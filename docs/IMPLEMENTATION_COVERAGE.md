# Brief coverage and remaining decisions

Scope: the consolidated implementation handoff dated 15 October 2026. Starting repository commit: `404ca0114b4815605f9726549dfb0e068d4d9fdd`. This matrix describes source changes and preserved boundaries. The [current showcase audit](SHOWCASE_AUDIT.md) maps each item to implementation, tests and its actual BioVista demonstration. Current checks are in [Release QA](RELEASE_QA.md); [Implementation QA](IMPLEMENTATION_QA.md) retains earlier snapshots. Source availability does not establish factual accuracy, audio quality, platform compatibility or new rights-holder permission.

**Implemented** means a source/workflow path exists with checks reported in QA. **Partial** identifies a concrete remaining limitation. **Decision/input needed** preserves an unresolved user choice or missing supplied asset. **Excluded** is deliberately outside accepted scope.

| Brief item | Decision | Coverage and boundary |
| --- | --- | --- |
| 1. Question-quality report | Accepted | Implemented in authoring and bank review: source/override issues, option explanations, topic/subtype counts, likely repeats, numerical-unit warnings and possible leakage. Heuristics do not fetch sources or provide a certainty score. |
| 2. Private host/audience views | Accepted | Host controls and an optional separate audience window showing visible presentation content. Extended-display/popup constraints remain; mirroring is never private. Physical dual-display testing is pending. |
| 3. One-click rehearsal | Accepted | Isolated engine simulation through final/tie results, reserve/pass checks and media preflight; existing rendered preview remains separate from live scores. Actual audio/display quality still needs event-machine rehearsal. |
| 4. Visual session planner | Unresolved | Excluded from this implementation; no timeline/planner interface inferred from the suggestion. |
| 5. Avoid/replace | Accepted | Unused compatible reserves retain the scheduled opportunity. Topic/format mismatch is disclosed; scored/revealed replacements preserve an audit trail and explicit score/lifeline consequences. No elaborate dispute workflow is added. |
| 6. Editable DOCX bank | Accepted | Assistant-operated local export/import with editable question tables and stable IDs, protected media metadata, validation and an independent verification workflow. Requires the exported template and a compatible editor; no live web builder. |
| 7. Click-to-zoom images | Accepted | Enlarged fit-to-screen view, close/Escape and return; no new image detail is invented. |
| 8. Separate discussion time | Accepted | `gameplay.discussionSeconds` (0–600); off at 0. Responses remain locked until discussion completes. |
| 9. Optional revision report | Accepted | `gameplay.revisionReport`; local host details/download, with concise public final results. Observed question performance is not a student diagnosis. |
| 10. Multilingual controls | Accepted | Implemented configurable language tag and exact-label dictionary, retaining English fallback and preserving question text. Actual language/font/layout coverage needs rehearsal; no automatic or independently verified translations are claimed. |
| 11. Topic coverage | Accepted | Authoring blueprint, per-team/round review and bank report counts. Coverage against the teacher's syllabus still requires author judgment. |
| 12. Repeat warning | Accepted | Normalized-token heuristic plus required conceptual review in authoring. No claim that all paraphrases are detected. |
| 13. Safe option shuffle | Accepted | Stable option/answer identities; explanation/narration/scoring stay paired through one fixed appearance and passes. |
| 14. Sequence/answer leakage | Accepted | Whole-bank authoring review plus candidate warnings for answer text appearing in other stems. Filenames, alt text, sources and narration also require author review. |
| 15. Difficulty curve | Accepted | Manual, rising and falling order of intact matched pairs; configurable easiest-to-hardest legend; short-mode pair selection retained. |
| 16. DOCX preview/rollback | Accepted | Temporary preview, original document, answer-key diff, explicit Apply and prior-configuration rollback; stale/invalid previews cannot silently replace the bank. |
| 17. Offline package | Accepted | Self-contained compiled HTML and local embedded media/scripts/fonts route; source websites are identified as online-only. Network-disabled interaction evidence is in QA. |
| 18. Optional print fallback | Accepted authoring offer | Offered once during setup/export, with separate participant sheet and host key requirements if selected. This request did not select a print artifact; no dedicated automatic print renderer is claimed. |
| 19. Absent-team handling | Conditional | Decision needed: the existing engine is genuinely two-team-only. No absent-team recalculation or multiteam controls are added before an expansion decision. |
| 20. Accidental-click protection | Rejected | Excluded: no routine gameplay confirmation feature. Deliberate destructive reset and score-integrity handling are separate existing/required operations. |
| 21. Opportunity statistics | Accepted | Host-selected direct opportunities, passes offered/reached, attempted/correct/wrong and scores. Definitions distinguish offered/reached/attempted; counts reconcile with event records. |
| 22. Rotating roles | Rejected | Excluded. |
| 23. Privacy-friendly aliases | Accepted interpretation | Team names only; no individual accounts, contact details or participant profiles. |
| 24. Planned regrouping | Reinterpreted | Fixed/alternating round starters for the two supported teams; memberships never change. |
| 25. Numerical ranges/units | MCQ only | `numerical` subtype and source/unit review; choices contain values/units. No typed-number response. |
| 26. Short-answer variants | Rejected | Excluded; no spelling-variant/open-response grading. |
| 27. Arrange in order | MCQ only | `sequence` subtype with alternative sequence options; no drag-and-drop interaction. |
| 28. Match pairs | MCQ only | `matching` subtype with alternative mapping options; no matching interaction. |
| 29. Special labels/shapes feature | Not explicitly accepted | No new feature inferred. Ordinary readable labels, focus and keyboard access are retained. |
| 30. Sensory-friendly mode | Rejected | No dedicated mode/preset added. Existing motion/sound settings and safe visual behavior remain. |
| 31. Asset/license credits pack | Accepted; rights limits remain | Host credit export and preserved notices/provenance. [Asset review](ASSET_REUSE_REVIEW.md) records project-scoped permission for the actual supplied character alongside ongoing university/other-mark and example-only speech restrictions; credits are not a new license grant. |
| 32. Retention/privacy dashboard | Unanswered | No new retention dashboard/cloud collection. Existing local resume/export safeguards retained; browser storage is not guaranteed permanent. |

