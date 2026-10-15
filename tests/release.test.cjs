'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {buildRelease}=require('../scripts/build-release.cjs'),{buildProvenance}=require('../scripts/build-provenance.cjs'),Compiler=require('../src/compiler.js'),Presets=require('../src/presets.js');
const {assertStableVersion}=require('../scripts/release-policy.cjs');
const MANIFEST='Quiz_Show_Kit_Release_Manifest.json',CHECKSUMS='Quiz_Show_Kit_SHA256SUMS.txt';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-release-test-'));
 const git=(...args)=>cp.execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const write=(file,value)=>{const full=path.join(root,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value,null,2)+'\n');};
 const read=file=>fs.readFileSync(path.join(root,file));
 const commit=()=>{git('add','-A');git('-c','user.name=Release Test','-c','user.email=release-test@example.invalid','commit','--quiet','-m','Fixture');};
 write('.gitignore','dist/\nprivate.txt\n');write('private.txt','Ignored private fixture data; never release.');write('public.txt','Tracked release fixture.');
 write('package.json',{name:'release-fixture',version:'1.1.0'});write('package-lock.json',{version:'1.1.0',packages:{'':{version:'1.1.0'}}});
 write('release.json',{version:'1.1.0',name:'Quiz Show Kit v1.1.0',notes:'docs/releases/v1.1.0.md'});write('docs/releases/v1.1.0.md','# Release 1.1.0\nFixture release notes.\n');write('docs/CHATGPT_HANDOFF.md','# Handoff\nRead [START](../prompts/START.md) and [notes](releases/v1.1.0.md#notes).\n');write('prompts/START.md','# Start\nFixture entry point.\n');write('src/runtime-fixture.js','// Tracked runtime fixture\n');write('scripts/runtime.cjs','// Tracked runtime builder fixture\n');write('scripts/build-provenance.cjs','// Tracked identity helper fixture\n');write('vendor/manifest.json',[]);
 const config={schemaVersion:1,event:{id:'release-fixture',title:'Release fixture'},teams:[{id:'Bio',name:'First',color:'#006633'},{id:'Vista',name:'Second',color:'#0044aa'}],rounds:[{id:1,name:'First round'}],questions:[0,1].map(i=>({id:'Q'+i,status:'main',round:1,pairId:'P1',difficulty:'accessible',stem:'Fixture question '+i,options:['One','Two','Three','Four'],correct:i,explanation:'Fixture explanation.',sources:[]}))};
 write('biovista.showcase.config.json',config);const normalized=Compiler.validate(config),baseFingerprint=Compiler.fingerprint(config),oldHTML='<html>Historical fixture</html>\n',html='<html><script>window.QSK_BUILD='+JSON.stringify(buildProvenance(root))+';\n</script>Current fixture</html>\n',docx=Buffer.from('Committed DOCX byte fixture; bound through metadata hash.');
 const origin={schemaVersion:2,sourceConfiguration:'biovista.showcase.config.json',publicExampleSha256:hash(html),profileId:normalized.profileId,questions:2,historicalArchive:{publicExampleSha256:hash(oldHTML)},authoringSetup:'competition'};
 write('examples/biovista/original/BioVista_Quiz_Offline.html',oldHTML);write('examples/biovista/original/origin.json',{publicExampleSha256:hash(oldHTML)});write('examples/biovista/origin.json',origin);
 const companions={'BioVista_Quiz_Offline.html':html,'BioVista_Question_Bank.docx':docx,'BioVista_Question_Bank.meta.json':{format:'QSK_EXAMPLE_DOCX_1',sha256:hash(docx),baseFingerprint,eventId:config.event.id,cards:2},'BioVista_Showcase.qsk-settings.json':Presets.exportSettings(config,{setup:'competition'}),'BioVista_Quality_Review.html':'<html>Quality fixture</html>\n','BioVista_Quality_Review.json':{format:'QSK_EXAMPLE_QUALITY_1',eventId:config.event.id,baseFingerprint,quality:{issues:[]}}};
 for(const [name,content]of Object.entries(companions))for(const prefix of ['examples/biovista/','docs/examples/biovista/'])write(prefix+name,content);
 git('init','--quiet');commit();
 return {root,write,read,git,commit,config,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
// Extract known Git-produced fixture ZIP entries in memory. This is not an untrusted ZIP importer.
function zipContents(bytes){
 const end=bytes.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));assert.ok(end>=0);const count=bytes.readUInt16LE(end+10),entries=new Map();let offset=bytes.readUInt32LE(end+16);
 for(let i=0;i<count;i++){assert.equal(bytes.readUInt32LE(offset),0x02014b50);const method=bytes.readUInt16LE(offset+10),length=bytes.readUInt32LE(offset+20),nameLength=bytes.readUInt16LE(offset+28),extra=bytes.readUInt16LE(offset+30),comment=bytes.readUInt16LE(offset+32),local=bytes.readUInt32LE(offset+42),name=bytes.subarray(offset+46,offset+46+nameLength).toString('utf8');assert.equal(bytes.readUInt32LE(local),0x04034b50);const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28),compressed=bytes.subarray(start,start+length);assert.ok([0,8].includes(method));entries.set(name,method===8?zlib.inflateRawSync(compressed):compressed);offset+=46+nameLength+extra+comment;}
 return entries;
}

