/* Offline session checks and an optional, display-only audience window. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SessionTools = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  let audience = null;
  const plain = value => JSON.parse(JSON.stringify(value));
  function rehearse(questions, configuration = {}, engine = root.BioEngine) {
    const result = {checks: [], errors: [], warnings: [], phaseCounts: {}, simulated: true};
    if (!engine) return {...result, errors: ['Quiz engine is unavailable. Reload the complete offline file.']};
    let time = 0, state, steps = 0;
    const step = (type, payload = {}) => {
      const next = engine.dispatch(state, {type, ...payload}, time);
      if (next.error) throw Error(type + ': ' + next.error);
      state = next.state;
    };
    try {
      state = engine.create(questions, {mode: configuration.mode || 'full', startingTeam: configuration.startingTeam || 'Bio', gameplay: configuration.gameplay || {}}, time);
      const count = state.schedule.length;
      step('START');
      while (steps++ < 250000) {
        if (state.phase === 'end') {
          if (state.kind !== 'tie' && state.mainScores.Bio === state.mainScores.Vista && state.tieSchedule.length) { step('START_TIE'); continue; }
          break;
        }
        result.phaseCounts[state.phase] = (result.phaseCounts[state.phase] || 0) + 1;
        if (['roundIntro', 'reveal'].includes(state.phase)) { step('NEXT'); continue; }
        if (['read', 'tieRead'].includes(state.phase)) { step('SHOW_OPTIONS'); continue; }
        if (state.phase === 'answering') {
          const question = engine.question(state);
          const answer = typeof question.correct === 'number' ? question.correct : 'ABCD'.indexOf(question.correct);
          step('STAGE', {option: answer});
          step('CONFIRM');
          continue;
        }
        if (state.timer) {
          if (state.timer.paused) step('RESUME');
          time += Math.min(1000, Math.max(1, state.timer.deadline - time));
          const next = engine.tick(state, time);
          if (next.error) throw Error(next.error);
          state = next.state;
          continue;
        }
        throw Error('No rehearsal transition for phase ' + state.phase);
      }
      if (state.phase !== 'end') throw Error('The simulated event did not finish within its safety limit.');
      result.checks.push('Simulated ' + count + ' main cards through final results using a separate state.');
      result.checks.push('Question/choice reveal, answer locks, configured timers and scoring completed.');
      if (result.phaseCounts.passTransition) result.checks.push('Primary wrong answer and receiving-team pass completed.');
      if (result.phaseCounts.discussion) result.checks.push('Discussion phase kept answers locked before the answer timer.');
      if (result.phaseCounts.tieRead) result.checks.push('Matched tie questions completed; unresolved ties retain the host decision.');
      const saved = engine.checkpoint(state, time), restored = engine.hydrate(saved, time + 1000);
      if (JSON.stringify(restored.mainScores) !== JSON.stringify(state.mainScores)) throw Error('Checkpoint changed simulated scores.');
      result.checks.push('Portable checkpoint restored the simulated score ledger.');
      result.finalScores = plain(state.mainScores);
      // Independently exercise a reserve and a pass using another isolated copy.
      state = engine.create(questions, {mode: configuration.mode || 'full', startingTeam: configuration.startingTeam || 'Bio', gameplay: configuration.gameplay || {}}, time);
      step('BEGIN_MAIN'); step('NEXT');
      const candidate = engine.reserves?.(state)?.[0];
      if (candidate) {
        const primary = state.primaryTeam;
        step('REPLACE', {reserveId:candidate.question.id, questionId:state.questionId, acceptMismatch:true, reason:'Isolated rehearsal replacement'});
        if (state.primaryTeam !== primary || !state.usedReserves.includes(candidate.question.id)) throw Error('Reserve replacement changed the scheduled opportunity.');
        result.checks.push('Unused reserve replacement preserved the primary team and recorded its use.');
        if (candidate.mismatches.length) result.warnings.push('Rehearsal reserve has a topic/format mismatch; live use requires a host choice.');
      } else result.warnings.push('No eligible reserve for the first scheduled question; inspect reserve coverage before the event.');
      step('SHOW_OPTIONS');
      step('PAUSE');
      const frozen=engine.view(state,time).remainingMs;
      const checkpoint=engine.checkpoint(state,time);state=engine.hydrate(checkpoint,time+500);time+=500;
      if(engine.view(state,time).remainingMs!==frozen)throw Error('Pause/recovery changed the remaining reveal time.');
      step('RESUME');
      result.checks.push('Paused choice reveal restored with the exact remaining time.');
      while (state.phase !== 'answering' && state.timer) { time += Math.min(1000, Math.max(1, state.timer.deadline-time)); state=engine.tick(state,time).state; }
      if (state.config.passingEnabled) {
        step('PASS');
        while (state.phase === 'passTransition') { time += Math.min(1000, Math.max(1,state.timer.deadline-time)); state=engine.tick(state,time).state; }
        if (state.turn !== 'passed') throw Error('The receiving team did not receive the pass.');
        const answer=engine.question(state).correct;
        step('STAGE',{option:answer});step('CONFIRM');
        result.checks.push('Voluntary pass reached the receiving team and its answer scored once.');
      }
      result.warnings.push('Simulation does not verify factual answers, physical audio, image readability, or Windows/macOS. Use Preview rehearsal on the event display.');
    } catch (error) { result.errors.push('Rehearsal stopped: ' + String(error.message || error)); }
    return result;
  }

  async function preflight({assets = {}, questions = [], document = root.document} = {}) {
    const result = {checks: [], errors: [], warnings: []};
    const media = new Map();
    for (const [name, item] of Object.entries(assets)) {
      if (item && typeof item.data === 'string') media.set(name, item.data);
      if (name === 'logos' && item) for (const [key, entry] of Object.entries(item)) if (entry?.data) media.set(key, entry.data);
    }
    const builtin = new Set(['microscope', 'pipette', 'dna', 'ph', 'biohazard']);
    for (const question of questions) {
      const key = question.visual?.key || question.visual?.type;
      if (key && !builtin.has(key) && !media.has(key) && !(key === 'Python' && media.has('python'))) result.errors.push(question.id + ': required question image is missing (' + key + ').');
      for (const key of [question.narration?.stem, ...(question.narration?.options || [])].filter(Boolean)) if (!media.has(key)) result.warnings.push(question.id + ': optional narration is missing; local speech or host reading is needed.');
    }
    if (document) {
      for (const node of document.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src],audio[src],video[src],source[src]')) {
        const uri = node.getAttribute('src') || node.getAttribute('href');
        if (uri && !uri.startsWith('data:')) result.errors.push('A gameplay resource is not embedded. Rebuild the offline file.');
      }
      if (!document.getElementById('quiz-data') || !document.getElementById('kit-config')) result.errors.push('Required embedded configuration is missing.');
    }
    for (const [name, data] of media) {
      if (!/^data:(image\/(?:png|jpeg|webp|svg\+xml)|audio\/(?:wav|x-wav|mpeg|ogg));base64,/i.test(data)) { result.errors.push(name + ': unsupported embedded media.'); continue; }
      if (data.startsWith('data:image/') && root.Image) {
        await new Promise(resolve => {
          const image = new root.Image(); let finished = false;
          const finish = error => {if(finished)return;finished=true;root.clearTimeout(timer);if(error)result.errors.push(name + ': image could not load. Replace it and rebuild.');resolve();};
          const timer = root.setTimeout(() => finish(true), 4000);
          image.onload = () => finish(false); image.onerror = () => finish(true); image.src = data;
        });
      }
    }
    if (!result.errors.length) result.checks.push('Required embedded configuration and ' + media.size + ' local media entries passed preflight.');
    result.checks.push('Fonts use the local system font stack; no remote font download is required.');
    const links = questions.reduce((sum, question) => sum + (question.sources || []).filter(source => source.url).length, 0);
    result.warnings.push(links + ' source references are online links. Bibliographic notes remain local; websites need internet.');
    result.warnings.push('Use Test sound/Test voice after a browser gesture. Optional narration availability depends on this browser and installed local voices.');
    return result;
  }

  function openAudience() {
    if (audience && !audience.closed) { audience.focus(); return {ok:true}; }
    audience = root.open?.('', '_blank', 'popup,width=1280,height=720');
    if (!audience) return {ok:false, message:'The audience window was blocked. Allow a popup for this file, then try again.'};
    const doc = audience.document;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:"><title>Quiz audience display</title></head><body><main id="audience-stage"></main></body></html>');
    doc.close();
    for (const style of root.document.querySelectorAll('style')) doc.head.append(doc.importNode(style, true));
    const override = doc.createElement('style');
    override.textContent = 'body{overflow:hidden}#audience-stage{position:fixed;inset:0;overflow:hidden;background:#07111a}.stage{grid-template-rows:92px 100px 92px minmax(0,1fr);pointer-events:none}.audience-banner{position:absolute;bottom:8px;right:24px;font-size:18px;color:#b8cfdb}.content{overflow:auto}.cinematic-layer[hidden]{display:none}';
    doc.head.append(override);
    audience.addEventListener('resize', () => publish(root.document));
    publish(root.document);
    return {ok:true, message:'Move this window to an extended display. Mirroring still exposes the host screen; host settings are not copied to this window.'};
  }
  function publicClone(node, doc) {
    const copy = doc.importNode(node, true);
    copy.querySelectorAll('script,iframe,object,embed,input,select,textarea,[data-action],#overlay,#toast,#recording-indicator,#rehearsal-badge').forEach(item => item.remove());
    for (const element of [copy, ...copy.querySelectorAll('*')]) {
      for (const attr of [...element.attributes]) if (/^on/i.test(attr.name)) element.removeAttribute(attr.name);
      element.removeAttribute('data-ui'); element.removeAttribute('data-action');
      if (element.getAttribute('role') === 'button') { element.removeAttribute('role'); element.removeAttribute('tabindex'); }
      if (element.tagName === 'BUTTON') element.setAttribute('disabled', '');
    }
    return copy;
  }
  function publish(document = root.document, state) {
    if (!audience || audience.closed) return false;
    try {
      const doc = audience.document, target = doc.getElementById('audience-stage');
      if (!target) return false;
      const stage = doc.createElement('div'); stage.className = 'stage';
      stage.style.transform = 'translate(-50%,-50%) scale(' + Math.min(audience.innerWidth/1920, audience.innerHeight/1080) + ')';
      // Only current public fragments are copied. Host panels, banks, repair
      // payloads, checkpoints and hidden answer keys never enter this document.
      for (const selector of ['header','.scoreboard','.turn-lane','#content']) {
        const node = document.querySelector(selector);
        if (node) stage.append(publicClone(node, doc));
      }
      const cinema = document.getElementById('cinematic-layer');
      if (cinema && !cinema.hidden) stage.append(publicClone(cinema, doc));
      if (state?.phase === 'intro') stage.querySelectorAll('.form-row,.resume-note').forEach(item => item.remove());
      target.replaceChildren(stage);
      return true;
    } catch (_) { return false; }
  }
  function closeAudience(){if(audience&&!audience.closed)audience.close();audience=null;}
  return Object.freeze({rehearse,preflight,openAudience,publish,closeAudience});
});
