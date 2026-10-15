const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const C=require('../src/compiler.js'),P=require('../src/presets.js'),CLI=require('../scripts/question-bank.cjs');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'examples/biovista');
const read=file=>fs.readFileSync(file,'utf8'),json=file=>JSON.parse(read(file)),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const baseline=json(path.join(root,'quiz.config.json')),showcase=json(path.join(root,'biovista.showcase.config.json')),historicalQuestions=json(path.join(directory,'original/questions.json'));
const html=read(path.join(directory,'BioVista_Quiz_Offline.html'));
const payload=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1]);

test('Historical BioVista HTML, question bytes and original provenance remain intact',()=>{
 const historical=json(path.join(directory,'original/origin.json'));
 assert.equal(historical.publicExampleSha256,'936403df41cc07e451158550df76f32be34c717a0f2e9e1280e76d6bfc9331b6');
 assert.equal(hash(fs.readFileSync(path.join(directory,'original/BioVista_Quiz_Offline.html'))),historical.publicExampleSha256);
 assert.equal(read(path.join(directory,'questions.json')),read(path.join(directory,'original/questions.json')));
 assert.match(read(path.join(directory,'original/ASSET_NOTICES.md')),/game code are unchanged/);
 assert.notEqual(hash(html),historical.publicExampleSha256);
});

test('Showcase preserves archived question meaning while explicitly enabling supported features',()=>{
 assert.equal(showcase.questions.length,41);
 for(const old of historicalQuestions){const current=showcase.questions.find(q=>q.id===old.id);for(const key of ['stem','options','correct','explanation','verificationDate','status','round','pairId','difficulty','seconds','timing'])assert.deepEqual(current[key],old[key],old.id+': '+key);assert.deepEqual(current.sources.slice(0,old.sources.length).map(s=>({title:s.title,url:s.url})),old.sources.map(s=>({title:s.title,url:s.url})));}
 assert.notEqual(showcase.event.id,baseline.event.id);assert.equal(baseline.gameplay,undefined);
 assert.equal(showcase.gameplay.shuffleOptions,true);assert.equal(showcase.gameplay.discussionSeconds,3);assert.equal(showcase.gameplay.roundOrder,'alternate');assert.equal(showcase.gameplay.revisionReport,true);
 assert.equal(showcase.questions.filter(q=>q.subtype==='numerical').length,6);assert.equal(showcase.questions.filter(q=>q.subtype==='image').length,6);assert.equal(showcase.questions.filter(q=>q.visual).length,7);
 const demo=showcase.questions.find(q=>q.id==='DEMO');assert.equal(demo.optionExplanations.length,4);assert.equal(demo.verification.checkedAt,'2026-10-15');assert.equal(demo.sources[0].section,'Base and Derived Units');
 assert.equal(showcase.questions.filter(q=>q.verification?.status==='verified').length,41);
 assert.equal(showcase.branding.character.asset,'chotaNamu');assert.equal(showcase.presentation.character,true);
});

