# Recommend useful features

Suggest a small number of improvements that fit the learning goal, audience, available time, venue and current source. Do not offer a long menu of hypothetical features. For each suggestion explain its teaching benefit, whether it already works, the effect on quiz flow, and any work still needed. Always accept a custom idea.

| Situation | Useful suggestion | Availability check |
| --- | --- | --- |
| New hosts or participants | One unscored practice question and a short rehearsal | Supported inventory; verify it is separate from scored pairs |
| Long wording or unfamiliar terms | More reading time, clearer wording, optional narration | Supported timing/voice settings; check pronunciation and pacing |
| Diagram-heavy lesson | Legible local diagrams, useful alternate text, matching visual complexity | Supported image assets; factual/visual review is still required |
| Mixed preparation levels | Balanced difficulty pairs and explanatory reveals | Authoring design; teacher can customize the mix |
| Short class | Complete-pair short mode and fewer rounds | Supported counts; preserve equal opportunities |
| Uncertain projection or busy visuals | Legible preview, gentle/no motion, silent mode | Normal presentation controls; no dedicated sensory-mode preset |
| Need for discussion | Optional separate thinking time before answers unlock | `gameplay.discussionSeconds`, off at 0 in normal/default setup; verify the built session |
| Live-event reliability | Resume copy, host rehearsal, reserve questions and tie pairs | Existing host tools; check the selected event and browser |
| More than two teams | Ask whether to expand the engine, then specify acceptance criteria | Existing engine is two-team-only; multiteam selector and absent-team controls remain gated |
| New layout or UI language | Custom layout or supplied control translations | Follow the current configuration's supported labels; question translations need separate checking |

## Dynamic availability rules

Use the source's supported-choice assessment after relevant changes; do not maintain a stale menu. Present disabled choices with a short reason when useful, or omit them until their dependency is enabled. Custom remains available as a request, not as an escape hatch around validation.

| Current state | Stop offering or disable | Compatible route |
| --- | --- | --- |
| Passing off | Pass time, pass-transition tuning, passed scoring | Re-enable passing if the teacher wants those rules |
| Consultation off | Consultation duration | Re-enable the lifeline or remove the requested timer |
| Sound off | Voice/rate/sample playback and sound volume changes as active behavior | Enable sound first; retain inactive preferences only where supported |
| Spoken options off | Option-speaking modes as active behavior | Enable spoken options; stem reading is a separate supported choice |
| No decorative motion | Decorative animation controls as active behavior | Keep fixed disclosure and game timing; enable another motion style for decoration |
| Incompatible count or missing pair | Final build/play delivery | Repair the affected inventory while preserving opportunity balance |
| Unsupported local voice or unreadable recording | Claims that the chosen narration works | Select an available local voice, add valid embedded clips or use a disclosed supported fallback |
| Invalid/unsafe asset | Embedding that asset | Request a supported static export or replace with approved media |
| Active event | Rule/content mutations that change score/timer meaning | Pause for presentation controls; rebuild a new event for rule/content changes |
| Missing build capability | “Download your finished quiz” claims | Complete useful work and provide the exact build handoff |

Keep three separate states in the teacher-facing summary: **ready**, **needs a choice/fix**, and **requires an extension**. A suggested feature is not automatically enabled. Recompute dependencies after changes and once before the final build. Report the specific conflict and one useful resolution; do not bury it in technical validator output.

## Accepted boundaries

The approved question types remain MCQ, including numerical, sequences and mappings represented by alternative options. Do not suggest free-text grading, typed numeric answers, drag-and-drop ordering/matching, rotating roles, routine gameplay confirmations, a dedicated sensory preset, full visual session planner or a retention dashboard as accepted work. Round-order rotation changes the starter/order, not membership. Ordinary readable labeling and keyboard access remain necessary. A feature number without wording and an unexplained/unanswered idea grant no approval.

Offer optional print fallback and revision reports during setup/export, not as compulsory workflows. Keep detailed statistics, evidence review and license downloads in the host surface. Verify the actual implementation against [coverage](../IMPLEMENTATION_COVERAGE.md) before describing any advanced feature as complete; limitations must remain visible.

## Turn a custom idea into an implementable brief

Capture the desired user action, visible behavior, rule/timer effects, pause/undo/recovery expectations, accessibility needs, offline constraints and acceptance example. Prefer the smallest change that delivers that behavior. Follow [extension guidance](../EXTENDING_ENGINE.md) and [review/fix guidance](REVIEW_AND_FIXES.md). Verify enhancements before rebuilding the current BioVista showcase; keep the historical files in `examples/biovista/original/` unchanged.
