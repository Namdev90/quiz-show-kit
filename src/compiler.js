/* Quiz Show Kit compiler. MIT; third-party runtimes and artwork retain their own licences. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./profile.js'));else root.QSKCompiler=factory(root.QSKProfile);})(typeof globalThis!=='undefined'?globalThis:this,function(Profile){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scriptData=x=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
function fail(path,message){throw Error(path+': '+message);}
function text(x,path,max=300,required=false){if(x===undefined||x===null){if(required)fail(path,'is required');return '';}if(typeof x!=='string'||x.length>max||required&&!x.trim())fail(path,'must be text'+(required?' (not empty)':'')+' up to '+max+' characters');return x;}
function keys(obj,allowed,path){if(!plain(obj))fail(path,'must be an object');for(const key of Object.keys(obj))if(!allowed.includes(key))fail(path+'.'+key,'is not a supported setting');}
function color(x,path){if(typeof x!=='string'||!/^#[0-9a-f]{6}$/i.test(x))fail(path,'must be a six-digit hex colour, such as #14e07c');return x.toLowerCase();}
function tree(value,depth=0,count={n:0}){if(depth>18||++count.n>30000)fail('configuration','is too deeply nested or large');if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))fail('configuration','contains an unsafe object key');tree(v,depth+1,count);}}
function canonical(x){if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(plain(x))return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';return JSON.stringify(x);}
function fingerprint(x){let h=2166136261;for(const c of canonical(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');} // Namespace, not authentication.
function asset(a,path){
 if(!plain(a))fail(path,'must be an asset object');const result=clone(a);
 if(a.data!==undefined){
  if(typeof a.data!=='string'||a.data.length>3*1024*1024||!/^data:(image\/(png|jpeg|webp|svg\+xml)|audio\/(wav|x-wav|mpeg|ogg));base64,[A-Za-z0-9+/]+={0,2}$/.test(a.data))fail(path+'.data','must be a bounded supported base64 image/audio data URI');
  if(a.data.startsWith('data:image/svg+xml;')){
   const encoded=a.data.split(',')[1],svg=typeof Buffer!=='undefined'?Buffer.from(encoded,'base64').toString('utf8'):decodeURIComponent(escape(atob(encoded)));
   if(/<\/?\s*[a-z0-9_.-]+:|&#(?:x[0-9a-f]+|[0-9]+);/i.test(svg)||!/<svg\b/i.test(svg)||!/<\/svg>\s*$/i.test(svg)||/<\s*(?:script|style|foreignObject|iframe|object|embed|image|use|a|animate[A-Za-z]*|set)\b/i.test(svg)||/\son[a-z0-9_-]*\s*=|href\s*=|url\s*\(|<!DOCTYPE|xml-stylesheet|javascript:/i.test(svg))fail(path+'.data','SVG must be static with no scripts, event handlers, embedded objects or resource links');
  }
 }else if(a.file!==undefined){
  if(typeof a.file!=='string'||a.file.length>240||/^(?:[a-z]+:|[\\/])|(?:^|[\\/])\.\.(?:[\\/]|$)/i.test(a.file))fail(path+'.file','must be a relative path inside the configuration directory');
 }else fail(path,'needs data or file');
 for(const key of ['width','height'])if(a[key]!==undefined&&(!Number.isFinite(a[key])||a[key]<=0||a[key]>20000))fail(path+'.'+key,'must be a positive image dimension');
 if(a.displayViewBox!==undefined&&(!/^[\d.]+ [\d.]+ [\d.]+ [\d.]+$/.test(a.displayViewBox)||a.displayViewBox.split(' ').some(x=>!Number.isFinite(Number(x)))))fail(path+'.displayViewBox','must contain four nonnegative numeric coordinates');
 delete result.path;delete result.licensePaths;return result;
}
const SUBTYPES=['text','numerical','image','graph','code','sequence','matching'];
const SOURCE_STATUS=['unverified','verified','conflicting','stale'];
function date(value,path){if(!value)return '';text(value,path,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)fail(path,'must be a real date in YYYY-MM-DD form');return value;}
function sourceRecord(s,path){
 keys(s,['title','url','section','edition','publicationDate','accessedAt','verifiedAt','status','supportNote'],path);
 const result={title:text(s.title,path+'.title',250,true)};
 if(s.url){const url=text(s.url,path+'.url',1500);let parsed;try{parsed=new URL(url);}catch(_){fail(path+'.url','must be a valid HTTPS source URL');}if(parsed.protocol!=='https:'||!parsed.hostname||parsed.username||parsed.password||/[\s<>]/.test(url))fail(path+'.url','must be an HTTPS source URL without credentials');result.url=url;}
 for(const key of ['section','edition','publicationDate','supportNote'])if(s[key]!==undefined)result[key]=text(s[key],path+'.'+key,key==='supportNote'?700:160);
 for(const key of ['accessedAt','verifiedAt'])if(s[key])result[key]=date(s[key],path+'.'+key);
 if(s.status!==undefined){if(!SOURCE_STATUS.includes(s.status))fail(path+'.status','must be unverified, verified, conflicting or stale');result.status=s.status;}
 if(s.status==='verified'&&(!result.verifiedAt||!result.supportNote))fail(path,'verified sources need verifiedAt and a concise supportNote describing the inspected claim');
 return result;
}
function question(raw,i,ids,rules,qids){
 const p='questions['+i+']';if(!plain(raw))fail(p,'must be an object');const q=clone(raw);
 q.id=text(q.id,p+'.id',64,true);if(!/^[a-z0-9._-]+$/i.test(q.id)||qids.has(q.id))fail(p+'.id','must be a unique letters/numbers identifier');qids.add(q.id);
 const at='question '+q.id;
 if(!['main','reserve','tie','demo'].includes(q.status))fail(at+'.status','must be main, reserve, tie or demo');if(!ids.has(q.round))fail(at+'.round','must refer to a declared round');
 q.stem=text(q.stem,at+'.stem',300,true);q.explanation=text(q.explanation,at+'.explanation',450,true);q.difficulty=text(q.difficulty,at+'.difficulty',40,true);q.topic=text(q.topic,at+'.topic',120);q.subtype=q.subtype||'text';if(!SUBTYPES.includes(q.subtype))fail(at+'.subtype','must be text, numerical, image, graph, code, sequence or matching; all use four selectable answers');
 if(!Array.isArray(q.options)||q.options.length!==4)fail(at+'.options','must contain four options');q.options=q.options.map((o,j)=>text(o,at+'.options['+j+']',180,true));if(new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4)fail(at+'.options','must be distinct');
 if(q.optionIds===undefined)q.optionIds=q.options.map((_,j)=>q.id+'-'+ 'ABCD'[j]);
 if(!Array.isArray(q.optionIds)||q.optionIds.length!==4||q.optionIds.some(x=>typeof x!=='string'||!/^[a-z0-9._-]{1,80}$/i.test(x))||new Set(q.optionIds).size!==4)fail(at+'.optionIds','must contain four distinct stable identifiers');
 if(typeof q.correct==='string'&&/^[A-D]$/.test(q.correct))q.correct='ABCD'.indexOf(q.correct);
 if(q.correct===undefined&&q.correctOptionId!==undefined)q.correct=q.optionIds.indexOf(q.correctOptionId);
 if(!Number.isInteger(q.correct)||q.correct<0||q.correct>3)fail(at+'.correct','must identify one existing option (0–3, A–D or correctOptionId)');
 if(q.correctOptionId!==undefined&&q.correctOptionId!==q.optionIds[q.correct])fail(at+'.correctOptionId','disagrees with the correct answer index; choose one answer identity');q.correctOptionId=q.optionIds[q.correct];
 if(q.optionExplanations===undefined)q.optionExplanations=['','','',''];if(!Array.isArray(q.optionExplanations)||q.optionExplanations.length!==4)fail(at+'.optionExplanations','must contain one explanation for each of the four option identities');q.optionExplanations=q.optionExplanations.map((x,j)=>text(x,at+'.optionExplanations['+j+']',450));
 if(['main','tie'].includes(q.status))q.pairId=text(q.pairId,at+'.pairId',64,true);
 q.seconds=rules.primaryMs/1000;q.timing={primary:rules.primaryMs/1000,passed:q.status==='tie'||!rules.passingEnabled?0:rules.passedMs/1000};
 if(q.sources===undefined)q.sources=[];if(!Array.isArray(q.sources)||q.sources.length>12)fail(at+'.sources','must be an array of at most 12 source records');q.sources=q.sources.map((s,j)=>sourceRecord(s,at+'.sources['+j+']'));
 if(q.verificationDate!==undefined)date(q.verificationDate,at+'.verificationDate');
 if(q.verification!==undefined){const v=q.verification;keys(v,['status','checkedAt','note','override'],at+'.verification');if(!['unverified','verified','disputed','creator-override'].includes(v.status))fail(at+'.verification.status','must be unverified, verified, disputed or creator-override');if(v.checkedAt)date(v.checkedAt,at+'.verification.checkedAt');if(v.note!==undefined)text(v.note,at+'.verification.note',700);
  if(v.status==='verified'&&(!v.checkedAt||!q.sources.some(s=>s.status==='verified')||q.sources.some(s=>['conflicting','stale'].includes(s.status))))fail(at+'.verification','verified status needs a check date, inspected supporting source and no unresolved conflicting or stale sources');
  if(v.status==='creator-override'){keys(v.override,['reason','chosenOptionId','recordedAt'],at+'.verification.override');text(v.override.reason,at+'.verification.override.reason',700,true);if(v.override.chosenOptionId!==q.correctOptionId)fail(at+'.verification.override.chosenOptionId','must match the creator selected answer identity');if(v.override.recordedAt)date(v.override.recordedAt,at+'.verification.override.recordedAt');}
  else if(v.override!==undefined)fail(at+'.verification.override','requires creator-override status; disagreement cannot be labelled independently verified');
 }
 if(q.visual){if(!plain(q.visual))fail(at+'.visual','must be an object');if(q.visual.key!==undefined&&(typeof q.visual.key!=='string'||!/^[a-z0-9._-]+$/i.test(q.visual.key)))fail(at+'.visual.key','must name an asset');text(q.visual.alt,at+'.visual.alt',250,true);}
 return q;
}
function gameplayConfig(raw,questions){
 keys(raw,['shuffleOptions','discussionSeconds','difficultyOrder','difficultyLevels','roundOrder','statistics','revisionReport'],'gameplay');const g={shuffleOptions:false,discussionSeconds:0,difficultyOrder:'manual',difficultyLevels:['accessible','moderate','challenging','standard'],roundOrder:'fixed',statistics:['directOpportunities','passesOffered','passesReached','attempted','correct','wrong','scores','primaryCorrect','passedCorrect','accuracy','winningChance'],revisionReport:false,...clone(raw)};
 for(const key of ['shuffleOptions','revisionReport'])if(typeof g[key]!=='boolean')fail('gameplay.'+key,'must be true or false');if(!Number.isInteger(g.discussionSeconds)||g.discussionSeconds<0||g.discussionSeconds>600)fail('gameplay.discussionSeconds','must be a whole number from 0 to 600');
 if(!['manual','rising','falling'].includes(g.difficultyOrder))fail('gameplay.difficultyOrder','must be manual, rising or falling');if(!['fixed','alternate'].includes(g.roundOrder))fail('gameplay.roundOrder','must be fixed or alternate');
 if(!Array.isArray(g.difficultyLevels)||!g.difficultyLevels.length||g.difficultyLevels.length>12||g.difficultyLevels.some(x=>typeof x!=='string'||!x.trim()||x.length>40)||new Set(g.difficultyLevels).size!==g.difficultyLevels.length)fail('gameplay.difficultyLevels','must contain 1–12 unique difficulty names in rising order');
 if(g.difficultyOrder!=='manual'&&questions.some(q=>q.status==='main'&&!g.difficultyLevels.includes(q.difficulty)))fail('gameplay.difficultyLevels','must include every main question difficulty before ordering');
 const metrics=['directOpportunities','passesOffered','passesReached','attempted','correct','wrong','scores','primaryCorrect','passedCorrect','accuracy','winningChance'];if(!Array.isArray(g.statistics)||g.statistics.some(x=>!metrics.includes(x))||new Set(g.statistics).size!==g.statistics.length)fail('gameplay.statistics','must list distinct supported statistic names');return g;
}
function localizationConfig(raw){keys(raw,['language','labels'],'localization');const language=text(raw.language||'en','localization.language',35,true);if(!/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(language))fail('localization.language','must be a language tag');if(!plain(raw.labels||{}))fail('localization.labels','must be an object');const labels={};for(const [k,v]of Object.entries(raw.labels||{})){text(k,'localization.labels key',160,true);labels[k]=text(v,'localization.labels.'+k,240,true);}if(Object.keys(labels).length>200)fail('localization.labels','supports at most 200 control labels');return {language,labels};}
function validate(input){
 if(typeof input==='string'){if(input.length>25*1024*1024)fail('configuration','exceeds the 25 MB input limit');try{input=JSON.parse(input);}catch(_){fail('configuration','is not valid JSON');}}
 tree(input);keys(input,['$schema','schemaVersion','event','teams','theme','presentation','rules','rounds','branding','assets','questions','verification','gameplay','localization'],'configuration');
 if(input.schemaVersion!==1)fail('schemaVersion','must be 1');
 keys(input.event,['id','title','organization','subtitle','date','introTagline','introHeadline','lifelineLabel'],'event');
 const event={id:text(input.event.id,'event.id',64,true),title:text(input.event.title,'event.title',80,true),organization:text(input.event.organization,'event.organization',140),subtitle:text(input.event.subtitle,'event.subtitle',160),date:text(input.event.date,'event.date',10),introTagline:text(input.event.introTagline,'event.introTagline',140),introHeadline:text(input.event.introHeadline||'Ready for the challenge?','event.introHeadline',100,true),lifelineLabel:text(input.event.lifelineLabel||'Ask a teacher','event.lifelineLabel',60,true)};
 if(!/^[a-z0-9][a-z0-9._-]*$/i.test(event.id))fail('event.id','must be a stable letters/numbers slug');if(event.date&&!/^\d{4}-\d{2}-\d{2}$/.test(event.date))fail('event.date','must be YYYY-MM-DD');
 if(!Array.isArray(input.teams)||input.teams.length!==2)fail('teams','must contain exactly two teams');const teams={};for(const [i,t]of input.teams.entries()){keys(t,['id','name','color'],'teams['+i+']');if(!['Bio','Vista'].includes(t.id)||teams[t.id])fail('teams['+i+'].id','must be one Bio and one Vista identifier');teams[t.id]={name:text(t.name,'teams['+i+'].name',40,true),color:color(t.color,'teams['+i+'].color')};}
 if(teams.Bio.name.trim().toLowerCase()===teams.Vista.name.trim().toLowerCase())fail('teams','must use different display names');
 const themeRaw=input.theme||{};keys(themeRaw,['background','surface','text','font','motif','style'],'theme');const theme={background:color(themeRaw.background||'#202829','theme.background'),surface:color(themeRaw.surface||'#304047','theme.surface'),text:color(themeRaw.text||'#fff4dc','theme.text'),font:themeRaw.font||'Segoe UI',motif:themeRaw.motif||'dna',style:themeRaw.style||'flat'};
 if(!['flat','skeuomorphic','glass'].includes(theme.style))fail('theme.style','must be flat, skeuomorphic or glass');
 if(!['Segoe UI','Arial','Verdana','Georgia','Tahoma'].includes(theme.font))fail('theme.font','must use a supported system font');if(!['dna','none'].includes(theme.motif))fail('theme.motif','must be dna or none');
 let presentation;
 if(input.presentation!==undefined){
  keys(input.presentation,['motion','sound','volume','spokenOptions','confetti','rewards','intro','coinAnimation','questionAnimation','winnerAnimation','optionSpeech','voiceName','voiceLang','speechRate','readQuestions','character'],'presentation');
  presentation={motion:'cinematic',sound:true,volume:80,spokenOptions:true,confetti:true,rewards:true,intro:true,coinAnimation:true,questionAnimation:true,winnerAnimation:true,optionSpeech:'smart',voiceName:'',voiceLang:'en-IN',speechRate:1,readQuestions:false,character:Boolean(input.branding?.character),...input.presentation};
  if(!['smart','letters','full'].includes(presentation.optionSpeech))fail('presentation.optionSpeech','must be smart, letters or full');
  text(presentation.voiceName,'presentation.voiceName',160);
  if(typeof presentation.voiceLang!=='string'||presentation.voiceLang.length>35||! /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(presentation.voiceLang))fail('presentation.voiceLang','must be a language tag such as en-IN');
  if(typeof presentation.speechRate!=='number'||!Number.isFinite(presentation.speechRate)||presentation.speechRate<.5||presentation.speechRate>2)fail('presentation.speechRate','must be from 0.5 to 2');
  if(!['cinematic','gentle','none'].includes(presentation.motion))fail('presentation.motion','must be cinematic, gentle or none');
  if(!Number.isInteger(presentation.volume)||presentation.volume<0||presentation.volume>100)fail('presentation.volume','must be an integer from 0 to 100');
  for(const key of ['sound','spokenOptions','confetti','rewards','intro','coinAnimation','questionAnimation','winnerAnimation','readQuestions','character'])if(typeof presentation[key]!=='boolean')fail('presentation.'+key,'must be true or false');
 }
 const rules=Profile.normalizeRules(input.rules||{});
 if(!Array.isArray(input.rounds)||!input.rounds.length||input.rounds.length>20)fail('rounds','must contain 1–20 rounds');const rounds=[],ids=new Set();for(const [i,r]of input.rounds.entries()){keys(r,['id','name'],'rounds['+i+']');if(!Number.isSafeInteger(r.id)||r.id<1||r.id>1000||ids.has(r.id))fail('rounds['+i+'].id','must be a unique positive integer');ids.add(r.id);rounds.push({id:r.id,name:text(r.name,'rounds['+i+'].name',80,true)});}
 if(!Array.isArray(input.questions)||input.questions.length>250)fail('questions','must contain at most 250 cards');const qids=new Set(),questions=input.questions.map((raw,i)=>question(raw,i,ids,rules,qids));
 const main=questions.filter(q=>q.status==='main'),tie=questions.filter(q=>q.status==='tie');if(!main.length||main.length>200)fail('questions','needs 2–200 main questions');if(tie.length>20)fail('questions','supports at most 20 tie-break cards');if(questions.filter(q=>q.status==='demo').length>1)fail('questions','supports one demo');for(const r of rounds){const rows=main.filter(q=>q.round===r.id);if(!rows.length)fail('rounds','each declared round needs main questions');}
 for(const status of ['main','tie']){const pairs=new Map();for(const q of questions.filter(x=>x.status===status)){const key=q.round+':'+q.pairId;const rows=pairs.get(key)||[];rows.push(q);pairs.set(key,rows);}for(const rows of pairs.values())if(rows.length!==2||rows[0].difficulty!==rows[1].difficulty)fail('questions','each '+status+' matched pair needs two questions with the same difficulty');}
 const assets={};for(const [key,a]of Object.entries(input.assets||{})){if(!/^[a-z0-9._-]+$/i.test(key))fail('assets','has an invalid identifier');assets[key]=asset(a,'assets.'+key);}if(Object.keys(assets).length>100)fail('assets','supports at most 100 assets');
 const branding={left:null,right:null};if(input.branding!==undefined){keys(input.branding,['left','right','character'],'branding');for(const side of ['left','right','character'])if(input.branding[side]){keys(input.branding[side],['asset','alt'],'branding.'+side);const key=text(input.branding[side].asset,'branding.'+side+'.asset',64,true);if(!assets[key])fail('branding.'+side+'.asset','does not name an asset');if(side==='character'&&(assets[key].data?!/^data:image\//.test(assets[key].data):! /\.(png|jpe?g|webp|svg)$/i.test(assets[key].file)))fail('branding.character.asset','must reference a supported static image');branding[side]={asset:key,alt:text(input.branding[side].alt,'branding.'+side+'.alt',250,true)};}}
 for(const q of questions)if(q.narration!==undefined){
  const p='questions.'+q.id+'.narration';keys(q.narration,['stem','options'],p);
  if(q.narration.options!==undefined&&(!Array.isArray(q.narration.options)||q.narration.options.length!==4))fail(p+'.options','must have four asset keys or null entries');
  const refs=[...(q.narration.stem===undefined?[]:[q.narration.stem]),...(q.narration.options||[]).filter(x=>x!==null)];
  for(const key of refs){if(typeof key!=='string'||!assets[key])fail(p,'must reference an existing audio asset');const a=assets[key];if(a.data?!/^data:audio\//.test(a.data):! /\.(wav|mp3|ogg)$/i.test(a.file))fail(p,'must reference WAV, MP3 or OGG audio');}
 }
 const builtInVisuals=['microscope','pipette','dna','ph','biohazard'];for(const q of questions)if(q.visual){const key=q.visual.key==='Python'?'python':q.visual.key||q.visual.type;if(!assets[key]&&!builtInVisuals.includes(key))fail('question '+q.id+'.visual','references missing or unsupported media '+String(key));if(assets[key]&&(assets[key].data?!assets[key].data.startsWith('data:image/'):! /\.(png|jpe?g|webp|svg)$/i.test(assets[key].file)))fail('question '+q.id+'.visual','must reference an image asset');}
 const gameplay=input.gameplay===undefined?undefined:gameplayConfig(input.gameplay,questions),localization=input.localization===undefined?undefined:localizationConfig(input.localization);
 const identityQuestions=questions.map((q,i)=>{const identity=clone(q);for(const key of ['optionIds','correctOptionId','optionExplanations','subtype','topic'])if(input.questions[i][key]===undefined)delete identity[key];return identity;});
 const profileId=event.id+':'+fingerprint({eventId:event.id,rules,questions:identityQuestions,...(gameplay?{gameplay}:{})});
 return {schemaVersion:1,event,teams,theme,...(presentation?{presentation}:{}),...(gameplay?{gameplay}:{}),...(localization?{localization}:{}),rules,rounds,branding,assets,questions,profileId};
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function blend(a,b,t){const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('');}
function styleCSS(t){
 if(t.style==='skeuomorphic')return `.score,.intro-panel,.question-body,.option,.modal,.cinematic{border:2px solid ${blend(t.surface,t.text,.35)};border-radius:18px;box-shadow:inset 0 2px 1px ${blend(t.surface,t.text,.2)},inset 0 -3px 2px ${blend(t.surface,'#000000',.4)},0 6px 0 ${blend(t.surface,'#000000',.55)}}.option:active{transform:translateY(2px)}.option:focus-visible{outline:3px solid ${t.text};outline-offset:4px}`;
 if(t.style==='glass')return `.score,.intro-panel,.question-body,.option,.modal,.cinematic{background:${t.surface};border:1px solid ${blend(t.surface,t.text,.32)};border-radius:22px;box-shadow:0 12px 35px #00000040}@supports(backdrop-filter:blur(12px)){.score,.intro-panel,.question-body,.option{background:${t.surface}eb;backdrop-filter:blur(12px)}}`;
 return '';
}
function themeCSS(c){const t=c.theme,s=blend(t.surface,t.text,.12),d=blend(t.surface,'#000000',.35),muted=blend(t.text,t.surface,.35);return `:root{--green:${c.teams.Bio.color};--blue:${c.teams.Vista.color};--white:${t.text};--muted:${muted}}body{background:${t.background};color:${t.text};font-family:"${t.font}",Arial,sans-serif}.stage{background:radial-gradient(ellipse at 12% 55%,rgba(var(--team-rgb),.18),transparent 60%),linear-gradient(135deg,${s},${t.background})}.score,.intro-panel,.question-body,.option,.modal,.cinematic{background:linear-gradient(145deg,${s},${t.surface} 55%,${d});color:${t.text}}.stem,.points,.intro-panel h1,.round-card h1,.end-card h1,.modal h1,.cinematic h1{color:${t.text}}.round-card p,.end-card p,.intro-panel p,.modal p{color:${muted}}.score .team-name,.score .points,.score .teacher-status,.question-count,.question-head,.rules,.rules p,.rules li,.rules h2,.option,.option .answer-text,.question-body,.cinema-bottom span,.show-scene p,.cinematic-kicker,.footer,.status-note,.teacher-status{color:${t.text}}.rules article,.settings-card,.host-section details,.explanation{background:${t.surface};color:${t.text}}.explanation b{color:${t.text}}.option .letter{background:${d};color:${t.text}}.option.staged,.option.correct{background:${t.surface};color:${t.text}}.atmosphere{opacity:.8}.stage[data-motion=none] *{animation:none!important;transition:none!important}.stage[data-motion=gentle] .score-pop{animation:none!important}${t.motif==='none'?'.turn-lane>svg,.dna3d-surface,.intro-art{display:none!important}':''}`;}
function build(input,runtime){const c=validate(input);if(!runtime||!runtime.template||!runtime.scripts)fail('runtime','is incomplete');const assets={...(runtime.sharedAssets||{}),libraries:runtime.libraries||{packages:[]}};let bytes=0;for(const [key,a]of Object.entries(c.assets)){let resolved=a;if(!a.data){const data=runtime.assetFiles?.[a.file];if(!data)fail('assets.'+key+'.file','is not loaded; add the local asset or use an inline data URI');resolved={...a,data};}asset(resolved,'assets.'+key);bytes+=resolved.data.length;if(bytes>20*1024*1024)fail('assets','exceed the 20 MB embedded asset budget');assets[key]={...resolved};delete assets[key].file;}
 const replacements={__QUESTIONS__:scriptData(c.questions),__ASSETS__:scriptData(assets),__CONFIG__:scriptData(c),__THEME__:themeCSS(c)+styleCSS(c.theme),__TITLE__:esc(c.event.title),__VENDOR__:runtime.scripts.vendor,__PROFILE__:runtime.scripts.profile,__AUDIO__:runtime.scripts.audio,__RECORDER__:runtime.scripts.recorder,__ENGINE__:runtime.scripts.engine,__DNA3D__:runtime.scripts.dna,__DNA3D_CSS__:runtime.scripts.dnaCSS,__MOTION__:runtime.scripts.motion,__PENALTY__:runtime.scripts.penalty,__PENALTY_CSS__:runtime.scripts.penaltyCSS,__UI__:runtime.scripts.ui};
 let html=runtime.template;for(const [marker,value]of Object.entries(replacements)){if(typeof value!=='string'||html.split(marker).length!==2)fail('runtime',marker+' must appear once');html=html.replace(marker,()=>marker.endsWith('_CSS__')||['__QUESTIONS__','__ASSETS__','__CONFIG__','__THEME__','__TITLE__'].includes(marker)?value:value.replace(/<\/script/gi,'<\\/script'));}if(Object.keys(replacements).some(marker=>html.includes(marker)))fail('runtime','contains an unresolved component');return {html,config:c,filename:c.event.id+'_Quiz_Offline.html'};
}
return Object.freeze({validate,build,escapeHTML:esc,scriptData,fingerprint,canonical});
});
