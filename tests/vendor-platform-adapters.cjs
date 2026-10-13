module.exports=function install(w,hooks,options={}){
  const noop=()=>{};const baseDate=w.Date.now();w.Date.now=()=>baseDate+hooks.clock();
  class Track extends w.EventTarget{constructor(kind){super();this.kind=kind;this.readyState='live';this.enabled=true;}clone(){const t=new Track(this.kind);t.original=this;return t;}stop(){this.readyState='ended';}getSettings(){return this.kind==='video'?{displaySurface:'browser',width:1920,height:1080,frameRate:30}:{sampleRate:48000,channelCount:2};}}
  w.MediaStream=class{constructor(tracks=[]){this.tracks=tracks;}getTracks(){return this.tracks;}getAudioTracks(){return this.tracks.filter(t=>t.kind==='audio');}getVideoTracks(){return this.tracks.filter(t=>t.kind==='video');}};
  const gainPrototype=w.AudioContext.prototype,oldGain=gainPrototype.createGain;
  gainPrototype.sampleRate=48000;
  gainPrototype.createGain=function(){const n=oldGain.call(this);n.connect=target=>target||n;n.disconnect=noop;n.gain.value=1;n.gain.cancelScheduledValues=noop;n.gain.setTargetAtTime=(value)=>n.gain.value=value;return n;};
  gainPrototype.createBuffer=function(channels,length,rate){return {numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,getChannelData:()=>new Float32Array(length)};};
  gainPrototype.decodeAudioData=function(bytes,success,error){try{const view=new DataView(bytes),riff=bytes.byteLength>=44&&view.getUint32(0,false)===0x52494646;const rate=riff?view.getUint32(24,true):48000,channels=riff?view.getUint16(22,true):1,bits=riff?view.getUint16(34,true):16;const length=riff?Math.max(1,Math.floor((bytes.byteLength-44)/(channels*bits/8))):4800;const buffer=this.createBuffer(channels,length,rate);if(options.audioDecodeDelayMs)return new Promise(resolve=>w.setTimeout(()=>{success?.(buffer);resolve(buffer);},options.audioDecodeDelayDelayMs||options.audioDecodeDelayMs));if(success)queueMicrotask(()=>success(buffer));return Promise.resolve(buffer);}catch(e){if(error)queueMicrotask(()=>error(e));return Promise.reject(e);}};
  gainPrototype.createBufferSource=function(){const ctx=this,n={buffer:null,loop:false,playbackRate:{value:1,setValueAtTime:noop},connect:target=>target,disconnect:noop,start(at=ctx.currentTime,offset=0,duration){hooks.buffers.push({at,offset,duration:duration??n.buffer?.duration,requestedAt:hooks.clock()/1000});},stop:noop};return n;};
  gainPrototype.createDynamicsCompressor=function(){return {threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0},connect:target=>target,disconnect:noop};};
  gainPrototype.createMediaStreamDestination=function(){return {stream:new w.MediaStream([new Track('audio')]),connect:target=>target,disconnect:noop};};
  gainPrototype.suspend=async function(){this.state='suspended';};gainPrototype.close=async function(){this.state='closed';};
  const oldOsc=gainPrototype.createOscillator;gainPrototype.createOscillator=function(){const n=oldOsc.call(this);n.disconnect=noop;return n;};
  w.HTMLMediaElement.prototype.canPlayType=()=> 'probably';w.HTMLMediaElement.prototype.load=noop;w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=noop;
  // Execute every canvas call, but retain a bounded diagnostic sample: the new
  // continuously drawn DNA fallback would otherwise log millions of objects.
  const canvasLogLimit=options.canvasLogLimit??20000;
  w.HTMLCanvasElement.prototype.getContext=function(){const canvas=this;const ctx={canvas,measureText:text=>({width:String(text).length*9}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:(x,y,width,height)=>({data:new Uint8ClampedArray(width*height*4),width,height})};return new Proxy(ctx,{get(target,key){if(key in target)return target[key];return (...args)=>{if(hooks.canvas.length<canvasLogLimit)hooks.canvas.push({key,args,at:hooks.clock()});else hooks.canvasLogDropped=(hooks.canvasLogDropped||0)+1;};},set(target,key,value){target[key]=value;return true;}});};
  if(!w.SVGElement.prototype.getBBox)w.SVGElement.prototype.getBBox=()=>({x:0,y:0,width:100,height:30});
  if(options.mockCapture){
    Object.defineProperty(w.navigator,'userActivation',{value:{isActive:true},configurable:true});
    Object.defineProperty(w.navigator,'mediaDevices',{value:{getDisplayMedia(config){hooks.captures.push(config);const stream=new w.MediaStream([new Track('video'),...(config.audio?[new Track('audio')]:[])]);return Promise.resolve(stream);},getUserMedia(){throw Error('Microphone/camera must not be requested');}},configurable:true});
    Object.defineProperty(w,'isSecureContext',{value:true,configurable:true});
    w.MediaRecorder=class extends w.EventTarget{
      static isTypeSupported(type){return type.includes('webm');}
      constructor(stream,config){super();this.stream=stream;this.mimeType=config.mimeType;this.state='inactive';hooks.recorders.push(this);}
      emit(){const e=new w.Event('dataavailable');e.data=new w.Blob(['MOCK_VENDOR_BYTES_NOT_A_REAL_VIDEO'],{type:this.mimeType});this.ondataavailable?.(e);}
      start(){this.state='recording';this.timer=w.setInterval(()=>this.emit(),1000);}
      stop(){if(this.state==='inactive')return;this.state='inactive';w.clearInterval(this.timer);queueMicrotask(()=>{this.emit();this.onstop?.(new w.Event('stop'));});}
    };
  }
};
