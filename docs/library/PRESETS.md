# Five starting experiences + Custom

Offer the quiz experience separately from its appearance. Every preset can be changed. Use the current preset implementation as the executable source of truth and [Configuration](../CONFIGURATION.md) for accepted values. The defaults below are starting designs, not evidence that a particular class will finish in a guaranteed time.

| Choice / ID | Best starting use | Answer / pass / consultation | Direct / passed score | Passing / consultation |
| --- | --- | --- | --- | --- |
| **1 · Friendly classroom** `friendly` | Low-pressure introduction and participation | 30s / unused / unused | +10, 0 / unused | Off / off |
| **2 · Discussion seminar** `seminar` | More time to compare and explain | 45s / 15s / 15s | +10, 0 / +5, 0 | On / on |
| **3 · Focused revision** `revision` | Short recall and application practice | 20s / unused / 10s | +10, 0 / unused | Off / on |
| **4 · Quiz competition** `competition` | The original event's scoring challenge | 15s / 7s / 7s | +10, −2 / +2, −5 | On / on |
| **5 · Visual laboratory** `visual-lab` | Diagrams, observations and lab decisions | 45s / 15s / 15s | +10, 0 / +5, 0 | On / on |
| **6 · Custom** | Describe the experience in your own words | Any supported values; new rules need an extension | Any supported values | Teacher's choice |

Each score cell lists correct, wrong. All five start with 8 seconds of answer-entry grace, 1.8 seconds of sequential option reveal, a 1-second pass transition when applicable, and two complete pairs per round in short mode. Consultation, when enabled, is once per team for the competition. Keep inactive timing values out of the teacher's active choices. A seminar preset does not add a new discussion timer, and a visual preset does not fabricate approved images.

Question counts, round names and difficulty distribution are suggested after learning the subject, class level and available time. Do not equate a preset with a rigid syllabus. Allow time for instruction, the practice card, explanations, consultation, transitions and possible ties; longer speech or visual analysis needs more room.

## Five visual styles + Custom

| Choice / ID | Appearance | Starting rendering style |
| --- | --- | --- |
| **1 · Classroom teal** `classroom` | Calm dark teal surfaces and clear light text | Flat |
| **2 · Lecture light** `lecture` | Light presentation surfaces and dark text | Flat |
| **3 · Midnight blue** `midnight` | Dark blue quiz-show setting | Flat |
| **4 · Skeuomorphic desk** `skeuomorphic` | Tactile raised cards and physical-looking controls | Skeuomorphic |
| **5 · Glass studio** `glass` | Layered translucent surfaces with readable text | Glass |
| **6 · Custom** | Own palette, font, motif, style description or reference | Supported values or a tested layout extension |

Use `theme.style` values `flat`, `skeuomorphic` or `glass`; the visual preset ID also selects a palette. Fonts are local system fonts, not web downloads. Preview short and long questions with the chosen team colors. Decorative depth or transparency must preserve legibility, focus indication and recognizable disabled states. Do not claim formal accessibility compliance without the relevant measurements and review.

Keep appearance independent from rules. A different theme cannot change scores, answer visibility, clocks or opportunity balance. Add a Custom answer wherever a choice is offered, including voice, motion, topic, sources, difficulty mix and individual feature settings. When the custom idea needs code, explain what needs implementation and preserve the requested outcome in the extension brief.
