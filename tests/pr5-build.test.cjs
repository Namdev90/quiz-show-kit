const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),vm=require('node:vm');
const C=require('../src/compiler.js'),Profile=require('../src/profile.js'),root=path.resolve(__dirname,'..');
const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function fixture(t){
 const base=fs.realpathSync(os.tmpdir()),directory=fs.mkdtempSync(path.join(base,'qsk-pr5-build-'));
 t.after(()=>{const relative=path.relative(base,path.resolve(directory));assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(directory).startsWith('qsk-pr5-build-'));fs.rmSync(directory,{recursive:true,force:true});});
 for(const file of ['scripts','src','vendor','assets','examples','package.json','package-lock.json','quiz.config.json','biovista.showcase.config.json'])fs.cpSync(path.join(root,file),path.join(directory,file),{recursive:true});
 fs.mkdirSync(path.join(directory,'docs'));
 return directory;
}
function build(directory){return cp.spawnSync(process.execPath,['scripts/build-launcher.cjs'],{cwd:directory,encoding:'utf8'});}
function published(directory){return Object.fromEntries(['BioVista_Quiz_Offline.html','origin.json','BioVista_Question_Bank.docx','BioVista_Question_Bank.meta.json','BioVista_Showcase.qsk-settings.json','BioVista_Quality_Review.json','BioVista_Quality_Review.html'].flatMap(file=>[path.join('examples/biovista',file),...(file==='origin.json'?[]:[path.join('docs/examples/biovista',file)])]).map(file=>[file,fs.existsSync(path.join(directory,file))?hash(fs.readFileSync(path.join(directory,file))):null]));}

test('Published artifacts are byte-identical across unrelated commits and tracked dirty state',t=>{
 const directory=fixture(t),git=(...args)=>cp.execFileSync('git',args,{cwd:directory,stdio:'pipe'});
 git('init');fs.writeFileSync(path.join(directory,'marker.txt'),'one');git('add','marker.txt');
 const commit=()=>git('-c','user.name=Regression fixture','-c','user.email=fixture@example.invalid','commit','-m','Unrelated fixture commit');
 commit();let result=build(directory);assert.equal(result.status,0,result.stderr);const first=published(directory);
 fs.writeFileSync(path.join(directory,'marker.txt'),'two');result=build(directory);assert.equal(result.status,0,result.stderr);assert.deepEqual(published(directory),first,'tracked dirty state must not change publication');
 git('add','marker.txt');commit();result=build(directory);assert.equal(result.status,0,result.stderr);assert.deepEqual(published(directory),first,'an unrelated HEAD must not change publication');
 const html=fs.readFileSync(path.join(directory,'examples/biovista/BioVista_Quiz_Offline.html'),'utf8');
 const info=JSON.parse(html.match(/window.QSK_BUILD=([^;]+);/)[1]);assert.equal(info.version,readJSON(path.join(root,'package.json')).version);assert.equal(info.baseCommit,undefined);assert.equal(info.localChanges,undefined);
});

for(const defect of ['missing DOCX','missing metadata','changed DOCX','wrong format','wrong event','wrong count','wrong fingerprint','wrong digest'])test('Publication rejects '+defect+' before writing artifacts',t=>{
 const directory=fixture(t),bank=path.join(directory,'examples/biovista/BioVista_Question_Bank.docx'),metaFile=bank.replace('.docx','.meta.json');
 let result=build(directory);assert.equal(result.status,0,result.stderr);const before=published(directory);
 if(defect==='missing DOCX')fs.unlinkSync(bank);
 else if(defect==='missing metadata')fs.unlinkSync(metaFile);
 else if(defect==='changed DOCX')fs.appendFileSync(bank,'corruption');
 else {const meta=readJSON(metaFile);const [key,value]={'wrong format':['format','other'],'wrong event':['eventId','other'],'wrong count':['cards',40],'wrong fingerprint':['baseFingerprint','00000000'],'wrong digest':['sha256','0'.repeat(64)]}[defect];meta[key]=value;fs.writeFileSync(metaFile,JSON.stringify(meta));}
 const altered=published(directory);result=build(directory);assert.notEqual(result.status,0,'must refuse unbound DOCX publication');assert.match(result.stderr,/DOCX|companion|authoring/i);assert.deepEqual(published(directory),altered,'failed validation must not overwrite any publication');
 for(const file of ['docs/examples/biovista/BioVista_Quiz_Offline.html','docs/examples/biovista/BioVista_Question_Bank.docx'])assert.equal(published(directory)[file],before[file]);
});

