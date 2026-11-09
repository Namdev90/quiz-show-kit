# Prepare and host an offline quiz

Use this checklist for your own reviewed event or the bundled BioVista showcase. It complements [configuration](CONFIGURATION.md); it does not change the rules of a quiz already in progress.

## Choose the right file

- To try BioVista, use the versioned HTML from the [published v1.1.3 release](https://github.com/Namdev90/quiz-show-kit/releases/tag/v1.1.3). The Apex showcase intentionally exposes settings as read-only.
- To create another event, use [QSK1](../prompts/START.md) or build a separate configuration. Give a new event its own ID and keep private material outside the public repository.
- Preserve the exact file used for a live session. Do not replace it with a newly built version halfway through an event.
- Keep the editable configuration, approved local assets and reusable settings alongside your private authoring materials. Playback needs the generated HTML, not the build toolchain.

Build a reviewed configuration from the repository root with Node.js 22 or newer:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

The build prints the output path, byte count, SHA-256, card counts and profile ID. An unsuccessful build is not a playable deliverable. See [handoff guidance](CHATGPT_HANDOFF.md) when your assistant cannot build files.

## Pre-event checklist

1. Open the finished HTML in the browser and on the computer that will host the event.
2. Confirm title, team display names, full/short selection, scoring and timing before starting. Internal team IDs remain Bio and Vista.
3. Run preflight and rehearsal. Read warnings about missing assets, narration and reserve coverage; simulation alone does not establish live readiness.
4. Use **Test sound/Test voice** after an actual browser gesture. Check volume, the selected installed voice and pronunciation on the speakers you will use.
5. Inspect long stems, all options, diagrams and alternative text at the real display size. Check keyboard use and reduced-motion behavior.
6. If using an audience window, test the browser's popup prompt and move that window to the extended display. Mirroring the host screen can expose host controls.
7. Practice pause, undo and recovery. Save a resume copy, reopen the copy and confirm that it restores paused with the expected state.
8. Keep a private backup of the original HTML and event materials. Treat checkpoints/resume copies as sensitive event records.

The quiz embeds gameplay scripts and approved media. Source-reference websites still need internet, and local speech availability depends on the device/browser. Disconnecting the network during rehearsal is a useful separate check of offline gameplay.

## During the event

- Use the reading and option-reveal phases as designed. The answer clock starts only after the required reveal and any configured discussion phase.
- Pause before handling an interruption or checking host settings. Do not change the underlying rules or question file during a live session.
- When substituting a reserve, review its round, difficulty, time and topic fit. Record the reason and consequences; if no suitable reserve exists, keep the slot paused for a decision.
- After important progress, save a fresh resume copy. Do not assume private browsing or restricted storage will retain the session.
- Keep the host HTML and answer keys private until the event's publication rules permit sharing.

## Recover an interrupted session

1. Return to the same original quiz file/browser if its saved state is available.
2. Otherwise open the latest **Save resume copy** file and verify its event/profile and paused state.
3. Check the current question, team, scores and remaining phase/time before resuming.
4. If the file reports an incompatible checkpoint, keep the original file and stop the attempted transfer. Do not edit checkpoint JSON or a score ledger to force acceptance.
5. Reconcile any uncertainty with the host's event record before continuing play.

A settings export saves reusable choices; it is not a substitute for a session checkpoint. New questions, rules or reviewed metadata can change profile identity. v1.1.2's BioVista profile is separate from the earlier enriched profiles.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Sound or speech is silent | Start with a browser gesture, check quiz/device volume and test the selected local voice. Some voices are unavailable offline or on another computer. |
| Settings cannot be changed | BioVista's fixed Apex showcase is deliberately read-only. Use a separate ordinary configuration for a customizable event. |
| Audience window does not open | Read the popup message and allow the specific popup if you choose. Test an extended display rather than assuming screen mirroring hides host controls. |
| Source links fail offline | Gameplay remains embedded; cited websites require connectivity. Use the locally retained bibliographic notes until online. |
| Progress disappears after reopening | Local storage may be blocked or the file/profile may differ. Use the matching saved resume copy; test recovery before the event. |
| An image or recording is rejected during build | Check approved type/size and that its real path stays inside the configuration directory. Do not disable containment or media validation. |
| A normal quiz unexpectedly has locked settings | Check whether the copied configuration retains `showcase: true`. Remove that flag in the separate event copy before building, not in the archived example. |
| Motion differs across computers | Check the system reduced-motion preference and the quiz's motion controls. Rehearse actual rendering; test results do not certify every display. |
| A DOCX edit or showcase build reports a fingerprint mismatch | Follow the [question-bank workflow](library/QUESTION_BANK.md) and rebuild matching companions through the documented authoring route. Do not overwrite metadata hashes to hide drift. |
| A question is disputed | Pause as needed, inspect its sources and record the disagreement. A successful build is not factual verification. |

## After the event

Save the required reports and final resume copy privately. Review them before any sharing: they can contain event content and session history. Remove participant details and use only the smallest sanitized example when reporting a problem.

For a bug, include toolkit version/commit, browser/OS, the affected phase, expected versus observed behavior and a sanitized reproduction. Report ordinary problems through [repository issues](https://github.com/Namdev90/quiz-show-kit/issues); follow [SECURITY.md](../SECURITY.md) for vulnerabilities.

The code's MIT license does not cover every logo, recording or example mark. Check [third-party notices](../THIRD_PARTY_NOTICES.md) and the [asset reuse review](ASSET_REUSE_REVIEW.md) before distributing another event. Current downloads use GitHub releases; there is no need to enable Pages hosting for offline playback.
