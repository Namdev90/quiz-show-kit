/* Public QSK1 preset decoder and authoring guardrails. No network or hidden state. */
'use strict';
const Compiler=require('./compiler.js');
const copy=x=>JSON.parse(JSON.stringify(x));
const rules=(seconds,passing,teacher,passed,consult,wrong=0,passPoints=5,passWrong=0)=>({primarySeconds:seconds,passedSeconds:passed,teacherSeconds:consult,graceSeconds:8,optionsRevealMs:1800,passTransitionMs:1000,scoring:{directCorrect:10,primaryWrong:wrong,passedCorrect:passPoints,passedWrong:passWrong},passing,teacher,shortPairsPerRound:2});
const quiz={
 friendly:{label:'Friendly classroom',rules:rules(30,false,false,7,7)},
 seminar:{label:'Discussion seminar',rules:rules(45,true,true,15,15)},
 revision:{label:'Focused revision',rules:rules(20,false,true,7,10)},
 competition:{label:'Quiz competition',rules:rules(15,true,true,7,7,-2,2,-5)},
 'visual-lab':{label:'Visual laboratory',rules:rules(45,true,true,15,15)}
};
const theme={
 classroom:{label:'Classroom teal',background:'#102f35',surface:'#214b53',text:'#f4faf9',font:'Segoe UI',motif:'none',style:'flat'},
 lecture:{label:'Lecture light',background:'#e8edf2',surface:'#ffffff',text:'#172c3b',font:'Arial',motif:'none',style:'flat'},
 midnight:{label:'Midnight blue',background:'#0b1428',surface:'#192a46',text:'#f3f7ff',font:'Segoe UI',motif:'none',style:'flat'},
 skeuomorphic:{label:'Skeuomorphic desk',background:'#251e18',surface:'#493b30',text:'#fff3db',font:'Georgia',motif:'none',style:'skeuomorphic'},
 glass:{label:'Glass studio',background:'#10182d',surface:'#223750',text:'#f4f8ff',font:'Segoe UI',motif:'none',style:'glass'}
};
function decode(key){
 if(typeof key!=='string'||key.length>500)throw Error('QSK1 key must be text up to 500 characters.');
 const parts=key.trim().split(/\s+/);if(parts.shift()!=='QSK1')throw Error('Unsupported preset protocol; expected QSK1.');
 const result={preset:'friendly',theme:'classroom'},seen=new Set();
 for(const token of parts){const match=/^(preset|theme)=([a-z-]+)$/.exec(token);if(!match||seen.has(match[1]))throw Error('Use QSK1 preset=<id> theme=<id>, without duplicate fields.');seen.add(match[1]);result[match[1]]=match[2];}
 if(result.preset!=='custom'&&!Object.hasOwn(quiz,result.preset))throw Error('Unknown quiz preset.');
 if(result.theme!=='custom'&&!Object.hasOwn(theme,result.theme))throw Error('Unknown theme preset.');
 return result;
}
function apply(config,key,saved){
 const selection=decode(key??saved?.key??'QSK1'),c=copy(config);
 if(selection.preset!=='custom'){
  c.rules=copy(quiz[selection.preset].rules);
  c.presentation={...c.presentation,motion:selection.preset==='competition'?'cinematic':'gentle',sound:true,volume:60,spokenOptions:true,optionSpeech:'smart',readQuestions:false,voiceName:'',voiceLang:'en-IN',speechRate:1};
 }
 if(selection.theme!=='custom'){const {label,...values}=theme[selection.theme];c.theme=copy(values);}
 if(saved!==undefined){
  if(!saved||saved.qskPresetVersion!==1||!saved.settings||typeof saved.settings!=='object'||Array.isArray(saved.settings))throw Error('Expected a QSK settings file, version 1.');
  if(Object.keys(saved).some(k=>!['qskPresetVersion','key','settings'].includes(k)))throw Error('Unsupported settings file field.');
  const allowed=['teams','theme','presentation','rules','gameplay','localization'];
  for(const [field,value]of Object.entries(saved.settings)){if(!allowed.includes(field))throw Error('Unsupported reusable setting: '+field);c[field]=copy(value);}
 }
 Compiler.validate(c);return c;
}
function exportSettings(config){
 const validated=Compiler.validate(config);
 const presentation=validated.presentation||{motion:'cinematic',sound:true,volume:80,spokenOptions:true,confetti:true,rewards:true,intro:true,coinAnimation:true,questionAnimation:true,winnerAnimation:true,optionSpeech:'letters',voiceName:'',voiceLang:'en-IN',speechRate:1,readQuestions:false};
 return {qskPresetVersion:1,key:'QSK1 preset=custom theme=custom',settings:copy({teams:config.teams,theme:validated.theme,presentation,rules:config.rules||{},...(validated.gameplay?{gameplay:validated.gameplay}:{}),...(validated.localization?{localization:validated.localization}:{})})};
}
function choices(config,capabilities={}){
 const p=config.presentation||{},r=config.rules||{};
 const enabled=(value,canonical,defaultValue)=>value===undefined?(canonical===undefined?defaultValue:canonical):value;
 const sound=p.sound!==false&&p.volume!==0,passing=enabled(r.passing,r.passingEnabled,true),teacher=enabled(r.teacher,r.teacherEnabled,true);
 const disabled={};
 function hide(keys,reason){for(const key of keys)disabled[key]=reason;}
 if(!passing)hide(['rules.passedSeconds','rules.passTransitionMs','rules.scoring.passedCorrect','rules.scoring.passedWrong'],'Passing is off; enable it before changing receiving-team settings.');
 if(!teacher)hide(['rules.teacherSeconds'],'Faculty lifeline is off.');
 if(!sound)hide(['presentation.spokenOptions','presentation.optionSpeech','presentation.voiceName','presentation.voiceLang','presentation.speechRate','presentation.readQuestions'],'Sound is off or volume is zero.');
 else if(p.spokenOptions===false)hide(['presentation.optionSpeech'],'Spoken option cues are off.');
 if(!capabilities.localTTS)hide(['presentation.voiceName','presentation.voiceLang','presentation.speechRate'],'No verified local speech voice; use embedded recordings or letter cues.');
 if(!sound||(!capabilities.localTTS&&!capabilities.stemRecording))hide(['readQuestion'],'Question narration needs enabled sound and a local voice or an embedded stem recording.');
 if(p.motion==='none'||capabilities.reducedMotion)hide(['presentation.coinAnimation','presentation.questionAnimation','presentation.winnerAnimation','presentation.confetti','presentation.rewards'],'Decorative motion is disabled; gameplay and scoring remain active.');
 if(capabilities.live)hide(['rules','teams','questions','rounds','theme','gameplay','localization'],'Change game structure before the event, then rebuild; live settings are presentation-only.');
 let errors=[];try{Compiler.validate(config);}catch(error){errors=[error.message];}
 const warnings=[];
 if(p.optionSpeech==='full')warnings.push('Read full options on host request; do not lengthen or block the scoring clock with narration.');
 if(r.primarySeconds<10)warnings.push('Short answer time: rehearse reading and decision time with this audience.');
 return {protocol:'QSK1',quizPresets:[...Object.keys(quiz),'custom'],themePresets:[...Object.keys(theme),'custom'],disabled,canBuild:errors.length===0,errors,warnings};
}
module.exports={decode,apply,exportSettings,choices,catalog:()=>copy({quiz,theme})};
