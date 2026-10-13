/* BioVista score-loss choreography. Only presentation; never changes engine scores. */
(() => {
'use strict';
let host={},layer=null,epoch=0,lastError=null;
const seen=new Set(),runs=new Map(),nodes=new Set(),tweens=new Set();
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const safe=(fn,...args)=>{try{fn?.(...args);}catch(error){lastError=error?.message||String(error);}};
function configure(options={}){host={...options};}
function ensureLayer(){
  if(layer?.isConnected)return layer;
  const stage=$('stage');if(!stage)return null;
  layer=document.createElement('div');layer.id='penalty-layer';layer.className='penalty-layer';layer.setAttribute('aria-hidden','true');stage.append(layer);return layer;
}
function designPoint(node,stage,fallback){
  const box=node?.getBoundingClientRect(),frame=stage?.getBoundingClientRect();
  if(!box||!frame||!Number.isFinite(frame.width)||frame.width<=0||box.width<=0||box.height<=0)return fallback;
  const scaleX=frame.width/1920,scaleY=frame.height>0?frame.height/1080:scaleX;
  return {x:clamp((box.left+box.width/2-frame.left)/scaleX,24,1896),y:clamp((box.top+box.height/2-frame.top)/scaleY,24,1020)};
}
function restoreRow(run){
  if(!run.row)return;
  // Only the name/score row is touched. Board height, stats, shadows and expansion remain independent.
  window.gsap?.set?.(run.row,{clearProps:'transform,transformOrigin'});
  for(const [property,value,priority]of run.original){if(value)run.row.style.setProperty(property,value,priority);else run.row.style.removeProperty(property);}
  if(window.gsap?.core?.getCache)window.gsap.core.getCache(run.row).uncache=1;
  run.row.classList.remove('score-loss-dip');
}
function cancelRun(run){
  if(!run||run.cancelled)return;run.cancelled=true;
  for(const tween of run.tweens){tween.kill?.();tweens.delete(tween);}run.tweens.clear();
  for(const token of run.nodes){token.remove();nodes.delete(token);}run.nodes.clear();restoreRow(run);
  if(runs.get(run.team)===run)runs.delete(run.team);
}
function finishRun(run){if(run.cancelled||run.pending||!run.rowDone)return;restoreRow(run);if(runs.get(run.team)===run)runs.delete(run.team);}
function run(team,amount,key,onPoint,options={}){
  if(!['Bio','Vista'].includes(team)||!Number.isSafeInteger(amount)||amount<1||key===null||key===undefined)return false;
  const kind=options.kind==='tie'?'tie':'main',eventKey=[epoch,kind,team,String(key)].join(':');
  if(seen.has(eventKey))return false;
  const stage=$('stage'),surface=ensureLayer();if(!stage||!surface)return false;
  seen.add(eventKey);cancelRun(runs.get(team));
  const id=(kind==='tie'?'tie-score-':'points-')+team.toLowerCase();
  const board=$('score-'+team.toLowerCase()),row=board?.querySelector('.score-main');
  const origin=designPoint($(id),stage,{x:team==='Bio'?785:1135,y:kind==='tie'?207:182});
  const g=window.gsap;
  // A missing library must never leave displayed scores waiting for an animation callback.
  // Huge manual corrections are also settled immediately; normal quiz penalties are exactly two.
  if(amount>100){safe(onPoint,amount,amount);return true;}
  if(!g?.timeline){for(let i=0;i<amount;i++)safe(onPoint,i+1,amount);return true;}
  const state={team,key:eventKey,kind,pending:amount,row,rowDone:!row,cancelled:false,nodes:new Set(),tweens:new Set(),original:[]};runs.set(team,state);
  function remember(tween){state.tweens.add(tween);tweens.add(tween);return tween;}
  function forget(tween){state.tweens.delete(tween);tweens.delete(tween);}
  if(row){
    state.original=['transform','transform-origin','translate','rotate','scale','will-change'].map(property=>[property,row.style.getPropertyValue(property),row.style.getPropertyPriority(property)]);
    row.classList.add('score-loss-dip');row.style.willChange='transform';
    const tilt=team==='Bio'?1.8:-1.8;
    const boardTimeline=g.timeline({onComplete:()=>{forget(boardTimeline);state.rowDone=true;restoreRow(state);finishRun(state);}});
    boardTimeline.data='BioPenalty:board:'+eventKey;
    remember(boardTimeline);
    boardTimeline.to(row,{y:10,rotation:tilt,transformOrigin:team==='Bio'?'75% 50%':'25% 50%',duration:.2,ease:'power2.in'})
      .to(row,{y:7,rotation:tilt*.6,duration:.18,ease:'sine.out'})
      .to(row,{y:0,rotation:0,duration:.76,ease:'elastic.out(1,.65)'});
  }
  const direction=team==='Bio'?-1:1;
  for(let i=0;i<amount;i++){
    const token=document.createElement('i');token.className='lost-point-token';token.dataset.point=String(i+1);token.dataset.team=team;token.textContent='−1';surface.append(token);nodes.add(token);state.nodes.add(token);
    const startX=origin.x+(i-(amount-1)/2)*9,startY=origin.y+9;
    const drift=direction*(25+(i%3)*14),bottom=clamp(startY+150+(i%2)*16,90,1020);
    g.set(token,{left:startX,top:startY,xPercent:-50,yPercent:-50,scale:.58,rotationZ:direction*-12,rotationY:0,opacity:0,force3D:true});
    let impacted=false;
    const impact=()=>{if(state.cancelled||impacted)return;impacted=true;safe(host.sound,'pointLossImpact',{team,point:i+1,total:amount,kind});safe(onPoint,i+1,amount);};
    const tokenTimeline=g.timeline({delay:i*.13,onStart:()=>{if(!state.cancelled)safe(host.sound,'pointFall',{team,point:i+1,total:amount,kind});},onComplete:()=>{
      if(!state.cancelled){impact();token.remove();nodes.delete(token);state.nodes.delete(token);state.pending--;forget(tokenTimeline);finishRun(state);}
    }});
    tokenTimeline.data='BioPenalty:token:'+eventKey+':'+(i+1);remember(tokenTimeline);
    tokenTimeline.to(token,{opacity:1,scale:1,top:startY-9,rotationZ:direction*8,duration:.15,ease:'power2.out'})
      .to(token,{left:startX+drift,top:bottom,rotationY:540,rotationZ:direction*(42+i*17),scale:.88,duration:.64,ease:'power2.in',onComplete:impact})
      .to(token,{top:bottom-12,rotationY:600,scale:.75,opacity:.7,duration:.1,ease:'power2.out'})
      .to(token,{top:bottom+8,rotationY:660,scale:.42,opacity:0,duration:.18,ease:'power2.in'});
  }
  return true;
}
function clear(options={}){
  for(const active of [...runs.values()])cancelRun(active);
  for(const tween of tweens)tween.kill?.();tweens.clear();
  for(const node of nodes)node.remove();nodes.clear();
  if(options.resetDedupe){epoch++;seen.clear();}
  if(options.settle!==false)safe(host.settle);
}
function dispose(){clear({resetDedupe:true});layer?.remove();layer=null;host={};}
window.BioPenalty=Object.freeze({configure,run,clear,dispose,getStatus:()=>({activeRuns:runs.size,tokens:nodes.size,tweens:tweens.size,seen:seen.size,epoch,error:lastError,gsap:window.gsap?.version||null})});
})();
