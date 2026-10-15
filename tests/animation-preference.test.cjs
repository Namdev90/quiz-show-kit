const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../src/compiler.js'),{runtime,root}=require('../scripts/runtime.cjs'),{load}=require('./dom-harness.cjs');
const raw=JSON.parse(fs.readFileSync(path.join(root,'biovista.showcase.config.json'),'utf8'));
const html=()=>C.build(raw,runtime(raw,path.join(root,'biovista.showcase.config.json'))).html;

test('System motion changes restore the configured showcase without changing scores or user settings',async()=>{
 const e=await load({html:html(),reducedPreference:true});try{
  assert.equal(e.w.BioQuiz.motionStatus().reducedMotion,true);assert.equal(e.query('#stage').dataset.motion,'none');
  e.w.__setReducedMotion(false);await e.advance(32);assert.equal(e.w.BioQuiz.motionStatus().reducedMotion,false);assert.equal(e.query('#stage').dataset.motion,'cinematic');assert.ok(e.w.BioDNAView);
  await e.action('COIN');assert.equal(e.w.BioQuiz.motionStatus().sceneTimeline,true);const before=e.get(),remaining=e.w.BioQuiz.motionInfo().remainingMs;
  e.w.__setReducedMotion(true);await e.advance(32);assert.equal(e.w.BioQuiz.motionStatus().reducedMotion,true);assert.equal(e.w.BioQuiz.motionStatus().sceneTimeline,false);assert.equal(e.w.BioQuiz.motionInfo().finished,false);assert.ok(e.w.BioQuiz.motionInfo().remainingMs<=remaining);assert.deepEqual(e.get().mainScores,before.mainScores);assert.deepEqual(e.get().log,before.log);
  e.w.__setReducedMotion(false);await e.advance(32);assert.equal(e.w.BioQuiz.motionStatus().sceneTimeline,true);assert.ok(e.w.BioQuiz.motionInfo().remainingMs<=remaining);assert.equal(e.w.BioQuiz.motionInfo().finished,false);
  await e.advance(5000);assert.equal(e.w.BioQuiz.motionInfo().finished,true);assert.match(e.text('#cinema-message'),/result is locked/);assert.equal(e.get().log.filter(row=>row.type==='coin-result').length,1);
 }finally{e.close();}
});

test('Changing system motion during option disclosure preserves answer hiding and the discussion gate',async()=>{
 const e=await load({html:html()});try{
  await e.action('START_SHOW');await e.advance(4600);await e.action('START');await e.advance(1100);await e.action('SHOW_OPTIONS');await e.advance(500);
  e.w.__setReducedMotion(true);await e.advance(32);assert.equal(e.get().phase,'optionsIntro');assert.equal(e.query('.answer-sources'),null);assert.equal(e.all('[data-option]:not([disabled])').length,0);
  e.w.__setReducedMotion(false);await e.advance(1600);assert.equal(e.get().phase,'discussion');assert.equal(e.all('[data-option]:not([disabled])').length,0);
  await e.advance(3000);assert.equal(e.get().phase,'answering');assert.ok(e.all('[data-option]').every(node=>node.style.opacity==='1'));assert.deepEqual(e.get().mainScores,{Bio:0,Vista:0});
 }finally{e.close();}
});

test('Native animation fallback advances a fair coin scene when GSAP is unavailable',async()=>{
 const animations=[],fallback=html().replace('let winnerTimeline=null;','window.gsap=undefined;let winnerTimeline=null;'),e=await load({html:fallback,nativeAnimationLog:animations});try{
  assert.equal(e.w.BioQuiz.motionStatus().animationDriver,'native');await e.action('COIN');assert.equal(e.w.BioQuiz.motionStatus().sceneTimeline,true);assert.equal(animations.filter(a=>a.node.matches('.coin-flight,.coin-solid')).length,2);
  await e.advance(1000);assert.ok(animations.find(a=>a.node.matches('.coin-solid')).currentTime>=1000);assert.equal(e.w.BioQuiz.motionInfo().finished,false);assert.equal(e.query('[data-ui="finishCinema"]').disabled,true);
  await e.advance(4100);assert.equal(e.w.BioQuiz.motionInfo().finished,true);assert.equal(e.query('[data-ui="finishCinema"]').disabled,false);assert.ok(animations.every(a=>a.playState==='idle'));assert.deepEqual(e.get().mainScores,{Bio:0,Vista:0});
 }finally{e.close();}
});

test('Native fallback keeps sequential option gates and animates reveal and rewards with cleanup on Undo',async()=>{
 const animations=[],fallback=html().replace('let winnerTimeline=null;','window.gsap=undefined;let winnerTimeline=null;'),e=await load({html:fallback,nativeAnimationLog:animations});try{
  await e.action('START_SHOW');await e.advance(4600);await e.action('START');await e.advance(1100);assert.ok(animations.some(a=>a.node.matches('.question-body')));await e.action('SHOW_OPTIONS');await e.advance(600);assert.equal(e.get().phase,'optionsIntro');assert.equal(e.all('[data-option]:not([disabled])').length,0);assert.equal(e.query('[data-option="3"]').style.opacity,'0');
  await e.advance(4300);await e.click('[data-option="'+e.w.BioEngine.question(e.get()).correct+'"]');await e.action('CONFIRM');assert.ok(animations.some(a=>a.node.matches('.explanation')));await e.advance(1300);await e.action('NEXT');if(e.get().phase==='roundIntro')await e.action('NEXT');await e.advance(1100);await e.action('SHOW_OPTIONS');await e.advance(4900);await e.click('[data-option="'+e.w.BioEngine.question(e.get()).correct+'"]');await e.action('CONFIRM');
  const rewards=animations.filter(a=>a.node.matches('.reward-coin'));assert.equal(rewards.length,10);assert.equal(e.get().mainScores[e.get().primaryTeam],10);await e.action('UNDO');assert.ok(rewards.every(a=>a.playState==='idle'));assert.equal(e.query('.reward-coin'),null);assert.deepEqual(e.get().mainScores,{Bio:0,Vista:0});
 }finally{e.close();}
});