for(const field of ['stem','correct','rules'])test('Coordinated root and showcase '+field+' edits cannot redefine the archived baseline',t=>{
 const directory=fixture(t);
 for(const name of ['quiz.config.json','biovista.showcase.config.json']){
  const file=path.join(directory,name),config=readJSON(file);
  if(field==='rules')config.rules.scoring.directCorrect++;
  else if(field==='stem')config.questions[0].stem+=' Changed historical meaning.';
  else config.questions[0].correct=1;
  fs.writeFileSync(file,JSON.stringify(config));
 }
 const raw=readJSON(path.join(directory,'biovista.showcase.config.json')),metaFile=path.join(directory,'examples/biovista/BioVista_Question_Bank.meta.json'),meta=readJSON(metaFile);
 meta.baseFingerprint=C.fingerprint(raw);fs.writeFileSync(metaFile,JSON.stringify(meta));
 const before=published(directory),result=build(directory);assert.notEqual(result.status,0,'must compare with immutable history');assert.match(result.stderr,/original|historical|archive/i);assert.deepEqual(published(directory),before);
});

test('Root-only customization leaves showcase preservation bound to the archive',t=>{
 const directory=fixture(t),file=path.join(directory,'quiz.config.json'),config=readJSON(file);
 config.questions[0].stem+=' Custom event.';config.rules.scoring.directCorrect++;
 fs.writeFileSync(file,JSON.stringify(config));const result=build(directory);assert.equal(result.status,0,result.stderr);
});

test('Removing reviewed card evidence cannot publish an all-verified showcase claim',t=>{
 const directory=fixture(t),file=path.join(directory,'biovista.showcase.config.json'),raw=readJSON(file),q=raw.questions.find(q=>q.id==='M01');
 const original=readJSON(path.join(directory,'examples/biovista/original/questions.json')).find(q=>q.id==='M01');
 delete q.verification;delete q.optionExplanations;q.sources=original.sources;
 fs.writeFileSync(file,JSON.stringify(raw));
 const ledgerFile=path.join(directory,'examples/biovista/evidence-review.json'),ledger=readJSON(ledgerFile);
 ledger.cards.find(r=>r.id===q.id).questionSha256=hash(C.canonical(q));fs.writeFileSync(ledgerFile,JSON.stringify(ledger));
 const metaFile=path.join(directory,'examples/biovista/BioVista_Question_Bank.meta.json'),meta=readJSON(metaFile);meta.baseFingerprint=C.fingerprint(raw);fs.writeFileSync(metaFile,JSON.stringify(meta));
 const before=published(directory),result=build(directory);
 assert.notEqual(result.status,0,'incomplete evidence must fail before publishing verification claims');assert.match(result.stderr,/review|evidence|rationale/i);assert.deepEqual(published(directory),before);
});

test('Explicit authoring repairs missing companions and produces a publishable bound DOCX',t=>{
 const directory=fixture(t),bank=path.join(directory,'examples/biovista/BioVista_Question_Bank.docx'),metaFile=bank.replace('.docx','.meta.json');
 fs.unlinkSync(bank);fs.unlinkSync(metaFile);
 const result=cp.spawnSync(process.execPath,['scripts/build-example.cjs','--authoring'],{cwd:directory,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const meta=readJSON(metaFile),raw=readJSON(path.join(directory,'biovista.showcase.config.json'));
 assert.equal(meta.eventId,raw.event.id);assert.equal(meta.cards,41);assert.equal(meta.sha256,hash(fs.readFileSync(bank)));assert.equal(meta.baseFingerprint,C.fingerprint(raw));
 const publication=build(directory);assert.equal(publication.status,0,publication.stderr);
});

test('Recorded historical rules agree with the digest-checked archived engine',()=>{
 const directory=path.join(root,'examples/biovista/original'),html=fs.readFileSync(path.join(directory,'BioVista_Quiz_Offline.html'),'utf8');
 assert.equal(hash(html),readJSON(path.join(directory,'origin.json')).publicExampleSha256);
 const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(code=>code.startsWith('/* BioVista: deterministic,'));
 const context={};vm.createContext(context);vm.runInContext(code,context,{timeout:2000});
 const config=context.BioEngine.create(readJSON(path.join(directory,'questions.json'))).config;
 const rules=Profile.normalizeRules(Object.fromEntries(Object.entries(config).filter(([key])=>!['ruleVersion','mode','startingTeam'].includes(key))));
 assert.equal(hash(C.canonical(rules)),'2b424e29feae2cc73c9e6873635b76b701ad09ed1030d81995f4dfb5e8bff0f9');
});
