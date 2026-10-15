# Ponytail: provenance and adaptation

QSK's lean workflow draws on [Ponytail](https://github.com/DietrichGebert/ponytail), by DietrichGebert. Reviewed on **2026-10-15** at commit [`84740e3d344b69b4a133201fa519eb37a62a2b2a`](https://github.com/DietrichGebert/ponytail/commit/84740e3d344b69b4a133201fa519eb37a62a2b2a).

Verified upstream sources: [README](https://github.com/DietrichGebert/ponytail/blob/84740e3d344b69b4a133201fa519eb37a62a2b2a/README.md), [compact rules](https://github.com/DietrichGebert/ponytail/blob/84740e3d344b69b4a133201fa519eb37a62a2b2a/AGENTS.md), [skill](https://github.com/DietrichGebert/ponytail/blob/84740e3d344b69b4a133201fa519eb37a62a2b2a/skills/ponytail/SKILL.md), [license](https://github.com/DietrichGebert/ponytail/blob/84740e3d344b69b4a133201fa519eb37a62a2b2a/LICENSE).

## Applied principles

- Understand the requested result and affected callers before editing. Complete the whole change, including dependent configuration, documentation and meaningful checks.
- Reuse suitable repository components, approved assets, platform features and installed dependencies. Prefer capable existing tools to rebuilding their functionality.
- Add only the readable implementation the task requires. Preserve the user's requested features, validation, error handling, security and accessibility.
- Report what was actually checked and any material remaining limitation.

QSK also keeps the launch prompt compact and loads task-specific references when needed. Reuse known answers and supplied settings; avoid repeated interviews, full repository dumps and redundant narration. Preserve factual sources, fairness, offline behavior and the full configuration. These are QSK-specific workflow choices, not an upstream token-compression API.

## Limits

Ponytail supplies agent instructions. It does not change a model's tokenizer, context limit, pricing or memory. A shorter launch prompt still costs context when its linked instructions are read. Upstream benchmark results describe upstream experiments, not measured QSK savings; compare equivalent QSK tasks and actual usage before claiming a percentage.

No upstream runtime, installer, hooks or full fork is required by this adaptation. This file records provenance and is not a second startup instruction set. Follow QSK's current entry point; reread this note only for attribution or upstream review.

## Upstream license

MIT License

Copyright (c) 2026 DietrichGebert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
