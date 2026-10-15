'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {publish,publishRemote,prepareRelease,listAll}=require('../scripts/publish-release.cjs');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex'),copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
const NOW=Date.parse('2026-10-15T12:00:00Z'),old='2026-10-15T11:55:00Z',recent='2026-10-15T11:59:30Z';
function fixture(t){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-publish-test-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const contents={'one.txt':Buffer.from('Public release fixture one.\n'),'two.bin':Buffer.from([0,1,2,3,255])};
 for(const [name,bytes]of Object.entries(contents))fs.writeFileSync(path.join(directory,name),bytes);
 const context={repository:'Namdev90/quiz-show-kit',version:'1.1.0',tag:'v1.1.0',name:'Public fixture v1.1.0',sourceCommit:'a'.repeat(40),sourceTree:'b'.repeat(40),directory,files:Object.keys(contents)};
 context.body='Public fixture notes.\n\n<!-- QSK_RELEASE_1 repository='+context.repository+' tag='+context.tag+' commit='+context.sourceCommit+' tree='+context.sourceTree+' manifest-sha256='+digest('public fixture manifest')+' -->\n';
 context.artifacts=Object.entries(contents).map(([name,bytes])=>({name,bytes:bytes.length,sha256:digest(bytes)}));
 return {context,contents};
}
function server(f,{tag=false,draft,existing=0,failAfter}={}){
 const c=f.context,base='repos/'+c.repository,store={tag:tag?{ref:'refs/tags/'+c.tag,object:{type:'commit',sha:c.sourceCommit}}:null,releases:[],assets:new Map(),bytes:new Map(),calls:[],next:100,failed:false};
 const owned=(id=1,isDraft=true)=>({id,tag_name:c.tag,target_commitish:c.sourceCommit,name:c.name,body:c.body,draft:isDraft,prerelease:false,html_url:'https://example.invalid/releases/'+id});
 if(draft!==undefined){store.releases.push(owned(1,draft));store.assets.set(1,[]);}
 function asset(name,{id=store.next++,state='uploaded',size=f.contents[name]?.length??0,created_at=old,updated_at=old,bytes=f.contents[name]}={}){const row={id,name,state,size,created_at,updated_at};if(bytes)store.bytes.set(id,Buffer.from(bytes));return row;}
 for(const name of c.files.slice(0,existing))store.assets.get(1).push(asset(name));
 const lost=(operation,value)=>{if(failAfter===operation&&!store.failed){store.failed=true;throw Error('Lost successful '+operation+' response');}return copy(value);};
 const client={
  request(method,endpoint,body,options){store.calls.push({method,endpoint,body:copy(body),options:copy(options)});
   if(endpoint===base+'/git/ref/tags/'+c.tag&&method==='GET')return copy(store.tag);
   if(endpoint===base+'/git/refs'&&method==='POST'){assert.equal(store.tag,null,'No existing tag may be overwritten');store.tag={ref:body.ref,object:{type:'commit',sha:body.sha}};return lost('tag',store.tag);}
   let m=endpoint.match(new RegExp('^'+base+'/releases\\?per_page=100&page=(\\d+)$'));
   if(m&&method==='GET')return copy(store.releases.slice((Number(m[1])-1)*100,Number(m[1])*100));
   if(endpoint===base+'/releases'&&method==='POST'){const release={...owned(),...body};delete release.make_latest;store.releases.push(release);store.assets.set(release.id,[]);return lost('draft',release);}
   m=endpoint.match(new RegExp('^'+base+'/releases/(\\d+)/assets\\?per_page=100&page=(\\d+)$'));
   if(m&&method==='GET')return copy((store.assets.get(Number(m[1]))||[]).slice((Number(m[2])-1)*100,Number(m[2])*100));
   m=endpoint.match(new RegExp('^'+base+'/releases/assets/(\\d+)$'));
   if(m){const id=Number(m[1]),rows=[...store.assets.values()].find(rows=>rows.some(a=>a.id===id)),found=rows?.find(a=>a.id===id);
    if(method==='GET')return copy(found||null);
    if(method==='DELETE'){assert.ok(found,'Delete must identify a known asset');rows.splice(rows.indexOf(found),1);store.bytes.delete(id);return null;}
   }
   m=endpoint.match(new RegExp('^'+base+'/releases/(\\d+)$'));
   if(m){const release=store.releases.find(r=>r.id===Number(m[1]));assert.ok(release,'Known release required');if(method==='GET')return copy(release);if(method==='PATCH'){assert.deepEqual(body,{draft:false,make_latest:'true'});release.draft=false;return lost('publish',release);}}
   throw Error('Unexpected mock request: '+method+' '+endpoint);
  },
  upload(id,file,name){store.calls.push({method:'UPLOAD',id,name});assert.equal(store.releases.find(r=>r.id===id)?.draft,true);assert.equal(path.basename(file),name);const bytes=fs.readFileSync(file),row=asset(name,{bytes,size:bytes.length});store.assets.get(id).push(row);return lost('upload',row);},
  download(id,dest,expectedbytes){store.calls.push({method:'DOWNLOAD',id,expectedbytes});const bytes=store.bytes.get(id);assert.ok(bytes,'Known asset download required');assert.equal(expectedbytes,c.artifacts.find(a=>a.name===[...store.assets.values()].flat().find(a=>a.id===id).name).bytes);fs.writeFileSync(dest,bytes,{flag:'wx'});}
 };
 const mutations=()=>store.calls.filter(call=>!['GET','DOWNLOAD'].includes(call.method));
 return {store,client,owned,asset,mutations};
}
const timing={now:()=>NOW,pause:async()=>{}};
async function complete(f,s,options=timing){const result=await publishRemote(f.context,s.client,options);assert.equal(result.sourceCommit,f.context.sourceCommit);assert.equal(result.downloadedAssetsVerified,2);assert.equal(s.store.releases.find(r=>r.tag_name===f.context.tag).draft,false);return result;}

