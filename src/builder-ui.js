(function(){
'use strict';
const $=id=>document.getElementById(id),B=QSKBuilder,clone=x=>JSON.parse(JSON.stringify(x));
const example=JSON.parse($('default').textContent),runtime=JSON.parse($('runtime').textContent),storageKey='qsk-faculty-work-v1';
let config=B.newConfig(),brief={topic:'',audience:'Undergraduate students',count:10,notes:''},pending=null,saveTimer,revision=0,importRevision=0;
function status(message,error=false,focus=false){$('status').textContent=message;$('status').dataset.error=String(error);if(focus)$('status').focus();}
function action(fn){try{return fn();}catch(e){status(B.friendly(e),true,true);}}
function readBrief(){return {topic:$('topic').value,audience:$('audience').value,count:Number($('questionCount').value),notes:$('notes').value};}
function persist(){clearTimeout(saveTimer);try{localStorage.setItem(storageKey,JSON.stringify({qskBuilderVersion:1,config,brief}));$('saveStatus').textContent='Saved in this browser on this device. Save work to keep a portable backup.';}catch(_){$('saveStatus').textContent='Browser saving is unavailable or full. Use Save work to keep a copy before closing this page.';}}
function autoSave(){clearTimeout(saveTimer);$('saveStatus').textContent='Saving your work in this browser…';saveTimer=setTimeout(persist,250);}
window.addEventListener('pagehide',persist);window.addEventListener('beforeunload',persist);
function dirty(){revision++;brief=readBrief();$('reviewed').checked=false;$('download').disabled=true;clearPreview();$('copyStatus').textContent='';autoSave();}
function clearPreview(){$('previewPanel').hidden=true;$('previewFrame').removeAttribute('srcdoc');}
function refreshRules(){try{const r=QSKProfile.normalizeRules(config.rules||{});$('rulesSummary').textContent=r.primaryMs/1000+' seconds per answer · Correct +'+r.directPoints+' · Wrong '+r.wrongPoints+' · '+(r.passingEnabled?'Passing: +'+r.passedPoints+' / '+r.passedWrongPoints:'Passing off')+' · '+(r.teacherEnabled?'Teacher consultation: '+r.teacherMs/1000+' seconds':'Teacher consultation off');}catch(e){$('rulesSummary').textContent='Check the rule values in More options: '+B.friendly(e);}}
const team=id=>config.teams.find(t=>t.id===id);
const ruleControls={primarySeconds:['primaryMs',1000],passedSeconds:['passedMs',1000],teacherSeconds:['teacherMs',1000]};
const scoreControls={directCorrect:'directPoints',primaryWrong:'wrongPoints',passedCorrect:'passedPoints',passedWrong:'passedWrongPoints'};
function renderSettings(){
 for(const [id,key]of Object.entries({eventTitle:'title',organization:'organization',eventDate:'date',subtitle:'subtitle'}))$(id).value=config.event[key]||'';
 $('teamA').value=team('Bio').name;$('teamB').value=team('Vista').name;$('colorA').value=team('Bio').color;$('colorB').value=team('Vista').color;
 const t=config.theme||{};for(const [id,key,fallback]of [['background','background','#202829'],['surface','surface','#304047'],['textColor','text','#fff4dc'],['motif','motif','dna'],['font','font','Segoe UI']])$(id).value=t[key]||fallback;
 const raw=config.rules||{};let r;try{r=QSKProfile.normalizeRules(raw);}catch(_){r=QSKProfile.normalizeRules({});}
 for(const [id,[key,factor]]of Object.entries(ruleControls))$(id).value=Object.hasOwn(raw,id)?raw[id]??'':Object.hasOwn(raw,key)?raw[key]===null?'':raw[key]/factor:r[key]/factor;
 for(const [id,key]of Object.entries(scoreControls))$(id).value=Object.hasOwn(raw.scoring||{},id)?raw.scoring[id]??'':Object.hasOwn(raw,key)?raw[key]??'':r[key];$('passing').checked=raw.passing??raw.passingEnabled??r.passingEnabled;$('teacher').checked=raw.teacher??raw.teacherEnabled??r.teacherEnabled;
 for(const [id,key]of Object.entries({topic:'topic',audience:'audience',questionCount:'count',notes:'notes'}))$(id).value=brief[key]??'';
 $('roundNames').replaceChildren();config.rounds.forEach((round,i)=>{const box=field('Round '+(i+1)+' name','text',round.name,'round-name-'+i,80);box.control.oninput=()=>{round.name=box.control.value;dirty();refreshQuestionSummaries();};$('roundNames').append(box.node);});
 refreshRules();
}
function element(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function field(label,type,value,id,max){const node=element('div','field'),l=element('label',null,label),control=element(type==='textarea'?'textarea':type==='select'?'select':'input');l.htmlFor=id;control.id=id;if(type!=='textarea'&&type!=='select')control.type=type;control.value=value??'';if(max)control.maxLength=max;if(type==='textarea')control.rows=3;node.append(l,control);return {node,control};}
function choices(control,options,value){for(const [v,label]of options){const option=element('option',null,label);option.value=v;control.append(option);}control.value=value;}
function qfield(i,parent,label,type,key,value,max,extra={}){const f=field(label,type,value,'question-'+i+'-'+key+(extra.source!==undefined?'-'+extra.source:''),max);f.control.dataset.question=i;f.control.dataset.field=key;Object.assign(f.control.dataset,extra);parent.append(f.node);return f.control;}
function refreshQuestionSummaries(){config.questions.forEach((q,i)=>{const title=$('question-title-'+i),meta=$('question-meta-'+i);if(title)title.textContent=(i+1)+'. '+(q.stem||'Write this question');if(meta)meta.textContent=(config.rounds.find(r=>r.id===q.round)?.name||'Unknown round')+' · '+({main:'Scored question',reserve:'Reserve',tie:'Tie break',demo:'Practice'}[q.status]||q.status)+' · '+q.difficulty;});}
function renderQuestions(openIndex){
 const open=new Set([...$('questionCards').children].filter(n=>n.open).map(n=>Number(n.dataset.index)));if(openIndex!==undefined)open.add(openIndex);
 $('questionCards').replaceChildren();$('emptyQuestions').hidden=config.questions.length>0;
 const main=config.questions.filter(q=>q.status==='main').length,extras=config.questions.length-main;
 $('inventory').textContent=config.questions.length?main+' scored questions · '+config.rounds.length+' round'+(config.rounds.length===1?'':'s')+(extras?' · '+extras+' extra cards':''):'Your questions will appear here';
 config.questions.forEach((q,i)=>{
  const card=element('details','question-card');card.dataset.index=i;card.open=open.has(i)||i===0;
  const summary=element('summary'),heading=element('span','question-title'),meta=element('span','question-meta');heading.id='question-title-'+i;meta.id='question-meta-'+i;const headingWrap=element('span');headingWrap.append(heading,meta);summary.append(headingWrap);card.append(summary);
  const editor=element('div','question-editor');qfield(i,editor,'Question '+(i+1)+' text','textarea','stem',q.stem,300);
  const answers=element('fieldset'),legend=element('legend',null,'Correct answer for question '+(i+1));answers.append(legend,element('p','answer-hint','Choose the circle beside the correct answer. Edit any answer below.'));
  const correctIndex=typeof q.correct==='string'?'ABCD'.indexOf(q.correct):q.correct;
  q.options.forEach((option,j)=>{const row=element('div','option-row'),radioLabel=element('label','answer-radio'),radio=element('input');radio.type='radio';radio.name='correct-'+i;radio.value=j;radio.checked=correctIndex===j;radio.dataset.question=i;radio.dataset.field='correct';radio.setAttribute('aria-label','Answer '+String.fromCharCode(65+j)+' is correct for question '+(i+1));radioLabel.append(radio);row.append(radioLabel);qfield(i,row,'Answer '+String.fromCharCode(65+j),'text','option',option,180,{option:String(j)}).id='question-'+i+'-option-'+j;row.lastChild.querySelector('label').htmlFor='question-'+i+'-option-'+j;answers.append(row);});editor.append(answers);
  qfield(i,editor,'Why is this answer correct?','textarea','explanation',q.explanation,450);
  const sources=element('fieldset');sources.append(element('legend',null,'Sources to check for question '+(i+1)));
  if(!q.sources?.length)sources.append(element('p','source-missing','No sources supplied. Check this answer against your teaching material or add a reliable source before presenting.'));
  (q.sources||[]).forEach((source,j)=>{const row=element('div','source-row');qfield(i,row,'Source '+(j+1)+' title','text','sourceTitle',source.title,250,{source:String(j)});qfield(i,row,'Source '+(j+1)+' link (optional HTTPS)','url','sourceUrl',source.url||'',1500,{source:String(j)});if(/^https:\/\/[^\s]+$/i.test(source.url||'')){const link=element('a','source-link','Open source '+(j+1)+' in a new tab');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';row.append(link);}const remove=element('button','text-button','Remove source '+(j+1));remove.type='button';remove.onclick=()=>{q.sources.splice(j,1);delete q.verificationDate;dirty();renderQuestions(i);$('question-'+i+'-stem').focus();};row.append(remove);sources.append(row);});
  const add=element('button',null,'Add source');add.type='button';add.disabled=(q.sources?.length||0)>=12;add.onclick=()=>{q.sources=q.sources||[];q.sources.push({title:'',url:''});dirty();renderQuestions(i);$('question-'+i+'-sourceTitle-'+(q.sources.length-1)).focus();};sources.append(add);
  const date=qfield(i,sources,'Source review date (only if actually checked)','date','verificationDate',q.verificationDate||'');date.setAttribute('aria-describedby','date-help-'+i);const dateHelp=element('p','help','Leave empty until these sources have actually been checked. Editing the content clears this date.');dateHelp.id='date-help-'+i;sources.append(dateHelp);editor.append(sources);
  if(q.visual)editor.append(element('p','help','This question includes a visual. Its media and alternative text are preserved; use the complete configuration editor to change them.'));
  const more=element('details','question-options');more.append(element('summary',null,'Question settings & paired questions'));
  const row=element('div','field-row'),round=qfield(i,row,'Round','select','round',q.round);choices(round,config.rounds.map(r=>[String(r.id),r.name]),String(q.round));const difficulty=qfield(i,row,'Difficulty','select','difficulty',q.difficulty);const levels=['accessible','moderate','challenging'];if(!levels.includes(q.difficulty))levels.push(q.difficulty);choices(difficulty,levels.map(x=>[x,x[0].toUpperCase()+x.slice(1)]),q.difficulty);more.append(row);
  if(['main','tie'].includes(q.status)){qfield(i,more,'Paired question group (advanced)','text','pairId',q.pairId,64);more.append(element('p','help','Keep exactly two questions in each group, with the same round and difficulty. Each team receives one.'));
  }
  const remove=element('button',null,['main','tie'].includes(q.status)?'Remove this pair':'Remove this question');remove.type='button';remove.onclick=()=>{if(more.querySelector('.remove-confirm'))return;const panel=element('div','remove-confirm');panel.append(element('p','help','Remove '+(['main','tie'].includes(q.status)?'both questions in this pair':'this question')+'? Save work first if you need a backup.'));const yes=element('button',null,'Remove'),no=element('button',null,'Keep questions');yes.type=no.type='button';yes.onclick=()=>{config.questions=config.questions.filter(x=>['main','tie'].includes(q.status)?!(x.status===q.status&&x.round===q.round&&x.pairId===q.pairId):x!==q);const used=config.rounds.filter(r=>config.questions.some(x=>x.status==='main'&&x.round===r.id));if(used.length)config.rounds=used;dirty();renderSettings();renderQuestions();$('addPair').focus();};no.onclick=()=>{panel.remove();remove.focus();};panel.append(yes,no);more.append(panel);no.focus();};more.append(remove);editor.append(more);card.append(editor);$('questionCards').append(card);
 });refreshQuestionSummaries();
}
function render(){renderSettings();renderQuestions();$('config').value=JSON.stringify(config,null,2);}
function stage(result,label,returnTarget='reply'){
 pending={...result,returnTarget};$('importError').hidden=true;$('reply').removeAttribute('aria-invalid');$('pendingImport').hidden=false;
 const c=result.config,main=c.questions.filter(q=>q.status==='main').length;
 $('importSummary').textContent=(label||c.event.title)+': '+main+' scored questions, '+(c.questions.length-main)+' extra cards, '+c.rounds.length+' round'+(c.rounds.length===1?'':'s')+'.';
 let ruleText;try{const r=QSKProfile.normalizeRules(c.rules||{});ruleText='Imported scoring: +'+r.directPoints+' correct, '+r.wrongPoints+' wrong, passing '+(r.passingEnabled?'+'+r.passedPoints+' / '+r.passedWrongPoints:'off')+'.';}catch(_){ruleText='Some rule values are unfinished. Complete them in More options before previewing.';}
 $('importChanges').textContent=(result.kind==='draft'?'Keeps your current teams, timing, scoring and appearance.':'Replaces the current quiz, including its teams, rules and appearance. '+ruleText)+' Accepting replaces the current questions and starts a new teacher review. Use Save work to keep the current quiz first.';
 $('pendingImport').focus();
}
function readReply(){importRevision++;pending=null;$('pendingImport').hidden=true;try{stage(B.parseReply($('reply').value,config));}catch(e){$('importError').textContent=B.friendly(e);$('importError').hidden=false;$('reply').setAttribute('aria-invalid','true');$('importError').focus();}}
$('readReply').onclick=readReply;
$('cancelImport').onclick=()=>{importRevision++;const target=pending?.returnTarget||'reply';pending=null;$('pendingImport').hidden=true;$(target).focus();};
$('useImport').onclick=()=>{if(!pending)return;const p=pending;pending=null;importRevision++;if(p.kind==='draft'){config={...clone(config),event:{...config.event,title:p.config.event.title},rounds:clone(p.config.rounds),questions:clone(p.config.questions)};}else config=clone(p.config);if(p.brief)brief=p.brief;$('pendingImport').hidden=true;render();dirty();status('Draft loaded. Review every question and source below; format checks are not fact checks.');$('review').focus();};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;const token=++importRevision;try{if(file.size>25*1024*1024)throw Error('Use a quiz file below 25 MB.');const text=await file.text();if(token!==importRevision)return;stage(B.parseReply(text,config),file.name,'import');}catch(error){if(token===importRevision){$('importError').textContent=B.friendly(error);$('importError').hidden=false;$('importError').focus();}}finally{e.target.value='';}};
$('loadExample').onclick=()=>{importRevision++;stage({config:clone(example),kind:'configuration'},'Original BioVista example','loadExample');};
$('reset').onclick=()=>stage({config:B.newConfig(),brief:{topic:'',audience:'Undergraduate students',count:10,notes:''},kind:'work'},'New blank classroom quiz','reset');
$('copyPrompt').onclick=async()=>{
 const button=$('copyPrompt');if(button.disabled)return;
 let text;try{text=B.prompt(config,readBrief());}catch(e){status('Before copying the prompt, fix: '+B.friendly(e),true,true);return;}
 const atRevision=revision;button.disabled=true;$('copyStatus').textContent='Copying your prepared prompt…';
 try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);$('promptFallback').hidden=true;$('copyStatus').textContent=atRevision===revision?'Prompt copied. Open ChatGPT and paste it to start.':'Prompt copied for the earlier details. Copy again to include your changes.';}
 catch(_){$('copyStatus').textContent='Automatic copying is unavailable. Copy the selected prompt text below.';$('manualPrompt').value=text;$('promptFallback').hidden=false;$('manualPrompt').focus();$('manualPrompt').select();}
 finally{button.disabled=false;}
};
$('selectPrompt').onclick=()=>{$('manualPrompt').focus();$('manualPrompt').select();};$('closePrompt').onclick=()=>{$('promptFallback').hidden=true;$('copyPrompt').focus();};
$('briefForm').onsubmit=e=>{e.preventDefault();$('copyPrompt').click();};
for(const id of ['topic','audience','notes','questionCount'])$(id).addEventListener('input',dirty);
function bind(id,set){$(id).addEventListener('input',()=>{set($(id));dirty();refreshRules();});}
for(const [id,key]of Object.entries({eventTitle:'title',organization:'organization',eventDate:'date',subtitle:'subtitle'}))bind(id,n=>config.event[key]=n.value);
bind('teamA',n=>team('Bio').name=n.value);bind('teamB',n=>team('Vista').name=n.value);bind('colorA',n=>team('Bio').color=n.value);bind('colorB',n=>team('Vista').color=n.value);
for(const [id,key]of Object.entries({background:'background',surface:'surface',textColor:'text',motif:'motif',font:'font'}))bind(id,n=>{config.theme=config.theme||{};config.theme[key]=n.value;});
for(const [id,[alias]]of Object.entries(ruleControls))bind(id,n=>{config.rules=config.rules||{};delete config.rules[alias];config.rules[id]=n.valueAsNumber;});
for(const [id,alias]of Object.entries(scoreControls))bind(id,n=>{config.rules=config.rules||{};delete config.rules[alias];config.rules.scoring=config.rules.scoring||{};config.rules.scoring[id]=n.valueAsNumber;});
for(const [id,alias]of [['passing','passingEnabled'],['teacher','teacherEnabled']])bind(id,n=>{config.rules=config.rules||{};delete config.rules[alias];config.rules[id]=n.checked;});
function questionChange(e){const n=e.target,i=Number(n.dataset.question);if(n.dataset.question===undefined||!config.questions[i])return;if(n.type==='radio'&&!n.checked)return;const q=config.questions[i],f=n.dataset.field;
 if(f==='option')q.options[Number(n.dataset.option)]=n.value;
 else if(f==='sourceTitle')q.sources[Number(n.dataset.source)].title=n.value;
 else if(f==='sourceUrl'){const s=q.sources[Number(n.dataset.source)];if(n.value)s.url=n.value;else delete s.url;const link=n.closest('.source-row').querySelector('a');if(link){link.hidden=!/^https:\/\/[^\s]+$/i.test(n.value);if(!link.hidden)link.href=n.value;}}
 else q[f]=['correct','round'].includes(f)?Number(n.value):n.value;
 if(['stem','option','correct','explanation','sourceTitle','sourceUrl'].includes(f)){delete q.verificationDate;$('question-'+i+'-verificationDate').value='';}
 dirty();refreshQuestionSummaries();
}
$('questionCards').addEventListener('input',e=>{if(e.target.type!=='radio')questionChange(e);});$('questionCards').addEventListener('change',e=>{if(e.target.type==='radio')questionChange(e);});
$('addPair').onclick=()=>action(()=>{if(config.questions.length>248||config.questions.filter(q=>q.status==='main').length>198)throw Error('The quiz supports up to 200 scored questions and 250 total cards.');const unique='manual-'+Date.now().toString(36)+'-'+revision,index=config.questions.length;for(let j=0;j<2;j++)config.questions.push({id:unique+'-'+j,status:'main',round:config.rounds[0].id,pairId:unique,difficulty:'accessible',stem:'',options:['','','',''],correct:0,explanation:'',sources:[],verificationDate:''});dirty();renderQuestions(index);status('Two questions added to '+config.rounds[0].name+'. Fill in both questions and check their answers.');$('question-'+index+'-stem').focus();});
$('loadConfigText').onclick=()=>{$('config').value=JSON.stringify(config,null,2);$('config').focus();};
$('applyConfig').onclick=()=>action(()=>stage(B.parseReply($('config').value,config),'Edited configuration','config'));
function checked(){const c=B.validate(config);status('Valid: '+c.questions.filter(q=>q.status==='main').length+' scored questions across '+c.rounds.length+' round'+(c.rounds.length===1?'':'s')+'. This checks format, not factual accuracy.');return c;}
function build(){checked();try{return QSKCompiler.build(config,runtime);}catch(e){throw Error(B.friendly(e).replace(/assets\.([^.]+)\.file: is not loaded; add the local asset or use an inline data URI/,'Missing local media "$1". Open More options and add the matching approved file, then preview again.'));}}
function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type})),a=element('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('validate').onclick=()=>action(()=>{checked();$('status').focus();});
$('preview').onclick=()=>action(()=>{const result=build();$('previewFrame').srcdoc=result.html;$('previewPanel').hidden=false;status('Preview ready. Check the questions and rehearse the quiz controls before downloading.');$('previewHeading').focus();});
$('closePreview').onclick=()=>{clearPreview();$('preview').focus();};
$('reviewed').onchange=()=>{$('download').disabled=!$('reviewed').checked;};
$('download').onclick=()=>action(()=>{if(!$('reviewed').checked)throw Error('Review every question, answer, explanation and source, then tick the review box before downloading.');const result=build();download(result.html,result.filename,'text/html');status('Your quiz file is ready. Check your browser’s downloads, then open '+result.filename+' to present offline.');});
$('save').onclick=()=>action(()=>{download(B.workFile(config,readBrief()),config.event.id+'_work.json','application/json');status('Work file is ready. Open it on this page later to continue editing. Review is required again when you reopen it.');});
$('saveConfig').onclick=()=>action(()=>{checked();download(JSON.stringify(config,null,2),'quiz.config.json','application/json');status('Validated configuration file is ready in your browser’s downloads.');});
$('assets').onchange=async e=>{const files=[...e.target.files];if(!files.length)return;const snapshot=revision,c=clone(config);try{c.assets=c.assets||{};for(const file of files){if(file.size>2*1024*1024)throw Error(file.name+' exceeds 2 MB. Use a smaller approved file.');const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read '+file.name));r.readAsDataURL(file);});let matched=false;for(const asset of Object.values(c.assets))if(asset.file&&asset.file.split(/[\\/]/).pop()===file.name){asset.data=data;delete asset.file;matched=true;}if(!matched)c.assets[file.name.replace(/[^a-z0-9._-]/gi,'_')]={data};}B.validateWork(c);if(revision!==snapshot)throw Error('Your quiz changed while the files were loading. Select the files again to add them to the current quiz.');config=c;dirty();status('Approved local media embedded. Preview again to check it.');}catch(error){status('Media could not be added: '+B.friendly(error),true,true);}finally{e.target.value='';}};
try{const saved=localStorage.getItem(storageKey);if(saved){const restored=B.parseReply(saved,config);config=restored.config;brief=restored.brief||brief;status('Restored your work from this browser. Review it again before downloading.');}}catch(_){$('saveStatus').textContent='Browser saving is unavailable, or saved work could not be read. Use Save work for a portable backup.';}
render();
})();
