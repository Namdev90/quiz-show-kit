/* Deterministic runtime-source identity. Generated outputs and Git state are excluded. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const DEFAULT_ROOT=path.resolve(__dirname,'..');
const SCOPE='runtime-source-v1';
function sourceFile(root,relative){
 if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||relative.includes('\\')||relative.split('/').some(part=>part==='..'||part===''))throw Error('Build input must be a relative project file.');
 const full=path.join(root,...relative.split('/')),real=fs.realpathSync(full),inside=path.relative(root,real);
 if(inside==='..'||inside.startsWith('..'+path.sep)||path.isAbsolute(inside)||!fs.statSync(real).isFile())throw Error('Build input must stay inside the project: '+relative);
 return full;
}
function sourcePaths(root,directory='src'){
 const files=[];
 for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){
  const relative=directory+'/'+entry.name;
  if(entry.isSymbolicLink())throw Error('Runtime source inputs must not be symbolic links: '+relative);
  if(entry.isDirectory())files.push(...sourcePaths(root,relative));else if(entry.isFile())files.push(relative);
 }
 return files;
}
function buildProvenance(projectRoot=DEFAULT_ROOT){
 const root=fs.realpathSync(projectRoot),packageFile=sourceFile(root,'package.json');
 const packageData=JSON.parse(fs.readFileSync(packageFile,'utf8'));
 if(typeof packageData.version!=='string'||!packageData.version.trim())throw Error('The package needs a version for build provenance.');
 const manifest=JSON.parse(fs.readFileSync(sourceFile(root,'vendor/manifest.json'),'utf8'));
 if(!Array.isArray(manifest))throw Error('The vendor manifest must be an array.');
 const files=new Set(['package.json','scripts/runtime.cjs','scripts/build-provenance.cjs','vendor/manifest.json',...sourcePaths(root)]);
 if(fs.existsSync(path.join(root,'package-lock.json')))files.add('package-lock.json');
 for(const entry of manifest){files.add(entry.file);for(const license of entry.licenseFiles||[])files.add(license);}
 const digest=crypto.createHash('sha256');digest.update('QSK '+SCOPE+'\0');
 for(const relative of [...files].sort()){
  const bytes=fs.readFileSync(sourceFile(root,relative));
  digest.update(Buffer.byteLength(relative)+':'+relative+'\0'+bytes.length+':');digest.update(bytes);digest.update('\0');
 }
 return {version:packageData.version,sourceDigest:digest.digest('hex'),sourceDigestAlgorithm:'sha256',sourceDigestScope:SCOPE};
}
module.exports={buildProvenance};
