/* Question bank review. MIT. Imported text is data; this module performs no network or filesystem I/O. */
'use strict';
const Compiler=require('./compiler.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>Compiler.canonical(a)===Compiler.canonical(b);
function qualityReport(questions){
 const issues=[],topics={},subtypes={},verification={verified:0,unverified:0,disputed:0,'creator-override':0};
 const tokens=s=>new Set(s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,' ').split(/\s+/).filter(x=>x.length>2));
 for(const q of questions){
  topics[q.topic||'Unspecified']=(topics[q.topic||'Unspecified']||0)+1;subtypes[q.subtype||'text']=(subtypes[q.subtype||'text']||0)+1;
  const status=q.verification?.status||'unverified';verification[status]=(verification[status]||0)+1;
  const warn=(field,message)=>issues.push({questionId:q.id,field,message});
  const answer=q.options[q.correct]?.trim();if(answer?.length>=4&&q.visual?.alt?.toLowerCase().includes(answer.toLowerCase()))warn('visual.alt','Alternative text contains the correct answer text; review pre-answer leakage without removing useful accessibility context.');
  if(answer?.length>=4&&String(q.visual?.key||'').toLowerCase().includes(answer.toLowerCase().replace(/\s+/g,'')))warn('visual.key','The media identifier may expose the answer; review filenames, captions and accessible labels before play.');
  if(!q.topic)warn('topic','Choose a topic to review coverage and replacement suitability.');
  if(status!=='verified')warn('verification',status==='creator-override'?'Creator override; verification disagreement remains.':status==='disputed'?'Resolve the recorded factual disagreement before claiming verification.':'Independent source verification is not recorded.');
  if(!q.sources?.length)warn('sources','Add an inspected source supporting the stem, answer and distractors.');
  for(const [i,s]of(q.sources||[]).entries())if(['stale','conflicting'].includes(s.status))warn('sources['+i+']','This source is '+s.status+'; inspect it and decide whether to correct, replace, omit or explicitly override the item.');
  if(!q.optionExplanations?.every(x=>x.trim()))warn('optionExplanations','Add a concise explanation for every option; missing explanations are not invented.');
  if(/\b(always|never|only|all of the above|none of the above)\b/i.test(q.stem+' '+q.options.join(' ')))warn('stem/options','Review absolute wording and option-dependent answers for ambiguity.');
  if(q.subtype==='numerical'){
   const parts=q.options.map(x=>x.match(/^\s*[-+]?\d+(?:[.,]\d+)?(?:\s*[×x]\s*10\^?[-+]?\d+)?\s*(.*?)\s*$/));
   if(parts.every(Boolean)){const units=parts.map(x=>x[1].replace(/\s+/g,'').toLowerCase());if(new Set(units).size>1)warn('options','Numerical options use different or missing units. Confirm conversions are intentional; no automatic mathematical or factual correction was made.');}
   else warn('options','Review numerical values and units manually; not every option has a simple comparable numeric form.');
  }
 }
 for(let i=0;i<questions.length;i++)for(let j=i+1;j<questions.length;j++){
  const a=questions[i],b=questions[j],x=tokens(a.stem),y=tokens(b.stem),overlap=[...x].filter(t=>y.has(t)).length,union=new Set([...x,...y]).size;
  if(union&&overlap/union>=.82)issues.push({questionId:a.id,relatedId:b.id,field:'stem',message:'Likely near-repeat; compare educational meaning and pair balance.'});
  for(const [first,second]of[[a,b],[b,a]]){const answer=first.options[first.correct]?.trim();if(answer?.length>=6&&second.stem.toLowerCase().includes(answer.toLowerCase()))issues.push({questionId:first.id,relatedId:second.id,field:'sequence',message:'Another stem contains this answer text; review possible answer leakage and ordering.'});}
 }
 return {topics,subtypes,verification,issues,notice:'Heuristics identify review candidates, not factual verification or a quality score. External sources were not fetched by this tool.'};
}
function compare(before,after){
 const old=new Map(before.map(q=>[q.id,q])),next=new Map(after.map(q=>[q.id,q]));
 return {orderChanged:!same(before.map(q=>q.id),after.map(q=>q.id)),moved:after.filter((q,i)=>old.has(q.id)&&before.findIndex(x=>x.id===q.id)!==i).map(q=>q.id),added:after.filter(q=>!old.has(q.id)).map(q=>q.id),removed:before.filter(q=>!next.has(q.id)).map(q=>q.id),changed:after.filter(q=>old.has(q.id)&&!same(old.get(q.id),q)).map(q=>({id:q.id,fields:[...new Set([...Object.keys(old.get(q.id)),...Object.keys(q)])].filter(k=>!same(old.get(q.id)[k],q[k])),answerChanged:old.get(q.id).correctOptionId!==q.correctOptionId||old.get(q.id).options[old.get(q.id).correct]!==q.options[q.correct]}))};
}
function safeRepair(questions){
 const fixed=clone(questions),changes=[];for(const q of fixed){
  if(typeof q.correct==='string'&&/^\s*[a-d]\s*$/i.test(q.correct)){const from=q.correct;q.correct='ABCD'.indexOf(q.correct.trim().toUpperCase());changes.push({id:q.id,field:'correct',from,to:q.correct,reason:'Normalized an unambiguous option letter; answer identity unchanged.'});}
  if(typeof q.round==='string'&&/^\d+$/.test(q.round.trim())){const from=q.round;q.round=Number(q.round);changes.push({id:q.id,field:'round',from,to:q.round,reason:'Converted an integer round label to the required numeric format.'});}
 }
 return {questions:fixed,changes};
}
function preview(current,candidateQuestions,{repair=false}={}){
 const original=Compiler.validate(current),repaired=repair?safeRepair(candidateQuestions):{questions:clone(candidateQuestions),changes:[]};
 const candidate=clone(current);candidate.questions=repaired.questions;let normalized=Compiler.validate(candidate);
 const oldById=new Map(original.questions.map(q=>[q.id,q]));for(const q of normalized.questions){const old=oldById.get(q.id);if(old&&q.verification?.status==='verified'&&same(old.verification,q.verification)&&['stem','options','correctOptionId','explanation','optionExplanations','visual','sources'].some(k=>!same(old[k],q[k]))){q.verification={...q.verification,status:'unverified',note:'Content changed since the recorded check; independently recheck the stem, answer, distractors and sources.'};q.sources=q.sources.map(s=>s.status==='verified'?{...s,status:'unverified'}:s);repaired.changes.push({id:q.id,field:'verification',reason:'Invalidated inherited verification because educational content changed; no answer or scientific meaning was changed.'});}}
 // Preserve the editable source configuration, filling stable question identities without changing rule spelling.
 candidate.questions=normalized.questions;
 return {format:'QSK_BANK_REVIEW_1',baseFingerprint:Compiler.fingerprint(current),candidate,diff:compare(original.questions,normalized.questions),repairs:repaired.changes,quality:qualityReport(normalized.questions)};
}
function apply(current,review){if(!review||review.format!=='QSK_BANK_REVIEW_1')throw Error('This is not a question bank preview.');if(Compiler.fingerprint(current)!==review.baseFingerprint)throw Error('The current bank changed after preview. Preview the document again before applying it.');Compiler.validate(review.candidate);return {current:clone(review.candidate),previous:clone(current)};}
function rollback(transaction){if(!transaction?.previous)throw Error('No previous bank is available.');Compiler.validate(transaction.previous);return clone(transaction.previous);}
module.exports={qualityReport,compare,safeRepair,preview,apply,rollback};
