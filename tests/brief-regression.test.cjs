const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const C=require('../src/compiler.js'),{runtime,root}=require('../scripts/runtime.cjs'),{load}=require('./dom-harness.cjs');
const original=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));
const plain=value=>JSON.parse(JSON.stringify(value));
function fixture(){
  const c=structuredClone(original),first=c.questions.find(q=>q.status==='main');
  c.event.id='brief-integration';c.rounds=c.rounds.filter(r=>r.id===first.round);
  c.questions=c.questions.filter(q=>q.status==='main'&&q.pairId===first.pairId||q.status==='reserve'&&q.round===first.round);
  c.questions[0].visual={type:'diagram',key:'microscope',alt:'Laboratory apparatus diagram',attribution:'Original toolkit diagram'};
  for(const q of c.questions)q.optionExplanations=q.options.map((option,index)=>'Explanation for option identity '+index+': '+option);
  c.presentation={...c.presentation,motion:'none',sound:false,intro:false,confetti:false,rewards:false};
  c.rules.optionsRevealMs=400;c.rules.passTransitionMs=300;
  c.gameplay={shuffleOptions:true,discussionSeconds:2,difficultyOrder:'manual',roundOrder:'alternate',statistics:['directOpportunities','passesOffered','passesReached','attempted','correct','wrong','scores'],revisionReport:true};
  return c;
}
async function start(e){await e.action('START_SHOW');await e.action('START');if(e.get().phase==='roundIntro')await e.action('NEXT');}
async function answerReady(e){await e.action('SHOW_OPTIONS');await e.advance(400);assert.equal(e.get().phase,'discussion');assert.ok(e.all('[data-option]').every(button=>button.disabled));await e.advance(2000);assert.equal(e.get().phase,'answering');}

test('Accepted shuffle/discussion/reveal features preserve answer identities and gate supporting material',async()=>{
  const c=fixture(),e=await load({html:C.build(c,runtime(c)).html});
  try{
    await start(e);assert.equal(e.query('.answer-sources'),null);assert.equal(e.query('.option-explanations'),null);
    await answerReady(e);
    const before=plain(e.w.BioEngine.question(e.get())),source=c.questions.find(q=>q.id===before.id);
    for(let i=0;i<4;i++)assert.equal(before.optionExplanations[i],source.optionExplanations[source.options.indexOf(before.options[i])]);
    const wrong=(before.correct+1)%4;
    await e.click('[data-option="'+wrong+'"]');await e.action('CONFIRM');await e.advance(300);
    assert.equal(e.get().turn,'passed');assert.equal(e.query('[data-option="'+wrong+'"]').disabled,true);
    assert.deepEqual(plain(e.w.BioEngine.question(e.get()).options),before.options,'Pass keeps the exact same option permutation');
    assert.equal(e.query('.answer-sources'),null);
    await e.click('[data-option="'+before.correct+'"]');await e.action('CONFIRM');
    assert.equal(e.get().phase,'reveal');assert.ok(e.query('.answer-sources'));
    assert.equal(e.query('.answer-sources a').getAttribute('href'),source.sources[0].url);
    assert.equal(e.query('.answer-sources a').getAttribute('target'),'_blank');
    const explained=e.all('.option-explanations li');assert.equal(explained.length,4);
    for(let i=0;i<4;i++)assert.ok(explained[i].textContent.includes(before.optionExplanations[i]));
    assert.deepEqual(e.get().mainScores,{Bio:-2,Vista:2});
  }finally{e.close();}
});

test('Question image enlarges by keyboard and returns without revealing an answer or changing scores',async()=>{
  const c=fixture(),e=await load({html:C.build(c,runtime(c)).html});
  try{
    await start(e);const before=e.get(),visual=e.query('[data-ui="zoomImage"]');
    assert.ok(visual);assert.equal(visual.getAttribute('tabindex'),'0');visual.focus();
    visual.dispatchEvent(new e.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    assert.ok(e.query('#overlay [role="dialog"]'));assert.match(e.text('#overlay'),/Laboratory apparatus diagram|Enlarged|image/i);
    assert.equal(e.query('#overlay .answer-sources'),null);await e.key('Escape');
    assert.equal(e.query('#overlay [role="dialog"]'),null);assert.deepEqual(e.get().mainScores,before.mainScores);assert.equal(e.get().phase,before.phase);
  }finally{e.close();}
});

test('Audience document excludes host tools and unrevealed bank material while retaining the public image',async()=>{
  const c=fixture(),e=await load({html:C.build(c,runtime(c)).html});let audience;
  try{
    await start(e);audience=new JSDOM('<!doctype html><html><body></body></html>',{pretendToBeVisual:true});
    audience.window.focus=()=>{};e.w.open=()=>audience.window;
    assert.equal(e.w.SessionTools.openAudience().ok,true);
    e.w.SessionTools.publish(e.w.document,e.get());
    const doc=audience.window.document;
    assert.ok(doc.querySelector('.visual'),'Public question image survives stripping interactive attributes');
    assert.equal(doc.querySelector('#quiz-data,#kit-config,#overlay,[data-ui],[data-action],input,select,textarea'),null);
    assert.equal(doc.querySelector('.answer-sources,.option-explanations'),null);
    await e.action('SHOW_OPTIONS');await e.advance(100);e.w.SessionTools.publish(e.w.document,e.get());
    const hostOptions=e.all('.option'),publicOptions=[...doc.querySelectorAll('.option')];assert.equal(publicOptions.length,4);
    for(let i=0;i<4;i++)assert.equal(publicOptions[i].style.opacity,hostOptions[i].style.opacity,'Audience retains option '+i+' disclosure visibility');
    await e.ui('settings');e.w.SessionTools.publish(e.w.document,e.get());
    assert.equal(doc.querySelector('[role="dialog"],#overlay'),null);
    assert.doesNotMatch(doc.body.textContent,/Repair handoff|Download revision|Host-only content review/);
  }finally{e.w.SessionTools.closeAudience();audience?.window.close();e.close();}
});
