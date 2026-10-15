const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../src/compiler.js'),{runtime,root}=require('../scripts/runtime.cjs'),{load,result}=require('./dom-harness.cjs');
function config(){const c=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));c.presentation={motion:'none',sound:false,intro:false};return c;}
function withCharacter(){const c=config(),png=fs.readFileSync(path.join(root,'assets/characters/chota-namu.png'));c.assets.chotaNamu={data:'data:image/png;base64,'+png.toString('base64'),creator:'Original creator not independently identified',sourceTitle:'Chota Namu supplied by Namdev Shirodkar',license:'LicenseRef-User-Provided-Project-Use',licenseText:fs.readFileSync(path.join(root,'assets/characters/NOTICE.md'),'utf8')};c.branding.character={asset:'chotaNamu',alt:'Chota Namu, supplied by Namdev Shirodkar'};return c;}
function toggle(e,value){const node=e.query('#live-character');assert.ok(node);node.checked=value;node.dispatchEvent(new e.w.Event('input',{bubbles:true}));}

test('Generic quiz stays character-free and does not embed the optional PNG',async()=>{
 const c=config(),built=C.build(c,runtime(c)),e=await load({html:built.html});try{
  assert.equal(e.query('.chota-namu'),null);assert.equal(Object.hasOwn(built.config.branding,'character'),false);
  const assets=JSON.parse(e.query('#asset-data').textContent);assert.equal(assets.chotaNamu,undefined);
  await e.ui('settings');assert.equal(e.query('#live-character'),null);assert.deepEqual(result.errors,[]);
 }finally{e.close();}
});

test('Supplied static character is optional, persists visibility, and stays out of gameplay and results',async()=>{
 const c=withCharacter(),html=C.build(c,runtime(c)).html,e=await load({html,reducedPreference:true});let restored;try{
  const original=c.assets.chotaNamu.data;assert.equal(e.query('.chota-namu--entry img').getAttribute('src'),original);
  assert.equal(e.query('.chota-namu--entry img').getAttribute('alt'),c.branding.character.alt);
  await e.ui('settings');assert.equal(e.query('#live-character').checked,true);assert.equal(e.query('.chota-namu--about img').getAttribute('src'),original);
  const before=e.get();toggle(e,false);assert.equal(e.query('.chota-namu'),null);assert.deepEqual(e.get().mainScores,before.mainScores);
  restored=await load({html,storage:[...e.memory.entries()]});assert.equal(restored.query('.chota-namu'),null);await restored.ui('settings');assert.equal(restored.query('#live-character').checked,false);
  toggle(e,true);await e.ui('close');assert.ok(e.query('.chota-namu--entry'));await e.action('START_SHOW');await e.action('START');assert.equal(e.query('#content .chota-namu'),null);
  const state=e.get();state.phase='end';state.timer=null;state.winner={team:'Bio',pending:false};e.w.BioQuiz.setState(state);assert.equal(e.query('#content .chota-namu'),null);assert.doesNotMatch(e.text('#content'),/Chota Namu/);
  assert.equal(e.query('img[src^="data:image/gif"]'),null);assert.deepEqual(result.resourceRequests,[]);assert.deepEqual(result.errors,[]);
 }finally{restored?.close();e.close();}
});