test('Fresh publication creates an exact tag and owned draft, verifies bytes, then publishes once',async t=>{const f=fixture(t),s=server(f);await complete(f,s);assert.deepEqual(s.mutations().map(x=>x.method),['POST','POST','UPLOAD','UPLOAD','PATCH']);assert.equal(s.store.tag.object.sha,f.context.sourceCommit);assert.equal(s.store.releases[0].body,f.context.body);assert.equal(s.store.calls.filter(x=>x.method==='DOWNLOAD').length,4);assert.equal(s.mutations()[1].body.make_latest,'false');});

test('A tag-only interrupted attempt resumes without recreating or moving its tag',async t=>{const f=fixture(t),s=server(f,{tag:true});await complete(f,s);assert.equal(s.mutations().filter(x=>x.endpoint?.endsWith('/git/refs')).length,0);assert.equal(s.mutations().filter(x=>x.method==='UPLOAD').length,2);});

test('Owned drafts with zero, some or all verified assets upload only missing names',async t=>{for(const count of [0,1,2])await t.test(String(count)+' existing assets',async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true,existing:count});await complete(f,s);assert.deepEqual(s.mutations().filter(x=>x.method==='UPLOAD').map(x=>x.name),f.context.files.slice(count));assert.equal(s.mutations().some(x=>x.method==='POST'||x.method==='DELETE'),false);assert.equal(s.mutations().filter(x=>x.method==='PATCH').length,1);});});

test('Published verification stays read-only and rejects a release that becomes a draft',async t=>{for(const changed of [false,true])await t.test(changed?'concurrent draft change':'newer stable exists',async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:false,existing:2});s.store.releases.push({...s.owned(2,false),tag_name:'v2.0.0'});if(changed){const download=s.client.download;s.client.download=(...args)=>{download(...args);s.store.releases[0].draft=true;};await assert.rejects(publishRemote(f.context,s.client,timing),/draft|state changed/i);}else await complete(f,s);assert.deepEqual(s.mutations(),[]);assert.equal(s.store.calls.filter(x=>x.method==='DOWNLOAD').length,2);});});