## Cross-cutting requirements

| Requirement | Coverage and remaining limit |
| --- | --- |
| Supplied and researched questions | Same independent verification instructions, checked-source records, option explanations, review/override choices and quality report. The showcase practice question has newly checked NIST unit evidence and per-option rationale; the other 40 inherited cards retain their historical evidence gaps. No wholesale fresh verification is claimed. |
| Evidence-backed reveal | One compact primary source after reveal, expandable extra sources/option rationale, local bibliographic notes and separate external links. Old sources retain their historical dates. |
| Honest override | Question/source verification statuses are distinct; explicit creator override records a chosen option and unresolved disagreement. Structural validation still blocks unsafe data. |
| MCQ subtype variety | Text, numerical, image, graph, code, sequence and matching metadata; all retain four choices and one intended key. Exact scientific figures require appropriate supplied/deterministic assets. |
| Import safety | Bounded DOCX ZIP/XML parsing; reject active/unsupported content, unsafe paths and imports lacking both recovery metadata and a valid QSK1 event/revision identity. Imported prose/links do not become instructions or execute. |
| Failure and AI repair | Visible recoverable notice plus previewable/copyable local redacted handoff; no automatic upload, credentials, raw private bank content, public issue or PR. |
| Team selection | Existing two-team coin toss preserved. More-than-two lever/reel selector and its visual iteration are **decision needed**, not represented as implemented. |
| Branding and character | Namdev Shirodkar credit and special curation kept in entry/About/settings. Actual user-supplied Chota Namu PNG/GIF and project-scoped use/publication permission now recorded; unchanged PNG is optional on welcome/About/settings with a persistent visibility toggle. GIF remains a reference; no gaze or substitute asset added. Existing Parul/PCAHS logo provenance is recorded; broader usage permission still needs confirmation. |
| Responsive and keyboard behavior | Existing responsive layout plus fit-to-screen zoom and focus/keyboard checks; actual tested viewports/zoom belong to QA, not inferred guarantees. |
| Lean library and presets | Concise START + AGENTS; five quiz and five visual presets plus Custom preserved. Relevant modules load by phase. Prompt size measured as bytes, never invented billing/token savings. |
| Reuse and preservation | Existing licensed local components and installed DOCX tooling reused, original BioVista files preserved in `examples/biovista/original/` while the public example is rebuilt with the current features. Existing locked development dependencies were restored for checks; no new dependency/model adopted or unrelated media fetched. Rights gaps remain explicit. |
| Recovery | Existing paused resume/checkpoint copy preserved; interrupted-event recovery must follow the tested launch route and storage behavior described in QA. |
| Actual platforms | Earlier Linux checks belong to their snapshots. Current Windows Chrome/Edge scope is recorded in Release QA. **macOS/Safari and physical event hardware remain untested.** |
| Repository/publication authority | The user authorized scoped tested merges, a release and reversible removal of confirmed quiz hosting. GitHub is the public destination. Unrelated sites and private/event-restricted material remain outside this scope. |

## Subsequent accepted additions

- **Teacher / Competition authoring modes:** the first unresolved setup question has exactly these two choices. Teacher chooses compatible defaults and asks only essentials; Competition exposes all supported controls. Switching preserves prior answers. `setup=teacher|competition` persists the choice without changing runtime rules or legacy keys.
- **Current BioVista showcase:** a release HTML download with its supported compatible Apex profile enabled and settings visible/read-only. The normal engine remains configurable and reusable settings omit the showcase lock. Original bank/scoring, companion DOCX/settings/review and the historical archive are preserved. Mutually exclusive choices and content subtypes remain documented alternatives. No hosted preview is required.

## Decisions and inputs still needed

1. Whether to expand the engine beyond two teams. Only after that decision should a scalable lever/reel selector and absent-team behavior be implemented and verified together.
2. Confirmation that the cataloged Parul/PCAHS logo is the intended authorized file for the target distribution. The actual Chota Namu artwork has now been supplied and authorized for this project/publication; unrelated reuse rights are not granted.
3. Actual macOS/Safari and physical event hardware checks. Actual Windows browser results do not substitute for a Mac or room rehearsal.
4. Separate authorization before publishing unrelated private/event-restricted material or changing the scope beyond this toolkit and its public BioVista example.

For exact implementation files and verified commands/results, use [Implementation QA](IMPLEMENTATION_QA.md). For source fields and author-operated commands, use [Configuration](CONFIGURATION.md).
