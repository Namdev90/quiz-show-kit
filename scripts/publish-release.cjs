#!/usr/bin/env node
'use strict';
// Run only after the read-only release verification job succeeds.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'dist/release');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
function gh(args){return cp.execFileSync('gh',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});}
function requireAbsent(endpoint,label){
 const result=cp.spawnSync('gh',['api',endpoint],{cwd:root,encoding:'utf8'});
 if(result.status===0)throw Error(label+' already exists; historical releases and tags are never overwritten.');
 if(!/HTTP 404/.test(result.stderr||''))throw Error('Could not confirm that '+label+' is absent. Check the GitHub authentication/permissions result; no publication attempted.');
}
function publish(){
 const repository='Namdev90/quiz-show-kit';
 if(process.env.GITHUB_ACTIONS!=='true'||process.env.GITHUB_REPOSITORY!==repository||process.env.GITHUB_REF!=='refs/heads/main'||!process.env.GH_TOKEN)throw Error('Publishing is restricted to the authorized main-branch release workflow.');
 const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'Quiz_Show_Kit_Release_Manifest.json'),'utf8'));
 if(!/^\d+\.\d+\.\d+$/.test(release.version)||manifest.version!==release.version||manifest.tag!=='v'+release.version)throw Error('Release version/manifest mismatch.');
 if(manifest.sourceCommit!==process.env.GITHUB_SHA||manifest.sourceCommit!==git('rev-parse','HEAD')||manifest.sourceTree!==git('rev-parse','HEAD^{tree}'))throw Error('Release artifacts must match the exact checked workflow commit.');
 if(git('status','--porcelain','--untracked-files=normal'))throw Error('Release checkout must remain clean.');
 const files=[`Quiz_Show_Kit_v${release.version}.zip`,'BioVista_Quiz_Public_Example.html','BioVista_Question_Bank.docx','BioVista_Showcase.qsk-settings.json','BioVista_Quality_Review.html','BioVista_Quality_Review.json','Quiz_Show_Kit_ChatGPT_Handoff.md','Quiz_Show_Kit_Release_Manifest.json','Quiz_Show_Kit_SHA256SUMS.txt'];
 if(JSON.stringify(fs.readdirSync(directory).sort())!==JSON.stringify([...files].sort()))throw Error('Unexpected release asset inventory.');
 const declared=manifest.artifacts;
 if(!Array.isArray(declared)||declared.length!==files.length-2||new Set(declared.map(a=>a.name)).size!==declared.length)throw Error('Invalid artifact manifest inventory.');
 for(const artifact of declared){
  if(!files.slice(0,-2).includes(artifact.name)||!Number.isSafeInteger(artifact.bytes)||!/^[a-f0-9]{64}$/.test(artifact.sha256))throw Error('Invalid release artifact record.');
  const file=path.join(directory,artifact.name);
  if(fs.lstatSync(file).isSymbolicLink()||fs.statSync(file).size!==artifact.bytes||hash(file)!==artifact.sha256)throw Error('Release artifact changed: '+artifact.name);
 }
 if(typeof release.name!=='string'||!release.name.trim()||release.name.length>200||/[\r\n]/.test(release.name)||release.notes!==`docs/releases/v${release.version}.md`)throw Error('Invalid release title or versioned notes path.');
 const notes=path.join(root,release.notes);if(!fs.statSync(notes).isFile())throw Error('Missing release notes.');
 const tag=manifest.tag;
 requireAbsent(`repos/${repository}/releases/tags/${tag}`,'Release '+tag);
 requireAbsent(`repos/${repository}/git/ref/tags/${tag}`,'Tag '+tag);
 // Atomic creation fails if another writer created this tag after the read.
 const createdTag=JSON.parse(gh(['api','--method','POST',`repos/${repository}/git/refs`,'-f','ref=refs/tags/'+tag,'-f','sha='+manifest.sourceCommit]));
 if(createdTag.ref!=='refs/tags/'+tag||createdTag.object?.type!=='commit'||createdTag.object.sha!==manifest.sourceCommit)throw Error('Created tag does not match the checked source commit.');
 // gh creates a draft, uploads the assets, then publishes it. No clobber flags.
 gh(['release','create',tag,...files.map(file=>path.join(directory,file)),'--repo',repository,'--verify-tag','--target',manifest.sourceCommit,'--title',release.name,'--notes-file',notes,'--latest']);
 const download=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-release-download-'));
 try{
  gh(['release','download',tag,'--repo',repository,'--dir',download]);
  if(JSON.stringify(fs.readdirSync(download).sort())!==JSON.stringify([...files].sort()))throw Error('Published release inventory differs from the verified package.');
  for(const file of files)if(hash(path.join(download,file))!==hash(path.join(directory,file)))throw Error('Downloaded release checksum mismatch: '+file);
  const published=JSON.parse(gh(['release','view',tag,'--repo',repository,'--json','url,isDraft,isPrerelease,targetCommitish']));
  if(published.isDraft||published.isPrerelease||published.targetCommitish!==manifest.sourceCommit)throw Error('Published release state does not match the verified source.');
  const remoteTag=JSON.parse(gh(['api',`repos/${repository}/git/ref/tags/${tag}`]));
  if(remoteTag.object?.type!=='commit'||remoteTag.object.sha!==manifest.sourceCommit)throw Error('Published tag differs from the verified source commit.');
  console.log(JSON.stringify({release:published.url,sourceCommit:manifest.sourceCommit,downloadedAssetsVerified:files.length},null,2));
 }finally{fs.rmSync(download,{recursive:true,force:true});}
}
try{publish();}catch(error){console.error('Release publication stopped: '+error.message);process.exitCode=1;}