test('Wrong tag identity or release ownership is rejected without modifying remote data',async t=>{
 const cases=[['tag commit',s=>{s.store.tag.object.sha='c'.repeat(40);}],['annotated tag',s=>{s.store.tag.object.type='tag';}],['tag ref',s=>{s.store.tag.ref='refs/tags/other';}],['marker',s=>{s.store.releases[0].body=s.store.releases[0].body.replace('manifest-sha256=','other-sha256=');}],['notes',s=>{s.store.releases[0].body+='Other notes';}],['target',s=>{s.store.releases[0].target_commitish='main';}],['title',s=>{s.store.releases[0].name='Another release';}],['prerelease',s=>{s.store.releases[0].prerelease=true;}],['invalid id',s=>{s.store.releases[0].id=0;}],['invalid draft',s=>{s.store.releases[0].draft='true';}],['duplicate release',s=>{s.store.releases.push({...s.store.releases[0],id:2});}]];
 for(const [name,change]of cases)await t.test(name,async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true});change(s);await assert.rejects(publishRemote(f.context,s.client,timing),/tag differs|not owned|Multiple releases/);assert.deepEqual(s.mutations(),[]);});
});

test('Unexpected, duplicate, incomplete or corrupt assets block all uploads and cleanup',async t=>{
 const cases=[['extra',s=>s.store.assets.get(1).push(s.asset('extra.txt',{bytes:Buffer.from('extra'),size:5}))],['duplicate',s=>s.store.assets.get(1).push(s.asset('one.txt'))],['invalid id',s=>{s.store.assets.get(1)[0].id=0;}],['metadata size',s=>{s.store.assets.get(1)[0].size++;}],['same-size wrong bytes',s=>{const id=s.store.assets.get(1)[0].id;s.store.bytes.set(id,Buffer.alloc(s.store.bytes.get(id).length,65));}],['download size',s=>{s.store.bytes.set(s.store.assets.get(1)[0].id,Buffer.from('short'));}],['unknown state',s=>{s.store.assets.get(1)[0].state='processing';}],['nonzero starter',s=>{s.store.assets.get(1)[0].state='starter';}],['bad completed asset before old-starter cleanup',s=>{s.store.assets.get(1).push(s.asset('two.bin',{state:'starter',size:0}));s.store.bytes.set(s.store.assets.get(1)[0].id,Buffer.from('bad'));}]];
 for(const [name,change]of cases)await t.test(name,async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true,existing:1});change(s);await assert.rejects(publishRemote(f.context,s.client,timing),/asset|checksum/i);assert.deepEqual(s.mutations(),[]);});
});

test('Lost successful tag, draft, upload or publish responses resume safely on reinvocation',async t=>{for(const stage of ['tag','draft','upload','publish'])await t.test(stage,async sub=>{const f=fixture(sub),s=server(f,{failAfter:stage});await assert.rejects(publishRemote(f.context,s.client,timing),new RegExp('Lost successful '+stage));const before=s.mutations().length;await complete(f,s);assert.equal(s.store.releases.length,1);assert.equal(s.mutations().filter(x=>x.endpoint?.endsWith('/git/refs')).length,1);assert.equal(s.mutations().filter(x=>x.method==='POST'&&x.endpoint?.endsWith('/releases')).length,1);assert.deepEqual(s.mutations().filter(x=>x.method==='UPLOAD').map(x=>x.name),f.context.files);assert.equal(s.mutations().filter(x=>x.method==='PATCH').length,1);if(stage==='publish')assert.equal(s.mutations().length,before);});});

test('A matching owned draft after the first release page is found rather than duplicated',async t=>{const f=fixture(t),s=server(f,{tag:true,draft:true,existing:1});s.store.releases.unshift(...Array.from({length:100},(_,i)=>({...s.owned(i+2,true),tag_name:'unrelated-'+i})));await complete(f,s);assert.ok(s.store.calls.some(x=>x.endpoint?.endsWith('/releases?per_page=100&page=2')));assert.equal(s.mutations().some(x=>x.method==='POST'),false);assert.equal(s.store.releases.length,101);});

test('Only an unchanged old zero-byte starter is removed; verified completed assets are retained',async t=>{const f=fixture(t),s=server(f,{tag:true,draft:true,existing:1}),starter=s.asset('two.bin',{state:'starter',size:0});s.store.assets.get(1).push(starter);const pauses=[];await complete(f,s,{now:()=>NOW,pause:async ms=>pauses.push(ms)});assert.deepEqual(pauses,[2000]);assert.deepEqual(s.mutations().filter(x=>x.method==='DELETE').map(x=>x.endpoint),['repos/'+f.context.repository+'/releases/assets/'+starter.id]);assert.deepEqual(s.mutations().filter(x=>x.method==='UPLOAD').map(x=>x.name),['two.bin']);});