test('Published example embeds the current engine and configured feature behavior; Pages copy matches exactly',()=>{
 assert.equal(html,read(path.join(root,'docs/examples/biovista/BioVista_Quiz_Offline.html')));
 const config=payload('kit-config'),bank=payload('quiz-data'),assets=payload('asset-data');
 assert.equal(config.profileId,C.validate(showcase).profileId);assert.deepEqual(config.gameplay,C.validate(showcase).gameplay);
 assert.equal(assets.chotaNamu.data,'data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/characters/chota-namu.png')).toString('base64'));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
 const profile=scripts.find(code=>code.startsWith('/* Quiz Show Kit rule profiles.')),engine=scripts.find(code=>code.startsWith('/* Quiz Show Kit: deterministic quiz logic.'));
 assert.equal(engine,read(path.join(root,'src/engine.js')));assert.ok(profile);
 const context={QSK_CONFIG:config};vm.createContext(context);vm.runInContext(profile,context);vm.runInContext(engine,context);const E=context.QSKEngine;
 let state=E.create(bank,{shuffleSeed:42});const act=(type,extra={})=>{const result=E.dispatch(state,{type,...extra},state.lastNow);assert.equal(result.error,null);state=result.state;};
 act('START');act('SHOW_OPTIONS');state=E.tick(state,state.lastNow+1800).state;assert.equal(state.phase,'discussion');assert.equal(E.view(state).question.optionExplanations,undefined);
 for(let i=0;i<3;i++)state=E.tick(state,state.lastNow+1000).state;
 assert.equal(state.phase,'answering');assert.equal(E.view(state).remainingMs,15000);const shown=E.question(state);act('STAGE',{option:shown.correct});act('CONFIRM');
 assert.equal(state.phase,'reveal');assert.match(E.view(state).question.optionExplanations[shown.correct],/metre measures length/);assert.equal(E.view(state).question.sources[0].status,'verified');assert.deepEqual(plain(state.mainScores),{Bio:0,Vista:0});
 act('NEXT');assert.equal(state.schedule.find(q=>q.round===2).primaryTeam,'Vista');assert.equal(state.config.gameplay.revisionReport,true);
 const origin=json(path.join(directory,'origin.json'));assert.equal(origin.publicExampleSha256,hash(html));assert.equal(origin.review.missingPerOptionExplanations,0);
});

test('Reusable companion settings preserve gameplay and authoring depth without embedding the bank or character',()=>{
 const settings=json(path.join(directory,'BioVista_Showcase.qsk-settings.json'));
 assert.deepEqual(settings,P.exportSettings(showcase,{setup:'competition'}));assert.equal(P.decode(settings.key).setup,'competition');assert.equal(settings.settings.questions,undefined);assert.equal(settings.settings.assets,undefined);assert.equal(settings.settings.branding,undefined);
 const reapplied=P.apply(baseline,undefined,settings);assert.deepEqual(reapplied.gameplay,showcase.gameplay);assert.equal(reapplied.event.id,baseline.event.id);assert.equal(reapplied.setup,undefined);
 const review=json(path.join(directory,'BioVista_Quality_Review.json'));assert.equal(review.format,'QSK_EXAMPLE_QUALITY_1');assert.equal(review.quality.verification.verified,41);assert.equal(review.quality.verification.unverified,0);assert.ok(!review.quality.issues.some(issue=>['verification','optionExplanations','visual.alt'].includes(issue.field)));assert.equal(review.quality.score,undefined);assert.deepEqual(review.diff.changed,[]);
 assert.equal(review.quality.issues.length,12);assert.equal(review.evidenceReview.warningDispositions.length,13);assert.equal(review.evidenceReview.warningDispositions.filter(w=>w.status==='corrected').length,1);
 for(const issue of review.quality.issues)assert.ok(review.evidenceReview.warningDispositions.some(w=>w.questionId===issue.questionId&&w.field===issue.field&&w.status==='reviewed-retain'));
});

test('Published example DOCX round-trips 41 stable IDs and demo evidence without changing the source configuration',()=>{
 const config=path.join(root,'biovista.showcase.config.json'),before=fs.readFileSync(config),docx=path.join(directory,'BioVista_Question_Bank.docx'),meta=json(path.join(directory,'BioVista_Question_Bank.meta.json')),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-showcase-review-'));
 try{
  assert.equal(meta.baseFingerprint,C.fingerprint(showcase));assert.equal(meta.sha256,hash(fs.readFileSync(docx)));
  const result=CLI.run(['preview','--config',config,'--document',docx,'--workspace',path.join(temporary,'review')]);assert.equal(result.applied,false);assert.deepEqual(result.added,[]);assert.deepEqual(result.removed,[]);assert.deepEqual(result.changed,[]);
  const candidate=json(path.join(temporary,'review/candidate.config.json'));assert.equal(candidate.questions.length,41);assert.deepEqual(candidate.questions.map(q=>q.id),showcase.questions.map(q=>q.id));assert.deepEqual(candidate.questions.find(q=>q.id==='DEMO').optionExplanations,showcase.questions.find(q=>q.id==='DEMO').optionExplanations);assert.equal(fs.readFileSync(config).compare(before),0);
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
