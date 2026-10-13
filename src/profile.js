/* Quiz Show Kit rule profiles. No I/O, dependencies or silent clamping. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.QSKProfile=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const defaults={primaryMs:15000,passedMs:7000,teacherMs:7000,graceMs:8000,optionsIntroMs:1800,passTransitionMs:1000,maxTickGapMs:2500,directPoints:10,passedPoints:2,wrongPoints:-2,passedWrongPoints:-5,passingEnabled:true,teacherEnabled:true,shortPairsPerRound:2};
  const accepted=new Set([...Object.keys(defaults),'primarySeconds','passedSeconds','teacherSeconds','graceSeconds','optionsRevealMs','scoring','passing','teacher']);
  function object(value,label){if(!value||Object.prototype.toString.call(value)!=='[object Object]')throw new Error(label+' must be an object.');}
  function number(value,label,min,max){if(typeof value!=='number'||!Number.isFinite(value)||!Number.isInteger(value)||value<min||value>max)throw new Error(label+' must be a whole number from '+min+' to '+max+'.');return value;}
  function alias(raw,canonical,human,factor=1,source=raw){
    const a=own(raw,canonical),b=human&&own(source,human);
    if(b&&typeof source[human]!=='number')throw new Error(human+' must be a number.');
    const converted=b?source[human]*factor:undefined;
    if(a&&b&&raw[canonical]!==converted)throw new Error('Conflicting '+canonical+' and '+human+' values.');
    return a?raw[canonical]:b?converted:defaults[canonical];
  }
  function flag(raw,canonical,human){const a=own(raw,canonical),b=own(raw,human);if(a&&b&&raw[canonical]!==raw[human])throw new Error('Conflicting '+canonical+' and '+human+' values.');const value=a?raw[canonical]:b?raw[human]:defaults[canonical];if(typeof value!=='boolean')throw new Error(human+' must be true or false.');return value;}
  function normalizeRules(raw={}){
    object(raw,'Rules');for(const key of Object.keys(raw))if(!accepted.has(key))throw new Error('Unknown rule: '+key);
    const scoring=raw.scoring===undefined?{}:raw.scoring;object(scoring,'Scoring');
    for(const key of Object.keys(scoring))if(!['directCorrect','primaryWrong','passedCorrect','passedWrong'].includes(key))throw new Error('Unknown scoring rule: '+key);
    const passingEnabled=flag(raw,'passingEnabled','passing'),teacherEnabled=flag(raw,'teacherEnabled','teacher');
    const result={
      primaryMs:number(alias(raw,'primaryMs','primarySeconds',1000),'Primary milliseconds',1000,600000),
      passedMs:number(alias(raw,'passedMs','passedSeconds',1000),'Passed milliseconds',passingEnabled?1000:0,600000),
      teacherMs:number(alias(raw,'teacherMs','teacherSeconds',1000),'Teacher milliseconds',teacherEnabled?1000:0,120000),
      graceMs:number(alias(raw,'graceMs','graceSeconds',1000),'Entry grace milliseconds',1000,60000),
      optionsIntroMs:number(alias(raw,'optionsIntroMs','optionsRevealMs'),'Options reveal milliseconds',400,20000),
      passTransitionMs:number(alias(raw,'passTransitionMs',null),'Pass transition milliseconds',passingEnabled?300:0,10000),
      maxTickGapMs:number(alias(raw,'maxTickGapMs',null),'Interruption threshold',2500,2500),
      directPoints:number(alias(raw,'directPoints','directCorrect',1,scoring),'Direct correct points',1,100),
      passedPoints:number(alias(raw,'passedPoints','passedCorrect',1,scoring),'Passed correct points',0,100),
      wrongPoints:number(alias(raw,'wrongPoints','primaryWrong',1,scoring),'Primary wrong points',-100,0),
      passedWrongPoints:number(alias(raw,'passedWrongPoints','passedWrong',1,scoring),'Passed wrong points',-100,0),
      passingEnabled,teacherEnabled,
      shortPairsPerRound:number(alias(raw,'shortPairsPerRound',null),'Short-mode pairs per round',1,10000)
    };
    return Object.freeze(result);
  }
  return Object.freeze({normalizeRules});
});
