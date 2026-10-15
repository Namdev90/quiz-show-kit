#!/usr/bin/env node
/* Package a validated, clean, committed checkout. No installs, regeneration, publication or network I/O. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const Compiler=require('../src/compiler.js'),Presets=require('../src/presets.js'),{buildProvenance}=require('./build-provenance.cjs');
const MANIFEST='Quiz_Show_Kit_Release_Manifest.json',CHECKSUMS='Quiz_Show_Kit_SHA256SUMS.txt';
const COMPANIONS=['BioVista_Quiz_Offline.html','BioVista_Question_Bank.docx','BioVista_Question_Bank.meta.json','BioVista_Showcase.qsk-settings.json','BioVista_Quality_Review.html','BioVista_Quality_Review.json'];
const PUBLIC_ARTIFACTS=[['examples/biovista/BioVista_Quiz_Offline.html','BioVista_Quiz_Public_Example.html'],['examples/biovista/BioVista_Question_Bank.docx','BioVista_Question_Bank.docx'],['examples/biovista/BioVista_Showcase.qsk-settings.json','BioVista_Showcase.qsk-settings.json'],['examples/biovista/BioVista_Quality_Review.html','BioVista_Quality_Review.html'],['examples/biovista/BioVista_Quality_Review.json','BioVista_Quality_Review.json'],['docs/CHATGPT_HANDOFF.md','Quiz_Show_Kit_ChatGPT_Handoff.md']];
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function git(root,args){try{return cp.execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']}).trim();}catch(error){throw Error('Git operation failed ('+args[0]+'); a readable local Git checkout and Git executable are required.');}}
function inside(root,file){const relative=path.relative(root,file);return relative!==''&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);}
function fileAt(root,relative){
 if(typeof relative!=='string'||!relative||relative.length>300||/[\\:\x00-\x1f]/.test(relative)||path.isAbsolute(relative)||relative.split('/').includes('..'))throw Error('Release file paths must remain inside the checkout.');
 const filename=path.resolve(root,relative);if(!inside(root,filename))throw Error('Release file paths must remain inside the checkout.');
 let stat,real;try{stat=fs.lstatSync(filename);real=fs.realpathSync(filename);}catch(_){throw Error('Required release file is missing: '+relative);}
 if(!stat.isFile()||stat.isSymbolicLink()||!inside(root,real))throw Error('Release inputs must be contained regular files: '+relative);
 try{git(root,['ls-files','--error-unmatch','--',relative]);}catch(_){throw Error('Release inputs must be tracked by Git: '+relative);}
 return fs.readFileSync(filename);
}
function jsonAt(root,file){try{return JSON.parse(fileAt(root,file).toString('utf8'));}catch(error){if(error instanceof SyntaxError)throw Error('Invalid release JSON: '+file);throw error;}}
function cleanIdentity(root){
 const checkout=fs.realpathSync(git(root,['rev-parse','--show-toplevel']));if(checkout!==root)throw Error('Release root must be the checkout top-level directory.');
 if(git(root,['status','--porcelain=v1','--untracked-files=all']))throw Error('Release packaging requires a clean checkout with all intended tracked and untracked changes committed. Ignored files are excluded.');
 const sourceCommit=git(root,['rev-parse','--verify','HEAD^{commit}']),sourceTree=git(root,['rev-parse','--verify','HEAD^{tree}']);if(!/^[0-9a-f]{40,64}$/.test(sourceCommit)||!/^[0-9a-f]{40,64}$/.test(sourceTree))throw Error('The release requires an identified committed Git tree.');
 return {sourceCommit,sourceTree};
}
function standaloneHandoff(bytes,root,commit){
 const base='https://github.com/Namdev90/quiz-show-kit/blob/'+commit+'/';
 const text=bytes.toString('utf8').replace(/(!?\[[^\]\n]*\]\()(<[^>\n]+>|[^)\s]+)([^)\n]*\))/g,(whole,start,target,end)=>{
  const wrapped=target.startsWith('<'),url=wrapped?target.slice(1,-1):target;if(/^(?:https?:|mailto:|#)/i.test(url))return whole;
  if(/^[a-z][a-z0-9+.-]*:|^\//i.test(url))throw Error('Standalone handoff links must be HTTPS links or contained repository paths.');
  const cut=url.search(/[?#]/),raw=cut===-1?url:url.slice(0,cut),suffix=cut===-1?'':url.slice(cut);let decoded;try{decoded=decodeURIComponent(raw);}catch(_){throw Error('Invalid escaped path in the standalone handoff.');}
  if(decoded.includes('\\')||decoded.startsWith('/'))throw Error('Standalone handoff paths must stay inside the checkout.');
  const relative=path.posix.normalize(path.posix.join('docs',decoded));fileAt(root,relative);
  const resolved=base+relative.split('/').map(encodeURIComponent).join('/')+suffix;return start+(wrapped?'<'+resolved+'>':resolved)+end;
 });
 return Buffer.from('Release source: `'+commit+'`. Relative repository links below are pinned to this exact release commit.\n\n'+text.replaceAll('https://github.com/Namdev90/quiz-show-kit/blob/main/',base));
}
function runtimeIdentity(root,html,version){
 // Every digest input must be tracked so the source archive can reproduce this identity.
 for(const file of ['scripts/runtime.cjs','scripts/build-provenance.cjs','vendor/manifest.json'])fileAt(root,file);
 const visit=directory=>{for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){const relative=directory+'/'+entry.name;if(entry.isDirectory())visit(relative);else fileAt(root,relative);}};visit('src');
 for(const entry of jsonAt(root,'vendor/manifest.json')){fileAt(root,entry.file);for(const file of entry.licenseFiles||[])fileAt(root,file);}
 const expected=buildProvenance(root),matches=[...html.toString('utf8').matchAll(/<script>\s*window\.QSK_BUILD=(\{[^;\r\n]*\});/g)];
 let actual;try{actual=matches.length===1?JSON.parse(matches[0][1]):null;}catch(_){actual=null;}
 if(!actual||actual.version!==version||Compiler.canonical(actual)!==Compiler.canonical(expected))throw Error('The HTML runtime build version or source digest is stale. Rebuild and commit the current example and Pages copies before packaging.');
 return expected;
}
function validateRelease(root){
 const identity=cleanIdentity(root),release=jsonAt(root,'release.json'),pkg=jsonAt(root,'package.json'),lock=jsonAt(root,'package-lock.json');
 const version=release.version;if(typeof version!=='string'||!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version)||version!==pkg.version||version!==lock.version||version!==lock.packages?.['']?.version)throw Error('Release, package and package-lock versions must match a safe semantic version.');
 const tag='v'+version;if(release.tag!==undefined&&release.tag!==tag)throw Error('Release tag must equal v followed by the version.');
 if(typeof release.name!=='string'||!release.name.trim()||release.name.length>160||/[\x00-\x1f\x7f]/.test(release.name))throw Error('Release name must be one nonempty line of at most 160 characters.');
 if(!fileAt(root,release.notes).toString('utf8').trim())throw Error('Release notes must contain text.');
 const config=jsonAt(root,'biovista.showcase.config.json'),validated=Compiler.validate(config),baseFingerprint=Compiler.fingerprint(config);
 for(const name of COMPANIONS){const source=fileAt(root,'examples/biovista/'+name),pages=fileAt(root,'docs/examples/biovista/'+name);if(!source.equals(pages))throw Error('Source and Pages companions differ: '+name);}
 const archive=jsonAt(root,'examples/biovista/original/origin.json'),archiveHash=sha256(fileAt(root,'examples/biovista/original/BioVista_Quiz_Offline.html'));
 if(archiveHash!==archive.publicExampleSha256)throw Error('The historical BioVista archive differs from its recorded hash.');
 const origin=jsonAt(root,'examples/biovista/origin.json'),html=fileAt(root,'examples/biovista/BioVista_Quiz_Offline.html'),htmlHash=sha256(html);
 if(origin.schemaVersion!==2||origin.sourceConfiguration!=='biovista.showcase.config.json'||origin.publicExampleSha256!==htmlHash||origin.profileId!==validated.profileId||origin.questions!==validated.questions.length||origin.historicalArchive?.publicExampleSha256!==archiveHash||origin.authoringSetup!=='competition')throw Error('The current BioVista HTML or provenance does not match the committed showcase configuration.');
 const runtimeBuild=runtimeIdentity(root,html,version);
 const meta=jsonAt(root,'examples/biovista/BioVista_Question_Bank.meta.json'),docxHash=sha256(fileAt(root,'examples/biovista/BioVista_Question_Bank.docx'));
 if(meta.format!=='QSK_EXAMPLE_DOCX_1'||meta.sha256!==docxHash||meta.baseFingerprint!==baseFingerprint||meta.eventId!==config.event.id||meta.cards!==validated.questions.length)throw Error('The question-bank DOCX is stale or differs from its recorded hash/configuration. Regenerate and commit its companions before packaging.');
 const settings=jsonAt(root,'examples/biovista/BioVista_Showcase.qsk-settings.json');
 if(Presets.decode(settings.key).setup!=='competition'||Compiler.canonical(settings)!==Compiler.canonical(Presets.exportSettings(config,{setup:'competition'})))throw Error('Reusable settings must match the current configuration and explicit competition authoring setup.');
 const quality=jsonAt(root,'examples/biovista/BioVista_Quality_Review.json');if(quality.format!=='QSK_EXAMPLE_QUALITY_1'||quality.baseFingerprint!==baseFingerprint||quality.eventId!==config.event.id)throw Error('The quality review is stale for the current showcase configuration.');
 const artifacts=PUBLIC_ARTIFACTS.map(([file,name])=>{const bytes=fileAt(root,file);return {name,bytes:file==='docs/CHATGPT_HANDOFF.md'?standaloneHandoff(bytes,root,identity.sourceCommit):bytes};});
 return {version,tag,name:release.name,notes:release.notes,...identity,runtimeBuild,artifacts};
}
function buildRelease({root=path.resolve(__dirname,'..'),output}={}){
 root=fs.realpathSync(root);output=path.resolve(output||path.join(root,'dist/release'));
 if(output===root||output===path.parse(output).root)throw Error('Choose a dedicated release output directory.');
 if(fs.existsSync(output)&&(!fs.lstatSync(output).isDirectory()||fs.lstatSync(output).isSymbolicLink()||fs.readdirSync(output).length))throw Error('The release output directory must be empty; existing files are never overwritten.');
 const validated=validateRelease(root),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-release-'));
 try{
  const archiveName='Quiz_Show_Kit_v'+validated.version+'.zip',archiveFile=path.join(temporary,archiveName);
  git(root,['archive','--format=zip','--prefix=quiz-show-kit/','--output='+archiveFile,validated.sourceCommit]);
  const artifacts=[{name:archiveName,bytes:fs.readFileSync(archiveFile)},...validated.artifacts];
  const manifest={format:'QSK_RELEASE_1',version:validated.version,tag:validated.tag,name:validated.name,sourceCommit:validated.sourceCommit,sourceTree:validated.sourceTree,runtimeBuild:validated.runtimeBuild,notes:validated.notes,artifacts:artifacts.map(a=>({name:a.name,bytes:a.bytes.length,sha256:sha256(a.bytes)}))};
  const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
  const sums=[...manifest.artifacts.map(a=>a.sha256+'  '+a.name),sha256(manifestBytes)+'  '+MANIFEST].join('\n')+'\n';
  const after=cleanIdentity(root);if(after.sourceCommit!==validated.sourceCommit||after.sourceTree!==validated.sourceTree)throw Error('The committed checkout changed during packaging; retry from a stable clean checkout.');
  if(fs.existsSync(output)&&(!fs.lstatSync(output).isDirectory()||fs.lstatSync(output).isSymbolicLink()||fs.readdirSync(output).length))throw Error('The release output directory changed; retry with an empty directory.');
  fs.mkdirSync(output,{recursive:true});
  for(const artifact of artifacts)fs.writeFileSync(path.join(output,artifact.name),artifact.bytes,{flag:'wx'});
  fs.writeFileSync(path.join(output,MANIFEST),manifestBytes,{flag:'wx'});fs.writeFileSync(path.join(output,CHECKSUMS),sums,{flag:'wx'});
  return {...manifest,output,manifest:MANIFEST,checksums:CHECKSUMS};
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
}
if(require.main===module){
 try{const args=process.argv.slice(2);if(args.length===1&&args[0]==='--help')console.log('node scripts/build-release.cjs [--output EMPTY_DIRECTORY]\nPackage the clean committed checkout into dist/release. Existing outputs are never overwritten; no document regeneration or publishing occurs.');else{if(args.length&&!(args.length===2&&args[0]==='--output'))throw Error('Use only optional --output EMPTY_DIRECTORY.');console.log(JSON.stringify(buildRelease({output:args[1]}),null,2));}}catch(error){console.error('Release packaging failed: '+error.message);process.exitCode=1;}
}
module.exports={buildRelease};
