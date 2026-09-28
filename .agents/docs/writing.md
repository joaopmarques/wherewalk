# Writing

## The rule

Simple words. Short sentences. Straight to the point. Cut anything that does not help the reader act.

Applies to code comments, docs, commit messages, PR text, and UI copy.

## Style: Simplified Technical English (ASD-STE100)

- One sentence, one idea. Up to 20 words for an instruction, 25 for a description.
- Active voice: "the planner asks ORS again", not "ORS is asked again".
- Common words: use, start, get, show, make sure. Not utilize, initiate, obtain, ensure.
- No semicolons. No contractions. No marketing words (seamless, robust, powerful).
- One name for one thing. See the names below.
- Steps are a numbered list, one action each, in the imperative.

## Names

- Domain words come from [CONTEXT.md](../../CONTEXT.md), capitalized in comments and UI copy: Target, Route, Loop, Candidate, Progress.
- UI words come from [design-system](design-system.md): Sign, Panel, Exit Button, Plaque, Shield, Candidate Chip.

## Comments

Say why, not what. Put a comment where a reader would otherwise "fix" deliberate code.

```ts
// ORS returns Loops much longer than asked in sparse areas, so ask again with a scaled length.
```

## Commits

Imperative subject, 50 characters or less: "Keep routes on walkable ways". The body says why, in short lines.
