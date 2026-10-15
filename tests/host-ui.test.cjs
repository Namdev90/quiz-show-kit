const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../src/compiler.js'),{runtime,root}=require('../scripts/runtime.cjs'),{load,result}=require('./dom-harness.cjs');
function config(){const c=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));c.presentation={motion:'none',sound:false,intro:false};return c;}
function setting(e,key,value){const node=e.query('[data-gameplay="'+key+'"]');assert.ok(node);if(node.type==='checkbox')node.checked=value;else node.value=String(value);node.dispatchEvent(new e.w.Event('change',{bubbles:true}));}
async function readDownload(e){const blob=e.downloads.at(-1).blob;return JSON.parse(await new Promise((resolve,reject)=>{const reader=new e.w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(blob);}));}

test('Host setup persists approved gameplay across starting the quiz and exports only selected statistics',async()=>{
 const c=config(),e=await load({html:C.build(c,runtime(c)).html});try{
  await e.ui('settings');setting(e,'shuffleOptions',true);setting(e,'discussionSeconds',3);setting(e,'difficultyOrder','falling');setting(e,'roundOrder','alternate');setting(e,'revisionReport',true);
  for(const node of e.all('[data-statistic]')){node.checked=node.dataset.statistic==='passesReached';node.dispatchEvent(new e.w.Event('change',{bubbles:true}));}
  assert.equal(e.get().config.gameplay.discussionSeconds,3);await e.ui('close');await e.action('START_SHOW');await e.action('START');
  assert.equal(e.get().config.gameplay.shuffleOptions,true);assert.equal(e.get().config.gameplay.difficultyOrder,'falling');
  await e.ui('settings');assert.equal(e.query('[data-gameplay="shuffleOptions"]').disabled,true);await e.ui('reports');assert.ok(e.query('[data-ui="revisionDownload"]'));
  await e.ui('statisticsDownload');const exported=await readDownload(e);assert.deepEqual(Object.keys(exported.teams.Bio),['passesReached']);
  await e.ui('revisionDownload');const revision=await readDownload(e);assert.equal(revision.enabled,true);
  assert.deepEqual(result.errors,[]);
 }finally{e.close();}
});

test('Standalone screen rehearsal uses no recording permission and restores official paused state',async()=>{
 const c=config(),e=await load({html:C.build(c,runtime(c)).html});try{
  await e.action('START_SHOW');await e.action('START');await e.action('SHOW_OPTIONS');await e.advance(1800);
  const before=e.get();await e.ui('settings');await e.ui('rehearsalPreview');
  assert.equal(e.w.BioQuiz.practiceStatus().kind,'standalone');assert.equal(e.captures.length,0);
  await e.advance(300);await e.key('Escape');const after=e.get();
  assert.equal(e.w.BioQuiz.practiceStatus().active,false);assert.deepEqual(after.mainScores,before.mainScores);assert.deepEqual(after.records,before.records);assert.equal(after.questionId,before.questionId);assert.equal(after.timer.paused,true);
  assert.equal(e.query('#rehearsal-badge'),null);assert.deepEqual(result.errors,[]);
 }finally{e.close();}
});

test('Blocked audience window offers a redacted offline repair download and preserves live scores',async()=>{
 const c=config(),e=await load({html:C.build(c,runtime(c)).html});try{
  e.w.open=()=>null;await e.ui('settings');const before=e.get().mainScores;await e.ui('audience');assert.match(e.text('#overlay'),/audience feature could not finish/);
  await e.ui('repair');assert.match(e.query('#repair-preview').value,/popup-blocked/);assert.doesNotMatch(e.query('#repair-preview').value,/question-bank|correctOptionId|apiKey/);
  await e.ui('repairDownload');const report=await readDownload(e);assert.equal(report.feature,'audience');assert.equal(report.errorCode,'popup-blocked');assert.deepEqual(e.get().mainScores,before);
  await e.key('Escape');await e.ui('settings');await e.ui('creditsDownload');const credits=await readDownload(e);assert.ok(credits.libraries.every(row=>row.licenseText));assert.doesNotMatch(JSON.stringify(credits),/data:image|data:audio/);
  assert.deepEqual(result.errors,[]);
 }finally{e.close();}
});
