/* BioVista DNA reading bubble. Decorative molecular analogy, not a scientific model.
 * Position is supplied by the same driver that places the HTML clock. No second tween.
 * Three.js 0.186.1 is embedded; Canvas2D is the hardware fallback. No network calls.
 */
(() => {
'use strict';
const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
const smooth = n => { n=clamp(n,0,1);return n*n*(3-2*n); };
const ACTIVE = new Set(['reading','options','answering','acknowledged','passTransition','teacher','tieAnswering']);
const PALETTE = ['#fac45d','#b5a1ff','#84e6c7','#ff9d8b'];
const instances = new WeakMap();

// The open central plateau gives the carrier a genuinely empty reading space.
// Both strand and base-pair positions use this exact envelope, so attachment is continuous.
function sample(x,sign,center,width,height,time,carrierWidth=230) {
  const core=carrierWidth/2+12, shoulder=80;
  const opening=1-smooth((Math.abs(x-center)-core)/shoulder);
  const angle=(x-28)/43-time*.48;
  const radius=Math.min(22,height*.19), bubble=Math.min(49,height*.435);
  return {x, y:height/2+sign*((1-opening)*Math.cos(angle)*radius+opening*bubble),
    z:sign*(1-opening)*Math.sin(angle)*radius, opening};
}

function attach(lane,options={}) {
  if(!lane) return null;
  if(instances.has(lane)) return instances.get(lane);
  const carrier=options.carrier||lane.querySelector('.turn-puck');
  let width=Number(options.width)||lane.clientWidth||1808;
  let height=Number(options.height)||lane.clientHeight||92;
  let carrierWidth=carrier?.offsetWidth||230;
  let progress=.22,phase='idle',paused=false,visible=true,disposed=false,mode='none';
  let frame=null,lastDraw=-Infinity,lastPositionPaint=-Infinity,elapsed=0,lastTick=0,frames=0,dirty=true,painted=false;
  let renderer=null,scene=null,camera=null,ctx=null,canvas=null,tubes=[],pairs=[],owned=[];
  let geometryError=null,observer=null,restoreHandler=null;
  const THREE=window.BioThree,colors=options.colors||['#33d398','#4ba9ee'];
  const container=document.createElement('div');
  container.className='dna3d-surface';container.setAttribute('aria-hidden','true');
  lane.prepend(container);
  const legacy=lane.querySelector('#dna-track');
  const design=()=>({width,height,center:width*progress,carrierWidth});
  const own=obj=>{owned.push(obj);return obj;};

  function makeCanvas() {const node=document.createElement('canvas');node.className='dna3d-canvas';node.setAttribute('aria-hidden','true');container.append(node);return node;}
  function pixelRatio(){return Math.min(window.devicePixelRatio||1,1.75);}
  function ready(kind){mode=kind;lane.classList.add('dna3d-ready');lane.dataset.dnaRenderer=kind;if(legacy)legacy.style.visibility='hidden';}
  function disposeGPU(){
    for(const object of owned.splice(0))object.dispose?.();
    if(renderer){renderer.dispose();renderer=null;}tubes=[];pairs=[];scene=null;camera=null;
  }
  function tubeGeometry(segments=384,sides=8){
    const geometry=own(new THREE.BufferGeometry());
    const positions=new Float32Array((segments+1)*(sides+1)*3),normals=new Float32Array(positions.length),index=[];
    for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
      const a=i*(sides+1)+j,b=a+sides+1;index.push(a,a+1,b,b,a+1,b+1);
    }
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(index);return {geometry,positions,normals,segments,sides};
  }
  function createGPU(){
    if(!THREE?.WebGLRenderer)throw Error('Embedded Three.js is unavailable');
    canvas=makeCanvas();
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
    renderer.setPixelRatio(pixelRatio());renderer.setSize(width,height,false);renderer.setClearColor(0,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    scene=new THREE.Scene();scene.scale.y=-1;scene.position.y=height;
    // Flip the scene (not the camera projection): Three.js then handles front-face winding.
    // This maps design-space Y-down coordinates to the normal Y-up orthographic camera.
    camera=new THREE.OrthographicCamera(0,width,height,0,.1,1000);camera.position.z=300;
    scene.add(new THREE.AmbientLight(0xd6ebf1,1.6));
    const key=new THREE.DirectionalLight(0xffffff,3.3);key.position.set(-150,-130,220);scene.add(key);
    const rim=new THREE.DirectionalLight(0x87c8ff,2);rim.position.set(width,100,-70);scene.add(rim);
    const lower=new THREE.DirectionalLight(0x96ffbd,1.3);lower.position.set(width*.5,height+140,90);scene.add(lower);
    for(const [sign,color,glow]of [[-1,parseInt(colors[0].slice(1),16),0x0d392a],[1,parseInt(colors[1].slice(1),16),0x0e263c]]){
      const data=tubeGeometry();const material=own(new THREE.MeshStandardMaterial({color,metalness:.55,roughness:.26,emissive:glow,emissiveIntensity:.65}));
      const mesh=new THREE.Mesh(data.geometry,material);mesh.frustumCulled=false;scene.add(mesh);tubes.push({...data,mesh,sign});
    }
    const count=Math.ceil(width/29),cylinder=own(new THREE.CylinderGeometry(2.1,2.1,1,8,1));
    const material=own(new THREE.MeshStandardMaterial({metalness:.32,roughness:.35,emissive:0x161315,emissiveIntensity:.18}));
    const beadsGeometry=own(new THREE.SphereGeometry(3.3,8,6));
    const beadMaterial=own(new THREE.MeshStandardMaterial({color:0xb3dfce,metalness:.66,roughness:.22}));
    const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),delta=new THREE.Vector3(),color=new THREE.Color();
    for(let side=0;side<2;side++){
      const sticks=own(new THREE.InstancedMesh(cylinder,material,count)),beads=own(new THREE.InstancedMesh(beadsGeometry,beadMaterial,count));
      sticks.frustumCulled=false;beads.frustumCulled=false;sticks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);beads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for(let i=0;i<count;i++)sticks.setColorAt(i,color.set(PALETTE[(i+(side?2:0))%4]));
      sticks.instanceColor.needsUpdate=true;
      scene.add(sticks,beads);pairs.push({sticks,beads,count,side,dummy,up,delta});
    }
    restoreHandler=event=>{event.preventDefault();geometryError='WebGL context lost; Canvas2D fallback active';fallback();requestDraw();};
    canvas.addEventListener('webglcontextlost',restoreHandler,false);mode='webgl2';
  }
  function fallback(){
    painted=false;
    if(canvas&&restoreHandler)canvas.removeEventListener('webglcontextlost',restoreHandler);restoreHandler=null;
    disposeGPU();canvas?.remove();canvas=makeCanvas();
    try{ctx=canvas.getContext('2d',{alpha:true});}catch(_){ctx=null;}
    if(ctx){const dpr=pixelRatio();canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);mode='canvas2d';}
    else{mode='legacy';canvas.remove();lane.classList.remove('dna3d-ready');lane.dataset.dnaRenderer='legacy';if(legacy)legacy.style.visibility='visible';}
  }
  try{createGPU();}catch(error){geometryError=error?.message||String(error);fallback();}

  function writeTube(data,t){
    const {positions,normals,segments,sides,sign}=data,center=width*progress,end=width-28;
    let offset=0;
    for(let i=0;i<=segments;i++){
      const x=28+(end-28)*i/segments,p=sample(x,sign,center,width,height,t,carrierWidth);
      const before=sample(x-.5,sign,center,width,height,t,carrierWidth),after=sample(x+.5,sign,center,width,height,t,carrierWidth);
      let tx=1,ty=after.y-before.y,tz=after.z-before.z,len=Math.hypot(tx,ty,tz);tx/=len;ty/=len;tz/=len;
      let nx=-ty,ny=tx;len=Math.hypot(nx,ny);nx/=len;ny/=len;
      const bx=-tz*ny,by=tz*nx,bz=tx*ny-ty*nx;
      const radius=3.6+.35*p.opening;
      for(let j=0;j<=sides;j++){
        const angle=j/sides*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),vx=nx*c+bx*s,vy=ny*c+by*s,vz=bz*s;
        positions[offset]=x+vx*radius;normals[offset++]=vx;
        positions[offset]=p.y+vy*radius;normals[offset++]=vy;
        positions[offset]=p.z+vz*radius;normals[offset++]=vz;
      }
    }
    data.geometry.attributes.position.needsUpdate=true;data.geometry.attributes.normal.needsUpdate=true;
  }
  function drawGPU(t){
    for(const tube of tubes)writeTube(tube,t);
    const center=width*progress;
    for(const part of pairs){const {dummy,delta,up,sticks,beads,count,side}=part;
      for(let i=0;i<count;i++){
        const x=28+(width-56)*i/(count-1),a=sample(x,side?1:-1,center,width,height,t,carrierWidth),b=sample(x,side?-1:1,center,width,height,t,carrierWidth);
        const fraction=.5*(1-a.opening*.91),end={x,y:a.y+(b.y-a.y)*fraction,z:a.z+(b.z-a.z)*fraction};
        delta.set(0,end.y-a.y,end.z-a.z);const length=Math.max(.15,delta.length());
        dummy.position.set(x,(a.y+end.y)*.5,(a.z+end.z)*.5);dummy.quaternion.setFromUnitVectors(up,delta.normalize());dummy.scale.set(1,length,1);dummy.updateMatrix();sticks.setMatrixAt(i,dummy.matrix);
        dummy.position.set(x,a.y,a.z);dummy.quaternion.identity();dummy.scale.setScalar(1);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);
      }
      sticks.instanceMatrix.needsUpdate=true;beads.instanceMatrix.needsUpdate=true;
    }
    renderer.render(scene,camera);
  }
  // Same continuous 3D coordinates projected into a depth-sorted Canvas2D fallback.
  // It remains decorative: text and all controls always stay in the HTML carrier.
  function drawCanvas(t){
    ctx.clearRect(0,0,width,height);
    const center=width*progress,segments=[];
    for(let x=28;x<width-28;x+=5)for(const sign of [-1,1]){
      const a=sample(x,sign,center,width,height,t,carrierWidth),b=sample(Math.min(width-28,x+5),sign,center,width,height,t,carrierWidth);
      segments.push({a,b,z:(a.z+b.z)/2,kind:'strand',sign});
    }
    for(let i=0,x=28;x<=width-28;x+=29,i++)for(const sign of [-1,1]){
      const a=sample(x,sign,center,width,height,t,carrierWidth),opposite=sample(x,-sign,center,width,height,t,carrierWidth),f=.5*(1-a.opening*.91);
      const b={x,y:a.y+(opposite.y-a.y)*f,z:a.z+(opposite.z-a.z)*f};segments.push({a,b,z:(a.z+b.z)/2,kind:'base',color:PALETTE[(i+(sign>0?2:0))%4]});
    }
    segments.sort((a,b)=>a.z-b.z);
    ctx.lineCap='round';
    for(const part of segments){const {a,b,kind}=part;ctx.globalAlpha=clamp(.72+part.z/90,.48,1);
      if(kind==='strand'){
        ctx.strokeStyle=part.sign<0?'#174e3e':'#153d60';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(a.x,a.y+2.4);ctx.lineTo(b.x,b.y+2.4);ctx.stroke();
        ctx.strokeStyle=part.sign<0?'#61e0ab':'#71bded';ctx.lineWidth=6.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        ctx.strokeStyle=part.sign<0?'#c7ffdc':'#d3eeff';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a.x,a.y-1.8);ctx.lineTo(b.x,b.y-1.8);ctx.stroke();
      }else{ctx.strokeStyle=part.color;ctx.lineWidth=3.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    ctx.globalAlpha=1;
  }
  function draw(now){
    if(disposed||!visible||document.hidden)return;
    if(lastTick)elapsed+=Math.min(100,Math.max(0,now-lastTick))/1000*(paused?0:1);lastTick=now;
    if(mode==='webgl2'){try{drawGPU(elapsed);}catch(error){geometryError=error?.message||String(error);fallback();if(ctx)drawCanvas(elapsed);}}
    else if(mode==='canvas2d')drawCanvas(elapsed);
    if(!painted&&['webgl2','canvas2d'].includes(mode)){ready(mode);painted=true;}
    lastDraw=now;frames++;dirty=false;
  }
  function tick(now){
    frame=null;if(disposed||!visible||document.hidden)return;
    const moving=ACTIVE.has(phase)&&!paused,interval=moving?1000/60:1000/12;
    if(dirty||(now-lastPositionPaint>33&&now-lastDraw>=interval-1))draw(now);
    if(!paused)frame=requestAnimationFrame(tick);
  }
  function requestDraw(){dirty=true;if(disposed||!visible||document.hidden)return;if(frame===null)frame=requestAnimationFrame(tick);}
  function resize(){
    if(disposed)return;
    const nextWidth=Number(options.width)||lane.clientWidth||1808,nextHeight=Number(options.height)||lane.clientHeight||92;
    carrierWidth=carrier?.offsetWidth||230;
    width=Math.max(320,nextWidth);height=Math.max(80,nextHeight);
    if(renderer){renderer.setPixelRatio(pixelRatio());renderer.setSize(width,height,false);camera.right=width;camera.top=height;scene.position.y=height;camera.updateProjectionMatrix();}
    if(ctx){const dpr=pixelRatio();canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
    requestDraw();
  }
  function onVisibility(){lastTick=0;if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else requestDraw();}
  document.addEventListener('visibilitychange',onVisibility);
  if(typeof ResizeObserver==='function'){observer=new ResizeObserver(resize);observer.observe(lane);}
  const api=Object.freeze({
    setProgress(value){if(!Number.isFinite(value))return;const next=clamp(value,0,1);if(next===progress)return;progress=next;if(!disposed&&visible&&!document.hidden){lastPositionPaint=performance.now();draw(lastPositionPaint);if(frame===null)frame=requestAnimationFrame(tick);}else requestDraw();},
    setPhase(value,details={}){phase=String(value||'idle');paused=!!details.paused;requestDraw();},
    setVisible(value){visible=!!value;container.hidden=!visible;if(!visible&&frame!==null){cancelAnimationFrame(frame);frame=null;lastTick=0;}if(visible)requestDraw();},
    resize,
    dispose(){if(disposed)return;disposed=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;observer?.disconnect();document.removeEventListener('visibilitychange',onVisibility);if(canvas&&restoreHandler)canvas.removeEventListener('webglcontextlost',restoreHandler);disposeGPU();container.remove();lane.classList.remove('dna3d-ready');delete lane.dataset.dnaRenderer;if(legacy)legacy.style.visibility='';instances.delete(lane);},
    getStatus:()=>({renderer:mode,threeRevision:THREE?.REVISION||null,progress,phase,paused,visible,frames,width,height,carrierWidth,error:geometryError,drawCalls:renderer?.info?.render?.calls||0,triangles:renderer?.info?.render?.triangles||0})
  });
  instances.set(lane,api);requestDraw();return api;
}
window.BioDNA=Object.freeze({attach,sample,version:'1.0.0'});
})();