test('Release archive contains tracked files only; artifact and manifest checksums identify the exact clean commit',()=>{const f=fixture();try{
 const originalDocx=f.read('examples/biovista/BioVista_Question_Bank.docx'),result=buildRelease({root:f.root}),output=path.join(f.root,'dist/release'),manifest=JSON.parse(fs.readFileSync(path.join(output,MANIFEST)));
 assert.equal(result.format,'QSK_RELEASE_1');assert.equal(result.tag,'v1.1.0');assert.equal(result.sourceCommit,f.git('rev-parse','HEAD'));assert.equal(result.sourceTree,f.git('rev-parse','HEAD^{tree}'));assert.deepEqual(manifest.runtimeBuild,buildProvenance(f.root));assert.equal(manifest.artifacts.length,7);assert.equal(manifest.artifacts.some(x=>[MANIFEST,CHECKSUMS].includes(x.name)),false);
 for(const item of manifest.artifacts){const bytes=fs.readFileSync(path.join(output,item.name));assert.equal(bytes.length,item.bytes);assert.equal(hash(bytes),item.sha256);}
 const sums=fs.readFileSync(path.join(output,CHECKSUMS),'utf8').trim().split('\n');assert.equal(sums.length,manifest.artifacts.length+1);for(const line of sums){const [digest,name]=line.split('  ');assert.equal(hash(fs.readFileSync(path.join(output,name))),digest);}assert.ok(sums.some(x=>x.endsWith('  '+MANIFEST)));assert.equal(sums.some(x=>x.endsWith('  '+CHECKSUMS)),false);
 const zip=zipContents(fs.readFileSync(path.join(output,'Quiz_Show_Kit_v1.1.0.zip')));assert.ok([...zip.keys()].every(name=>name.startsWith('quiz-show-kit/')));assert.equal(zip.get('quiz-show-kit/public.txt').toString(),'Tracked release fixture.');assert.ok(![...zip.keys()].some(name=>name.includes('private.txt')||name.startsWith('quiz-show-kit/dist/')||name.includes('/.git/')));assert.equal(JSON.parse(zip.get('quiz-show-kit/package.json')).version,'1.1.0');assert.ok(zip.has('quiz-show-kit/docs/releases/v1.1.0.md'));const handoff=fs.readFileSync(path.join(output,'Quiz_Show_Kit_ChatGPT_Handoff.md'),'utf8');assert.ok(handoff.includes('https://github.com/Namdev90/quiz-show-kit/blob/'+result.sourceCommit+'/prompts/START.md'));assert.ok(handoff.includes('/docs/releases/v1.1.0.md#notes'));assert.ok(zip.get('quiz-show-kit/docs/CHATGPT_HANDOFF.md').toString().includes('(../prompts/START.md)'));
 assert.deepEqual(f.read('examples/biovista/BioVista_Question_Bank.docx'),originalDocx);assert.equal(f.git('status','--porcelain=v1','--untracked-files=all'),'');assert.throws(()=>buildRelease({root:f.root}),/must be empty/);
 }finally{f.cleanup();}});
test('Tracked or untracked pending changes prevent a release without creating output',()=>{const f=fixture();try{
 f.write('untracked.txt','pending');assert.throws(()=>buildRelease({root:f.root}),/clean checkout/);assert.equal(fs.existsSync(path.join(f.root,'dist/release')),false);fs.unlinkSync(path.join(f.root,'untracked.txt'));f.write('public.txt','Modified tracked file');assert.throws(()=>buildRelease({root:f.root}),/clean checkout/);
 }finally{f.cleanup();}});
test('Committed version mismatch and unsafe release notes path are rejected',()=>{const f=fixture();try{
 f.write('release.json',{version:'1.2.0',name:'Mismatched release',notes:'docs/releases/v1.1.0.md'});f.commit();assert.throws(()=>buildRelease({root:f.root}),/versions must match/);
 f.write('release.json',{version:'1.1.0',name:'Valid release',notes:'../outside.md'});f.commit();assert.throws(()=>buildRelease({root:f.root}),/inside the checkout/);assert.equal(fs.existsSync(path.join(f.root,'dist/release')),false);
 }finally{f.cleanup();}});
test('Missing committed companions and differing Pages copies are rejected',()=>{const f=fixture();try{
 const name='BioVista_Quality_Review.html',source='examples/biovista/'+name,pages='docs/examples/biovista/'+name,original=f.read(source);fs.unlinkSync(path.join(f.root,source));f.commit();assert.throws(()=>buildRelease({root:f.root}),/Required release file is missing/);
 f.write(source,original);f.write(pages,'Different copy');f.commit();assert.throws(()=>buildRelease({root:f.root}),/Source and Pages companions differ/);
 }finally{f.cleanup();}});
