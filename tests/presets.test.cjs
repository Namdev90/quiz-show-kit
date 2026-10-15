const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const P=require('../src/presets.js'),C=require('../src/compiler.js'),{runtime}=require('../scripts/runtime.cjs');
const original=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../quiz.config.json'),'utf8'));
test('All 25 preset/theme combinations build and preserve question pairing',()=>{
 for(const preset of Object.keys(P.catalog().quiz))for(const theme of Object.keys(P.catalog().theme)){
  const c=P.apply(original,`QSK1 preset=${preset} theme=${theme}`),built=C.build(c,runtime(c));
  assert.equal(built.config.questions.length,41);assert.deepEqual(c.questions,original.questions);
  if(theme==='skeuomorphic')assert.match(built.html,/box-shadow:inset 0 2px/);
  if(theme==='glass')assert.match(built.html,/@supports\(backdrop-filter/);
 }
});
test('Portable settings round-trip custom values without retaining questions or personal event data',()=>{
 const c=P.apply(original,'QSK1 preset=seminar theme=skeuomorphic');c.presentation.volume=23;c.rules.graceSeconds=11;
 const saved=P.exportSettings(c),restored=P.apply(original,saved.key,saved);
 for(const key of ['rules','theme','presentation','teams'])assert.deepEqual(C.validate(restored)[key],C.validate(c)[key]);
 assert.equal(saved.settings.questions,undefined);assert.equal(saved.settings.event,undefined);
 assert.throws(()=>P.apply(original,'QSK1',{qskPresetVersion:1,settings:{rules:{primarySeconds:0}}}),/Primary milliseconds/);
 assert.throws(()=>P.apply(original,'QSK1',{qskPresetVersion:1,settings:{questions:[]}}),/Unsupported/);
});
test('Preset decoder rejects unknown versions, duplicate keys, unsupported settings and prototype keys',()=>{
 for(const value of ['QSK2','QSK1 preset=unknown','QSK1 preset=friendly preset=seminar','QSK1 eval=run','QSK1 theme=__proto__'])assert.throws(()=>P.decode(value));
 assert.deepEqual(P.decode('QSK1'),{preset:'friendly',theme:'classroom'});
});
test('Legacy effective presentation round-trips without silently switching narration or motion',()=>{
 const saved=P.exportSettings(original),restored=P.apply(original,undefined,saved);
 assert.equal(restored.presentation.optionSpeech,'letters');assert.equal(restored.presentation.motion,'cinematic');
 assert.deepEqual(restored.rules,original.rules);
});
test('CLI relocated configurations embed bounded source assets and use the saved key',()=>{
 const os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),root=path.resolve(__dirname,'..');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-preset-'));
 try{
  const saved=path.join(directory,'settings.json'),out=path.join(directory,'other','quiz.json'),html=path.join(directory,'quiz.html');
  fs.writeFileSync(saved,JSON.stringify(P.exportSettings(original)));
  cp.execFileSync(process.execPath,[path.join(root,'scripts/preset.cjs'),'--config',path.join(root,'quiz.config.json'),'--settings',saved,'--output',out]);
  const portable=JSON.parse(fs.readFileSync(out));assert.equal(portable.presentation.optionSpeech,'letters');
  assert.ok(Object.values(portable.assets).every(a=>a.data&&!a.file));
  cp.execFileSync(process.execPath,[path.join(root,'scripts/build.cjs'),'--config',out,'--output',html]);
  assert.ok(fs.statSync(html).size>1000000);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('Suggestions react to dependencies and report invalid flow instead of silently repairing it',()=>{
 const c=P.apply(original,'QSK1');c.presentation.sound=false;c.presentation.motion='none';
 const result=P.choices(c,{live:true});assert.ok(result.disabled['rules.passedSeconds']);assert.ok(result.disabled['rules.teacherSeconds']);assert.ok(result.disabled['presentation.voiceName']);assert.ok(result.disabled.questions);assert.equal(result.canBuild,true);
 c.rules.passing=true;c.rules.teacher=true;c.presentation.sound=true;c.presentation.motion='gentle';
 const next=P.choices(c,{localTTS:true});assert.equal(next.disabled['rules.passedSeconds'],undefined);assert.equal(next.disabled['rules.teacherSeconds'],undefined);assert.equal(next.disabled['presentation.voiceName'],undefined);
 c.questions=c.questions.slice(1);assert.equal(P.choices(c).canBuild,false);
});
test('Narration references require existing audio, four slots and bounded voice settings',()=>{
 const c=P.apply(original,'QSK1');c.assets.recording={file:'assets/audio/optionA.wav'};c.questions[0].narration={stem:'recording',options:['recording',null,null,null]};assert.doesNotThrow(()=>C.build(c,runtime(c)));
 for(const mutation of [x=>x.questions[0].narration.stem='missing',x=>x.questions[0].narration.options=['recording'],x=>x.questions[0].narration.extra=true,x=>x.presentation.speechRate=0,x=>x.presentation.voiceLang='<script>',x=>x.assets.recording={data:'data:image/png;base64,AAAA'}]){const x=structuredClone(c);mutation(x);assert.throws(()=>C.validate(x));}
});

test('Authoring setup is explicit and preserves legacy decoder/export shapes and runtime configuration',()=>{
 assert.deepEqual(P.decode('QSK1 preset=competition'),{preset:'competition',theme:'classroom'});
 assert.deepEqual(P.exportSettings(original,{}),P.exportSettings(original));
 assert.equal(P.exportSettings(original).key,'QSK1 preset=custom theme=custom');
 const baseline=P.apply(original,'QSK1 preset=seminar theme=glass');
 for(const setup of ['teacher','competition']){
  assert.deepEqual(P.decode('QSK1 setup='+setup),{preset:'friendly',theme:'classroom',setup});
  const applied=P.apply(original,'QSK1 preset=seminar theme=glass setup='+setup);
  assert.deepEqual(applied,baseline);assert.equal(applied.setup,undefined);assert.equal(applied.mode,undefined);
  const saved=P.exportSettings(applied,{setup});assert.equal(saved.key,'QSK1 preset=custom theme=custom setup='+setup);
  assert.deepEqual(saved.settings,P.exportSettings(baseline).settings);
  assert.deepEqual(P.apply(original,undefined,saved),P.apply(original,undefined,P.exportSettings(baseline)));
 }
});
test('Authoring setup rejects unsupported and duplicate syntax without inferring a replacement',()=>{
 for(const key of ['QSK1 setup=unknown','QSK1 setup=Teacher','QSK1 setup=teacher setup=competition','QSK1 setup=teacher setup=teacher','QSK1 setup=teacher,competition','QSK1 setup=','QSK1 setup=full'])assert.throws(()=>P.decode(key));
 for(const options of [{setup:'full'},{setup:null},{setup:1},{setup:'teacher',mode:'short'},[],null])assert.throws(()=>P.exportSettings(original,options),/setup/);
 const badSaved=P.exportSettings(original);badSaved.key+=' setup=wrong';assert.throws(()=>P.apply(original,'QSK1 preset=friendly',badSaved),/authoring setup/);
});
test('CLI saves and restores authoring setup across preset-only keys, with explicit setup taking priority',()=>{
 const os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),root=path.resolve(__dirname,'..');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-authoring-'));
 try{
  function save(name,key,settings){const output=path.join(directory,name+'.json'),args=[path.join(root,'scripts/preset.cjs'),'--config',path.join(root,'quiz.config.json'),'--save-settings',output];if(key!==undefined)args.push('--key',key);if(settings)args.push('--settings',settings);cp.execFileSync(process.execPath,args,{stdio:'pipe'});return {file:output,value:JSON.parse(fs.readFileSync(output,'utf8'))};}
  const legacy=save('legacy','QSK1 preset=competition');assert.equal(legacy.value.key,'QSK1 preset=custom theme=custom');
  const competition=save('competition','QSK1 preset=competition theme=midnight setup=competition');assert.equal(P.decode(competition.value.key).setup,'competition');
  const imported=save('imported',undefined,competition.file);assert.equal(P.decode(imported.value.key).setup,'competition');
  const changedPreset=save('preset-only','QSK1 preset=friendly theme=classroom',competition.file);assert.equal(P.decode(changedPreset.value.key).setup,'competition');
  const teacher=save('teacher','QSK1 preset=friendly theme=classroom setup=teacher',competition.file);assert.equal(P.decode(teacher.value.key).setup,'teacher');
  assert.deepEqual(teacher.value.settings,changedPreset.value.settings);assert.equal(teacher.value.settings.setup,undefined);assert.equal(teacher.value.settings.mode,undefined);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
