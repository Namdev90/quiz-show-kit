const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),C=require('../src/compiler.js'),P=require('../src/presets.js'),{runtime,root}=require('../scripts/runtime.cjs'),{load}=require('./dom-harness.cjs');
const source=JSON.parse(fs.readFileSync(path.join(root,'biovista.showcase.config.json'),'utf8'));
const generic=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));
const html=raw=>C.build(raw,runtime(raw,path.join(root,'biovista.showcase.config.json'))).html;

test('The Apex showcase explicitly enables the supported rich presentation profile',()=>{
 assert.equal(source.showcase,true);assert.equal(source.theme.style,'skeuomorphic');
 for(const key of ['sound','spokenOptions','readQuestions','confetti','rewards','coinAnimation','questionAnimation','winnerAnimation','intro','character'])assert.equal(source.presentation[key],true,key);
 assert.equal(source.presentation.motion,'cinematic');assert.equal(source.presentation.optionSpeech,'full');
 assert.equal(source.gameplay.shuffleOptions,true);assert.equal(source.gameplay.revisionReport,true);assert.ok(source.gameplay.discussionSeconds>0);assert.equal(source.gameplay.statistics.length,11);
 assert.equal(C.validate(source).showcase,true);for(const value of ['true',{},1])assert.throws(()=>C.validate({...source,showcase:value}),/showcase/);
});

test('Showcase settings stay visible and read-only, including synthetic setting changes',async()=>{
 const e=await load({html:html(source)});try{
  await e.ui('settings');assert.match(e.text('#overlay'),/Apex|read-only/i);
  const controls=e.all('[data-presentation],[data-gameplay],[data-statistic]');assert.ok(controls.length>20);assert.ok(controls.every(node=>node.disabled),'all showcase setting controls must be disabled');
  const before=e.get(),shuffle=e.query('[data-gameplay="shuffleOptions"]');shuffle.checked=false;shuffle.dispatchEvent(new e.w.Event('change',{bubbles:true}));assert.deepEqual(e.get().config,before.config);
  const sound=e.query('[data-presentation="sound"]');sound.checked=false;sound.dispatchEvent(new e.w.Event('input',{bubbles:true}));assert.equal(e.w.BioQuiz.audioStatus().muted,false);
  assert.equal(e.w.BioQuiz.act('CONFIGURE',{gameplay:{shuffleOptions:false}}),false);assert.equal(e.get().config.gameplay.shuffleOptions,true);
  assert.ok(e.query('[data-ui="rehearse"]'));assert.equal(e.query('[data-ui="rehearse"]').disabled,false);assert.equal(e.query('[data-ui="reports"]').disabled,false);
 }finally{e.close();}
});

test('Persisted preferences cannot disable the showcase profile',async()=>{
 const key='quiz-show-kit:'+C.validate(source).profileId+'.presentation';
 const e=await load({html:html(source),storage:[[key,JSON.stringify({sound:false,volume:0,motion:'none',character:false,readQuestions:false})]]});try{
  await e.ui('settings');assert.equal(e.query('[data-presentation="sound"]').checked,true);assert.equal(e.query('[data-presentation="character"]').checked,true);assert.equal(e.query('[data-presentation="readQuestions"]').checked,true);assert.equal(e.query('[data-presentation="motion"]').value,'cinematic');assert.equal(e.w.BioQuiz.audioStatus().muted,false);
 }finally{e.close();}
});

test('Normal events retain editable gameplay and presentation; reusable settings do not export the lock',async()=>{
 const settings=P.exportSettings(source,{setup:'competition'});assert.equal(settings.showcase,undefined);assert.equal(settings.settings.showcase,undefined);
 const raw=P.apply(generic,undefined,settings),e=await load({html:html(raw)});try{
  assert.equal(C.validate(raw).showcase,undefined);await e.ui('settings');const shuffle=e.query('[data-gameplay="shuffleOptions"]');assert.equal(shuffle.disabled,false);shuffle.checked=false;shuffle.dispatchEvent(new e.w.Event('change',{bubbles:true}));assert.equal(e.get().config.gameplay.shuffleOptions,false);
  const sound=e.query('[data-presentation="sound"]');assert.equal(sound.disabled,false);sound.checked=false;sound.dispatchEvent(new e.w.Event('input',{bubbles:true}));assert.equal(e.w.BioQuiz.audioStatus().muted,true);
 }finally{e.close();}
});

test('The exact showcase CTA points to a repository release download and never an online preview',()=>{
 const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
 for(const file of ['index.html','docs/index.html']){const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'));try{const link=[...dom.window.document.querySelectorAll('a')].find(a=>a.textContent==='Try the BioVista Feature Showcase Quiz');assert.ok(link,'exact showcase CTA');assert.equal(link.getAttribute('href'),'https://github.com/Namdev90/quiz-show-kit/releases/download/v'+version+'/BioVista_Quiz_Public_Example.html');assert.equal(link.hasAttribute('download'),true);assert.equal(dom.window.document.querySelector('a[href*="github.io/quiz-show-kit"]'),null);}finally{dom.window.close();}}
 const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');assert.match(readme,/\[Try the BioVista Feature Showcase Quiz\]\(https:\/\/github\.com\/Namdev90\/quiz-show-kit\/releases\/download\//);assert.doesNotMatch(readme,/namdev90\.github\.io\/quiz-show-kit/);
});
