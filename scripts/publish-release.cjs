#!/usr/bin/env node
'use strict';
// Run only after read-only verification. A retry must use the original workflow SHA.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),cp=require('node:child_process');
const {assertStableVersion}=require('./release-policy.cjs');
const REPOSITORY='Namdev90/quiz-show-kit',MANIFEST='Quiz_Show_Kit_Release_Manifest.json',CHECKSUMS='Quiz_Show_Kit_SHA256SUMS.txt';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const readHash=file=>hash(fs.readFileSync(file));
const positiveId=value=>Number.isSafeInteger(value)&&value>0;
function releaseFiles(version){return [`Quiz_Show_Kit_v${version}.zip`,'BioVista_Quiz_Public_Example.html','BioVista_Question_Bank.docx','BioVista_Showcase.qsk-settings.json','BioVista_Quality_Review.html','BioVista_Quality_Review.json','Quiz_Show_Kit_ChatGPT_Handoff.md',MANIFEST,CHECKSUMS];}
function prepareRelease({root=path.resolve(__dirname,'..'),env=process.env}={}){
 if(env.GITHUB_ACTIONS!=='true'||env.GITHUB_REPOSITORY!==REPOSITORY||env.GITHUB_REF!=='refs/heads/main'||!env.GH_TOKEN)throw Error('Publishing is restricted to the authorized main-branch release workflow.');
 const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim(),directory=path.join(root,'dist/release');
 const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8')),manifestBytes=fs.readFileSync(path.join(directory,MANIFEST)),manifest=JSON.parse(manifestBytes);
 assertStableVersion(release.version);
 if(manifest.version!==release.version||manifest.tag!=='v'+release.version)throw Error('Release version/manifest mismatch.');
 if(manifest.sourceCommit!==env.GITHUB_SHA||manifest.sourceCommit!==git('rev-parse','HEAD')||manifest.sourceTree!==git('rev-parse','HEAD^{tree}'))throw Error('Release artifacts must match the exact checked workflow commit.');
 if(git('status','--porcelain','--untracked-files=all'))throw Error('Release checkout must remain clean.');
 const files=releaseFiles(release.version);
 if(JSON.stringify(fs.readdirSync(directory).sort())!==JSON.stringify([...files].sort()))throw Error('Unexpected release asset inventory.');
 for(const name of files){const stat=fs.lstatSync(path.join(directory,name));if(!stat.isFile()||stat.isSymbolicLink())throw Error('Release assets must be regular files.');}
 const declared=manifest.artifacts;
 if(!Array.isArray(declared)||declared.length!==files.length-2||new Set(declared.map(a=>a.name)).size!==declared.length)throw Error('Invalid artifact manifest inventory.');
 for(const a of declared){if(!files.slice(0,-2).includes(a.name)||!Number.isSafeInteger(a.bytes)||a.bytes<0||!/^[a-f0-9]{64}$/.test(a.sha256)||fs.statSync(path.join(directory,a.name)).size!==a.bytes||readHash(path.join(directory,a.name))!==a.sha256)throw Error('Release artifact changed: '+a.name);}
 const expectedSums=[...declared.map(a=>a.sha256+'  '+a.name),hash(manifestBytes)+'  '+MANIFEST].join('\n')+'\n';
 if(fs.readFileSync(path.join(directory,CHECKSUMS),'utf8')!==expectedSums)throw Error('Release checksums differ from the verified manifest.');
 if(typeof release.name!=='string'||!release.name.trim()||release.name.length>160||/[\x00-\x1f\x7f]/.test(release.name)||release.notes!==`docs/releases/v${release.version}.md`)throw Error('Invalid release title or versioned notes path.');
 const notes=fs.readFileSync(path.join(root,release.notes),'utf8');
 const marker=`<!-- QSK_RELEASE_1 repository=${REPOSITORY} tag=${manifest.tag} commit=${manifest.sourceCommit} tree=${manifest.sourceTree} manifest-sha256=${hash(manifestBytes)} -->`;
 return {repository:REPOSITORY,version:release.version,tag:manifest.tag,name:release.name,body:notes.trimEnd()+'\n\n'+marker+'\n',sourceCommit:manifest.sourceCommit,sourceTree:manifest.sourceTree,directory,files,artifacts:files.map(name=>({name,bytes:fs.statSync(path.join(directory,name)).size,sha256:readHash(path.join(directory,name))}))};
}
function githubClient(){
 function run(args,{input,maxBuffer=4*1024*1024,binary=false}={}){return cp.execFileSync('gh',args,{input,encoding:binary?undefined:'utf8',maxBuffer,stdio:['pipe','pipe','pipe']});}
 return {
  request(method,endpoint,body,{missing=false}={}){
   const args=['api','--method',method,endpoint];if(body!==undefined)args.push('--input','-');
   try{const text=run(args,{input:body===undefined?undefined:JSON.stringify(body)});return text.trim()?JSON.parse(text):null;}
   catch(error){if(missing&&/HTTP 404/.test(String(error.stderr||'')))return null;throw error;}
  },
  upload(id,file,name){return JSON.parse(run(['api','--method','POST',`https://uploads.github.com/repos/${REPOSITORY}/releases/${id}/assets?name=${encodeURIComponent(name)}`,'-H','Content-Type: application/octet-stream','--input',file]));},
  download(id,file,bytes){fs.writeFileSync(file,run(['api',`repos/${REPOSITORY}/releases/assets/${id}`,'-H','Accept: application/octet-stream'],{binary:true,maxBuffer:Math.max(1024*1024,bytes+1)}),{flag:'wx'});}
 };
}
function listAll(client,endpoint){
 const all=[];
 for(let page=1;page<=100;page++){const rows=client.request('GET',endpoint+`?per_page=100&page=${page}`);if(!Array.isArray(rows))throw Error('Invalid paginated GitHub response.');all.push(...rows);if(rows.length<100)return all;}
 throw Error('GitHub inventory exceeds the bounded release pagination limit.');
}
function newerStable(releases,version){
 const parts=version.split('.').map(BigInt);
 return releases.some(release=>{if(release.draft||release.prerelease||!/^v(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/.test(release.tag_name))return false;const other=release.tag_name.slice(1).split('.').map(BigInt);for(let i=0;i<3;i++){if(other[i]!==parts[i])return other[i]>parts[i];}return false;});
}
async function publishRemote(context,client,{now=Date.now,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 const c=context,base=`repos/${c.repository}`,temporary=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-release-verify-'));
 const tag=()=>client.request('GET',`${base}/git/ref/tags/${c.tag}`,undefined,{missing:true});
 const checkTag=()=>{const found=tag();if(found?.ref!=='refs/tags/'+c.tag||found.object?.type!=='commit'||found.object.sha!==c.sourceCommit)throw Error('Release tag differs from the exact checked source commit.');return found;};
 const owned=release=>{if(!release||!positiveId(release.id)||release.tag_name!==c.tag||release.target_commitish!==c.sourceCommit||release.name!==c.name||release.body!==c.body||release.prerelease!==false||typeof release.draft!=='boolean')throw Error('Existing release is not owned by this exact source/manifest; no content will be overwritten.');return release;};
 const readRelease=id=>owned(client.request('GET',`${base}/releases/${id}`));
 const requireDraft=id=>{const release=readRelease(id);if(!release.draft)throw Error('Release is already published; retry to verify it without changes.');checkTag();return release;};
 const allReleases=()=>listAll(client,`${base}/releases`);
 const findRelease=releases=>{const matches=releases.filter(r=>r.tag_name===c.tag);if(matches.length>1)throw Error('Multiple releases use this tag; refusing ambiguous draft ownership.');return matches.length?owned(matches[0]):null;};
 const inventory=id=>{const rows=listAll(client,`${base}/releases/${id}/assets`),seen=new Set();for(const a of rows){if(!positiveId(a.id)||!c.files.includes(a.name)||seen.has(a.name))throw Error('Unexpected or duplicate remote release asset.');seen.add(a.name);}return rows;};
 let downloadIndex=0;
 const verifyAsset=asset=>{const expected=c.artifacts.find(a=>a.name===asset.name);if(asset.state!=='uploaded'||asset.size!==expected.bytes)throw Error('Remote asset is incomplete or differs in size: '+asset.name);const file=path.join(temporary,String(++downloadIndex));client.download(asset.id,file,expected.bytes);if(fs.statSync(file).size!==expected.bytes||readHash(file)!==expected.sha256)throw Error('Downloaded release checksum mismatch: '+asset.name);};
 const verifyAll=id=>{const rows=inventory(id);if(rows.length!==c.files.length)throw Error('Published release inventory differs from the verified package.');for(const a of rows)verifyAsset(a);};
 const result=release=>({release:release.html_url,sourceCommit:c.sourceCommit,downloadedAssetsVerified:c.files.length});
 try{
  // Enumerating releases also finds private drafts; by-tag lookup only promises published releases.
  let releases=allReleases(),release=findRelease(releases);
  if(release&&!release.draft){checkTag();verifyAll(release.id);if(readRelease(release.id).draft)throw Error('Published release became a draft during verification.');checkTag();return result(release);}
  if(newerStable(releases,c.version))throw Error('A newer stable release exists; an older retry cannot replace Latest.');
  if(tag())checkTag();else{client.request('POST',`${base}/git/refs`,{ref:'refs/tags/'+c.tag,sha:c.sourceCommit});checkTag();}
  if(!release){release=owned(client.request('POST',`${base}/releases`,{tag_name:c.tag,target_commitish:c.sourceCommit,name:c.name,body:c.body,draft:true,prerelease:false,make_latest:'false'}));}
  requireDraft(release.id);
  const rows=inventory(release.id);
  // Validate every existing completed file before any upload or cleanup.
  for(const a of rows)if(a.state==='uploaded')verifyAsset(a);else if(a.state!=='starter'||a.size!==0)throw Error('Unrecognized incomplete release asset: '+a.name);
  for(const a of rows.filter(a=>a.state==='starter')){
   const created=Date.parse(a.created_at),updated=Date.parse(a.updated_at);
   if(!Number.isFinite(created)||!Number.isFinite(updated)||now()-Math.max(created,updated)<120000)throw Error('Incomplete upload is still recent; retry the original workflow after two minutes: '+a.name);
   await pause(2000);requireDraft(release.id);
   const latest=client.request('GET',`${base}/releases/assets/${a.id}`,undefined,{missing:true});
   if(latest){if(latest.id!==a.id||latest.name!==a.name||latest.state!=='starter'||latest.size!==0||latest.created_at!==a.created_at||latest.updated_at!==a.updated_at)throw Error('Incomplete asset changed during cleanup; retry without deleting it.');client.request('DELETE',`${base}/releases/assets/${a.id}`,undefined,{missing:true});}
  }
  const present=new Set(rows.filter(a=>a.state==='uploaded').map(a=>a.name));
  for(const name of c.files)if(!present.has(name)){requireDraft(release.id);client.upload(release.id,path.join(c.directory,name),name);}
  requireDraft(release.id);verifyAll(release.id);
  releases=allReleases();const current=findRelease(releases);if(!current||current.id!==release.id||!current.draft||newerStable(releases,c.version))throw Error('Release state changed before publication; no publish attempted.');
  requireDraft(release.id);
  client.request('PATCH',`${base}/releases/${release.id}`,{draft:false,make_latest:'true'});
  const published=readRelease(release.id);if(published.draft)throw Error('Release remains a draft.');checkTag();verifyAll(release.id);checkTag();
  return result(published);
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
}
async function publish(options={}){const context=prepareRelease(options);return publishRemote(context,options.client||githubClient(),options.timing);}
if(require.main===module)publish().then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error('Release publication stopped: '+error.message);process.exitCode=1;});
module.exports={publish,prepareRelease,publishRemote,githubClient,listAll};
