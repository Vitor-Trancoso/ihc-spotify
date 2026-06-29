---
name: council
description: Run an adversarial 6-role council (Creator / Opposer / Out-of-the-box / Investigator / Neutral / Judge) over a design decision, plan, or code change to stress-test it before committing. Use when the user asks for a "council", "conselho", "adversarial review", "stress test this plan", or any time a decision feels load-bearing enough to deserve more than one perspective.
---

# Council — Adversarial Multi-Role Review

A structured deliberation that pits 6 specialized roles against each other to
expose flaws, surface alternatives, and produce a defensible verdict. Designed
for design decisions, technical plans, refactor strategies, architecture
choices, and "should we ship this?" calls.

## When to use

Invoke this skill when:
- The user explicitly asks for "conselho" / "council" / "panel" / "adversarial review".
- A plan has been written and needs a final stress-test before implementation
  (e.g. plans under `plans/` per the project's "every feature needs a reviewed
  plan first" rule).
- A decision has more than one viable path and the user wants confidence before
  picking one.
- The user asks "what could go wrong with X?" or "is this really the right call?".

**Do NOT use** for:
- Trivial decisions (renaming a variable, formatting choices).
- Pure information retrieval (use Explore instead).
- Tasks where the user just wants the answer fast.

## The 6 roles

| Role           | Sigla | Mission                                                                                 |
|----------------|-------|-----------------------------------------------------------------------------------------|
| **Creator**    | C     | Defends the proposal. Articulates *why* it's the right call. Anchors the discussion.    |
| **Opposer**    | O     | Attacks the proposal. Hunts for regressions, edge cases, hidden coupling, premature abstraction, security holes, performance cliffs. |
| **Out-of-box** | X     | Proposes lateral alternatives the others wouldn't consider. Reframes the problem.       |
| **Investigator** | I   | Brings ground-truth facts: reads code, checks file:line claims, verifies migration safety, runs grep. No opinions — just verifiable evidence. |
| **Neutral**    | N     | Weighs trade-offs cold. Identifies the cheapest path that captures the most value.      |
| **Judge**      | J     | Delivers a verdict in 1–3 sentences with explicit rationale. Decides go / adjust / no-go. |

## Process

### Step 1 — Frame the question

Ask the user (or pull from context) for:
1. **The decision under review** — be specific. "Should we use X library?" not "Is this a good plan?".
2. **The constraints that matter** — deadline, budget, team familiarity, regulatory.
3. **What success looks like** — how will we know the chosen path was right?

If any are missing, use AskUserQuestion to fill them before running the council.

### Step 2 — Fan out the 6 roles in parallel

Spawn **6 subagents in a single message** (one Agent call per role) so they
deliberate independently without contaminating each other. Use the
`general-purpose` agent type unless the role needs read-only constraint (then
use `Explore` for Investigator).

**Prompt template** for each role — adjust the role-specific block:

```
You are the {ROLE_NAME} on an adversarial design council. The decision under
review is:

  {DECISION_STATEMENT}

Context the user provided:
  {CONSTRAINTS}
  {SUCCESS_CRITERIA}

Relevant artifacts (read these first):
  {FILE_PATHS, PLAN_PATHS, CODE_REFERENCES}

Your mandate as {ROLE_NAME}:
  {ROLE_MISSION — see table above}

Output requirements:
  - Under 400 words.
  - Lead with your position in one sentence.
  - Follow with 3–5 bullet points of evidence or reasoning.
  - End with "Open question for the Judge: ..." if you have one.
  - Cite file:line for any code claim.
  - Stay in role — do NOT play other roles. The Judge will synthesize.
```

Role-specific blocks:

- **Creator**: "Defend this proposal. Articulate why it's the right call given
  the constraints. Acknowledge the strongest counterargument and explain why
  your path still wins."
- **Opposer**: "Attack this proposal. Find at least 3 failure modes: a
  regression, an edge case, and a hidden coupling. Be specific — vague concerns
  don't count. Cite file:line."
- **Out-of-box**: "Propose at least 2 alternative paths the Creator wouldn't
  think of. Reframe the problem if useful. One alternative should be 'do
  nothing / defer' if it's defensible."
- **Investigator**: "Verify every factual claim in the proposal. Read the cited
  files. Grep for symbols. Report what's true, what's stale, what's missing.
  No opinions, just facts and file:line evidence."
- **Neutral**: "Compare the Creator's path against the Out-of-box alternatives
  on three axes: implementation cost, risk of regression, payoff. Recommend
  the path with the best ratio. Be cold about it."
- **Judge**: Spawn the Judge **after** the other 5 return — see Step 3.

### Step 3 — Run the Judge with the other 5 outputs as context

After collecting C, O, X, I, N responses, spawn the Judge with all 5 outputs
verbatim in its prompt:

```
You are the Judge on an adversarial design council. Five role-agents have
deliberated on this decision:

  {DECISION_STATEMENT}

Their verbatim outputs:

  === CREATOR ===
  {C_OUTPUT}

  === OPPOSER ===
  {O_OUTPUT}

  === OUT-OF-BOX ===
  {X_OUTPUT}

  === INVESTIGATOR (facts only) ===
  {I_OUTPUT}

  === NEUTRAL ===
  {N_OUTPUT}

Your job:
  1. Resolve any factual disputes using the Investigator's evidence as ground truth.
  2. Decide: GO (as proposed) / ADJUST (specify the change) / NO-GO (with reason).
  3. Output verdict in this exact shape:

     **Verdict**: GO | ADJUST | NO-GO
     **Rationale**: <1–3 sentences. Cite which roles convinced you and why.>
     **Action**: <The concrete next step. If ADJUST, the specific change.>
     **Open risks accepted**: <What we are knowingly accepting. None is a valid answer.>

Under 250 words. No hedging. The user needs a decision, not a summary.
```

### Step 4 — Present the council to the user

Format the final response to the user as:

```
# Council verdict — {DECISION_SHORT_NAME}

**Verdict**: {GO|ADJUST|NO-GO}
**Action**: {one line}

## Deliberation summary
- **Creator** argued: {1-line gist}
- **Opposer** raised: {1-line gist of strongest attack}
- **Out-of-box** proposed: {1-line gist of best alternative}
- **Investigator** confirmed/refuted: {1-line gist of key fact}
- **Neutral** recommended: {1-line gist of trade-off call}

## Judge's full ruling
{verbatim Judge output}

## Open risks accepted
{from Judge}
```

Keep the user-facing summary tight. The verbose role outputs stay in your
context; surface them only if the user asks "what did the Opposer say
exactly?".

### Step 5 (optional) — Persist to a plan

If the council was reviewing a plan file under `plans/`, append a new
`## Council review — YYYY-MM-DD` section to that plan with the Judge's
verdict and a 1-line summary per role. This creates a durable audit trail
for the project's design record.

## Variations

**Mini-council (3 roles)** — when the decision is small but non-trivial: run
only Opposer + Investigator + Judge. Skip Creator (the proposal is the
Creator), skip Out-of-box and Neutral.

**Per-decision council** — when reviewing a multi-decision plan (like the
Avali portal-aluno plan with DEC-1 through DEC-5), run one council per DEC
in a single Workflow fan-out. Each DEC gets 6 agents; verdicts collect into
a table.

**Code-change council** — for a PR/diff review: Creator = author defense,
Opposer = security + correctness review, Out-of-box = simpler alternative,
Investigator = test coverage + regression check, Neutral = revert vs. fix
forward, Judge = merge / request-changes / close.

## Anti-patterns

- ❌ Running all 6 in one agent ("be Creator then Opposer then..."). Roles
  contaminate each other. Always parallel, always separate.
- ❌ Letting the Judge see the proposal before the other 5 outputs. The Judge
  must synthesize from the deliberation, not pre-judge.
- ❌ Skipping the Investigator on plans that cite code. The whole council
  collapses if the facts are wrong.
- ❌ Long summaries. The Judge has to give a decision. Hedged verdicts are
  worse than wrong ones.
- ❌ Using the council for trivial choices. It costs ~6× the tokens of a
  single agent; reserve for load-bearing decisions.

## Example invocation (verbatim)

User: "Run a council on DEC-1 of the portal-aluno plan."

Assistant flow:
1. Read the plan, locate DEC-1, extract the decision statement and the
   alternatives already drafted.
2. Spawn 5 parallel agents (C, O, X, I, N) with the templates above.
3. Wait for all 5 to return.
4. Spawn the Judge with all 5 outputs in its prompt.
5. Present the Step 4 format to the user.
6. Offer to append the verdict to the plan file.