test('Recent creation or update, and invalid starter timestamps, block cleanup',async t=>{for(const dates of [{created_at:recent},{updated_at:recent},{created_at:'invalid'},{updated_at:'invalid'}])await t.test(JSON.stringify(dates),async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true});s.store.assets.get(1).push(s.asset('one.txt',{state:'starter',size:0,...dates}));await assert.rejects(publishRemote(f.context,s.client,timing),/still recent/);assert.deepEqual(s.mutations(),[]);});});

test('Changed starter metadata or a concurrently published draft is never deleted',async t=>{
 const changes=[['id',(a,s)=>{const request=s.client.request;s.client.request=(method,endpoint,...args)=>{const value=request(method,endpoint,...args);return method==='GET'&&endpoint.endsWith('/releases/assets/'+a.id)?{...value,id:a.id+1}:value;};}],['name',a=>{a.name='two.bin';}],['state',a=>{a.state='uploaded';}],['size',a=>{a.size=1;}],['created_at',a=>{a.created_at=recent;}],['updated_at',a=>{a.updated_at=recent;}],['published',(_a,s)=>{s.store.releases[0].draft=false;}]];
 for(const [name,change]of changes)await t.test(name,async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true}),starter=s.asset('one.txt',{state:'starter',size:0});s.store.assets.get(1).push(starter);await assert.rejects(publishRemote(f.context,s.client,{now:()=>NOW,pause:async()=>change(starter,s)}),/changed during cleanup|already published/);assert.equal(s.mutations().some(x=>x.method==='DELETE'||x.method==='PATCH'),false);});
});

test('Newer published stable releases block publication both initially and immediately before publish',async t=>{for(const when of ['initial','before publish'])await t.test(when,async sub=>{const f=fixture(sub),s=server(f,{tag:true,draft:true,existing:2}),newer={...s.owned(2,false),tag_name:'v1.2.0'};if(when==='initial')s.store.releases.push(newer);else{const request=s.client.request;let lists=0;s.client.request=(method,endpoint,...args)=>{if(method==='GET'&&endpoint.endsWith('/releases?per_page=100&page=1')&&++lists===2)s.store.releases.push(newer);return request(method,endpoint,...args);};}await assert.rejects(publishRemote(f.context,s.client,timing),/newer stable|state changed/);assert.equal(s.mutations().some(x=>x.method==='PATCH'),false);assert.equal(s.store.releases[0].draft,true);});});

test('Pagination rejects invalid responses and refuses unbounded inventories',()=>{assert.throws(()=>listAll({request:()=>({items:[]})},'fixture'),/Invalid paginated/);let calls=0;assert.throws(()=>listAll({request:()=>{calls++;return Array(100).fill({id:1});}},'fixture'),/bounded release pagination/);assert.equal(calls,100);});

test('Authorization and exact source gates reject before any GitHub client call',async t=>{
 const f=fixture(t),valid={GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:f.context.repository,GITHUB_REF:'refs/heads/main',GH_TOKEN:'fixture-token',GITHUB_SHA:f.context.sourceCommit};let calls=0;const client={request(){calls++;throw Error('Remote must not be reached');}};
 for(const change of [{GITHUB_ACTIONS:'false'},{GITHUB_REPOSITORY:'another/repo'},{GITHUB_REF:'refs/heads/topic'},{GH_TOKEN:''}]){const env={...valid,...change};assert.throws(()=>prepareRelease({root:path.join(f.context.directory,'missing'),env}),/authorized main-branch/);await assert.rejects(publish({root:f.context.directory,env,client}),/authorized main-branch/);}
 const root=f.context.directory;fs.mkdirSync(path.join(root,'dist/release'),{recursive:true});fs.writeFileSync(path.join(root,'release.json'),JSON.stringify({version:'1.1.0'}));fs.writeFileSync(path.join(root,'dist/release/Quiz_Show_Kit_Release_Manifest.json'),JSON.stringify({version:'1.1.0',tag:'v1.1.0',sourceCommit:'c'.repeat(40),sourceTree:'d'.repeat(40)}));
 await assert.rejects(publish({root,env:valid,client}),/exact checked workflow commit/);assert.equal(calls,0);
});
