const test=require('node:test'),assert=require('node:assert/strict');
const H=require('../src/host-tools.js');

test('Answer evidence keeps one primary external link, optional sources, and aligned option explanations',()=>{
 const card={options:['Fourth','First','Second','Third'],correct:1,optionExplanations:['Fourth is incorrect.','First is correct.','Second is incorrect.','Third is incorrect.'],sources:[{title:'Primary reference',url:'https://example.org/primary',section:'Chapter 2',supportNote:'Original support note.'},{title:'Additional reference',url:'https://example.org/extra'}]};
 const html=H.revealHTML(card);
 assert.match(html,/target="_blank" rel="noopener noreferrer">Source<\/a>/);
 assert.match(html,/<details><summary>Additional sources \(1\)<\/summary>/);
 assert.ok(html.indexOf('<b>Fourth</b> — Fourth is incorrect.')<html.indexOf('<b>First</b> — First is correct.'));
 assert.match(html,/External reference links need internet/);
});

test('Reveal renders imported content as text and excludes executable or unsupported source URLs',()=>{
 const html=H.revealHTML({options:['<img onerror=x>','B','C','D'],optionExplanations:['<script>x</script>'],sources:[{title:'<iframe>',url:'javascript:alert(1)',supportNote:'<svg onload=x>'}]});
 assert.doesNotMatch(html,/<script|<iframe|<img|<svg|href="javascript:/);
 assert.match(html,/&lt;script&gt;/);
 assert.equal(H.revealHTML({options:['A','B','C','D'],sources:[],optionExplanations:[]}), '');
});

test('Repair handoff uses explicit safe fields and never imports raw errors or question contents',()=>{
 const input={feature:'image',code:'load-failed',questionId:'Q01',phase:'read',userAgent:'Mozilla/5.0 (Windows NT 10.0) Chrome/134.0 token-secret',config:{mode:'short',shuffleOptions:true,discussionSeconds:7,teamName:'PRIVATE PERSON',apiKey:'secret',question:'PRIVATE STEM'},error:'Token secret /Users/private/home',logs:['PRIVATE LOG'],version:'1.0.0'};
 const report=H.diagnostic(input),text=JSON.stringify(report);
 assert.equal(report.environment.os,'Windows');assert.equal(report.environment.browser,'Chrome');
 assert.equal(report.configuration.discussionSeconds,7);assert.equal(report.questionId,'Q01');
 for(const secret of ['PRIVATE','token-secret','/Users/private','Token secret','apiKey'])assert.ok(!text.includes(secret));
 assert.match(report.instructions,/Never publish, push or merge/);
 const hostile=H.diagnostic({feature:'C:\\secret',questionId:'../../private',phase:'secret-phase',code:'private-error',version:'password=secret'});
 assert.equal(hostile.feature,'runtime');assert.equal(hostile.questionId,null);assert.equal(hostile.errorCode,'runtime-error');assert.equal(hostile.version,'unknown');
});

test('Credits export preserves library licenses and identifies missing provenance without embedding media',()=>{
 const report=H.credits({known:{data:'data:audio/wav;base64,HUGE',sourceUrl:'https://example.org',author:'Creator',license:'CC0 1.0'},missing:{data:'data:image/png;base64,HUGE'},libraries:{packages:[{name:'Example',version:'1',license:'MIT',licenseText:'Required license'}]}},[{id:'Q1',visual:{key:'missing',attribution:'Creator permission pending'}}]);
 assert.doesNotMatch(JSON.stringify(report),/base64|HUGE/);
 assert.match(report.assets[1].provenance,/Incomplete/);
 assert.equal(report.libraries[0].licenseText,'Required license');
 assert.equal(report.questionMedia[0].attribution,'Creator permission pending');
});

test('Repair handoff preserves validated source provenance and legacy build fields',()=>{
 const digest='AB'.repeat(32),commit='cd'.repeat(20);
 const report=H.diagnostic({version:'1.1.0',build:{sourceDigest:digest,sourceDigestAlgorithm:'sha256',sourceDigestScope:'runtime-source-v1',baseCommit:commit,localChanges:true}});
 assert.equal(report.build.sourceDigest,digest.toLowerCase());assert.equal(report.build.sourceDigestAlgorithm,'sha256');assert.equal(report.build.sourceDigestScope,'runtime-source-v1');
 assert.equal(report.build.baseCommit,commit);assert.equal(report.build.localChanges,true);assert.equal(report.version,'1.1.0');
 const legacy=H.diagnostic({version:'1.0.0',build:{baseCommit:commit,localChanges:false}});
 assert.equal(legacy.build.baseCommit,commit);assert.equal(legacy.build.localChanges,false);assert.equal(legacy.build.sourceDigest,null);
 for(const build of [
  {sourceDigest:'/Users/private/secret',sourceDigestAlgorithm:'sha256',sourceDigestScope:'runtime-source-v1'},
  {sourceDigest:digest,sourceDigestAlgorithm:'private-path',sourceDigestScope:'runtime-source-v1'},
  {sourceDigest:digest,sourceDigestAlgorithm:'sha256',sourceDigestScope:'private-path'}
 ]){
  const bad=H.diagnostic({build});assert.equal(bad.build.sourceDigest,null);assert.doesNotMatch(JSON.stringify(bad.build),/private|secret/);
 }
});
