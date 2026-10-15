(() => {
'use strict';
const assets=JSON.parse(document.getElementById('asset-data').textContent);
const SYNTH={
opening:[[392,.10],[523,.10],[659,.12],[784,.18]],round:[[523,.08],[698,.15]],read:[[440,.055],[494,.08]],next:[[523,.055],[587,.075]],start:[[466,.05],[622,.11]],acknowledge:[[554,.06],[554,.06]],select:[[740,.045]],correct:[[523,.08],[659,.08],[784,.15]],incorrect:[[180,.20],[120,.28]],pass:[[440,.06],[588,.09]],passedStart:[[588,.045],[784,.065]],timeup:[[260,.09],[200,.15]],countdown:[[660,.025]],pause:[[392,.045],[330,.06]],resume:[[330,.045],[392,.08]],cancel:[[494,.045],[415,.06]],lifeline:[[523,.06],[698,.06],[880,.12]],lifelineResume:[[698,.055],[523,.055],[784,.10]],undo:[[587,.04],[494,.04],[440,.07]],tieStart:[[440,.06],[660,.06],[880,.11]],tied:[[392,.07],[392,.08]],winner:[[523,.08],[659,.08],[784,.10],[1047,.22]],faculty:[[349,.05],[466,.08]],correction:[[466,.05],[554,.09]],replace:[[415,.04],[554,.04],[740,.08]],interruption:[[294,.07],[247,.09]],settings:[[494,.045],[622,.055]],host:[[330,.04],[440,.075]],scoreTools:[[370,.04],[554,.075]],eventLog:[[415,.035],[622,.065]],unmute:[[622,.05],[831,.075]],mode:[[466,.04],[698,.07]],starting:[[523,.04],[784,.07]],rules:[[440,.045],[554,.075]],review:[[349,.04],[523,.075]],save:[[622,.035],[740,.05],[932,.08]],fullscreen:[[392,.035],[784,.08]],coin:[[659,.03],[784,.03],[988,.08]],motion:[[440,.04],[660,.06]],reset:[[294,.05],[392,.05],[523,.07]],close:[[415,.045]],warning:[[247,.055],[247,.065]],test:[[440,.07],[554,.07],[659,.09]],volume:[[600,.025]],goldCoin:[[1568,.055]],pointFall:[[760,.035],[510,.05],[260,.10]],coinCinematic:[[392,.09],[523,.10],[659,.11],[784,.16]],coinResult:[[523,.09],[659,.09],[880,.17]],showCinematic:[[262,.10],[392,.10],[523,.12],[659,.12],[784,.20]],urgency:[[700,.025]],answerStart:[[523,.07],[784,.12]]
};
const clips=new Map(),nodes=new Set(),subscribers=new Set();
let enabled=false,muted=false,volume=.8,context=null,compressor=null,capture=null,initializing=null,lastError='',lastLetter='',lastLetterAt=-Infinity,nextCue=0;
const diagnostics={clipPlays:0,coinPlays:0,lossPlays:0,letterPlays:0,synthPlays:0,speechPlays:0,narrationPlays:0,lastCue:'',lastSpeech:'',loaded:[],failures:[]};
const speech={voiceName:'',voiceLang:'en-IN',speechRate:1};
let speechSerial=0,utterance=null,narration=null,speechError='';
const sourceKeys=[...new Set(['coinSound','selectA','selectB','selectC','selectD','optionA','optionB','optionC','optionD',...Object.keys(assets).filter(key=>/^data:audio\//.test(assets[key]?.data||''))])];
function status(){return {enabled,muted,volume,state:context?.state||'uninitialised',engine:'Howler.js + Web Audio',error:lastError,loaded:[...diagnostics.loaded],captureAudioReady:Boolean(capture),speech:{available:localVoices().length>0,voices:localVoices().length,speaking:Boolean(utterance||narration),error:speechError,...speech}};}
function notify(){for(const fn of subscribers){try{fn(status());}catch(_){}}}
function wireBus(){
 context=window.Howler?.ctx||null;
 if(!context||!window.Howler?.masterGain)return;
 if(compressor)return;
 compressor=context.createDynamicsCompressor();
 compressor.threshold.value=-3;compressor.knee.value=4;compressor.ratio.value=16;compressor.attack.value=.003;compressor.release.value=.13;
 window.Howler.masterGain.disconnect();window.Howler.masterGain.connect(compressor);compressor.connect(context.destination);
 if(context.createMediaStreamDestination){capture=context.createMediaStreamDestination();compressor.connect(capture);}
}
function loadClips(){
 if(initializing)return initializing;
 initializing=(async()=>{
  if(typeof window.Howl!=='function'||!window.Howler)throw Error('The embedded audio library did not load.');
  const jobs=sourceKeys.map(key=>new Promise(resolve=>{
   const data=assets[key]?.data;if(!data){diagnostics.failures.push(key+':missing');resolve(false);return;}
   const format=/^data:audio\/(wav|x-wav|wave)/.test(data)?'wav':/^data:audio\/ogg/.test(data)?'ogg':'mp3';
   let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timeout);if(ok)diagnostics.loaded.push(key);else diagnostics.failures.push(key+':decode');resolve(ok);};
   const timeout=setTimeout(()=>done(false),5000);
   try{const sound=new Howl({src:[data],format:[format],preload:true,html5:false,volume:key==='coinSound'?.68:key.startsWith('option')?.98:.68,onload:()=>done(true),onloaderror:()=>done(false),onplayerror:()=>{lastError='Audio needs another browser gesture. Click any quiz control or Test sound to retry.';enabled=false;notify();}});clips.set(key,sound);}catch(_){done(false);}
  }));
  wireBus();if(context&&context.state!=='running')await context.resume();await Promise.all(jobs);
  if(!diagnostics.loaded.includes('coinSound'))throw Error('The embedded coin sound could not be decoded.');
  return true;
 })().catch(e=>{initializing=null;lastError=e.message;notify();throw e;});
 return initializing;
}
async function enable(){
 try{await loadClips();wireBus();if(context)await context.resume();enabled=!context||context.state==='running';if(!enabled)throw Error('Audio needs another user gesture.');Howler.mute(muted);Howler.volume(volume);lastError=diagnostics.failures.length?'Some optional audio clips were unavailable.':'';notify();return true;}
 catch(e){enabled=false;lastError=e.message;notify();return false;}
}
function setVolume(value=.8){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));if(volume===0)stopSpeech();if(window.Howler)Howler.volume(volume);notify();}
function setMuted(value=false){muted=Boolean(value);if(muted)stopAll();if(window.Howler)Howler.mute(muted);notify();}
function stopAll(){stopSpeech();for(const clip of clips.values())try{clip.stop();}catch(_){}for(const node of [...nodes])try{node.stop();}catch(_){}nodes.clear();nextCue=context?.currentTime||0;lastLetter='';}

// Only local browser voices are eligible: an exported quiz never requests a cloud voice.
function localVoices(){try{return (window.speechSynthesis?.getVoices?.()||[]).filter(v=>v.localService===true);}catch(_){return [];}}
function listVoices(){return localVoices().map(v=>({name:v.name,lang:v.lang,default:Boolean(v.default)}));}
function configureSpeech(settings={}){stopSpeech();if(typeof settings.voiceName==='string')speech.voiceName=settings.voiceName.slice(0,160);if(typeof settings.voiceLang==='string'&&/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(settings.voiceLang))speech.voiceLang=settings.voiceLang;if(Number.isFinite(settings.speechRate)&&settings.speechRate>=.5&&settings.speechRate<=2)speech.speechRate=settings.speechRate;notify();}
function stopSpeech(){speechSerial++;try{if(utterance)window.speechSynthesis?.cancel();}catch(_){}utterance=null;if(narration){try{clips.get(narration)?.stop();}catch(_){}narration=null;}}
function canSpeak(assetKey){return Boolean(assetKey&&/^data:audio\//.test(assets[assetKey]?.data||''))||Boolean(window.SpeechSynthesisUtterance&&localVoices().length);}
function speak(text,{assetKey=null}={}){
 if(!enabled||muted||volume===0||typeof text!=='string'||!text.trim())return false;
 stopSpeech();for(const key of ['optionA','optionB','optionC','optionD','selectA','selectB','selectC','selectD'])try{clips.get(key)?.stop();}catch(_){}
 const serial=speechSerial,clip=assetKey&&clips.get(assetKey);
 if(clip?.state()==='loaded'&&/^data:audio\//.test(assets[assetKey]?.data||'')){
  narration=assetKey;const done=()=>{if(serial===speechSerial){narration=null;notify();}};
  try{const id=clip.play();clip.once?.('end',done,id);clip.once?.('playerror',done,id);diagnostics.narrationPlays++;diagnostics.lastSpeech=text;speechError='';notify();return true;}catch(_){narration=null;}
 }
 const voices=localVoices(),lang=speech.voiceLang.toLowerCase();
 const voice=voices.find(v=>v.name===speech.voiceName)||voices.find(v=>v.lang.toLowerCase()===lang)||voices.find(v=>v.lang.toLowerCase().split('-')[0]===lang.split('-')[0]);
 if(!voice||typeof window.SpeechSynthesisUtterance!=='function'){speechError='No installed local voice matches this language. Choose another language/voice or embed a recording.';notify();return false;}
 try{
  utterance=new SpeechSynthesisUtterance(text.trim());utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=speech.speechRate;utterance.volume=volume;
  utterance.onend=()=>{if(serial===speechSerial){utterance=null;notify();}};
  utterance.onerror=event=>{if(serial===speechSerial){utterance=null;speechError='Voice playback was interrupted or unavailable ('+(event.error||'speech error')+').';notify();}};
  window.speechSynthesis.speak(utterance);diagnostics.speechPlays++;diagnostics.lastSpeech=text;speechError='';notify();return true;
 }catch(_){utterance=null;speechError='Local speech could not start. Try Test voice after another click.';notify();return false;}
}
function voicesChanged(){notify();window.dispatchEvent(new Event('qskvoiceschanged'));}
window.speechSynthesis?.addEventListener?.('voiceschanged',voicesChanged);

function playClip(key,{letter=false,loss=false,rate=1}={}){
 const clip=clips.get(key);if(!clip||clip.state()!=='loaded')return false;
 if(letter){const t=performance.now();if(key===lastLetter&&t-lastLetterAt<180)return true;lastLetter=key;lastLetterAt=t;for(const other of ['optionA','optionB','optionC','optionD'])if(other!==key)clips.get(other)?.stop();diagnostics.letterPlays++;}
 const playId=clip.play();if(typeof clip.rate==='function')clip.rate(rate,playId);diagnostics.clipPlays++;if(loss)diagnostics.lossPlays++;else if(key==='coinSound')diagnostics.coinPlays++;return true;
}
function cue(kind,options={}){
 diagnostics.lastCue=kind;if(!enabled||muted)return false;
 if(/^option[A-D]$/.test(kind)){stopSpeech();return playClip(kind,{letter:true});}
 if(/^select[A-D]$/.test(kind)){stopSpeech();return playClip(kind)||playClip('option'+kind.slice(-1),{letter:true});}
 if(kind==='goldCoin')return playClip('coinSound');
 if(kind==='pointLossImpact')return playClip('coinSound',{loss:true,rate:.7});
 if(!context||!Howler?.masterGain)return false;
 if(context.state!=='running'){context.resume().catch(()=>{});return false;}
 if(kind==='incorrect')stopAll();
 const seq=kind==='urgency'?[[options.frequency||700,.045]]:SYNTH[kind]||SYNTH.select;
 let t=['urgency','incorrect','pointFall'].includes(kind)?context.currentTime:Math.max(context.currentTime,nextCue);
 for(const [frequency,duration]of seq){
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=kind==='incorrect'?'square':kind==='timeup'?'triangle':'sine';oscillator.frequency.value=frequency;
  const peak=kind==='pointFall'?.12:kind==='incorrect'?.46:kind==='urgency'?Math.min(.35,Math.max(.10,(options.gain??.15)*2.1)):.28;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(peak,t+.006);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);oscillator.connect(gain);gain.connect(Howler.masterGain);nodes.add(oscillator);
  oscillator.onended=()=>{nodes.delete(oscillator);try{oscillator.disconnect();gain.disconnect();}catch(_){}};oscillator.start(t);oscillator.stop(t+duration+.012);t+=duration+.025;diagnostics.synthPlays++;
 }
 if(!['urgency','pointFall'].includes(kind))nextCue=t;return true;
}
function subscribe(fn){subscribers.add(fn);fn(status());return()=>subscribers.delete(fn);}
function getCaptureStream(){return capture?.stream||null;}
function dispose(){stopAll();window.speechSynthesis?.removeEventListener?.('voiceschanged',voicesChanged);for(const clip of clips.values())try{clip.unload();}catch(_){}clips.clear();subscribers.clear();}
window.BioAudio=Object.freeze({enable,cue,setMuted,setVolume,configureSpeech,listVoices,canSpeak,speak,stopSpeech,getStatus:status,stopAll,getCaptureStream,subscribe,dispose,cueNames:()=>[...Object.keys(SYNTH),...sourceKeys,'goldCoin','pointLossImpact'],getDiagnostics:()=>JSON.parse(JSON.stringify(diagnostics))});
})();