test('Stale DOCX fingerprint and wrong authoring setup block packaging',()=>{const f=fixture();try{
 const name='BioVista_Question_Bank.meta.json',meta=JSON.parse(f.read('examples/biovista/'+name)),stale={...meta,baseFingerprint:'00000000'};for(const dir of ['examples/biovista/','docs/examples/biovista/'])f.write(dir+name,stale);f.commit();assert.throws(()=>buildRelease({root:f.root}),/DOCX is stale/);
 for(const dir of ['examples/biovista/','docs/examples/biovista/']){f.write(dir+name,meta);f.write(dir+'BioVista_Showcase.qsk-settings.json',Presets.exportSettings(f.config,{setup:'teacher'}));}f.commit();assert.throws(()=>buildRelease({root:f.root}),/competition authoring setup/);
 }finally{f.cleanup();}});
test('Changed historical archive and wrong current HTML provenance fail before any outputs',()=>{const f=fixture();try{
 const old=f.read('examples/biovista/original/BioVista_Quiz_Offline.html');f.write('examples/biovista/original/BioVista_Quiz_Offline.html','Altered archive');f.commit();assert.throws(()=>buildRelease({root:f.root}),/historical BioVista archive/);
 f.write('examples/biovista/original/BioVista_Quiz_Offline.html',old);const origin=JSON.parse(f.read('examples/biovista/origin.json'));origin.publicExampleSha256='0'.repeat(64);f.write('examples/biovista/origin.json',origin);f.commit();assert.throws(()=>buildRelease({root:f.root}),/current BioVista HTML or provenance/);assert.equal(fs.existsSync(path.join(f.root,'dist/release')),false);
 }finally{f.cleanup();}});

test('Runtime version/source drift is rejected even when the current HTML hash is re-recorded',()=>{const f=fixture();try{
 const htmlFile='examples/biovista/BioVista_Quiz_Offline.html',original=f.read(htmlFile).toString(),changed=original.replace('"version":"1.1.0"','"version":"1.0.0"');
 for(const file of [htmlFile,'docs/examples/biovista/BioVista_Quiz_Offline.html'])f.write(file,changed);let origin=JSON.parse(f.read('examples/biovista/origin.json'));origin.publicExampleSha256=hash(changed);f.write('examples/biovista/origin.json',origin);f.commit();assert.throws(()=>buildRelease({root:f.root}),/runtime build version or source digest is stale/);
 for(const file of [htmlFile,'docs/examples/biovista/BioVista_Quiz_Offline.html'])f.write(file,original);origin.publicExampleSha256=hash(original);f.write('examples/biovista/origin.json',origin);f.write('src/runtime-fixture.js','// Changed source after the HTML was built\n');f.commit();assert.throws(()=>buildRelease({root:f.root}),/runtime build version or source digest is stale/);
 }finally{f.cleanup();}});
test('Standalone handoff refuses escaped relative paths outside the source checkout',()=>{const f=fixture();try{f.write('docs/CHATGPT_HANDOFF.md','[unsafe](%2e%2e/%2e%2e/outside.md)');f.commit();assert.throws(()=>buildRelease({root:f.root}),/inside the checkout/);assert.equal(fs.existsSync(path.join(f.root,'dist/release')),false);}finally{f.cleanup();}});

test('Shared release policy accepts exact stable numeric versions and rejects prerelease or malformed versions',()=>{
 for(const version of ['0.0.0','1.1.0','12.34.56'])assert.equal(assertStableVersion(version),version);
 for(const version of ['1.1.0-rc.1','1.1.0-beta','1.1.0+build.1','01.1.0','1.01.0','1.1.00','1.1','v1.1.0',' 1.1.0','1.1.0\n',1,null,undefined])assert.throws(()=>assertStableVersion(version),/Stable releases only:.*semantic version X.Y.Z/);
});
test('Aligned prerelease and malformed numeric versions are rejected before any release output',()=>{const f=fixture();try{
 for(const version of ['1.1.0-rc.1','1.1.0+build.1','01.1.0','1.01.0','1.1.00']){
  const release=JSON.parse(f.read('release.json')),pkg=JSON.parse(f.read('package.json')),lock=JSON.parse(f.read('package-lock.json'));
  release.version=pkg.version=lock.version=lock.packages[''].version=version;
  f.write('release.json',release);f.write('package.json',pkg);f.write('package-lock.json',lock);f.commit();
  assert.throws(()=>buildRelease({root:f.root}),/Stable releases only:.*semantic version X.Y.Z/);
  assert.equal(fs.existsSync(path.join(f.root,'dist/release')),false);
 }
 }finally{f.cleanup();}});
