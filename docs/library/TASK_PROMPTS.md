# Reusable task prompts

These optional instructions extend the [main workflow](../TEACHER_PROMPT.md); they do not replace its source checks, supported configuration, permission boundaries or offline contract. Use them after the launcher has loaded. Replace bracketed text, or let the assistant ask for missing details one at a time.

## Research a bank

```text
Research a quiz on [topic] for [audience]. Use my supplied syllabus if readable; otherwise propose an appropriate scope. Build a source-backed objective and difficulty blueprint, then draft complete matched pairs with four plausible choices, one defensible answer and concise explanations. Verify the supporting sources, record actual review dates and flag uncertainty. Use the repository's question-research library and current field limits. Offer review once, then respect my choice to proceed or skip.
```

## Ideate a theme or rounds

```text
Suggest three distinct round/theme concepts for this learning goal using the repository's presets and custom route. Explain the teaching value, likely question patterns, visual opportunities and time implications of each. Recommend one and let me customize it. Keep concept suggestions separate from features already implemented.
```

## Design the experience

```text
Offer the five visual presets plus Custom for this event, with visual previews when supported. Apply my choice across readable question cards, team cues and host controls. Check long text, focus/disabled states, media, motion and room readability. Preserve the scoring/timing contract. Implement custom layout changes only with the relevant source and checks; state anything not tested.
```

## Recommend or add a feature

```text
Using my current settings and learning goal, suggest up to three useful additions. Label each as ready to configure or requiring an extension; show its benefit and effect on flow. Recompute compatible choices after every change. For the feature I select, implement the smallest complete change with contract updates and focused tests. Keep the real BioVista example intact and all optional behavior switchable.
```

## Repair a problem

```text
Investigate [observed problem] in this quiz. Read the source and reproduce the behavior if tools permit. Explain the expected behavior, make the smallest authorized repair, and test the affected flow plus relevant pause/undo/recovery behavior. Report evidence and remaining limitations. Do not publish private event content or claim unavailable checks ran.
```

## Review and contribute

```text
Review the current repository for this requested quiz. Identify relevant defects, outdated instructions and up to three worthwhile improvements. Implement authorized local fixes with concrete checks. Open a PR only when I have authorized that contribution and usable GitHub access exists; otherwise return the patch/proposal and state that no PR was opened. Link only real commits and PRs.
```

## Choose tools or improve my prompt

```text
Use the model-routing library to choose the lightest capable tools available here for my task. Recommend a named model or speech provider only after checking current official information. Rewrite my request as a compact, unambiguous instruction with the goal, readable inputs, constraints, required output and acceptance checks. Put reusable rules in the repository rather than repeating them; preserve my intent and identify missing capabilities honestly.
```

At delivery, generate the personal next-session prompt and settings attachment from [QSK1 reuse](REUSE_PROTOCOL.md). Do not stuff complete custom data into an invented secret key or rely on inaccessible cross-chat memory.
