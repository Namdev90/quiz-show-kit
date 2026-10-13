/* Genuine browser screen capture. It never changes quiz state or requests microphone/camera access. */
(function (root) {
  'use strict';
  const MAX_SECONDS=90,MAX_BYTES=128*1024*1024;
  let session=null,lastRecording=null,lastURL='',serial=0;
  let getQuizAudioStream=()=>root.BioAudio?.getCaptureStream?.()||null;
  const listeners=new Set(),boundStops=new WeakSet();
  let state={phase:'idle',elapsedSeconds:0,maxSeconds:MAX_SECONDS,audioRequested:false,hasAudio:false,audioSource:'none',bytes:0,mimeType:'',filename:'',displaySurface:'unknown',message:'Click Record rehearsal to choose the quiz tab or window. No microphone is used.',error:'',downloadRequested:false};
  const clock=()=>root.performance?.now?.()??Date.now();
  function chooseMime(audio=true) {
    if(typeof root.MediaRecorder!=='function')return '';
    const candidates=audio?['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']:['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    if(typeof root.MediaRecorder.isTypeSupported!=='function')return '';
    return candidates.find(type=>root.MediaRecorder.isTypeSupported(type))||'';
  }
  function getSupport() {
    const capture=typeof root.navigator?.mediaDevices?.getDisplayMedia==='function',record=typeof root.MediaRecorder==='function',secure=root.isSecureContext!==false,mimeType=chooseMime();
    const available=capture&&record&&secure&&Boolean(mimeType);
    const reason=!secure?'This browser context does not permit screen capture.':!capture?'This browser does not offer screen/window capture here.':!record?'This browser does not provide MediaRecorder.':!mimeType?'WebM recording is unavailable in this browser. Use a current Chrome or Edge browser.':'A real click and the browser’s screen/window picker are required for every recording.';
    return {available,capture,record,secure,mimeType,reason};
  }
  function getStatus(){return {...state,hasRecording:Boolean(lastRecording?.blob?.size),lastFilename:lastRecording?.filename||'',lastBytes:lastRecording?.blob?.size||0};}
  function indicator() {
    const doc=root.document;if(!doc)return;
    let badge=doc.getElementById('recording-indicator');
    if(!badge) {
      const style=doc.createElement('style');style.textContent='#recording-indicator{position:absolute;z-index:60;top:8px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;border:2px solid #b72a38;border-radius:14px;background:#fff6f4;color:#8b1523;padding:8px 15px;font:700 19px/1.25 Segoe UI,Arial,sans-serif;box-shadow:0 5px 16px #0003}#recording-indicator[hidden]{display:none}#recording-indicator button{font:700 17px Segoe UI,Arial,sans-serif;padding:7px 12px;background:#a51d2e;color:white;border:1px solid #7a101d;border-radius:8px;box-shadow:none}';doc.head?.append(style);
      badge=doc.createElement('div');badge.id='recording-indicator';badge.setAttribute('role','status');badge.setAttribute('aria-live','polite');
      const label=doc.createElement('span');label.dataset.recorderLabel='';const stopButton=doc.createElement('button');stopButton.type='button';stopButton.dataset.recorderStop='';stopButton.textContent='Stop';
      badge.append(label,stopButton);(doc.getElementById('header-status')||doc.getElementById('stage')||doc.body)?.append(badge);
    }
    const active=['requesting','recording','stopping'].includes(state.phase);badge.hidden=!active;
    const label=badge.querySelector('[data-recorder-label]'),text=state.phase==='requesting'?'CHOOSE QUIZ TAB / WINDOW':state.phase==='stopping'?'FINALISING RECORDING':'● RECORDING '+String(Math.floor(state.elapsedSeconds/60)).padStart(2,'0')+':'+String(Math.floor(state.elapsedSeconds%60)).padStart(2,'0');if(label&&label.textContent!==text)label.textContent=text;
    const button=badge.querySelector('[data-recorder-stop]');if(button){if(!boundStops.has(button)){button.addEventListener('click',()=>stop('Stopped by host'));boundStops.add(button);}button.disabled=state.phase==='stopping';button.textContent=state.phase==='requesting'?'Cancel':'Stop';}
  }
  function publish(patch={}) {
    state={...state,...patch};indicator();const status=getStatus();
    for(const listener of listeners){try{listener(status);}catch(_){}}
    if(root.CustomEvent)root.dispatchEvent?.(new root.CustomEvent('biovista-recorder-status',{detail:status}));
  }
  function onStatus(listener){if(typeof listener!=='function')return ()=>{};listeners.add(listener);try{listener(getStatus());}catch(_){}return ()=>listeners.delete(listener);}
  function stopTrack(track){try{if(track.readyState!=='ended')track.stop();}catch(_){}}
  function cleanup(s) {
    for(const timer of [s.interval,s.cap,s.fallback])if(timer){root.clearInterval(timer);root.clearTimeout(timer);}
    for(const [track,listener]of s.endListeners)track.removeEventListener?.('ended',listener);
    s.endListeners=[];for(const track of s.owned)stopTrack(track);
  }
  function releasePrevious(){if(lastURL){root.URL?.revokeObjectURL?.(lastURL);lastURL='';}lastRecording=null;}
  function download() {
    if(!lastRecording?.blob?.size)return false;
    try {
      if(!lastURL)lastURL=root.URL.createObjectURL(lastRecording.blob);
      const a=root.document.createElement('a');a.href=lastURL;a.download=lastRecording.filename;a.style.display='none';root.document.body.append(a);a.click();a.remove();
      publish({downloadRequested:true,message:(state.error?'A partial recording is available. ':'')+'Video download requested. Check Downloads; Save video can request it again.'});return true;
    } catch(error){publish({downloadRequested:false,error:String(error.message||error),message:'The video is ready, but its download was blocked. Use Save video.'});return false;}
  }
  function finish(s) {
    if(s.finished)return;s.finished=true;cleanup(s);
    if(session!==s){s.resolve(false);return;}
    session=null;const blob=new root.Blob(s.chunks,{type:s.recorder?.mimeType||s.mimeType||'video/webm'});
    const elapsed=Math.max(0,((s.ended??clock())-s.started)/1000);
    if(!blob.size){publish({phase:'error',elapsedSeconds:elapsed,error:s.error||'No video data was returned by the browser.',message:'No recording file was created because the capture contained no video data.',bytes:0});s.resolve(false);return;}
    releasePrevious();const filename='BioVista_Rehearsal_'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.webm';lastRecording={blob,filename};
    publish({phase:'ready',elapsedSeconds:elapsed,bytes:blob.size,mimeType:blob.type,filename,error:s.error||'',message:'Recording is ready. '+s.reason});download();s.resolve(true);
  }
  function failStart(s,error) {
    s.cancelled=true;cleanup(s);if(session!==s){s.resolve(false);return false;}session=null;
    const denied=error?.name==='NotAllowedError';publish({phase:'error',error:String(error?.message||error),message:denied?'Capture was cancelled or denied. No recording started. Click Record again when ready.':'Recording could not start: '+String(error?.message||error)});s.resolve(false);return false;
  }
  async function start(options={}) {
    if(['requesting','recording','stopping'].includes(state.phase))return false;
    const support=getSupport();if(!support.available){publish({phase:'error',error:support.reason,message:support.reason});return false;}
    if(root.navigator?.userActivation?.isActive===false){publish({phase:'error',error:'A real user click is required.',message:'Click Record rehearsal yourself, then select the quiz tab/window in the browser picker.'});return false;}
    const s={id:++serial,owned:new Set(),endListeners:[],chunks:[],bytes:0,started:0,cancelled:false,finished:false,reason:'Stopped by host',error:'',recorder:null};s.done=new Promise(resolve=>s.resolve=resolve);session=s;
    const audioRequested=options.audio===true,maxSeconds=Math.min(MAX_SECONDS,Math.max(1,Number(options.maxSeconds)||MAX_SECONDS));
    publish({phase:'requesting',elapsedSeconds:0,maxSeconds,audioRequested,hasAudio:false,audioSource:'none',bytes:0,filename:'',error:'',downloadRequested:false,message:'Choose the quiz tab or window in the browser picker. Capture is not active yet.'});
    let quizClones=[];
    if(audioRequested) {
      try{const bus=getQuizAudioStream?.();for(const track of (bus?.getAudioTracks?.()||[]).filter(t=>t.readyState!=='ended'&&typeof t.clone==='function')){const copy=track.clone();s.owned.add(copy);quizClones.push(copy);}}catch(_){for(const track of quizClones)stopTrack(track);quizClones=[];}
    }
    try {
      // This call remains in the original click task, before any await. The user always chooses the source.
      const request={video:{displaySurface:'browser',frameRate:30},audio:audioRequested&&!quizClones.length,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',systemAudio:audioRequested&&!quizClones.length?'include':'exclude'};
      const screen=await root.navigator.mediaDevices.getDisplayMedia(request);
      for(const track of screen.getTracks())s.owned.add(track);
      if(s.cancelled||session!==s){cleanup(s);return false;}
      const video=screen.getVideoTracks().filter(track=>track.readyState!=='ended');if(!video.length)throw Error('The selected source has no live video track.');
      const screenAudio=screen.getAudioTracks();const selectedAudio=audioRequested?(quizClones.length?quizClones:screenAudio):[];
      for(const track of screenAudio)if(!selectedAudio.includes(track))stopTrack(track);
      const recordTracks=[...video,...selectedAudio];
      const stream=typeof root.MediaStream==='function'?new root.MediaStream(recordTracks):screen;
      const mimeType=chooseMime(Boolean(selectedAudio.length));if(!mimeType)throw Error('This browser cannot encode WebM.');s.mimeType=mimeType;
      const recorder=new root.MediaRecorder(stream,{mimeType,videoBitsPerSecond:6000000,audioBitsPerSecond:128000});s.recorder=recorder;
      recorder.ondataavailable=event=>{if(s.finished||!event.data?.size)return;s.chunks.push(event.data);s.bytes+=event.data.size;if(session===s)publish({bytes:s.bytes});if(s.bytes>=MAX_BYTES)stop('Recording reached its memory safety limit');else if(session===s&&state.phase==='recording'&&clock()-s.started>=state.maxSeconds*1000)stop('Rehearsal time limit reached');};
      recorder.onstop=()=>finish(s);
      recorder.onerror=event=>{if(s.finished||session!==s)return;s.error=String(event.error?.message||event.message||'Browser recording error');stop('Browser recording interrupted');};
      for(const track of video){const listener=()=>stop('Screen sharing ended');track.addEventListener?.('ended',listener);s.endListeners.push([track,listener]);}
      recorder.start(1000);s.started=clock();
      const audioSource=selectedAudio.length?(quizClones.length?'quiz':'screen'):'none';
      publish({phase:'recording',hasAudio:Boolean(selectedAudio.length),audioSource,mimeType,displaySurface:video[0].getSettings?.().displaySurface||'unknown',message:audioSource==='quiz'?'Recording includes the quiz sound track. Use Test sound if the browser has suspended playback.':audioSource==='screen'?'Recording includes audio offered by the selected screen/tab.':'Recording is video-only, without audio. No microphone is substituted.'});
      s.interval=root.setInterval(()=>{if(session!==s)return;const elapsedSeconds=Math.max(0,(clock()-s.started)/1000);publish({elapsedSeconds});if(elapsedSeconds>=maxSeconds)stop('Rehearsal time limit reached');},250);
      s.cap=root.setTimeout(()=>stop('Rehearsal time limit reached'),maxSeconds*1000);
      return true;
    } catch(error){return failStart(s,error);}
  }
  function stop(reason='Stopped by host') {
    const s=session;if(!s)return Promise.resolve(false);
    if(state.phase==='requesting'){s.cancelled=true;cleanup(s);session=null;publish({phase:'idle',message:'Capture request cancelled. Close the browser picker if it remains open.'});s.resolve(false);return Promise.resolve(false);}
    if(state.phase==='stopping')return s.done;
    s.reason=reason;s.ended=clock();publish({phase:'stopping',message:'Finalising the genuine capture and releasing screen sharing.'});
    for(const timer of [s.interval,s.cap])if(timer){root.clearInterval(timer);root.clearTimeout(timer);}
    s.fallback=root.setTimeout(()=>{s.error=s.error||'The browser did not finish normally; only returned video chunks were preserved.';finish(s);},5000);
    try{if(s.recorder?.state!=='inactive')s.recorder.stop();}catch(error){s.error=String(error.message||error);finish(s);}
    for(const [track,listener]of s.endListeners)track.removeEventListener?.('ended',listener);s.endListeners=[];for(const track of s.owned)stopTrack(track);
    return s.done;
  }
  function reset(){if(session)return false;releasePrevious();publish({phase:'idle',elapsedSeconds:0,bytes:0,filename:'',downloadRequested:false,error:'',message:'Click Record rehearsal to choose the quiz tab or window. No microphone is used.'});return true;}
  function configure(options={}){if(typeof options.getQuizAudioStream==='function')getQuizAudioStream=options.getQuizAudioStream;}
  root.addEventListener?.('pagehide',()=>stop('Quiz page closed'));
  root.BioRecorder=Object.freeze({start,stop,download,reset,getStatus,getSupport,supported:()=>getSupport().available,onStatus,configure,getBlob:()=>lastRecording?.blob||null});
  indicator();
})(typeof window!=='undefined'?window:globalThis);
