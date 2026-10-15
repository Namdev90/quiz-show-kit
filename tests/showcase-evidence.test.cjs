const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const C=require('../src/compiler.js'),Build=require('../scripts/build-example.cjs');
const root=path.resolve(__dirname,'..'),read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')),clone=x=>JSON.parse(JSON.stringify(x));
const archive=read('examples/biovista/original/questions.json'),showcase=read('biovista.showcase.config.json');
const sha=x=>crypto.createHash('sha256').update(C.canonical(x)).digest('hex');
function fixture(){
 const raw=clone(showcase);raw.questions=clone(archive);
 const q=raw.questions.find(q=>q.id==='M01');
 q.optionExplanations=['Nucleus fixture rationale.','Golgi fixture rationale.','Lysosome fixture rationale.','Membrane fixture rationale.'];
 q.verification={status:'verified',checkedAt:'2026-10-15',note:'Synthetic preservation regression fixture; not a factual review.'};
 q.sources=q.sources.map(s=>({...s,status:'verified',verifiedAt:'2026-10-15',accessedAt:'2026-10-15',section:'Fixture section',supportNote:'Synthetic review record for the preservation test.'}));
 const review={format:'QSK_BIOVISTA_EVIDENCE_REVIEW_1',checkedAt:'2026-10-15',archivedQuestionsSha256:sha(archive),cards:[{id:q.id,questionSha256:sha(q)}]};
 return {raw,q,review};
}

test('Audited supplemental evidence can enrich a non-demo card without changing archived content',()=>{
 const {raw,review}=fixture();assert.doesNotThrow(()=>Build.verifyPreservation(raw,archive,review));
});

test('Supplemental evidence must be complete and bound to the exact reviewed question',()=>{
 for(const defect of ['missing receipt','changed rationale','incomplete rationales','unverified source','changed original citation']){
  const {raw,q,review}=fixture();
  if(defect==='missing receipt')review.cards=[];
  if(defect==='changed rationale')q.optionExplanations[0]+=' Unreviewed edit.';
  if(defect==='incomplete rationales'){q.optionExplanations[2]='';review.cards[0].questionSha256=sha(q);}
  if(defect==='unverified source'){q.sources[0].status='unverified';review.cards[0].questionSha256=sha(q);}
  if(defect==='changed original citation'){q.sources[0].url='https://example.invalid/replacement';review.cards[0].questionSha256=sha(q);}
  assert.throws(()=>Build.verifyPreservation(raw,archive,review),/review|evidence|citation|rationale/i,defect);
 }
});

test('A matching evidence receipt cannot authorize educational, inventory or scoring edits',()=>{
 for(const field of ['stem','options','correct','explanation','id','pairId','timing','verificationDate','rules','order','remove']){
  const {raw,q,review}=fixture();
  if(field==='rules')raw.rules.scoring.directCorrect++;
  else if(field==='order')raw.questions.reverse();
  else if(field==='remove')raw.questions.pop();
  else if(field==='options')q.options[0]+=' changed';
  else if(field==='correct')q.correct='B';
  else if(field==='timing')q.timing.primary++;
  else q[field]=String(q[field])+' changed';
  review.cards[0].id=q.id;review.cards[0].questionSha256=sha(q);
  assert.throws(()=>Build.verifyPreservation(raw,archive,review),/original|historical|archive/i,field);
 }
});

test('An accessible-label correction requires an explicit before/after review receipt',()=>{
 const {raw,review}=fixture(),q=raw.questions.find(q=>q.id==='M23'),before=q.visual.alt;
 q.optionExplanations=['Radiation rationale.','Flammable rationale.','Biological rationale.','Magnetic rationale.'];
 q.verification={status:'verified',checkedAt:'2026-10-15'};
 q.sources=q.sources.map(s=>({...s,status:'verified',verifiedAt:'2026-10-15',supportNote:'Synthetic label-preservation test.'}));
 q.visual.alt='Three curved lobes around a central ring, shown without text';
 const receipt={id:q.id,questionSha256:sha(q)};review.cards.push(receipt);
 assert.throws(()=>Build.verifyPreservation(raw,archive,review),/label|accessib|review/i);
 receipt.accessibilityCorrection={field:'visual.alt',before,after:q.visual.alt,reason:'Describe visible geometry without naming the answer.'};
 assert.doesNotThrow(()=>Build.verifyPreservation(raw,archive,review));
 q.visual.key='different-symbol';receipt.questionSha256=sha(q);
 assert.throws(()=>Build.verifyPreservation(raw,archive,review),/original|historical|archive/i);
});

