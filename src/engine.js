/* Quiz Show Kit: deterministic quiz logic. The profile is captured once at load. */
(function (global) {
  'use strict';
  const TEAMS = ['Bio', 'Vista'];
  const PHASES = ['intro','roundIntro','read','tieRead','optionsIntro','discussion','answering','acknowledged','passTransition','reveal','end'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const freeze=value=>{if(value&&typeof value==='object'){for(const item of Object.values(value))freeze(item);Object.freeze(value);}return value;};
  const stable=value=>Array.isArray(value)?'['+value.map(stable).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stable(value[key])).join(',')+'}':JSON.stringify(value);
  const identity=value=>{const text=stable(value);let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return text.length+':'+(hash>>>0).toString(16);};
  if(!global.QSKProfile?.normalizeRules || !global.QSK_CONFIG)throw new Error('Load QSKProfile and the normalized competition profile before the engine.');
  const rawProfile=clone(global.QSK_CONFIG),RULES=global.QSKProfile.normalizeRules(rawProfile.rules);
  if(typeof rawProfile.profileId!=='string'||!rawProfile.profileId.trim()||typeof rawProfile.event?.id!=='string'||!rawProfile.event.id.trim()||typeof rawProfile.event?.title!=='string'||!rawProfile.event.title.trim())throw new Error('A competition profile needs profileId, event.id and event.title.');
  if(!Array.isArray(rawProfile.rounds)||!rawProfile.rounds.length||rawProfile.rounds.some(round=>!['string','number'].includes(typeof round.id)||!String(round.id).trim()||typeof round.name!=='string'||!round.name.trim())||new Set(rawProfile.rounds.map(round=>String(round.id))).size!==rawProfile.rounds.length)throw new Error('The profile needs distinct named rounds.');
  for(const team of TEAMS)if(typeof rawProfile.teams?.[team]?.name!=='string'||!rawProfile.teams[team].name.trim()||typeof rawProfile.teams[team].color!=='string')throw new Error('Each canonical team needs a display name and color.');
  const GAMEPLAY_DEFAULTS=freeze({shuffleOptions:false,discussionSeconds:0,difficultyOrder:'manual',difficultyLevels:['accessible','moderate','challenging','standard'],roundOrder:'fixed',statistics:['directOpportunities','passesOffered','passesReached','attempted','correct','wrong','scores','primaryCorrect','passedCorrect','accuracy','winningChance'],revisionReport:false});
  function normalizeGameplay(raw={}) {
    if(!raw||Object.prototype.toString.call(raw)!=='[object Object]')throw new Error('Gameplay settings must be an object.');
    for(const key of Object.keys(raw))if(!Object.hasOwn(GAMEPLAY_DEFAULTS,key))throw new Error('Unknown gameplay setting: '+key);
    const result={...clone(GAMEPLAY_DEFAULTS),...clone(raw)};
    for(const key of ['shuffleOptions','revisionReport'])if(typeof result[key]!=='boolean')throw new Error(key+' must be true or false.');
    if(!Number.isInteger(result.discussionSeconds)||result.discussionSeconds<0||result.discussionSeconds>600)throw new Error('Discussion seconds must be a whole number from 0 to 600.');
    if(!['manual','rising','falling'].includes(result.difficultyOrder))throw new Error('Choose manual, rising or falling difficulty order.');
    if(!['fixed','alternate'].includes(result.roundOrder))throw new Error('Choose fixed or alternate round order.');
    if(!Array.isArray(result.difficultyLevels)||!result.difficultyLevels.length||result.difficultyLevels.length>12||result.difficultyLevels.some(x=>typeof x!=='string'||!x.trim()||x.length>40)||new Set(result.difficultyLevels).size!==result.difficultyLevels.length)throw new Error('Difficulty levels must be distinct labels ordered easiest to hardest.');
    if(!Array.isArray(result.statistics)||result.statistics.some(x=>!GAMEPLAY_DEFAULTS.statistics.includes(x))||new Set(result.statistics).size!==result.statistics.length)throw new Error('Choose distinct supported statistics.');
    return result;
  }
  const BASE_GAMEPLAY=freeze(normalizeGameplay(rawProfile.gameplay));
  const gameplay=s=>s.config.gameplay||BASE_GAMEPLAY;
  const PROFILE=freeze({profileId:rawProfile.profileId,event:rawProfile.event,teams:rawProfile.teams,rounds:rawProfile.rounds,rules:RULES,...(rawProfile.gameplay===undefined?{}:{gameplay:BASE_GAMEPLAY})}),PROFILE_IDENTITY=identity(PROFILE);
  let knownBank=null,knownBankText=null,BANK_IDENTITY=null;
  const validatedConfigs=new WeakSet();
  function configValid(config){
    if(!config||typeof config!=='object')return false;
    if(validatedConfigs.has(config))return true;
    if(config?.gameplay!==undefined){try{if(stable(normalizeGameplay(config.gameplay))!==stable(config.gameplay))return false;}catch{return false;}}
    if(config?.shuffleSeed!==undefined&&(!Number.isInteger(config.shuffleSeed)||config.shuffleSeed<0||config.shuffleSeed>4294967295))return false;
    if((config?.gameplay||BASE_GAMEPLAY).shuffleOptions&&config?.shuffleSeed===undefined)return false;
    const valid=config.ruleVersion===5&&['full','short'].includes(config.mode)&&TEAMS.includes(config.startingTeam)&&Object.keys(RULES).every(key=>config[key]===RULES[key])&&Object.keys(config).every(key=>['ruleVersion','mode','startingTeam','gameplay','shuffleSeed',...Object.keys(RULES)].includes(key));
    if(valid){freeze(config);validatedConfigs.add(config);}return valid;
  }
  const gameplayIdentities=new WeakMap();
  function gameplayIdentity(config){if(gameplayIdentities.has(config))return gameplayIdentities.get(config);const value=identity({gameplay:config.gameplay||BASE_GAMEPLAY,...(config.shuffleSeed===undefined?{}:{shuffleSeed:config.shuffleSeed})});if(Object.isFrozen(config))gameplayIdentities.set(config,value);return value;}
  function stateProfileValid(s){return s?.version===5&&s.profileId===PROFILE.profileId&&s.profileIdentity===PROFILE_IDENTITY&&s.bankIdentity===BANK_IDENTITY&&configValid(s.config)&&(s.config.gameplay===undefined?s.gameplayIdentity===undefined||s.gameplayIdentity===gameplayIdentity(s.config):s.gameplayIdentity===gameplayIdentity(s.config));}
  const opposite = team => team === 'Bio' ? 'Vista' : 'Bio';
  const nonnegative = value => Math.max(0, Number(value) || 0);
  function answerIndex(value) {
    if (typeof value === 'string' && /^[A-D]$/i.test(value)) return value.toUpperCase().charCodeAt(0)-65;
    return Number.isInteger(value) && value >= 0 && value <= 3 ? value : null;
  }
  // Public views expose only already-confirmed wrong choices, never the key.
  // The audit ledger is authoritative so Undo, recovery and voids stay coherent.
  function blockedOptions(s) {
    if(s.turn!=='passed' || !s.questionId)return [];
    const indices=(s.records||[]).filter(row=>!row.voided && row.questionId===s.questionId && row.kind===s.kind && row.team===s.primaryTeam && row.turn==='primary' && row.origin==='answer' && row.correct===false).map(row=>answerIndex(row.option)).filter(index=>index!==null);
    return [...new Set(indices)].sort((a,b)=>a-b);
  }
  function clearBlockedSelection(s) {
    if(s.selected!==null && blockedOptions(s).includes(answerIndex(s.selected))){s.selected=null;return true;}
    return false;
  }
  function normalizeQuestions(input) {
    if (!Array.isArray(input) || !input.length) throw new Error('Question data is missing.');
    if(input.length>250)throw new Error('A question bank is limited to 250 cards.');
    const seen = new Set();
    const declared=new Map();
    const result=input.map(raw => {
      const q = clone(raw);
      if (typeof q.id!=='string'||!q.id.trim()||seen.has(q.id)) throw new Error('Question IDs must be present, textual and unique.');
      seen.add(q.id);
      q.status = q.status || q.kind;
      q.pairId = q.pairId || q.matchedPairId || q.pair;
      q.round = q.roundNumber === undefined ? q.round : q.roundNumber;
      if(q.round===undefined&&q.status!=='main')q.round=0;
      if(!['string','number'].includes(typeof q.round)||!String(q.round).trim()||(typeof q.round==='number'&&!Number.isFinite(q.round)))throw new Error('Question round is invalid: '+q.id);
      const legacyLetterKey=q.optionIds===undefined&&typeof q.correctOptionId==='string'&&/^[A-D]$/i.test(q.correctOptionId);
      q.optionIds=q.optionIds||q.options?.map((_,i)=>q.id+'-'+String.fromCharCode(65+i));
      if(!Array.isArray(q.optionIds)||q.optionIds.length!==4||q.optionIds.some(id=>typeof id!=='string'||!id.trim())||new Set(q.optionIds).size!==4)throw new Error('Question option identities must be four distinct labels: '+q.id);
      q.correct = q.correct===undefined&&q.correctOptionId&&q.optionIds.includes(q.correctOptionId)?q.optionIds.indexOf(q.correctOptionId):answerIndex(q.correct===undefined?q.correctOptionId:q.correct);
      if(q.correctOptionId!==undefined&&!legacyLetterKey&&q.correctOptionId!==q.optionIds[q.correct])throw new Error('Correct answer identity and index disagree: '+q.id);
      q.correctOptionId=q.optionIds[q.correct];
      q.optionExplanations=q.optionExplanations??['','','',''];q.subtype=q.subtype||'text';q.topic=q.topic||'';
      if(q.optionExplanations!==undefined&&(!Array.isArray(q.optionExplanations)||q.optionExplanations.length!==4||q.optionExplanations.some(value=>typeof value!=='string')))throw new Error('Question needs four text option explanations: '+q.id);
      const seconds=q.seconds??q.timing?.primary??q.timing?.primarySeconds??RULES.primaryMs/1000;
      if(typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<=0)throw new Error('Question timing is invalid: '+q.id);
      declared.set(q.id,seconds);q.seconds=RULES.primaryMs/1000;
      if (!['main','reserve','tie','demo'].includes(q.status) || !Array.isArray(q.options) || q.options.length!==4 || q.options.some(option=>typeof option==='string'?!option.trim():!option||typeof option.text!=='string'||!option.text.trim()) || q.correct===null || typeof q.stem!=='string'||!q.stem.trim()) throw new Error('A question record is invalid: '+q.id);
      if(new Set(q.options.map(option=>(typeof option==='string'?option:option.text).trim().toLowerCase())).size!==4)throw new Error('Question options must be distinct: '+q.id);
      if(['main','tie'].includes(q.status)&&(typeof q.pairId!=='string'||!q.pairId.trim()))throw new Error('A scheduled card needs a textual matched-pair ID: '+q.id);
      if(q.status==='main'&&!PROFILE.rounds.some(round=>String(round.id)===String(q.round)))throw new Error('Main question references an unknown profile round: '+q.id);
      q.difficulty=q.difficulty||'standard';
      q.timing={...(q.timing||{}),primary:RULES.primaryMs/1000,passed:q.status==='tie'||!RULES.passingEnabled?0:RULES.passedMs/1000};
      return q;
    });
    const pairs=new Map();for(const q of result.filter(q=>['main','tie'].includes(q.status))){const key=[q.status,String(q.round),q.pairId].join(':');if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push(q);}
    for(const cards of pairs.values())if(cards.length===2&&declared.get(cards[0].id)!==declared.get(cards[1].id))throw new Error('Matched source question timing must agree: '+cards[0].pairId);
    if(result.filter(q=>q.status==='main').length>200||result.filter(q=>q.status==='tie').length>20||result.filter(q=>q.status==='demo').length>1)throw new Error('Bank limits are 200 main cards, 20 tie cards and one demo.');
    return result;
  }
  function buildSchedule(questions, config, kind='main') {
    const list=questions.filter(q=>q.status===kind);
    const rounds=kind==='main'?PROFILE.rounds.map(round=>round.id):[...new Set(list.map(q=>q.round))];
    const entries=[];
    for(const round of rounds) {
      const cards=list.filter(q=>String(q.round)===String(round));
      if(kind==='main'&&!cards.length)throw new Error('Each configured round needs at least one complete main pair: '+round);
      const pairs=[];
      for(const q of cards) {
        if(!q.pairId)throw new Error('Every scheduled question needs a matched pair ID: '+q.id);
        let pair=pairs.find(p=>p.id===q.pairId);
        if(!pair){pair={id:q.pairId,cards:[]};pairs.push(pair);}
        pair.cards.push(q);
      }
      for(const pair of pairs) {
        if(pair.cards.length!==2)throw new Error('Every matched pair must contain two questions: '+pair.id);
        if(pair.cards[0].difficulty!==pair.cards[1].difficulty || pair.cards[0].seconds!==pair.cards[1].seconds)throw new Error('Paired difficulty and timing must agree: '+pair.id);
      }
      const selected=kind==='main' && config.mode==='short'?pairs.slice(0,config.shortPairsPerRound):pairs.slice();
      const settings=config.gameplay||BASE_GAMEPLAY;
      if(kind==='main'&&settings.difficultyOrder!=='manual') {
        for(const pair of selected)if(!settings.difficultyLevels.includes(pair.cards[0].difficulty))throw new Error('Difficulty level is missing from the ordered legend: '+pair.cards[0].difficulty);
        const direction=settings.difficultyOrder==='rising'?1:-1;
        selected.sort((a,b)=>direction*(settings.difficultyLevels.indexOf(a.cards[0].difficulty)-settings.difficultyLevels.indexOf(b.cards[0].difficulty)));
      }
      const start=kind==='main'&&settings.roundOrder==='alternate'&&rounds.indexOf(round)%2?opposite(config.startingTeam):config.startingTeam;
      for(const pair of selected) for(let i=0;i<2;i++) entries.push({id:pair.cards[i].id,round,pairId:pair.id,kind,primaryTeam:i===0?start:opposite(start)});
    }
    if(kind==='main'&&(!entries.length||entries.length%2))throw new Error('Main rounds must contain complete matched pairs.');
    if(kind==='tie'&&entries.length%2)throw new Error('Tie rounds must contain complete matched pairs.');
    return entries;
  }
  function settingsFrom(options) {
    const direct=Object.fromEntries(Object.keys(GAMEPLAY_DEFAULTS).filter(key=>Object.hasOwn(options,key)).map(key=>[key,options[key]]));
    return normalizeGameplay({...BASE_GAMEPLAY,...direct,...options.gameplay});
  }
  function newSeed() {
    if(global.crypto?.getRandomValues)return global.crypto.getRandomValues(new Uint32Array(1))[0];
    return Math.floor(Math.random()*4294967296);
  }
  function displayQuestion(s,q) {
    if(!q)return null;
    if(!gameplay(s).shuffleOptions)return q;
    // A seeded permutation is derived once in meaning from session seed + stable ID.
    // Never shuffle again at pass, narration, Undo or recovery boundaries.
    let seed=(s.config.shuffleSeed^parseInt(identity(q.id).split(':')[1],16))>>>0;
    const random=()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return (t^(t>>>14))>>>0;};
    const order=[0,1,2,3];
    for(let i=3;i>0;i--){const span=i+1,limit=4294967296-(4294967296%span);let value;do{value=random();}while(value>=limit);const j=value%span;[order[i],order[j]]=[order[j],order[i]];}
    const mapped={...q,options:order.map(i=>q.options[i]),optionIds:order.map(i=>q.optionIds[i]),correct:order.indexOf(q.correct)};
    if(q.optionExplanations)mapped.optionExplanations=order.map(i=>q.optionExplanations[i]);
    if(q.narration)mapped.narration={...q.narration,...(q.narration.options?{options:order.map(i=>q.narration.options[i])}:{})};
    return mapped;
  }
  function schedule(input,options={}) {
    const config={...RULES,gameplay:settingsFrom(options),mode:options.mode==='short'?'short':'full',startingTeam:options.startingTeam==='Vista'?'Vista':'Bio'};
    return buildSchedule(normalizeQuestions(input),config);
  }
  function create(input,options={},now=0) {
    const normalized=normalizeQuestions(input),text=stable(normalized);
    if(knownBankText!==null&&text!==knownBankText)throw new Error('A different bank needs a separately loaded competition profile.');
    if(options.mode!==undefined&&!['full','short'].includes(options.mode)||options.startingTeam!==undefined&&!TEAMS.includes(options.startingTeam))throw new Error('Choose full/short mode and a canonical starting team.');
    const config={...RULES,ruleVersion:5,gameplay:settingsFrom(options),mode:options.mode==='short'?'short':'full',startingTeam:options.startingTeam==='Vista'?'Vista':'Bio'};
    if(config.gameplay.shuffleOptions)config.shuffleSeed=options.shuffleSeed===undefined?newSeed():options.shuffleSeed;
    if(!configValid(config))throw new Error('Invalid gameplay settings or shuffle seed.');
    const bank=knownBank||freeze(normalized);
    const main=buildSchedule(bank,config),ties=buildSchedule(bank,config,'tie');
    if(knownBank===null){knownBank=bank;knownBankText=text;BANK_IDENTITY=identity(bank);}
    return {version:5,profileId:PROFILE.profileId,profileIdentity:PROFILE_IDENTITY,bankIdentity:BANK_IDENTITY,gameplayIdentity:gameplayIdentity(config),bank,config,schedule:main,tieSchedule:ties,cursor:-1,tieCursor:-1,kind:'main',phase:'intro',questionId:null,primaryTeam:config.startingTeam,activeTeam:config.startingTeam,turn:'primary',selected:null,lockedAnswer:null,timer:null,answerRemainingMs:null,mainScores:{Bio:0,Vista:0},tieScores:{Bio:0,Vista:0},lifelines:{Bio:false,Vista:false},lifelineActive:null,lifelineUses:[],records:[],log:[],history:[],usedReserves:[],winner:null,lastNow:Number(now)||0,sequence:0,pauseReason:'',migrationNotice:''};
  }
  function question(s) {return displayQuestion(s,(knownBank||s.bank).find(q=>q.id===s.questionId));}
  function remaining(timer,now) {return !timer?0:timer.paused?nonnegative(timer.remainingMs):nonnegative(timer.deadline-now);}
  function copyState(s) {
    return {...s,timer:s.timer?{...s.timer}:null,mainScores:{...s.mainScores},tieScores:{...s.tieScores},lifelines:{...s.lifelines},lifelineActive:s.lifelineActive?{...s.lifelineActive,returnClock:{...s.lifelineActive.returnClock}}:null,lifelineUses:s.lifelineUses.slice(),records:s.records.slice(),log:s.log.slice(),history:s.history.slice(),usedReserves:s.usedReserves.slice(),schedule:s.schedule.map(x=>({...x})),tieSchedule:s.tieSchedule.map(x=>({...x})),winner:s.winner?{...s.winner}:null};
  }
  function recordLog(s,type,now,details={}) {
    s.sequence++;
    s.log.push({id:s.sequence,at:now,type,questionId:s.questionId,team:s.activeTeam,...details});
  }
  function snapshot(s,now) {
    const snap={...s};delete snap.bank;delete snap.history;delete snap.config;
    snap.timer=s.timer?{...s.timer,remainingMs:remaining(s.timer,now),deadline:null,paused:true}:null;
    return clone(snap);
  }
  function addHistory(s,previous,now) {
    s.history.push(snapshot(previous,now));
    if(s.history.length>20)s.history.splice(0,s.history.length-20);
  }
  function startTimer(s,mode,ms,now) {s.timer={mode,remainingMs:ms,deadline:now+ms,paused:false};s.pauseReason='';}
  function pauseTimer(s,now,reason='Host pause') {
    if(s.timer && !s.timer.paused){s.timer.remainingMs=remaining(s.timer,now);s.timer.deadline=null;s.timer.paused=true;}
    s.pauseReason=reason;
  }
  function loadCard(s,item,phase,now) {
    s.questionId=item.id;s.primaryTeam=item.primaryTeam;s.activeTeam=item.primaryTeam;s.turn='primary';s.kind=item.kind;
    s.phase=phase;s.selected=null;s.lockedAnswer=null;s.timer=null;s.answerRemainingMs=null;s.pauseReason='';s.winner=null;s.lifelineActive=null;
    recordLog(s,'question-ready',now,{phase});
  }
  function beginMain(s,now) {s.cursor=0;s.tieCursor=-1;loadCard(s,s.schedule[0],'roundIntro',now);}
  function end(s,now,pendingReason='Main scores are tied. Start matched-pair tie resolution.') {
    const tally=s.kind==='tie'?s.tieScores:s.mainScores;
    const tied=tally.Bio===tally.Vista;
    s.phase='end';s.timer=null;s.selected=null;s.pauseReason='';s.lifelineActive=null;
    s.winner={team:tied?null:(tally.Bio>tally.Vista?'Bio':'Vista'),pending:tied,reason:tied&&s.kind==='main'&&!s.tieSchedule.length?'No tie questions are configured. Tie pending faculty decision.':tied?pendingReason:'Resolved after complete team opportunities.'};
    recordLog(s,'end',now,{winner:s.winner.team,pending:tied,reason:s.winner.reason});
  }
  function reveal(s,effects,now) {s.phase='reveal';s.timer=null;s.selected=null;s.pauseReason='';s.lifelineActive=null;effects.push({type:'phase',phase:'reveal'});recordLog(s,'reveal',now);}
  function turnOutcome(s,option,origin,effects,now) {
    const q=question(s),submitted=option!==null;
    const correct=submitted && option===q.correct;
    const delta=s.kind==='demo'?0:submitted?(correct?(s.turn==='passed'?s.config.passedPoints:s.config.directPoints):(s.turn==='passed'?s.config.passedWrongPoints:s.config.wrongPoints)):0;
    const tally=s.kind==='tie'?s.tieScores:s.mainScores;
    tally[s.activeTeam]+=delta;
    s.records.push({questionId:q.id,kind:s.kind,team:s.activeTeam,turn:s.turn,option,optionId:submitted?q.optionIds[option]:null,correct:submitted?correct:null,delta,origin,at:now,voided:false});
    recordLog(s,submitted?'answer-confirmed':origin,now,{turn:s.turn,option,optionId:submitted?q.optionIds[option]:null,correct:submitted?correct:null,delta,kind:s.kind});
    s.lockedAnswer=option;s.selected=null;s.timer=null;s.answerRemainingMs=null;s.lifelineActive=null;
    if(delta)effects.push({type:'score',team:s.activeTeam,delta,kind:s.kind});
    effects.push({type:'announcement',team:s.activeTeam,outcome:submitted?(correct?'correct':'incorrect'):origin,delta,kind:s.kind,turn:s.turn});
    if(submitted && correct)effects.push({type:'celebrate',team:s.activeTeam,kind:s.kind,delta});
    effects.push({type:'sound',cue:submitted?(correct?'correct':'incorrect'):origin==='timeout'?'timeup':'pass'});
    if(s.config.passingEnabled && s.kind!=='tie' && s.turn==='primary' && !correct) {
      s.turn='passed';s.activeTeam=opposite(s.primaryTeam);s.phase='passTransition';s.lockedAnswer=null;
      startTimer(s,'transition',s.config.passTransitionMs,now);
      if(origin!=='pass')effects.push({type:'sound',cue:'pass'});
      effects.push({type:'phase',phase:'passTransition'});
    } else reveal(s,effects,now);
  }
  function finishTeacher(s,effects,now,early=false) {
    const returnClock=s.lifelineActive.returnClock;
    s.lifelineActive=null;startTimer(s,returnClock.mode,returnClock.remainingMs,now);
    recordLog(s,'lifeline-resumed',now,{early});
    effects.push({type:'sound',cue:'lifelineResume'},{type:'notice',message:early?'Teacher consultation finished. Original clock resumes.':'Teacher time is up. Original clock resumes.'},{type:'teacher-finished',early});
  }
  function tick(original,rawNow) {
    if(!stateProfileValid(original))return {state:original,effects:[],error:'This state does not match the loaded competition profile.'};
    const now=Math.max(original.lastNow,Number(rawNow)||0);
    const effects=[];
    let s={...original,timer:original.timer?{...original.timer}:null,lastNow:now};
    if(!s.timer || s.timer.paused)return {state:s,effects,error:null};
    if(now-original.lastNow>s.config.maxTickGapMs) {
      pauseTimer(s,original.lastNow,'Interrupted: resume when the host is ready.');
      effects.push({type:'notice',message:s.pauseReason},{type:'sound',cue:'interruption'});
      return {state:s,effects,error:null};
    }
    s.timer.remainingMs=remaining(s.timer,now);
    if(s.timer.remainingMs>0)return {state:s,effects,error:null};
    s=copyState(s);
    if(s.phase==='optionsIntro'&&gameplay(s).discussionSeconds>0) {
      s.phase='discussion';startTimer(s,'discussion',gameplay(s).discussionSeconds*1000,now);recordLog(s,'discussion-started',now,{seconds:gameplay(s).discussionSeconds});
      effects.push({type:'phase',phase:'discussion'});
    } else if(s.phase==='optionsIntro'||s.phase==='discussion') {
      s.phase='answering';startTimer(s,'answer',s.config.primaryMs,now);recordLog(s,'answer-timer-started',now,{seconds:s.config.primaryMs/1000});
      effects.push({type:'phase',phase:'answering'},{type:'sound',cue:'answerStart'});
    } else if(s.timer.mode==='teacher' && s.lifelineActive) {
      finishTeacher(s,effects,now);
    } else if(s.phase==='passTransition') {
      s.phase='answering';startTimer(s,'answer',s.config.passedMs,now);recordLog(s,'passed-turn-start',now);
      effects.push({type:'phase',phase:'answering'},{type:'sound',cue:'passedStart'});
    } else if(s.phase==='answering' || s.phase==='acknowledged') {
      addHistory(s,original,original.lastNow);
      turnOutcome(s,null,'timeout',effects,now);
    }
    return {state:s,effects,error:null};
  }
  function guarded(action) {
    if(action.confirmed!==true || !String(action.reason||'').trim())throw new Error('Faculty/host confirmation and a reason are required.');
    return String(action.reason).trim().slice(0,240);
  }
  function reserves(s) {
    const current=question(s),slot=s.schedule[s.cursor];
    if(s.kind!=='main'||!current||!slot||['intro','end'].includes(s.phase))return [];
    return s.bank.filter(q=>q.status==='reserve'&&!s.usedReserves.includes(q.id)&&(q.suitableRounds||q.eligibleRounds||[q.round]).map(String).includes(String(slot.round))&&q.difficulty===current.difficulty&&q.seconds===current.seconds).map(q=>{
      const mismatches=[];
      if((q.topic||'')!==(current.topic||''))mismatches.push('Topic differs from the current question.');
      if((q.subtype||'text')!==(current.subtype||'text'))mismatches.push('Question format differs from the current question.');
      return {question:q,mismatches,exactMatch:mismatches.length===0};
    }).sort((a,b)=>a.mismatches.length-b.mismatches.length);
  }
  function dispatch(original,action,rawNow) {
    if(!stateProfileValid(original))return {state:original,effects:[],error:'This state does not match the loaded competition profile.'};
    if(!action || !action.type)return {state:original,effects:[],error:'An action is required.'};
    const now=Math.max(original.lastNow,Number(rawNow)||0);
    // Visibility/sleep interruptions freeze the last observed logical time, before timeout processing.
    if(action.type==='INTERRUPT') {
      let s=copyState(original);s.lastNow=now;
      pauseTimer(s,original.lastNow,action.reason || 'Presentation interrupted: host resume required.');
      recordLog(s,'interruption',now,{reason:s.pauseReason});
      return {state:s,effects:[{type:'notice',message:s.pauseReason},{type:'sound',cue:'interruption'}],error:null};
    }
    const timed=tick(original,now);
    let s=copyState(timed.state),effects=timed.effects.slice();
    const before=timed.state;
    try {
      const type=String(action.type).toUpperCase();
      if(['STAGE','ACKNOWLEDGE','CONFIRM','PASS','USE_LIFELINE'].includes(type) && (['passTransition','optionsIntro','discussion'].includes(original.phase) || timed.state.turn!==original.turn || (original.lifelineActive && !timed.state.lifelineActive)))throw new Error('This action belonged to a transition that has ended. Wait for the active opportunity before answering.');
      if(s.lifelineActive && ['STAGE','ACKNOWLEDGE','CONFIRM','PASS','CANCEL_ACK'].includes(type))throw new Error('Wait for the teacher consultation to finish before continuing.');
      if(type==='UNDO') {
        if(!s.history.length)throw new Error('There is no action to undo.');
        const histories=s.history.slice(),restored=histories.pop();
        const seq=s.sequence+1;
        s={...clone(restored),bank:s.bank,config:s.config,history:histories,lastNow:now,sequence:seq};
        clearBlockedSelection(s);
        if(s.timer){s.timer.paused=true;s.timer.deadline=null;s.pauseReason='Undo restored play paused. Resume when ready.';}
        recordLog(s,'undo',now,{reason:'Previous host action, scores, clocks and lifeline use restored.'});
        return {state:s,effects:[{type:'notice',message:'Last action undone.'},{type:'sound',cue:'undo'}],error:null};
      }
      if(type==='REVEAL' && s.phase==='reveal')return {state:timed.state,effects,error:null};
      if(type==='CONFIGURE') {
        if(s.phase!=='intro')throw new Error('Gameplay settings can change only before the session starts.');
        s.config={...s.config,gameplay:normalizeGameplay({...gameplay(s),...action.gameplay})};
        if(s.config.gameplay.shuffleOptions&&s.config.shuffleSeed===undefined)s.config.shuffleSeed=newSeed();
        configValid(s.config);s.gameplayIdentity=gameplayIdentity(s.config);
        s.schedule=buildSchedule(s.bank,s.config);s.tieSchedule=buildSchedule(s.bank,s.config,'tie');
        recordLog(s,'gameplay-configured',now);
        // Setup is not a live opportunity. Do not attach history using a different config.
        s.history=[];s.lastNow=now;return {state:s,effects,error:null};
      } else if(type==='COIN_RESULT') {
        if(s.phase!=='intro' || !TEAMS.includes(action.team))throw new Error('Choose a valid coin result before the show starts.');
        if(s.log.some(entry=>entry.type==='coin-result'))throw new Error('The starting-team result is already recorded for this session.');
        s.config=freeze({...s.config,startingTeam:action.team});s.primaryTeam=action.team;s.activeTeam=action.team;
        s.schedule=buildSchedule(s.bank,s.config);s.tieSchedule=buildSchedule(s.bank,s.config,'tie');
        recordLog(s,'coin-result',now,{result:action.team,eligibleTeams:TEAMS.slice(),method:action.method==='crypto-byte-low-bit'?'crypto-byte-low-bit':'host-supplied'});effects.push({type:'sound',cue:'coin'});
        s.history=[];s.lastNow=now;return {state:s,effects,error:null};
      } else if(type==='START') {
        if(s.phase!=='intro')throw new Error('The show has already started.');
        const demo=s.bank.find(q=>q.status==='demo');
        if(demo)loadCard(s,{id:demo.id,primaryTeam:s.config.startingTeam,kind:'demo'},'read',now);else beginMain(s,now);
        effects.push({type:'sound',cue:'opening'});
      } else if(type==='BEGIN_MAIN') {
        if(s.phase!=='intro' && s.kind!=='demo')throw new Error('Main play has already started.');
        beginMain(s,now);effects.push({type:'sound',cue:'round'});
      } else if(type==='NEXT' || type==='READ_QUESTION') {
        if(s.phase==='roundIntro') {s.phase='read';recordLog(s,'read-stem',now);effects.push({type:'sound',cue:'read'});}
        else if(s.phase==='reveal') {
          if(s.kind==='demo'){beginMain(s,now);effects.push({type:'sound',cue:'round'});}
          else if(s.kind==='main') {
            const prior=s.schedule[s.cursor];s.cursor++;
            if(s.cursor>=s.schedule.length){s.cursor=s.schedule.length-1;end(s,now);effects.push({type:'sound',cue:s.winner.pending?'tied':'winner'});}
            else {const item=s.schedule[s.cursor],newRound=item.round!==prior.round;loadCard(s,item,newRound?'roundIntro':'read',now);effects.push({type:'sound',cue:newRound?'round':'next'});}
          } else {
            if(s.tieCursor%2===1 && s.tieScores.Bio!==s.tieScores.Vista){end(s,now);effects.push({type:'sound',cue:'winner'});}
            else if(s.tieCursor+1>=s.tieSchedule.length){end(s,now,'Tie pending faculty decision after all configured matched pairs.');effects.push({type:'sound',cue:'faculty'});}
            else {s.tieCursor++;loadCard(s,s.tieSchedule[s.tieCursor],'tieRead',now);effects.push({type:'sound',cue:'next'});}
          }
        } else throw new Error('Finish the current question before advancing.');
      } else if(type==='SHOW_OPTIONS') {
        if(!['read','tieRead'].includes(s.phase))throw new Error('Choices are already shown or no question is ready.');
        s.phase='optionsIntro';s.selected=null;startTimer(s,'options',s.config.optionsIntroMs,now);recordLog(s,'options-shown',now,{answerSeconds:s.config.primaryMs/1000,revealMs:s.config.optionsIntroMs});effects.push({type:'sound',cue:'start'});
      } else if(type==='ACKNOWLEDGE') {
        if(s.phase!=='answering' || s.timer.paused)throw new Error('Acknowledge only while the active team timer is running.');
        s.answerRemainingMs=remaining(s.timer,now);s.phase='acknowledged';
        startTimer(s,'grace',s.config.graceMs,now);recordLog(s,'acknowledged',now);effects.push({type:'sound',cue:'acknowledge'});
      } else if(type==='STAGE') {
        if(!['answering','acknowledged'].includes(s.phase))throw new Error('This turn is no longer accepting choices.');
        const index=answerIndex(action.option);if(index===null)throw new Error('Choose A, B, C or D.');
        if(blockedOptions(s).includes(index))throw new Error('That option was already confirmed wrong by the primary team. Choose one of the remaining options.');
        const acknowledges=s.phase==='answering';
        if(acknowledges) {
          if(s.timer.paused)throw new Error('Resume the active team timer before selecting its final answer.');
          s.answerRemainingMs=remaining(s.timer,now);s.phase='acknowledged';
          startTimer(s,'grace',s.config.graceMs,now);recordLog(s,'acknowledged-by-selection',now);
        }
        if(s.selected===index && !acknowledges)return {state:timed.state,effects,error:null};
        s.selected=index;recordLog(s,'answer-staged',now,{option:index});effects.push({type:'sound',cue:'select'});
      } else if(type==='CONFIRM') {
        if(s.phase!=='acknowledged' || s.timer.paused)throw new Error('Acknowledge an answer and resume its entry timer before confirming.');
        if(s.selected===null)throw new Error('Stage an A–D answer before confirming.');
        if(blockedOptions(s).includes(answerIndex(s.selected)))throw new Error('That option was already confirmed wrong by the primary team. Choose one of the remaining options.');
        turnOutcome(s,s.selected,'answer',effects,now);
      } else if(type==='CANCEL_ACK') {
        if(s.phase!=='acknowledged')throw new Error('There is no acknowledgement to cancel.');
        s.phase='answering';s.selected=null;startTimer(s,'answer',s.answerRemainingMs,now);s.answerRemainingMs=null;recordLog(s,'acknowledgement-cancelled',now);effects.push({type:'sound',cue:'cancel'});
      } else if(type==='PAUSE') {
        if(!s.timer || s.timer.paused)throw new Error('There is no running timer to pause.');
        pauseTimer(s,now,action.reason || 'Host pause');recordLog(s,'paused',now,{reason:s.pauseReason});effects.push({type:'sound',cue:'pause'});
      } else if(type==='RESUME') {
        if(!s.timer || !s.timer.paused)throw new Error('There is no paused timer to resume.');
        const ms=s.timer.remainingMs;startTimer(s,s.timer.mode,ms,now);recordLog(s,'resumed',now);effects.push({type:'sound',cue:'resume'});
      } else if(type==='USE_LIFELINE') {
        if(!s.config.teacherEnabled)throw new Error('Teacher consultation is disabled for this competition.');
        if(!['answering','acknowledged'].includes(s.phase) || !s.timer)throw new Error('Ask a teacher is available only during the active team opportunity.');
        if(s.kind==='demo')throw new Error('The unscored demonstration does not consume competition lifelines.');
        if(s.lifelineActive || s.lifelines[s.activeTeam])throw new Error('Team '+s.activeTeam+' has already used its one Ask a teacher lifeline.');
        const returnClock={mode:s.timer.mode,remainingMs:remaining(s.timer,now)};
        s.lifelines[s.activeTeam]=true;s.lifelineActive={team:s.activeTeam,questionId:s.questionId,kind:s.kind,returnClock};
        s.lifelineUses.push({team:s.activeTeam,questionId:s.questionId,kind:s.kind,at:now,voided:false});
        startTimer(s,'teacher',s.config.teacherMs,now);recordLog(s,'lifeline-used',now,{kind:s.kind,consultationMs:s.config.teacherMs});effects.push({type:'sound',cue:'lifeline'});
      } else if(type==='RESUME_LIFELINE') {
        if(!s.lifelineActive || !s.timer || s.timer.mode!=='teacher')throw new Error('There is no teacher consultation to finish.');
        finishTeacher(s,effects,now,true);
      } else if(type==='PASS') {
        if(!['answering','acknowledged'].includes(s.phase) || s.timer.paused)throw new Error('Pass only during a running team opportunity.');
        turnOutcome(s,null,'pass',effects,now);
      } else if(type==='REVEAL') {
        throw new Error('The answer stays hidden until both valid opportunities have ended.');
      } else if(type==='START_TIE') {
        if(s.phase!=='end' || s.kind==='tie' || s.mainScores.Bio!==s.mainScores.Vista)throw new Error('Tie resolution starts only after tied main scores.');
        if(!s.tieSchedule.length)throw new Error('No tie questions are configured. Faculty decision is required.');
        s.tieScores={Bio:0,Vista:0};s.tieCursor=0;loadCard(s,s.tieSchedule[0],'tieRead',now);effects.push({type:'sound',cue:'tieStart'});
      } else if(type==='END_TIE_EXHAUSTED') {
        const reason=guarded(action);
        if(s.mainScores.Bio!==s.mainScores.Vista || (s.kind!=='tie' && s.phase!=='end'))throw new Error('This session has no unresolved tie to refer.');
        s.phase='end';s.timer=null;s.lifelineActive=null;s.winner={team:null,pending:true,reason:'Tie pending faculty decision: '+reason};recordLog(s,'tie-referred',now,{reason});effects.push({type:'sound',cue:'faculty'});
      } else if(type==='CORRECT_SCORE') {
        const reason=guarded(action),team=action.team,delta=Number(action.delta);
        if(!TEAMS.includes(team) || !Number.isInteger(delta) || Math.abs(delta)>1000 || !delta)throw new Error('Choose a team and a nonzero whole-number correction up to 1000.');
        const scoreKind=action.kind==='tie'?'tie':'main';
        (scoreKind==='tie'?s.tieScores:s.mainScores)[team]+=delta;
        recordLog(s,'score-correction',now,{team,delta,kind:scoreKind,reason});effects.push({type:'score',team,delta,kind:scoreKind},{type:'sound',cue:'correction'});
        if(s.phase==='end')end(s,now);
      } else if(type==='REPLACE'||type==='AVOID') {
        const old=question(s),candidate=reserves(s).find(item=>item.question.id===action.reserveId)||(!action.reserveId&&type==='AVOID'?reserves(s)[0]:null),reserve=candidate?.question;
        if(action.questionId!==undefined&&action.questionId!==s.questionId)throw new Error('The current question changed. Review its available reserves before replacing it.');
        const scoredOrRevealed=s.phase==='reveal'||s.records.some(row=>row.questionId===s.questionId&&!row.voided)||s.lifelineUses.some(use=>use.questionId===s.questionId&&!use.voided);
        const reason=scoredOrRevealed?guarded(action):(String(action.reason||'').trim().slice(0,240)||'Host avoided this question before scoring.');
        if(candidate?.mismatches.length&&action.acceptMismatch!==true)throw new Error(candidate.mismatches.join(' ')+' Choose this reserve explicitly with acceptMismatch or provide a matched reserve.');
        if(s.kind!=='main' || !old || ['intro','end'].includes(s.phase))throw new Error('Only the current main question can be replaced.');
        const rounds=reserve && (reserve.suitableRounds || reserve.eligibleRounds || [reserve.round]);
        if(!reserve || reserve.status!=='reserve' || s.usedReserves.includes(reserve.id) || !rounds.map(String).includes(String(s.schedule[s.cursor].round)) || reserve.difficulty!==old.difficulty || reserve.seconds!==old.seconds)throw new Error('Select an unused reserve suitable for this round, difficulty and time limit.');
        for(const row of s.records.filter(row=>row.questionId===old.id && !row.voided)) {
          const tally=row.kind==='tie'?s.tieScores:s.mainScores;tally[row.team]-=row.delta;
        }
        for(const use of s.lifelineUses.filter(use=>use.questionId===old.id && !use.voided))s.lifelines[use.team]=false;
        s.lifelineUses=s.lifelineUses.map(use=>use.questionId===old.id?{...use,voided:true,voidReason:reason}:use);
        s.records=s.records.map(row=>row.questionId===old.id?{...row,voided:true,voidReason:reason}:row);
        s.usedReserves.push(reserve.id);s.schedule[s.cursor]={...s.schedule[s.cursor],id:reserve.id};
        loadCard(s,s.schedule[s.cursor],'read',now);recordLog(s,'faculty-replacement',now,{voidedQuestionId:old.id,reserveId:reserve.id,reason,action:type,scoringPolicy:'Void this question’s outcomes and restore its teacher uses; retain score corrections.',mismatches:candidate.mismatches});
        effects.push({type:'notice',message:'Question voided. Its scores and teacher uses have been restored; replacement keeps the same primary team.'},{type:'sound',cue:'replace'});
      } else throw new Error('Unknown action: '+type);
      addHistory(s,before,now);
      s.lastNow=now;
      return {state:s,effects,error:null};
    } catch(error) {return {state:timed.state,effects:timed.effects,error:error.message};}
  }
  function view(s,now=s.lastNow) {
    const q=question(s),optionsVisible=['optionsIntro','discussion','answering','acknowledged','passTransition','reveal'].includes(s.phase);
    let card=null;
    if(q) {
      card={id:q.id,round:s.kind==='main'?s.schedule[s.cursor].round:q.round,topic:q.topic,difficulty:q.difficulty,pairId:q.pairId,status:q.status,stem:q.stem,seconds:q.seconds,visual:q.visual || null};
      if(optionsVisible)card.options=clone(q.options);
      if(s.phase==='reveal'){card.correct=q.correct;card.correctOptionId=q.correctOptionId;card.optionIds=clone(q.optionIds);card.explanation=q.explanation;card.optionExplanations=clone(q.optionExplanations||[]);card.sources=clone(q.sources||[]);card.verification=q.verification?clone(q.verification):undefined;}
    }
    const ms=remaining(s.timer,now);
    return {gameplay:clone(gameplay(s)),roundOrder:s.kind==='main'?s.schedule.filter(item=>String(item.round)===String(s.schedule[s.cursor]?.round)).slice(0,2).map(item=>item.primaryTeam):[s.config.startingTeam,opposite(s.config.startingTeam)],phase:s.phase,kind:s.kind,question:card,questionId:s.questionId,primaryTeam:s.primaryTeam,activeTeam:s.activeTeam,turn:s.turn,selected:s.selected,blockedOptions:blockedOptions(s),lockedAnswer:s.phase==='reveal'?s.lockedAnswer:null,lifelines:{...s.lifelines},lifelineActive:s.lifelineActive?clone(s.lifelineActive):null,canUseLifeline:s.config.teacherEnabled && s.kind!=='demo' && ['answering','acknowledged'].includes(s.phase) && !s.lifelines[s.activeTeam] && !s.lifelineActive,optionsVisible,remainingMs:ms,remainingSeconds:Math.ceil(ms/1000),timerMode:s.timer?s.timer.mode:null,paused:!!(s.timer&&s.timer.paused),pauseReason:s.pauseReason,mainScores:{...s.mainScores},tieScores:{...s.tieScores},cursor:s.cursor,tieCursor:s.tieCursor,totalQuestions:s.schedule.length,tieQuestionCount:s.tieSchedule.length,winner:s.winner?{...s.winner}:null,canUndo:s.history.length>0,migrationNotice:s.migrationNotice||''};
  }
  function checkpoint(s,now=s.lastNow) {
    const saved=clone(s);
    saved.history=saved.history.slice(-20);
    if(saved.timer){saved.timer.remainingMs=remaining(s.timer,now);saved.timer.deadline=null;saved.timer.paused=true;}
    saved.lastNow=0;
    return JSON.stringify(saved);
  }
  function stats(s) {
    const empty=()=>({correct:0,wrong:0,passes:0,timeouts:0,submitted:0,attempted:0,accuracy:null,primaryCorrect:0,passedCorrect:0,points:0,scores:0,directOpportunities:0,passesOffered:0,passesReached:0});
    const totals=rows=>{
      const teams={Bio:empty(),Vista:empty()};
      for(const row of rows) {
        const t=teams[row.team];if(!t)continue;t.points+=Number(row.delta)||0;
        if(row.correct===true){t.correct++;t.submitted++;if(row.turn==='passed')t.passedCorrect++;else t.primaryCorrect++;}
        else if(row.correct===false){t.wrong++;t.submitted++;}
        else if(row.origin==='timeout')t.timeouts++;
        else if(row.origin==='pass')t.passes++;
      }
      for(const t of Object.values(teams)){t.accuracy=t.submitted?Number((100*t.correct/t.submitted).toFixed(1)):null;t.attempted=t.submitted;t.scores=t.points;}
      return teams;
    };
    const records=s.records.filter(row=>!row.voided),mainRows=records.filter(row=>row.kind==='main'),tieRows=records.filter(row=>row.kind==='tie');
    const roundFor=id=>s.schedule.find(item=>item.id===id)?.round || s.bank.find(q=>q.id===id)?.round;
    const main={teams:totals(mainRows)},tie={teams:totals(tieRows)},current={questionId:s.questionId,round:roundFor(s.questionId),teams:totals(records.filter(row=>row.questionId===s.questionId))};
    for(const team of TEAMS){main.teams[team].points=s.mainScores[team];tie.teams[team].points=s.tieScores[team];}
    const rounds=PROFILE.rounds.map(item=>({round:item.id,name:item.name,teams:totals(mainRows.filter(row=>String(roundFor(row.questionId))===String(item.id)))}));
    for(const row of s.log.filter(row=>row.type==='score-correction'&&row.kind!=='tie')) {
      const round=roundFor(row.questionId),target=rounds.find(entry=>entry.round===round);
      if(target && TEAMS.includes(row.team))target.teams[row.team].points+=row.delta;
      if(row.questionId===s.questionId && TEAMS.includes(row.team))current.teams[row.team].points+=row.delta;
    }
    const addOpportunities=(section,kind,include=()=>true)=>{
      const voided=new Set(s.log.filter(row=>row.type==='faculty-replacement').map(row=>row.voidedQuestionId));
      const cards=kind==='tie'?s.tieSchedule:s.schedule;
      for(const card of cards)if(include(card.id)&&!voided.has(card.id)&&s.log.some(row=>row.type==='question-ready'&&row.questionId===card.id))section.teams[card.primaryTeam].directOpportunities++;
      for(const row of records.filter(row=>row.kind===kind&&row.turn==='primary'&&row.correct!==true&&include(row.questionId)))if(RULES.passingEnabled&&kind!=='tie') {
        const team=opposite(row.team);section.teams[team].passesOffered++;
        if(s.log.some(entry=>entry.type==='passed-turn-start'&&entry.questionId===row.questionId))section.teams[team].passesReached++;
      }
      for(const team of TEAMS)section.teams[team].scores=section.teams[team].points;
    };
    addOpportunities(main,'main');addOpportunities(tie,'tie');addOpportunities(current,s.kind,id=>id===s.questionId);
    for(const round of rounds)addOpportunities(round,'main',id=>String(roundFor(id))===String(round.round));
    const completed=new Set(mainRows.filter(row=>row.turn==='primary').map(row=>row.questionId));
    const remainingPrimary={Bio:0,Vista:0};for(const card of s.schedule)if(!completed.has(card.id))remainingPrimary[card.primaryTeam]++;
    const expectedPerPrimary=(s.config.directPoints+s.config.wrongPoints)/2;
    const projectedScores={Bio:s.mainScores.Bio+expectedPerPrimary*remainingPrimary.Bio,Vista:s.mainScores.Vista+expectedPerPrimary*remainingPrimary.Vista};
    const projectedMargin=projectedScores.Bio-projectedScores.Vista;
    const binomial=n=>{const p=[Math.pow(.5,n)];for(let k=1;k<=n;k++)p[k]=p[k-1]*(n-k+1)/k;return p;};
    const b=binomial(remainingPrimary.Bio),v=binomial(remainingPrimary.Vista),chances={Bio:0,Vista:0,tie:0};
    const gap=s.mainScores.Bio-s.mainScores.Vista;
    for(let kb=0;kb<b.length;kb++)for(let kv=0;kv<v.length;kv++) {
      const margin=gap+s.config.wrongPoints*(remainingPrimary.Bio-remainingPrimary.Vista)+(s.config.directPoints-s.config.wrongPoints)*(kb-kv);
      chances[margin>0?'Bio':margin<0?'Vista':'tie']+=100*b[kb]*v[kv];
    }
    const outlook={kind:'conditional',assumption:'Assumed independent 50% future correct ('+s.config.directPoints+') and 50% wrong ('+s.config.wrongPoints+') primary answers for both teams; no passes or tie-breaks. Exact illustrative main-score chances, not a calibrated prediction. Expected gain is '+expectedPerPrimary+' per remaining primary question.',remainingPrimary,projectedScores,projectedMargin,chances,leadTeam:projectedMargin===0?null:projectedMargin>0?'Bio':'Vista'};
    return {current,main,tie,rounds,outlook,selected:clone(gameplay(s).statistics),definitions:{directOpportunities:'Primary questions made ready for this team, excluding replaced questions.',passesOffered:'Receiving opportunities created after an unsuccessful primary turn, including an active pass transition.',passesReached:'Offered passes whose receiving answer clock started.',attempted:'Confirmed answer selections; voluntary passes and timeouts are excluded.',scores:'Ledger points including explicit host corrections; replacements void only their question outcomes.'}};
  }
  function report(s) {
    const rows=s.records.filter(row=>!row.voided&&row.kind!=='demo'),groups=new Map();
    const questions=[];
    for(const entry of [...s.schedule,...s.tieSchedule]) {
      const attempts=rows.filter(row=>row.questionId===entry.id);
      if(!attempts.length||!s.log.some(row=>row.type==='reveal'&&row.questionId===entry.id))continue;
      const q=displayQuestion(s,s.bank.find(q=>q.id===entry.id)),topic=q.topic||'Unspecified';
      questions.push({id:q.id,topic,kind:entry.kind,round:entry.round,stem:q.stem,options:clone(q.options),optionIds:clone(q.optionIds),correct:q.correct,correctOptionId:q.correctOptionId,explanation:q.explanation||'',optionExplanations:clone(q.optionExplanations||[]),sources:clone(q.sources||[]),verification:q.verification?clone(q.verification):null,attempts:clone(attempts)});
      if(!groups.has(topic))groups.set(topic,{topic,questions:0,teams:Object.fromEntries(TEAMS.map(team=>[team,{attempted:0,correct:0,wrong:0,passes:0,timeouts:0,points:0}]))});
      const group=groups.get(topic);group.questions++;
      for(const row of attempts){const team=group.teams[row.team];team.points+=row.delta;if(row.correct!==null){team.attempted++;team[row.correct?'correct':'wrong']++;}else if(row.origin==='pass')team.passes++;else if(row.origin==='timeout')team.timeouts++;}
    }
    return {enabled:gameplay(s).revisionReport,teams:stats(s).main.teams,topics:[...groups.values()],questions,notes:'Observed question outcomes only; topic points exclude standalone host corrections. This host report contains revealed answer keys.'};
  }
  function timerLimit(s, mode) {
    return mode==='discussion'?gameplay(s).discussionSeconds*1000:mode==='grace'?RULES.graceMs:mode==='teacher'?RULES.teacherMs:mode==='options'?RULES.optionsIntroMs:mode==='transition'?RULES.passTransitionMs:s.turn==='passed'?RULES.passedMs:RULES.primaryMs;
  }
  // Opportunity metrics use these events. Reconcile their phase/position history
  // with the saved cursor, including demo, replacements, ties and truncated Undo logs.
  function validateOpportunities(s) {
    const main=buildSchedule(knownBank,s.config),ties=buildSchedule(knownBank,s.config,'tie'),demo=knownBank.find(q=>q.status==='demo');
    const scores={main:{Bio:0,Vista:0},tie:{Bio:0,Vista:0}},outcomes=[];
    let cursor=-1,tieCursor=-1,kind='main',phase='intro',questionId=null,team=s.config.startingTeam,primaryTeam=team,turn='primary';
    const invalid=()=>{throw new Error('Saved opportunity transition does not match the reached question, team or phase.');};
    const atCard=entry=>{if(entry.questionId!==questionId||entry.team!==team)invalid();};
    for(let index=0;index<s.log.length;index++) {
      const entry=s.log[index];
      if(entry.type==='question-ready') {
        let card,expectedPhase;
        const replacement=s.log[index+1];
        if(kind==='main'&&cursor>=0&&!['intro','end','outcome'].includes(phase)&&replacement?.type==='faculty-replacement'&&replacement.voidedQuestionId===questionId&&replacement.reserveId===entry.questionId) {
          card={...main[cursor],id:replacement.reserveId};expectedPhase='read';
        } else if(phase==='intro'&&demo&&entry.questionId===demo.id) {
          card={id:demo.id,kind:'demo',primaryTeam:s.config.startingTeam};expectedPhase='read';
        } else if(phase==='intro'||kind==='demo') {
          card=main[0];cursor=0;tieCursor=-1;expectedPhase='roundIntro';
        } else if(kind==='main'&&phase==='reveal') {
          card=main[cursor+1];expectedPhase=card?.round===main[cursor].round?'read':'roundIntro';cursor++;
        } else if(kind==='main'&&phase==='end') {
          if(scores.main.Bio!==scores.main.Vista)invalid();scores.tie={Bio:0,Vista:0};
          card=ties[0];tieCursor=0;expectedPhase='tieRead';
        } else if(kind==='tie'&&phase==='reveal') {
          if(tieCursor%2===1&&scores.tie.Bio!==scores.tie.Vista)invalid();
          card=ties[++tieCursor];expectedPhase='tieRead';
        }
        if(!card||entry.questionId!==card.id||entry.team!==card.primaryTeam||entry.phase!==expectedPhase)invalid();
        questionId=card.id;kind=card.kind;primaryTeam=card.primaryTeam;team=primaryTeam;turn='primary';phase=expectedPhase;
      } else if(entry.type==='faculty-replacement') {
        if(kind!=='main'||cursor<0||questionId!==entry.reserveId||main[cursor].id!==entry.voidedQuestionId)invalid();
        for(const row of outcomes.filter(row=>row.kind==='main'&&row.questionId===entry.voidedQuestionId))scores.main[row.team]-=row.delta;
        main[cursor].id=entry.reserveId;
      } else if(entry.type==='read-stem') {
        atCard(entry);if(phase!=='roundIntro')invalid();phase='read';
      } else if(entry.type==='options-shown') {
        atCard(entry);if(!['read','tieRead'].includes(phase)||turn!=='primary')invalid();phase='optionsIntro';
      } else if(entry.type==='discussion-started') {
        atCard(entry);if(phase!=='optionsIntro'||!gameplay(s).discussionSeconds)invalid();phase='discussion';
      } else if(entry.type==='answer-timer-started') {
        atCard(entry);if(phase!==(gameplay(s).discussionSeconds?'discussion':'optionsIntro'))invalid();phase='answering';
      } else if(['acknowledged','acknowledged-by-selection'].includes(entry.type)) {
        atCard(entry);if(phase!=='answering')invalid();phase='acknowledged';
      } else if(entry.type==='answer-staged') {
        atCard(entry);if(phase!=='acknowledged')invalid();
      } else if(entry.type==='acknowledgement-cancelled') {
        atCard(entry);if(phase!=='acknowledged')invalid();phase='answering';
      } else if(['answer-confirmed','pass','timeout'].includes(entry.type)) {
        atCard(entry);
        if(!['answering','acknowledged'].includes(phase)||entry.type==='answer-confirmed'&&phase!=='acknowledged'||entry.kind!==kind||entry.turn!==turn)invalid();
        if(!s.records.some(row=>row.questionId===questionId&&row.kind===kind&&row.team===team&&row.turn===turn&&row.at===entry.at&&row.option===entry.option&&row.correct===entry.correct&&row.delta===entry.delta&&row.origin===(entry.type==='answer-confirmed'?'answer':entry.type)))invalid();
        outcomes.push(entry);if(kind!=='demo')scores[kind][team]+=entry.delta;
        if(RULES.passingEnabled&&kind!=='tie'&&turn==='primary'&&entry.correct!==true){turn='passed';team=opposite(primaryTeam);phase='passTransition';}
        else phase='outcome';
      } else if(entry.type==='passed-turn-start') {
        atCard(entry);if(phase!=='passTransition'||turn!=='passed')invalid();phase='answering';
      } else if(entry.type==='reveal') {
        atCard(entry);if(phase!=='outcome')invalid();phase='reveal';
      } else if(entry.type==='end') {
        atCard(entry);if(phase!=='end'&&!(phase==='reveal'&&(kind==='main'?cursor===main.length-1:kind==='tie'&&tieCursor%2===1&&(tieCursor===ties.length-1||scores.tie.Bio!==scores.tie.Vista))))invalid();phase='end';
      } else if(entry.type==='tie-referred') {
        atCard(entry);if(kind!=='tie'&&phase!=='end')invalid();phase='end';
      } else if(entry.type==='score-correction') {
        scores[entry.kind][entry.team]+=entry.delta;
      } else if(['coin-result','gameplay-configured'].includes(entry.type)&&phase!=='intro')invalid();
    }
    if(s.cursor!==cursor||s.tieCursor!==tieCursor||s.kind!==kind||s.phase!==phase||s.questionId!==questionId||s.primaryTeam!==primaryTeam||s.activeTeam!==team||s.turn!==turn)invalid();
  }
  function validateCheckpoint(s, histories=true) {
    if(!knownBank)throw new Error('Initialize the known competition bank with create before recovery.');
    if(!stateProfileValid(s))throw new Error('Checkpoint profile or rules do not match this competition. Standalone BioVista v4 checkpoints are not compatible.');
    if(!PHASES.includes(s.phase)||!['main','demo','tie'].includes(s.kind)||!TEAMS.includes(s.primaryTeam)||!TEAMS.includes(s.activeTeam)||!['primary','passed'].includes(s.turn))throw new Error('Saved phase or team is invalid.');
    if(stable(normalizeQuestions(s.bank))!==knownBankText)throw new Error('Saved question bank differs from the loaded source.');
    for(const tally of [s.mainScores,s.tieScores])if(!tally||!TEAMS.every(team=>Number.isSafeInteger(tally[team])))throw new Error('Saved scores are invalid.');
    for(const key of ['records','log','history','lifelineUses','usedReserves','schedule','tieSchedule'])if(!Array.isArray(s[key]))throw new Error('Saved '+key+' is invalid.');
    if(!s.lifelines||!TEAMS.every(team=>typeof s.lifelines[team]==='boolean'))throw new Error('Saved teacher flags are invalid.');
    const expectedMain=buildSchedule(knownBank,s.config),expectedTie=buildSchedule(knownBank,s.config,'tie');
    const assignments=new Map(expectedMain.map(item=>[item.id,{kind:'main',team:item.primaryTeam}]));
    for(const item of expectedTie)assignments.set(item.id,{kind:'tie',team:item.primaryTeam});
    const demo=knownBank.find(q=>q.status==='demo');if(demo)assignments.set(demo.id,{kind:'demo',team:s.config.startingTeam});
    const expectedReserves=[],voidedIds=new Set();
    let priorLog=-1,coinResults=0;
    for(const entry of s.log) {
      if(!entry||!Number.isSafeInteger(entry.id)||entry.id<=priorLog||!Number.isFinite(entry.at)||entry.at<0)throw new Error('Saved log sequence is invalid.');priorLog=entry.id;
      if(entry.type==='coin-result'){coinResults++;if(coinResults>1||!TEAMS.includes(entry.result)||entry.result!==s.config.startingTeam||entry.eligibleTeams!==undefined&&stable(entry.eligibleTeams)!==stable(TEAMS))throw new Error('Saved starting-team result is inconsistent.');}
      if(entry.type==='faculty-replacement') {
        const slot=expectedMain.find(item=>item.id===entry.voidedQuestionId),reserve=knownBank.find(q=>q.id===entry.reserveId),old=knownBank.find(q=>q.id===entry.voidedQuestionId);
        if(!slot||!reserve||reserve.status!=='reserve'||expectedReserves.includes(reserve.id)||!String(entry.reason||'').trim()||reserve.difficulty!==old.difficulty||!(reserve.suitableRounds||reserve.eligibleRounds||[reserve.round]).map(String).includes(String(slot.round)))throw new Error('Saved reserve replacement is invalid.');
        assignments.set(reserve.id,{kind:'main',team:slot.primaryTeam});voidedIds.add(old.id);slot.id=reserve.id;expectedReserves.push(reserve.id);
      }
    }
    if(!Number.isSafeInteger(s.sequence)||s.sequence<0||(s.log.length?s.sequence!==s.log[s.log.length-1].id:s.sequence!==0))throw new Error('Saved event sequence is inconsistent.');
    if(stable(s.schedule)!==stable(expectedMain)||stable(s.tieSchedule)!==stable(expectedTie)||stable(s.usedReserves)!==stable(expectedReserves))throw new Error('Saved schedule differs from the configured pairs and replacements.');
    if(!Number.isInteger(s.cursor)||s.cursor< -1||s.cursor>=s.schedule.length||!Number.isInteger(s.tieCursor)||s.tieCursor< -1||s.tieCursor>=s.tieSchedule.length&&s.tieCursor!==-1)throw new Error('Saved position is invalid.');
    if(s.questionId!==null&&!knownBank.some(q=>q.id===s.questionId))throw new Error('Saved question is unknown.');
    if(s.phase!=='intro'&&s.kind==='main'&&(s.cursor<0||s.questionId!==s.schedule[s.cursor].id))throw new Error('Saved main question does not match its position.');
    if(s.kind==='tie'&&(s.tieCursor<0||s.questionId!==s.tieSchedule[s.tieCursor].id))throw new Error('Saved tie question does not match its position.');
    if(s.kind==='demo'&&s.questionId!==demo?.id)throw new Error('Saved demo question is invalid.');
    const totals={main:{Bio:0,Vista:0},tie:{Bio:0,Vista:0}},seen=new Map();
    for(const row of s.records) {
      const q=displayQuestion(s,knownBank.find(q=>q.id===row?.questionId)),assignment=assignments.get(row?.questionId),submitted=row?.option!==null;
      if(!q||!assignment||row.kind!==assignment.kind||!TEAMS.includes(row.team)||!['primary','passed'].includes(row.turn)||typeof row.voided!=='boolean'||!Number.isFinite(row.at)||row.at<0)throw new Error('Saved answer ledger is invalid.');
      if(submitted&&answerIndex(row.option)===null||submitted&&typeof row.option!=='number'||!submitted&&!['pass','timeout'].includes(row.origin)||submitted&&row.origin!=='answer')throw new Error('Saved answer or outcome is invalid.');
      if(row.optionId!==undefined&&row.optionId!==(submitted?q.optionIds[row.option]:null)||gameplay(s).shuffleOptions&&row.optionId===undefined)throw new Error('Saved option identity does not match its displayed answer.');
      const isCorrect=submitted?row.option===q.correct:null;
      const delta=row.kind==='demo'?0:submitted?isCorrect?(row.turn==='passed'?RULES.passedPoints:RULES.directPoints):(row.turn==='passed'?RULES.passedWrongPoints:RULES.wrongPoints):0;
      if(row.correct!==isCorrect||row.delta!==delta||row.voided!==voidedIds.has(row.questionId))throw new Error('Saved answer result is inconsistent with the source and rule profile.');
      if(!s.log.some(entry=>entry.type===(submitted?'answer-confirmed':row.origin)&&entry.questionId===row.questionId&&entry.team===row.team&&entry.kind===row.kind&&entry.turn===row.turn&&entry.option===row.option&&entry.correct===row.correct&&entry.delta===row.delta&&entry.at===row.at))throw new Error('Saved answer has no matching audit event.');
      const key=row.kind+':'+row.questionId+':'+row.turn;if(seen.has(key))throw new Error('An opportunity was scored more than once.');
      if(row.turn==='primary'&&row.team!==assignment.team)throw new Error('Saved primary team is wrong.');
      if(row.turn==='passed') {
        const first=seen.get(row.kind+':'+row.questionId+':primary');
        if(!RULES.passingEnabled||row.kind==='tie'||!first||first.correct===true||row.team!==opposite(assignment.team)||submitted&&first.correct===false&&row.option===first.option)throw new Error('Saved passed opportunity is invalid.');
      }
      seen.set(key,row);if(!row.voided&&row.kind!=='demo')totals[row.kind][row.team]+=row.delta;
    }
    for(const entry of s.log)if(entry.type==='score-correction') {
      if(!TEAMS.includes(entry.team)||!['main','tie'].includes(entry.kind)||!Number.isSafeInteger(entry.delta)||entry.delta===0||Math.abs(entry.delta)>1000||!String(entry.reason||'').trim())throw new Error('Saved correction is invalid.');
      totals[entry.kind][entry.team]+=entry.delta;
    }
    for(const team of TEAMS)if(s.mainScores[team]!==totals.main[team]||s.tieScores[team]!==totals.tie[team])throw new Error('Saved score totals do not reconcile with the ledger.');
    for(const use of s.lifelineUses) {
      if(!RULES.teacherEnabled||!TEAMS.includes(use.team)||assignments.get(use.questionId)?.kind!==use.kind||!['main','tie'].includes(use.kind)||typeof use.voided!=='boolean'||use.voided!==voidedIds.has(use.questionId)||!Number.isFinite(use.at)||use.at<0||!s.log.some(entry=>entry.type==='lifeline-used'&&entry.questionId===use.questionId&&entry.team===use.team&&entry.kind===use.kind&&entry.at===use.at))throw new Error('Saved teacher ledger is invalid.');
    }
    for(const team of TEAMS)if(s.lifelineUses.filter(use=>use.team===team&&!use.voided).length!==(s.lifelines[team]?1:0))throw new Error('Saved teacher use does not reconcile.');
    if(s.turn==='passed'&&(!RULES.passingEnabled||s.kind==='tie'||!seen.has(s.kind+':'+s.questionId+':primary')||seen.get(s.kind+':'+s.questionId+':primary').correct===true||s.activeTeam!==opposite(s.primaryTeam)))throw new Error('Saved active receiving team is invalid.');
    if(s.questionId!==null&&s.phase!=='intro'&&s.primaryTeam!==assignments.get(s.questionId)?.team)throw new Error('Saved question team is invalid.');
    if(s.turn==='primary'&&s.activeTeam!==s.primaryTeam)throw new Error('Saved active primary team is invalid.');
    if(s.selected!==null&&answerIndex(s.selected)===null||s.selected!==null&&typeof s.selected!=='number'||s.selected!==null&&blockedOptions(s).includes(s.selected))throw new Error('Saved selection is invalid or already tried.');
    const timed=['optionsIntro','discussion','answering','acknowledged','passTransition'].includes(s.phase);
    if(timed!==Boolean(s.timer))throw new Error('Saved timer and phase disagree.');
    if(s.timer) {
      const expectedMode=s.lifelineActive?'teacher':s.phase==='discussion'?'discussion':s.phase==='optionsIntro'?'options':s.phase==='acknowledged'?'grace':s.phase==='passTransition'?'transition':'answer';
      if(s.timer.mode!==expectedMode||!Number.isFinite(s.timer.remainingMs)||s.timer.remainingMs<0||s.timer.remainingMs>timerLimit(s,s.timer.mode))throw new Error('Saved timer is invalid.');
    }
    if(s.phase==='acknowledged'&&(!Number.isFinite(s.answerRemainingMs)||s.answerRemainingMs<0||s.answerRemainingMs>(s.turn==='passed'?RULES.passedMs:RULES.primaryMs)))throw new Error('Saved frozen answer time is invalid.');
    if(s.lifelineActive) {
      const use=s.lifelineActive,clock=use.returnClock;
      if(!RULES.teacherEnabled||!timed||s.kind==='demo'||!s.lifelines[use.team]||use.team!==s.activeTeam||use.questionId!==s.questionId||use.kind!==s.kind||!clock||!['answer','grace'].includes(clock.mode)||!Number.isFinite(clock.remainingMs)||clock.remainingMs<0||clock.remainingMs>timerLimit(s,clock.mode)||clock.mode!==(s.phase==='acknowledged'?'grace':'answer'))throw new Error('Saved teacher consultation is invalid.');
    }
    validateOpportunities(s);
    if(histories)for(const frame of s.history)validateCheckpoint({...frame,bank:knownBank,config:s.config,history:[]},false);
    return s;
  }
  function hydrate(serialized,now=0) {
    const s=typeof serialized==='string'?JSON.parse(serialized):clone(serialized);
    // v5 used the same scoring ledger before explicit option identities existed.
    // Migrate only missing default metadata after exact semantic-bank comparison;
    // changed keys, gameplay, profiles or any scoring semantics remain incompatible.
    if(s?.version===5&&s.config?.gameplay===undefined&&rawProfile.gameplay===undefined&&s.bankIdentity!==BANK_IDENTITY&&Array.isArray(s.bank)&&s.bank.every(q=>q.optionIds===undefined)) {
      const normalized=normalizeQuestions(s.bank),legacy=normalized.map((q,i)=>{const previous={...q};for(const key of ['optionIds','correctOptionId','optionExplanations','subtype','topic'])if(!Object.hasOwn(s.bank[i],key))delete previous[key];return previous;});
      const priorIdentity=identity(legacy);
      if(s.bankIdentity===priorIdentity&&stable(normalized)===knownBankText&&s.profileId===PROFILE.profileId&&s.profileIdentity===PROFILE_IDENTITY) {
        if(!Array.isArray(s.history)||s.history.some(frame=>frame.bankIdentity!==priorIdentity))throw new Error('Legacy history has an inconsistent bank identity.');
        s.bankIdentity=BANK_IDENTITY;s.bank=clone(knownBank);
        for(const frame of s.history)frame.bankIdentity=BANK_IDENTITY;
        s.migrationNotice='Previous checkpoint recovered with stable option identities. Scoring and question meaning are unchanged.';
      }
    }
    validateCheckpoint(s);
    s.bank=knownBank;s.history=s.history.slice(-20);
    if(s.timer){s.timer.paused=true;s.timer.deadline=null;s.pauseReason='Restored checkpoint: resume when the host is ready.';}
    s.lastNow=Number(now)||0;
    return s;
  }
  const api=Object.freeze({create,dispatch,tick,hydrate,checkpoint,schedule,question,view,stats,report,reserves,answerIndex});
  global.BioEngine=api;global.QSKEngine=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
