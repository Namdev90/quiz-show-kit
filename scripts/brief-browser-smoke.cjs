'use strict';
// Rendered/offline acceptance checks. Uses an already-installed Playwright;
// deliberately does not install a browser or upload test artifacts.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.QSK_PLAYWRIGHT_MODULE || 'playwright-core');
const C = require('../src/compiler.js');
const {runtime, root} = require('./runtime.cjs');
const tieOnly=process.argv.includes('--tie-only');
const output = path.join(root, 'test-results/brief-browser',...(tieOnly?['tie']:[]));
fs.mkdirSync(output, {recursive:true});
const config = JSON.parse(fs.readFileSync(path.join(root, 'quiz.config.json'), 'utf8'));
config.event.id = 'brief-browser-acceptance';
config.event.title = 'Offline acceptance fixture';
config.teams[0].name = 'Environmental Microbiology Team North';
config.teams[1].name = 'Molecular Biotechnology Team South';
config.presentation = {...config.presentation, motion:'none', sound:false, intro:false, confetti:false, rewards:false};
config.rules.optionsRevealMs = 400;
config.rules.passTransitionMs = 300;
// Long answer clocks keep this rendered suite independent of shared-runner CPU
// stalls. Deadline boundaries are covered by deterministic engine tests.
config.rules.primarySeconds = 600;
config.rules.passedSeconds = 600;
config.gameplay={shuffleOptions:true,discussionSeconds:1,difficultyOrder:'manual',roundOrder:'alternate',statistics:['directOpportunities','passesOffered','passesReached','attempted','correct','wrong','scores'],revisionReport:true};
const longCard=config.questions.find(question=>question.status==='main');
longCard.stem='Layout fixture: choose the indicated laboratory option. '+ 'This deliberately long sentence checks readable wrapping on common laptop and projector screens. '.repeat(2);
longCard.options=longCard.options.map((option,index)=>(option+' — long option '+(index+1)+': '+ 'laboratory interpretation with units and a complete explanation ').padEnd(165,'x').slice(0,175));
longCard.optionExplanations=longCard.options.map((option,index)=>'Fixture explanation for stable option identity '+index+'.');
if(tieOnly){
  const tie=config.questions.find(question=>question.status==='tie');
  config.rounds=config.rounds.filter(round=>round.id===longCard.round);
  config.questions=config.questions.filter(question=>question.status==='main'&&question.pairId===longCard.pairId||question.status==='tie'&&question.pairId===tie.pairId);
  config.questions.filter(question=>question.status==='tie').forEach(question=>question.round=longCard.round);
  longCard.visual={type:'diagram',key:'microscope',alt:'Laboratory apparatus diagram',attribution:'Original toolkit diagram'};
}
const fixture = path.join(output, 'acceptance-fixture.html');
fs.writeFileSync(fixture, C.build(config, runtime(config)).html);
const report = {os:os.platform(),release:os.release(),architecture:os.arch(),launch:'local file URL, network disabled',browser:null,viewports:[],checks:[],pageErrors:[],networkRequests:[],referenceFailures:[],limitations:['Automated screenshots do not verify physical projector readability or audible speakers.','A Linux run is not Windows, macOS or Safari verification.','CSS zoom below is a larger-layout-text check; manual browser toolbar zoom remains a platform checklist item.']};
let browser;
async function check(name, run) { await run(); report.checks.push(name); console.log('PASS '+name); }
(async()=>{
  try {
    browser = await chromium.launch({headless:true, ...(process.env.QSK_BROWSER_EXECUTABLE?{executablePath:process.env.QSK_BROWSER_EXECUTABLE}:{})});
    report.browser = await browser.version();
    const context = await browser.newContext({offline:true,viewport:{width:1366,height:768},acceptDownloads:true});
    const page = await context.newPage();
    context.on('requestfailed',request=>{if(/^https?:/i.test(request.url()))report.referenceFailures.push({url:request.url(),error:request.failure()?.errorText||'failed'});});
    page.setDefaultTimeout(60000);
    page.on('pageerror', error=>report.pageErrors.push(error.message));
    page.on('request',request=>{if(/^https?:/i.test(request.url()))report.networkRequests.push(request.url());});
    await page.goto(pathToFileURL(fixture).href);
    await page.waitForFunction(()=>Boolean(window.BioQuiz));
    const state=()=>page.evaluate(()=>window.BioQuiz.getState());
    const action=type=>page.locator('[data-action="'+type+'"]').click();
    const ui=type=>page.locator('[data-ui="'+type+'"]').first().click();
    const phase=type=>page.waitForFunction(wanted=>window.BioQuiz.getState().phase===wanted,type);
    await check('Local offline file initializes with no remote gameplay request',async()=>{assert.equal((await state()).phase,'intro');assert.deepEqual(report.networkRequests,[]);});
    await check('Responsive entry and host controls render at laptop/projector sizes',async()=>{
      for(const [width,height]of [[1366,768],[1920,1080],[1024,768]]){
        await page.setViewportSize({width,height});
        const box=await page.locator('#stage').boundingBox();
        assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=width+1&&box.y+box.height<=height+1,'Stage fits '+width+'x'+height);
        await page.screenshot({path:path.join(output,'entry-'+width+'x'+height+'.png')});
        report.viewports.push({width,height,stageFits:true});
      }
      await page.setViewportSize({width:1366,height:768});
      await ui('settings');
      await page.screenshot({path:path.join(output,'host-settings.png')});
      await ui('close');
    });
    await check('Coin outcome is fixed before final reveal and survives resizing',async()=>{
      await action('COIN');
      await page.screenshot({path:path.join(output,'coin-selector.png')});
      await page.setViewportSize({width:1024,height:768});
      await page.waitForTimeout(5300);
      await page.evaluate(()=>window.BioQuiz.skipMotion());
      const first=await state();
      const result=first.log.find(row=>row.type==='coin-result');
      assert.ok(result,'Coin outcome recorded');
      await page.setViewportSize({width:1366,height:768});
      assert.deepEqual((await state()).log.find(row=>row.type==='coin-result'),result);
      assert.equal(await page.locator('[data-action="COIN"]').isDisabled(),true);
    });
    await action('START_SHOW');await action('START');
    let completed=0,firstPass=false,revealCaptured=false,zoomCaptured=false,zoomedText=false,tieWrong=false;
    await check('Complete offline event, including blocked pass choices, reveal and tie opportunities',async()=>{
      for(let step=0;step<700;step++){
        let current=await state();
        if(current.timer?.paused){await action('RESUME');continue;}
        if(current.phase==='roundIntro'){await action('NEXT');continue;}
        if(['read','tieRead'].includes(current.phase)){
          assert.equal(await page.locator('#content .answer-sources').count(),0,'Sources hidden until reveal');
          assert.equal(await page.locator('#content .option-explanations').count(),0,'Explanations hidden until reveal');
          if(!zoomCaptured&&await page.locator('[data-ui="zoomImage"]').count()){
            const before=await state();await ui('zoomImage');
            await page.screenshot({path:path.join(output,'image-zoom.png')});
            await page.keyboard.press('Escape');
            assert.deepEqual((await state()).mainScores,before.mainScores);zoomCaptured=true;
          }
          await action('SHOW_OPTIONS');continue;
        }
        if(['optionsIntro','discussion','passTransition'].includes(current.phase)){
          await page.waitForTimeout(120);continue;
        }
        if(current.phase==='answering'){
          const question=await page.evaluate(()=>window.BioEngine.question(window.BioQuiz.getState()));
          let selected=question.correct;
          if(current.kind==='main'&&current.cursor<2&&current.turn==='primary'&&current.config.passingEnabled) selected=(question.correct+1)%4;
          if(current.kind==='tie'&&current.tieCursor===1){selected=(question.correct+1)%4;tieWrong=true;}
          if(current.turn==='passed'){
            const blocked=await page.evaluate(()=>window.BioEngine.view(window.BioQuiz.getState(),performance.now()).blockedOptions);
            for(const index of blocked)assert.equal(await page.locator('[data-option="'+index+'"]').isDisabled(),true);
            firstPass=true;
          }
          try{await page.locator('[data-option="'+selected+'"]').click({timeout:3000});}
          catch(error){const latest=await state();if(latest.timer?.paused||latest.phase!==current.phase||latest.questionId!==current.questionId)continue;throw error;}
          await action('CONFIRM');continue;
        }
        if(current.phase==='reveal'){
          completed++;
          if(!revealCaptured&&current.kind==='main'&&await page.locator('#content .answer-sources').count()){
            await page.screenshot({path:path.join(output,'answer-source-reveal.png')});
            for(const [width,height]of [[1366,768],[1920,1080],[1024,768]]){
              await page.setViewportSize({width,height});
              const next=await page.locator('[data-action="NEXT"]').boundingBox();
              assert.ok(next&&next.x>=-1&&next.y>=-1&&next.x+next.width<=width+1&&next.y+next.height<=height+1,'Next remains in viewport '+width+'x'+height);
              const clipped=await page.locator('.option').evaluateAll(options=>options.filter(option=>option.scrollWidth>option.clientWidth+1).length);
              assert.equal(clipped,0,'No horizontally clipped options at '+width+'x'+height);
              await page.screenshot({path:path.join(output,'long-answer-'+width+'x'+height+'.png')});
            }
            await page.setViewportSize({width:1366,height:768});
            const link=page.locator('#content .answer-sources a').first();
            if(await link.count()){
              assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
              await link.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'answer-source-reveal.png')});
              const beforeLink=await state(),popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;
              await popup.waitForLoadState('domcontentloaded').catch(()=>{});await popup.waitForTimeout(300);await popup.close();await page.bringToFront();
              assert.deepEqual((await state()).mainScores,beforeLink.mainScores);assert.equal((await state()).phase,'reveal');
              assert.ok(report.referenceFailures.length,'External source failed offline in a separate tab');
            }
            revealCaptured=true;
          }
          if(!zoomedText){
            await page.evaluate(()=>document.querySelector('#content').style.zoom='1.25');
            await page.screenshot({path:path.join(output,'answer-text-125-percent.png')});
            assert.equal(await page.locator('[data-action="NEXT"]').isVisible(),true);
            await page.evaluate(()=>document.querySelector('#content').style.zoom='');zoomedText=true;
          }
          await action('NEXT');continue;
        }
        if(current.phase==='end'){
          if(!current.winner?.team&&await page.locator('[data-action="START_TIE"]').count()){await action('START_TIE');continue;}
          assert.ok(current.winner,'A deliberate final result is present');
          await page.screenshot({path:path.join(output,'final-scores.png')});
          assert.doesNotMatch(await page.locator('#content').innerText(),/Namdev Shirodkar|Curated for Parul/);
          break;
        }
        throw Error('Unexpected phase: '+current.phase);
      }
      assert.equal((await state()).phase,'end');assert.ok(completed>=config.questions.filter(q=>q.status==='main').length);
      assert.ok(firstPass,'Passed answers were exercised');
      assert.ok(revealCaptured,'Source reveal rendered');assert.ok(zoomCaptured,'Image overlay rendered and dismissed');
      if(tieOnly)assert.ok(tieWrong,'Matched tie pair was played in the rendered browser');
      report.checks.push('Completed '+completed+' question reveals; tie wrong answer exercised: '+tieWrong+'; image overlay captured: '+zoomCaptured+'; source reveal captured: '+revealCaptured);
    });
    await check('Refresh provides explicit recovery and preserves the final score ledger',async()=>{
      const before=await state();await page.reload();await page.waitForFunction(()=>Boolean(window.BioQuiz));
      if(await page.locator('[data-action="RESUME_SAVED"]').count()){
        await action('RESUME_SAVED');assert.deepEqual((await state()).mainScores,before.mainScores);
      }else{
        report.limitations.push('This browser denied local-file storage; use the downloaded resume copy instead.');
      }
    });
    assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.networkRequests,[]);
    await context.close();
  } catch(error) { report.failure=String(error.stack||error);process.exitCode=1;console.error(report.failure); }
  finally { if(browser)await browser.close();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)); }
})();
