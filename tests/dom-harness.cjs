const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const file=path.resolve(__dirname,'../dist/Quiz_Offline.html'),html=fs.readFileSync(file,'utf8');
const KEY='quiz-show-kit:test',result={file,sha256:crypto.createHash('sha256').update(html).digest('hex'),environment:'jsdom DOM emulation of the exact saved HTML text in bundled Node24; no browser, file URL, hosted route or network. Platform clock/storage/audio/download adapters are simulated. No layout/speaker claim.',passes:[],failures:[],errors:[],resourceRequests:[],fixtures:[]};
const plain=x=>JSON.parse(JSON.stringify(x));
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
async function load(options={}){
  let time=0,next=1;const frames=new Map();const intervals=new Map(),timeouts=new Map(),memory=new Map(options.storage||[]),blobs=new Map(),notes=[],gainChanges=[],downloads=[],buffers=[],canvas=[],captures=[],recorders=[];
  const vc=new VirtualConsole();vc.on('jsdomError',e=>result.errors.push(e.message));
  const dom=new JSDOM(options.html||html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
    w.fetch=url=>{result.resourceRequests.push(String(url));throw Error('Network disabled in DOM test');};
    w.XMLHttpRequest=class{open(method,url){result.resourceRequests.push(String(url));throw Error('Network disabled in DOM test');}};
    w.WebSocket=class{constructor(url){result.resourceRequests.push(String(url));throw Error('Network disabled in DOM test');}};
    Object.defineProperty(w.performance,'now',{value:()=>time,configurable:true});
    w.setInterval=(fn,ms)=>{const id=next++;intervals.set(id,{fn,ms,nextAt:time+ms});return id;};w.clearInterval=id=>intervals.delete(id);
    w.setTimeout=(fn,ms=0)=>{const id=next++;timeouts.set(id,{fn,at:time+ms});return id;};w.clearTimeout=id=>timeouts.delete(id);
    w.requestAnimationFrame=fn=>{const id=next++;frames.set(id,fn);return id;};w.cancelAnimationFrame=id=>frames.delete(id);
    w.matchMedia=()=>({matches:Boolean(options.reducedPreference),addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
    const storage={getItem(k){if(options.denyStorage)throw Error('Test persistence denial');return memory.has(k)?memory.get(k):null;},setItem(k,v){if(options.denyStorage)throw Error('Test persistence denial');memory.set(k,String(v));},removeItem(k){if(options.denyStorage)throw Error('Test persistence denial');memory.delete(k);}};
    Object.defineProperty(w,'localStorage',{value:storage,configurable:true});
    Object.defineProperty(w.crypto,'getRandomValues',{value:array=>{array.fill(options.coinValue??1);return array;}});w.confirm=()=>w.__confirmResult!==false;w.__confirmResult=true;
    w.URL.createObjectURL=blob=>{const id='blob:test-'+next++;blobs.set(id,blob);return id;};w.URL.revokeObjectURL=id=>blobs.delete(id);
    w.HTMLAnchorElement.prototype.click=function(){downloads.push({href:this.href,name:this.download,blob:blobs.get(this.href)});};
    class AudioContext{
      constructor(){this.state='suspended';this.destination={};}
      get currentTime(){return time/1000;}
      async resume(){this.state='running';}
      createGain(){const isMaster=gainChanges.length===0;const node={gain:{setValueAtTime(value,at){gainChanges.push({value,at,isMaster});},linearRampToValueAtTime(value){node.peak=value;},exponentialRampToValueAtTime(){}},connect(){}};return node;}
      createOscillator(){const n={frequency:{value:0},type:'sine',connect(gain){n.gain=gain;},start(at){notes.push({frequency:n.frequency.value,type:n.type,start:at,requestedAt:time/1000,peak:n.gain?.peak});n.note=notes[notes.length-1];},stop(at){if(n.note)n.note.stop=at;}};return n;}
    }
    w.AudioContext=AudioContext;w.webkitAudioContext=AudioContext;require('./vendor-platform-adapters.cjs')(w,{clock:()=>time,buffers,canvas,captures,recorders},options);
    w.HTMLElement.prototype.requestFullscreen=async()=>{};w.document.exitFullscreen=async()=>{};
    w.addEventListener('error',e=>result.errors.push(e.error?.message||e.message));w.addEventListener('unhandledrejection',e=>result.errors.push(String(e.reason)));
  }});
  const w=dom.window;assert.ok(w.BioQuiz,'Actual UI must initialise');
  const env={dom,w,notes,gainChanges,downloads,memory,buffers,canvas,captures,recorders,get:()=>plain(w.BioQuiz.getState()),query:s=>w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)],text:s=>w.document.querySelector(s)?.textContent||'',async click(selector){const b=w.document.querySelector(selector);assert.ok(b,'Missing control '+selector);assert.equal(b.disabled,true===false,'Disabled control '+selector);b.click();await flush();},async action(type){await env.click('[data-action="'+type+'"]');},async ui(name){await env.click('[data-ui="'+name+'"]');},async advance(ms){const end=time+ms;while(time<end){time=Math.min(end,time+16);const batch=[...frames];frames.clear();for(const[id,fn]of batch)fn(time);for(const job of [...intervals.values()])if(time>=job.nextAt){job.nextAt+=job.ms;job.fn();}for(const[id,job]of [...timeouts])if(job.at<=time){timeouts.delete(id);job.fn();}await flush();}},async key(key,repeat=false){w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key,repeat,bubbles:true}));await flush();},close(){w.BioQuiz.stopForTest();w.BioMotion?.cleanup();dom.window.close();},clock:()=>time};
  await flush();return env;
}

module.exports={load,result,file,html,plain,flush};
