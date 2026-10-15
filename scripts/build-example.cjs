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
function originalMeaning(questions){return questions.map(question=>{const q={...question};for(const key of ['subtype','optionExplanations','verification','sources'])delete q[key];if(q.visual){q.visual={...q.visual};delete q.visual.alt;}return q;});}
const digest=value=>hash(Compiler.canonical(value));
function verifyPreservation(raw,baseline,review){
 if(Compiler.canonical(originalMeaning(raw.questions))!==Compiler.canonical(originalMeaning(baseline))||digest(Profile.normalizeRules(raw.rules))!==historicalRulesSha256)throw Error('The feature showcase must retain the original public educational content, IDs, paired inventories and scoring/timing rules from the historical archive.');
 const records=new Map();
 if(review){
  if(review.format!=='QSK_BIOVISTA_EVIDENCE_REVIEW_1'||review.archivedQuestionsSha256!==digest(baseline)||!Array.isArray(review.cards)||!/^\d{4}-\d{2}-\d{2}$/.test(review.checkedAt))throw Error('The evidence review is not bound to the historical question archive.');
  for(const record of review.cards){if(!record||records.has(record.id))throw Error('Duplicate or invalid evidence review receipt.');records.set(record.id,record);}
 }
 for(let i=0;i<baseline.length;i++){
  const q=raw.questions[i],old=baseline[i],receipt=records.get(q.id);
  const identity=s=>({title:s.title,...(s.url?{url:s.url}:{})});
  if(Compiler.canonical((q.sources||[]).slice(0,old.sources.length).map(identity))!==Compiler.canonical(old.sources.map(identity)))throw Error(q.id+': preserve the original citation titles/URLs; append inspected corroboration instead of replacing history.');
  const supplemental=Compiler.canonical(q.sources)!==Compiler.canonical(old.sources)||q.optionExplanations!==undefined||q.verification!==undefined||q.visual?.alt!==old.visual?.alt;
  if(!supplemental)continue;
  if(!receipt||receipt.questionSha256!==digest(q))throw Error(q.id+': supplemental evidence must match its exact reviewed question receipt.');
  if(q.verification?.status!=='verified'||q.verification.checkedAt!==review.checkedAt||q.optionExplanations?.length!==4||!q.optionExplanations.every(x=>typeof x==='string'&&x.trim())||!q.sources?.length||!q.sources.every(s=>s.status==='verified'&&s.verifiedAt===review.checkedAt&&s.supportNote?.trim()))throw Error(q.id+': reviewed supplemental evidence requires four rationales, verified sources and an actual matching question-check date.');
  if(q.visual?.alt!==old.visual?.alt){const correction=receipt.accessibilityCorrection;if(!correction||correction.field!=='visual.alt'||correction.before!==old.visual?.alt||correction.after!==q.visual?.alt||!correction.reason?.trim())throw Error(q.id+': an accessible-label correction needs an explicit before/after review receipt.');}
 }
 return true;
}
function buildExample({authoring=false}={}){
 const directory=path.join(root,'examples/biovista'),archive=path.join(directory,'original');
 const original=readJSON(path.join(archive,'origin.json'));
 const archiveHash=hash(fs.readFileSync(path.join(archive,'BioVista_Quiz_Offline.html')));
 if(archiveHash!==original.publicExampleSha256)throw Error('The historical BioVista archive differs from its recorded SHA-256. Restore it before regenerating the current example.');
 const configFile=path.join(root,'biovista.showcase.config.json'),raw=readJSON(configFile),baseline=readJSON(path.join(archive,'questions.json')),evidenceFile=path.join(directory,'evidence-review.json');
 const evidence=fs.existsSync(evidenceFile)?readJSON(evidenceFile):null;
 verifyPreservation(raw,baseline,evidence);
 if(!evidence||evidence.cards.length!==raw.questions.length||raw.questions.some(q=>q.verification?.status!=='verified'||q.verification.checkedAt!==evidence.checkedAt||q.optionExplanations?.length!==4||!q.optionExplanations.every(x=>typeof x==='string'&&x.trim())||!q.sources?.length||!q.sources.every(s=>s.status==='verified'&&s.verifiedAt===evidence.checkedAt&&s.accessedAt===evidence.checkedAt&&s.section?.trim()&&s.supportNote?.trim())))throw Error('The reviewed BioVista showcase requires an exact receipt, verified source records and four option rationales for every card. Restore missing evidence before publishing.');
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
 const evidenceReview=evidence?{checkedAt:evidence.checkedAt,sha256:hash(fs.readFileSync(evidenceFile)),counts:evidence.counts,warningDispositions:evidence.warningDispositions,sequenceReview:evidence.sequenceReview}:null;
 const review={format:'QSK_EXAMPLE_QUALITY_1',eventId:raw.event.id,baseFingerprint:Compiler.fingerprint(raw),diff:preview.diff,repairs:preview.repairs,quality:preview.quality,evidenceReview,notice:'Read-only example of an unchanged-bank quality review. This is not an apply/rollback transaction. All 41 cards have inspected-source records and four option rationales dated 2026-10-15. Thirteen inherited heuristic warnings have explicit manual dispositions: M23 accessible text was corrected; twelve deliberate wording, numeric-form or internal-identifier candidates remain visible to the heuristic. Shared teaching and difficulty/coverage limits are recorded. The build itself fetches no sources.'};
 json(path.join(directory,'BioVista_Quality_Review.json'),review);
 const e=Compiler.escapeHTML;
 const manualHTML=evidenceReview?'<section><h2>Inspected evidence and manual dispositions</h2><p>'+e(review.notice)+'</p><p>Review date: '+e(evidenceReview.checkedAt)+'. Evidence ledger SHA-256: <code>'+e(evidenceReview.sha256)+'</code>.</p><ul>'+evidenceReview.warningDispositions.map(w=>'<li><b>'+e(w.questionId+' / '+w.field+' / '+w.status)+'</b>: '+e(w.note)+'</li>').join('')+'</ul><h2>Shared teaching and limits</h2><p>'+e(evidenceReview.sequenceReview.acceptedSharedTeaching.observation)+' '+e(evidenceReview.sequenceReview.acceptedSharedTeaching.limitation)+'</p><ul>'+evidenceReview.sequenceReview.limitations.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></section>':'';
 const reviewHTML=BankCLI.reviewHTML(review).replace('<h1>Review your question bank changes</h1>','<h1>BioVista example: unchanged-bank quality review</h1><p><b>Read-only companion.</b> No import was applied. Use a new preview workspace to review your own edited DOCX; this file is not an apply/rollback transaction. Historical source dates remain unchanged.</p>').replace('</html>',manualHTML+'</html>');
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
 const provenance={schemaVersion:2,kind:'current-engine-feature-showcase',sourceConfiguration:'biovista.showcase.config.json',profileId:built.config.profileId,publicExampleSha256:hash(built.html),questions:built.config.questions.length,options:built.config.questions.length*4,preserved:'All original public question stems, answer options/keys, overall explanations, original source titles/URLs, historical verificationDate values, paired inventories and scoring/timing rules. Reviewed source metadata, corroborating citations and option rationales are bound to exact question receipts. M23 alone receives a neutral geometric accessible label; visual identities/artwork remain intact. The current runtime and explicit optional showcase settings are regenerated from source.',historicalArchive:{directory:'original',originalBuild:original.originalBuild,originalSha256:original.originalSha256,publicExampleSha256:archiveHash},enabledShowcaseSettings:built.config.gameplay,authoringSetup:'competition',authoringSetupMeaning:'Choice of detailed creator workflow only; not a live gameplay mode.',review:{issues:review.quality.issues.length,sourceVerification:'All 41 cards have manually inspected evidence and four option rationales dated 2026-10-15; source details and manual warning dispositions are in evidence-review.json. Builds fetch no sources.',evidenceReviewSha256:evidenceReview?.sha256,missingPerOptionExplanations:built.config.questions.filter(q=>!q.optionExplanations.every(x=>x.trim())).length}};
 json(path.join(directory,'origin.json'),provenance);
 return {file:'examples/biovista/BioVista_Quiz_Offline.html',bytes:Buffer.byteLength(built.html),sha256:provenance.publicExampleSha256,archiveSha256:archiveHash,totalCards:built.config.questions.length,qualityIssues:review.quality.issues.length,docxRegenerated:authoring};
}
if(require.main===module){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--help'){console.log('node scripts/build-example.cjs [--authoring]\nBuild current BioVista HTML, reusable settings and quality review. --authoring also regenerates the published DOCX using Python 3/python-docx. Historical archive and baseline config remain unchanged.');}
 else if(args.some(x=>x!=='--authoring')||args.length>1){console.error('Use only the optional --authoring flag.');process.exitCode=1;}
 else try{console.log(JSON.stringify(buildExample({authoring:args.includes('--authoring')}),null,2));}catch(error){console.error('Example build failed: '+error.message);process.exitCode=1;}
}
module.exports={buildExample,verifyPreservation};