test('The published BioVista bank has reviewed evidence and four option rationales on every card',()=>{
 const normalized=C.validate(showcase);
 for(const q of normalized.questions){
  assert.equal(q.verification?.status,'verified',q.id);
  assert.equal(q.verification?.checkedAt,'2026-10-15',q.id);
  assert.ok(q.optionExplanations.every(x=>x.trim()),q.id);
  assert.ok(q.sources.every(s=>s.status==='verified'&&s.verifiedAt==='2026-10-15'&&s.supportNote&&s.section),q.id);
 }
});

test('M23 describes visible geometry before reveal without naming its answer',()=>{
 const q=C.validate(showcase).questions.find(q=>q.id==='M23');
 assert.doesNotMatch(q.visual.alt,/bio(logical)?[ -]?hazard/i);assert.match(q.visual.alt,/lobe|curved|ring/i);
 assert.equal(q.options[q.correct],'Biological hazard');
});

test('Expandable source notes avoid the identified paired and reserve-path answer cues',()=>{
 const {revealHTML}=require('../src/host-tools.js'),questions=C.validate(showcase).questions;
 const revealed=id=>revealHTML(questions.find(q=>q.id===id));
 assert.doesNotMatch(revealed('T01'),/\bmole\b/i);
 assert.doesNotMatch(revealed('R01'),/\bmole\b/i);
 assert.doesNotMatch(revealed('T05'),/bacteria|fungi|microbial|decomposition/i);
 // Preserve and explicitly record the historical shared DEMO teaching.
 assert.match(revealed('DEMO'),/thermodynamic temperature/);
});

test('M23 main view and keyboard zoom keep accessible labels neutral until answer reveal',async()=>{
 const c=clone(showcase);c.showcase=false;c.presentation={motion:'none',sound:false,intro:false};c.gameplay={shuffleOptions:true};
 c.questions=c.questions.filter(q=>['DEMO','M23','M24'].includes(q.id));c.questions.find(q=>q.id==='DEMO').round=4;c.rounds=c.rounds.filter(r=>r.id===4);
 const {runtime}=require('../scripts/runtime.cjs'),{load}=require('./dom-harness.cjs'),e=await load({html:C.build(c,runtime(c)).html});
 try{
  await e.action('START_SHOW');await e.action('START');
  if(e.get().phase==='roundIntro')await e.action('NEXT');
  await e.action('SHOW_OPTIONS');await e.advance(1800);
  await e.click('[data-option="'+e.w.QSKEngine.question(e.w.BioQuiz.getState()).correct+'"]');await e.action('CONFIRM');await e.action('NEXT');
  if(e.get().phase==='roundIntro')await e.action('NEXT');
  assert.equal(e.get().questionId,'M23');
  const label=()=>e.query('.visual svg[role="img"]').getAttribute('aria-label');
  assert.doesNotMatch(label(),/bio(logical)?[ -]?hazard/i);assert.equal(e.query('.option-explanations'),null);
  const image=e.query('[data-ui="zoomImage"]');image.focus();image.dispatchEvent(new e.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.ok(e.query('.zoom-panel'));assert.doesNotMatch(e.query('.zoom-panel svg').getAttribute('aria-label'),/bio(logical)?[ -]?hazard/i);
  await e.key('Escape');assert.equal(e.get().questionId,'M23');
  await e.action('SHOW_OPTIONS');await e.advance(1800);
  const shown=e.w.QSKEngine.question(e.w.BioQuiz.getState());await e.click('[data-option="'+shown.correct+'"]');await e.action('CONFIRM');
  assert.equal(e.get().phase,'reveal');assert.equal(e.all('.option-explanations li').length,4);
  for(const [i,node]of e.all('.option-explanations li').entries()){assert.match(node.textContent,new RegExp(shown.options[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.ok(node.textContent.includes(shown.optionExplanations[i]));}
  e.w.BioQuiz.skipMotion();
  for(const summary of e.all('.answer-sources summary,.option-explanations summary')){
   summary.focus();const key=new e.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});summary.dispatchEvent(key);
   assert.equal(e.get().phase,'reveal','Opening feedback details must not activate Next');assert.equal(e.get().questionId,'M23');assert.equal(key.defaultPrevented,false,'Preserve native details activation');
  }
 }finally{e.close();}
});
