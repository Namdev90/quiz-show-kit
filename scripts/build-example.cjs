#!/usr/bin/env node
/* Build the current public BioVista showcase without changing its historical archive. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const Compiler=require('../src/compiler.js'),Bank=require('../src/question-bank.js'),Presets=require('../src/presets.js'),Profile=require('../src/profile.js');
const {runtime,root}=require('./runtime.cjs'),BankCLI=require('./question-bank.cjs');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const json=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
// SHA-256 of canonical normalized rules recovered from the digest-checked original HTML engine.
const historicalRulesSha256='2b424e29feae2cc73c9e6873635b76b701ad09ed1030d81995f4dfb5e8bff0f9';
function originalMeaning(questions){return questions.map(question=>{const q={...question};delete q.subtype;if(q.status==='demo'){delete q.optionExplanations;delete q.verification;q.sources=q.sources.map(source=>({title:source.title,...(source.url?{url:source.url}:{})}));}return q;});}
function buildExample({authoring=false}={}){
 const directory=path.join(root,'examples/biovista'),archive=path.join(directory,'original');
 const original=readJSON(path.join(archive,'origin.json'));
 const archiveHash=hash(fs.readFileSync(path.join(archive,'BioVista_Quiz_Offline.html')));
 if(archiveHash!==original.publicExampleSha256)throw Error('The historical BioVista archive differs from its recorded SHA-256. Restore it before regenerating the current example.');
 const configFile=path.join(root,'biovista.showcase.config.json'),raw=readJSON(configFile),baseline=readJSON(path.join(archive,'questions.json'));
 if(Compiler.canonical(originalMeaning(raw.questions))!==Compiler.canonical(originalMeaning(baseline))||hash(Compiler.canonical(Profile.normalizeRules(raw.rules)))!==historicalRulesSha256)throw Error('The feature showcase must retain the original public question meaning and scoring/timing rules from the historical archive. Only the independently checked demo receives supplemental option rationales and source-review metadata; create a separate event for edited educational content.');
 const docxFile=path.join(directory,'BioVista_Question_Bank.docx'),docxMeta=path.join(directory,'BioVista_Question_Bank.meta.json');
 if(!authoring){
  const regenerate=' Run npm run build:example -- --authoring to regenerate its companions before publishing.';
  if(!fs.existsSync(docxFile)||!fs.existsSync(docxMeta))throw Error('The published example DOCX and metadata are both required.'+regenerate);
  const meta=readJSON(docxMeta);
  if(meta?.format!=='QSK_EXAMPLE_DOCX_1'||meta.eventId!==raw.event.id||meta.cards!==raw.questions.length||meta.baseFingerprint!==Compiler.fingerprint(raw)||meta.sha256!==hash(fs.readFileSync(docxFile)))throw Error('The published example DOCX bytes or metadata do not match the showcase.'+regenerate);
 }
 const built=Compiler.build(raw,runtime(raw,configFile)),htmlFile=path.join(directory,'BioVista_Quiz_Offline.html');
 fs.writeFileSync(htmlFile,built.html,'utf8');
 const settings=Presets.exportSettings(raw,{setup:'competition'});
 json(path.join(directory,'BioVista_Showcase.qsk-settings.json'),settings);
 const preview=Bank.preview(raw,raw.questions);
 const review={format:'QSK_EXAMPLE_QUALITY_1',eventId:raw.event.id,baseFingerprint:Compiler.fingerprint(raw),diff:preview.diff,repairs:preview.repairs,quality:preview.quality,notice:'Read-only example of an unchanged-bank quality review. This is not an apply/rollback transaction. DEMO has separately inspected NIST evidence dated 2026-10-15 and four option rationales. The other 40 cards retain inherited evidence gaps. The build itself fetches no sources.'};
 json(path.join(directory,'BioVista_Quality_Review.json'),review);
 const reviewHTML=BankCLI.reviewHTML(review).replace('<h1>Review your question bank changes</h1>','<h1>BioVista example: unchanged-bank quality review</h1><p><b>Read-only companion.</b> No import was applied. Use a new preview workspace to review your own edited DOCX; this file is not an apply/rollback transaction. Historical source dates remain unchanged.</p>');
 fs.writeFileSync(path.join(directory,'BioVista_Quality_Review.html'),reviewHTML,'utf8');
 if(authoring){
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-example-docx-'));
  try{
   const output=path.join(temporary,'BioVista_Question_Bank.docx');
   BankCLI.run(['export','--config',configFile,'--output',output]);
   fs.copyFileSync(output,docxFile);
   json(docxMeta,{format:'QSK_EXAMPLE_DOCX_1',eventId:raw.event.id,baseFingerprint:Compiler.fingerprint(raw),sha256:hash(fs.readFileSync(docxFile)),cards:built.config.questions.length});
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
 }
 const provenance={schemaVersion:2,kind:'current-engine-feature-showcase',sourceConfiguration:'biovista.showcase.config.json',profileId:built.config.profileId,publicExampleSha256:hash(built.html),questions:built.config.questions.length,options:built.config.questions.length*4,preserved:'All original public question stems, answer options/keys, overall explanations, source titles/URLs, historical verificationDate values, paired inventories and scoring/timing rules. Only DEMO adds separately checked option rationales and source-review metadata; existing numerical and visual cards receive descriptive subtype labels. The current runtime and explicit optional showcase settings are regenerated from source.',historicalArchive:{directory:'original',originalBuild:original.originalBuild,originalSha256:original.originalSha256,publicExampleSha256:archiveHash},enabledShowcaseSettings:built.config.gameplay,authoringSetup:'competition',authoringSetupMeaning:'Choice of detailed creator workflow only; not a live gameplay mode.',review:{issues:review.quality.issues.length,sourceVerification:'DEMO: NIST Base and Derived Units inspected 2026-10-15. Other 40 cards retain historical metadata; the build fetches no sources.',missingPerOptionExplanations:built.config.questions.filter(q=>!q.optionExplanations.every(x=>x.trim())).length}};
 json(path.join(directory,'origin.json'),provenance);
 return {file:'examples/biovista/BioVista_Quiz_Offline.html',bytes:Buffer.byteLength(built.html),sha256:provenance.publicExampleSha256,archiveSha256:archiveHash,totalCards:built.config.questions.length,qualityIssues:review.quality.issues.length,docxRegenerated:authoring};
}
if(require.main===module){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--help'){console.log('node scripts/build-example.cjs [--authoring]\nBuild current BioVista HTML, reusable settings and quality review. --authoring also regenerates the published DOCX using Python 3/python-docx. Historical archive and baseline config remain unchanged.');}
 else if(args.some(x=>x!=='--authoring')||args.length>1){console.error('Use only the optional --authoring flag.');process.exitCode=1;}
 else try{console.log(JSON.stringify(buildExample({authoring:args.includes('--authoring')}),null,2));}catch(error){console.error('Example build failed: '+error.message);process.exitCode=1;}
}
module.exports={buildExample};
