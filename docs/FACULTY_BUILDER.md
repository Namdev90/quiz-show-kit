# Classroom quiz builder

The builder makes an interactive quiz presentation for exactly two teams. Questions have four choices and one correct answer, arranged in balanced pairs. The downloaded presentation includes the existing quiz-show playback, scoring, clocks and host tools and works offline. It is an independent toolkit, not an official university product. New quizzes use text branding; the authorized BioVista branding stays with the example.

## Prepare, review, present

1. Open `index.html` or the live builder. Enter the lesson topic, quiz title and audience. Choose 6, 10 or 20 questions for ChatGPT to draft. More lesson details can include topic boundaries and reference notes.
2. Choose **Copy prompt for ChatGPT**. The success message appears only after clipboard copying succeeds. If your browser denies clipboard access, the prepared text appears selected. Use your device's Copy command, or **Select prompt text**. **Close prompt** returns focus to the copy button.
3. Use **Open ChatGPT**, paste the prompt, and attach any course notes. ChatGPT should write the questions, give explanations and cite sources it actually accessed. It must flag unavailable research instead of inventing citations or review dates.
4. Copy the entire reply. Back in the builder, paste it into **Paste ChatGPT's reply** and choose **Read reply**. The builder accepts a complete fenced reply or its data block, along with existing Quiz Show Kit configurations and saved work files. You do not need to edit JSON.
5. Check the import summary. **Use these questions** accepts the draft; **Back to paste** leaves the current quiz and pasted reply intact. Classroom drafts retain your existing teams, rules and appearance. Complete configuration imports explicitly replace those settings as well.
6. In **Review & edit**, open each question. Edit its wording and options, select the correct answer, review its explanation and open its source links. Add or correct source records where needed. A format check cannot establish factual accuracy. Source review dates are never assigned automatically; editing content clears that question's date.
7. Use **Preview quiz**, rehearse the controls and close the preview to return to the builder. Tick the teacher-review statement before choosing **Download offline quiz**. Every edit and import resets that statement. The result is one HTML file; open it on the classroom computer and rehearse its display and sound. Sound needs a real browser gesture. Keep the embedded answers with the host until the activity.

## Keep your work and recover

**Save work** downloads an editable work file. Reopen it with **Or open a quiz file** to continue. The builder also saves to this browser when storage is available and restores the draft after reload. Browser storage is device/browser specific, may be blocked, and may fill up with a large media bank. The visible saving status reports that boundary; keep a work-file backup before closing the browser or changing computers. Teacher review must be repeated after reopening.

If a reply is unfinished or has invalid question pairs/options, the input remains available and a message explains the repair. Ask ChatGPT to return the complete corrected draft using the copied prompt, then replace the pasted reply and try again. A failed import does not replace the current quiz. You can reopen the same work file after cancelling an import.

**Add two questions** creates a complete pair for manual drafting. Delete a pair using its question settings, with a separate **Keep questions** action. Each scored or tie-break pair must keep two questions in the same round and difficulty. Blank wording, duplicate choices, unfinished scores and source links can be saved as work, but must be repaired before a playable quiz can be built.

## Optional controls

**More options** includes organization/date text, team colors, answer time, passing and teacher consultation, points, presentation colors/fonts, round names, and local media. Existing imports keep their configured values; edits apply only to the current authoring draft. Rehearse any changes before an event. Check custom presentation colors for contrast in preview.

The complete configuration editor is for experienced users. Load the current form, make changes and apply them through the same staged import. File-based media requires selecting its matching approved local file. Media remains subject to the existing static SVG, supported-type, path and size checks. A failed media batch is not partially applied.

**Try the BioVista example** stages the real 41-card configuration for editing. **Play the original example** opens the preserved presentation. Importing it does not rewrite the original example file or alter its scoring.

## Implementation and references

The builder wraps the existing compiler; it does not change the playback/scoring engine. Its assistant return format is `qskDraftVersion: 1` with `title`, `rounds` and complete `questions`; each record follows the existing question contract. The copy prompt contains that contract in full. Configuration and saved-work formats are separately recognized and validated. See [configuration](CONFIGURATION.md) and `src/builder-model.js` for integrators.

Persistent labels, announced copy/import outcomes and actionable errors follow the W3C guidance on [labels and instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/). The guided paste/import and review approach also draws on the official [Gamma creation workflow](https://help.gamma.app/en/articles/7838093-how-do-i-create-a-new-presentation-document-or-webpage-in-gamma), [Kahoot AI question review](https://support.kahoot.com/hc/en-us/articles/40803785990675-How-to-generate-a-kahoot-with-AI) and [H5P author fields](https://h5p.org/documentation/content-author-guide/tutorials-for-authors/single-choice-set). These are design references, not compatibility or endorsement claims.

See [verification evidence](FACULTY_BUILDER_QA.md) for the difference between regression tests, browser checks and remaining human review.
