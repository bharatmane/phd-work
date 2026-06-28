Abstract— Human-Computer Interaction is shifting from the direct manipulation of visible interfaces toward delegation within invisible, prompt-driven, multi-agent AI systems. The dominant industry response to this shift has been transparency: show the user what the agent is doing, and trust will follow. We argue this response is built on an unexamined assumption, and that recent empirical evidence contradicts it. A 2026 study of action-trace interfaces for AI agent oversight found that giving users a visible trace of agent reasoning raised their *confidence* in their decisions without raising their *accuracy* — users felt more certain while catching no more errors. We call this the **Legibility Trap**: passive visibility into a system's "seams" produces the feeling of control without the substance of it, and may worsen automation bias rather than correct it. We argue that what closes the gap between confidence and accuracy is not visibility but *forced engagement* — interaction designed to require the user to act on what they see, not merely observe it. We term this distinction **Strategic Friction**: a class of interface mechanisms that convert passive disclosure into active checkpoints. We operationalize this through **Delegation Contracts**, a concrete interaction pattern in which a user and an agent negotiate explicit scope, authority, and recovery terms before a task proceeds, and through five revised usability heuristics for agentic interfaces. This paper positions itself explicitly on top of recent empirical work on multi-agent transparency and oversight, extending it with a design-theoretic distinction the existing literature has not yet drawn, and a concrete mechanism the existing literature has not yet proposed.

# The Friction Paradox: Designing Active Friction for Trustworthy Agentic Interfaces

## 1. Introduction & The Paradigm Shift to UX 3.0

### 1.1 The Post-GUI Transition

For three decades, HCI rested on direct manipulation and visual consistency (Shneiderman, 1983). The GUI, maturing across desktop (UX 1.0) and mobile (UX 2.0) computing, reduced friction by translating code into deterministic, spatial, persistent objects — buttons, menus, fields — where every action produced an immediate, legible state change. Nielsen's (1994) usability heuristics codified this world: system status stays visible, because the canvas is always there to show it.

That world is receding. A decade of HCI work — voice interaction studies (Porcheron, Reeves, Sharples, & Fischer, 2018), critiques of conversational expectation gaps (Luger & Sellen, 2016), and design guidelines for AI-infused systems (Amershi et al., 2019) — has tracked a steady migration away from persistent visual canvases. Each wave showed the same pattern: removing the screen does not remove the interaction problem, it relocates it. Voice didn't simplify interaction; it moved the burden into turn-taking and conversational repair. Predictive, screen-light systems didn't make capability obvious; they made it something the user had to infer.

### 1.2 The Agentic Rupture

Since 2023, frontier LLMs and multi-agent pipelines have pushed this migration further than voice ever did. Interaction is no longer query-and-response; it is delegation. The user states an objective; an orchestrating system plans, executes, monitors, and self-corrects across tools, APIs, and sub-agents the user never sees directly. Recent design-research surveys of these systems (Schömbs, Zhang, Goncalves, & Johal, 2025) describe this explicitly as a shift in the user's role from operator to "composer" — someone who sets direction for a system whose internal coordination remains largely opaque.

This is not a hypothetical future. Schömbs et al. (2025) and a 2026 study on agent oversight (Grunde-McLaughlin et al., 2026) both treat opacity in multi-agent systems as a live, unsolved HCI problem — not a speculative one. Our contribution starts from their empirical ground, not in spite of it.

### 1.3 The Thesis Statement

The industry's working answer to this opacity has been transparency: surface the agent's reasoning, show its confidence, expose its plan. This is a reasonable instinct, and it is also, on the evidence, insufficient. Grunde-McLaughlin et al. (2026) gave users action traces of an AI agent's steps and tested whether this helped them catch errors. It helped them *feel* more confident in their decisions. It did not make their decisions more accurate. Visibility and judgment improved on different axes — confidence moved, accuracy didn't.

We call this the **Legibility Trap**: the assumption that showing a system's seams is functionally equivalent to giving a user the means to catch its mistakes. It treats transparency as if it were friction, when it is closer to decoration — informative, but not load-bearing. A user who sees a trace they don't act on has gained a feeling, not a check.

We argue the missing ingredient is not more visibility but *designed obligation*: interaction moments that require the user to evaluate, confirm, or redirect before the system proceeds, rather than moments that merely inform them. We call this distinction **Strategic Friction** — friction that is active rather than passive, and that is deliberately placed at the points where an autonomous system's confidence and its actual reliability are most likely to diverge.

***

## 2. The Illusion of Effortless Computing: The Metacognitive Burden

### 2.1 The Feed-Forward Deficit

Classical interface design bridges intent and capability through Feed-Forward — affordances that show what's possible before the user acts (Djajadiningrat, Overbeeke, & Wensveen, 2002). A GUI's dropdown menus and grayed-out buttons map the boundaries of the system's functional universe without the user needing to guess. When the interface collapses to a blank prompt bar or an ambient microphone, that map disappears. The user must now hold a private, constantly-stale mental catalog of "what this thing can do" — a problem voice-interaction research has documented for a decade (Luger & Sellen, 2016) and that prompt-based systems have inherited rather than solved.

```
THE FEED-FORWARD DEFICIT
─────────────────────────────────────────────────────────────
Traditional GUI (high feed-forward)
  Persistent buttons → visible constraints → clear capabilities

Agentic, prompt-driven UI (deficit)
  Invisible prompt   → zero affordances     → guesswork, anxiety
```

### 2.2 The Gulf of Evaluation in Probabilistic Systems

Norman (1986) defined the Gulf of Evaluation as the effort required to interpret a system's state against the user's expectations. In a GUI, this gulf is narrow — a checked box shows a checkmark. In an agentic system, a single ambiguous request ("optimize my quarterly budget") triggers an unknown number of hidden steps before producing one synthesized result. Because the intermediate reasoning is hidden, the gulf widens sharply, and the user is left to audit an output they did not watch get produced — a demand on attention and judgment that Tankelevitch et al. (2024) term *metacognitive load*: the user must monitor, evaluate, and decide whether to trust a process they cannot see.

### 2.3 Prompting as Cognitive Overstretch

The industry markets natural-language prompting as the most intuitive interface yet built. Zamfirescu-Pereira, Wong, Hartmann, and Yang (2023) found the opposite in practice: non-experts struggle to predict how a model will interpret their wording, and end up doing the work of an ad hoc systems engineer — embedding constraints and hedges into plain text — without the tools a real systems engineer would have. Three demands stack on top of each other here: translating a vague goal into precise language, predicting how the system will read that language, and tracking context across turns the system might silently drop. None of this is reduced by removing the screen; it is just renamed "simple."

***

## 3. The Automation Threat: Cognitive Deskilling and Agency Loss

### 3.1 Asymmetric Co-Agency

In direct manipulation, agency is symmetrical: the user acts, the system responds immediately. In agentic delegation, the user states a goal and the system independently plans sub-tasks, selects tools, and routes data — often across remote services the user has no direct visibility into. Schömbs et al. (2025) describe the resulting orchestration layer as fundamentally opaque to the end user by design, not by accident: that opacity is what makes the system feel like a single coherent agent rather than a committee.

### 3.2 The Mechanism of Cognitive Deskilling

A GUI workflow, however optimized, still requires the user to touch the intermediate steps — sorting, cross-referencing, sequencing. That contact is what keeps domain knowledge alive. When an agent absorbs the intermediate steps entirely, the user only ever sees inputs and outputs, and the loop that reinforces expertise breaks. Over months of reliance, this risk compounds quietly: the skill required to catch a bad output is the same skill that's eroding from disuse.

### 3.3 The Auditing Crisis

This produces a structural paradox: the more autonomous and opaque a system becomes, the more rigorous an audit it requires — and the same opacity that makes auditing necessary is what erodes the user's ability to perform one. Grunde-McLaughlin et al.'s (2026) finding gives this paradox empirical teeth: even when given a trace to audit *with*, users' accuracy didn't move. If deskilled, distracted users are handed visibility without obligation, the most likely outcome is not better auditing — it's more confident rubber-stamping.

***

## 4. From Legibility to Active Friction

### 4.1 The Seamful Design Legacy

Chalmers and MacColl (2003) argued against the industry's pursuit of seamlessness, on the grounds that hiding a system's limitations and infrastructure doesn't remove them — it just removes the user's ability to work around them. Their answer, Seamful Design, was to make those boundaries visible on purpose. This was the right instinct twenty years before agentic AI existed, and it is the right starting point now. But it is a starting point, not a finishing line — and recent evidence shows where it runs out.

### 4.2 The Legibility Trap

Grunde-McLaughlin et al. (2026) built exactly the kind of seamful interface this tradition calls for: an action trace exposing what a Computer User Agent had done, intended for verification. Users who saw it reported higher confidence in their decisions. Their actual error-finding accuracy was statistically unchanged. The trace was real, the seam was visible, and it didn't close the evaluation gap it was built to close.

This is the central evidence behind our argument: *legibility and judgment are not the same variable.* A visible trace can be read passively — skimmed for reassurance rather than interrogated for fault. Nothing in a passive trace requires the user to do anything with what they see. The seam was seamful; it just wasn't a checkpoint.

### 4.3 Defining Strategic Friction

We define **Strategic Friction** as interface mechanisms that convert a moment of disclosure into a moment of required action — a point where the system cannot proceed until the user has done something more committal than looking. This is a narrower, more falsifiable claim than "make the system transparent." It predicts that disclosure paired with an obligatory checkpoint (confirm, redirect, or reject before continuing) will outperform disclosure alone on the accuracy measure where Grunde-McLaughlin et al. found passive traces did not move the needle. That is a testable hypothesis, not a slogan, and Section 7 returns to how it could be tested.

Strategic Friction is not a reintroduction of mechanical annoyance. It is selective: it activates where an agent's confidence and its actual reliability are most likely to diverge, and stays out of the way everywhere else.

***

## 5. Operationalizing Active Friction

### 5.1 Delegation Contracts

Prompt-engineering research has mostly tried to make a single instruction better-specified — clearer wording, better examples, more structure. That helps the model, not the user's ability to govern what happens next. We propose a different unit of design: the **Delegation Contract** — an explicit, negotiated agreement between user and agent, established before a multi-step task proceeds, with seven elements:

1. **Goal** — the outcome the user actually wants, distinct from the literal request.
2. **Scope** — which tools, data, and domains the agent may touch.
3. **Authority** — what the agent may do without asking again.
4. **Constraints** — budget, time, compliance, or preference limits that bound any plan.
5. **Checkpoints** — the specific moments requiring explicit user approval before continuing.
6. **Evidence** — what reasoning or sources the agent must surface to support a contested step.
7. **Recovery** — how to undo, roll back, or escalate if something goes wrong.

A contract is friction by construction: scope and checkpoints cannot be set passively. The user has to decide them, which is exactly the kind of forced engagement Section 4 argues a passive trace does not produce. Unlike a prompt, a contract persists across the task and can be referenced, revised, or paused mid-execution.

### 5.2 Three Friction Primitives

Within a contract's checkpoints, three concrete patterns instantiate Strategic Friction:

**Semantic Speedbumps.** Before a multi-step action begins, the system shows its interpretation of the request and waits for confirmation: *"I've interpreted your goal as modifying 400 entries across 3 tables. Confirm or refine."* This is a checkpoint, not a status update — execution is blocked until the user responds.

**Predictive Confidence Mapping.** Where an agent's plan depends on a guess rather than a fact, the interface flags that specific step rather than the whole output — directing the user's limited auditing attention to exactly the place where Grunde-McLaughlin et al.'s gap between confidence and accuracy is most likely to bite.

**Structural Disclosures.** When an orchestrator splits a task across sub-agents, the interface renders the delegation path as a navigable structure, not a static trace — letting the user inspect or intervene at a specific node rather than only review the finished chain after the fact. This is the difference between a log (passive) and a control surface (active), and it is where this paper extends rather than restates Schömbs et al. (2025), who identify the need for this kind of visibility into orchestration but stop short of proposing the contract-and-checkpoint mechanism that would make it actionable.

```
PASSIVE LEGIBILITY              ACTIVE FRICTION
────────────────────────────────────────────────────
Action trace (view-only)   →    Semantic speedbump (blocks until confirmed)
Confidence score (display)  →    Confidence-targeted checkpoint (forces review)
Execution log (after the    →    Structural disclosure (intervene mid-task,
  fact)                            at the specific failing node)
```

***

## 6. Building on the Multi-Agent Accountability Literature

When a tiered pipeline fails — an orchestrator misreads context, a planner builds on a corrupted parameter, an executor acts on it — the user typically sees only the final failure, not its origin. Schömbs et al. (2025) name this orchestration opacity as an open HCI challenge and propose interface directions such as conversation graphs and activity maps to address it. Grunde-McLaughlin et al. (2026) build and test one such direction directly, and find that visibility alone — their action trace — raises confidence without raising accuracy.

Read together, these two papers establish that (a) the field already recognizes multi-agent opacity as unsolved, and (b) at least one well-designed visibility intervention doesn't fully solve it. Our contribution sits on top of both findings rather than against them: where they show that a trace is not sufficient, we argue why — passive disclosure doesn't require action — and propose the missing piece. A **Distributed Culpability checkpoint**, built from the same data their action traces expose, differs only in one respect: when a failure is detected, it pauses the pipeline at the specific failing node and requires a decision (re-authorize, redirect, or escalate) before anything downstream resumes. The data is the same; the obligation attached to it is not.

***

## 7. Heuristics for Agentic Interface Governance

Nielsen's (1994) heuristics assume a persistent, hand-built canvas. Generative, ephemeral, agent-rendered interfaces violate that assumption directly — a layout that exists only for one task, then evaporates, can't rely on muscle memory or fixed navigation. We propose five heuristics built for this condition, each distinguishing passive disclosure from the active obligation Section 4 argues actually matters:

**H1 — Explicit Boundary Feed-Forward.** The system states its current operational limits before the user formulates a request, not after a failed one. *Passive version: a help page. Active version: the limit appears inline, at the moment it's relevant.*

**H2 — Proactive Intention Grounding.** Before a multi-step task runs, the system mirrors its interpretation of the goal back to the user as something to be confirmed, not just displayed.

**H3 — Calibrated Friction, Not Calibrated Disclosure.** The interface scales how much it *requires* of the user — not just how much it *shows* them — to the task's stakes and the agent's actual uncertainty. Low-stakes, high-confidence actions stay frictionless; high-stakes or low-confidence ones force a checkpoint, per Section 4.3.

**H4 — Node-Level Recovery.** On failure, the user can intervene at the specific sub-agent that broke, per Section 6's Distributed Culpability checkpoint, rather than restarting the entire task.

**H5 — Friction That Preserves Skill.** Some checkpoints exist specifically to keep the user practicing judgment the system could technically make for them — a deliberate tax on full automation, paid to keep human oversight real rather than ceremonial.

***

## 8. A Research Agenda

### 8.1 Testing the Legibility/Friction Distinction Directly

Section 4.3's claim is falsifiable, and should be tested as such: a controlled comparison of (a) no disclosure, (b) passive disclosure (Grunde-McLaughlin et al.'s action trace condition), and (c) active friction (the same information gated behind a required checkpoint), measured on accuracy, not just confidence. If active friction doesn't outperform passive disclosure on accuracy, the central claim of this paper is wrong, and that would be worth knowing.

### 8.2 Longitudinal Trust, Not Single-Session Trust

Most trust measurement in this space — including post-failure trust studies (Baughan, Wang, Liu, Mercurio, & Chen, 2023) — is cross-sectional. Agentic systems are always-on; trust in them is a trajectory, not a snapshot. Field deployments tracking the same users across months, through at least one real failure, would show whether Strategic Friction helps trust recover after a mistake or just slows the user down before one occurs.

### 8.3 Measuring the Cost of Friction

Friction has a price: time, irritation, abandonment. Any serious evaluation of Strategic Friction has to measure that cost against the accuracy gain, not just demonstrate the gain exists. Eye-tracking and think-aloud protocols during checkpoint moments would show whether users are actually evaluating at a Semantic Speedbump or just clicking through it — the same passive-engagement failure mode this paper argues against, recreated inside the fix itself if the checkpoint is designed badly.

***

## 9. Conclusion

The shift from GUI to voice, prompting, and autonomous agents is real, and the industry's default response — make the system transparent — is a reasonable first move that the evidence shows is not a sufficient one. Grunde-McLaughlin et al. (2026) demonstrated this directly: visibility raised confidence without raising accuracy. That gap is the actual problem this paper addresses. Strategic Friction, operationalized through Delegation Contracts and a small set of design primitives, is a concrete answer to a question the literature has only recently learned to ask precisely: not "can the user see what the agent is doing," but "is the user ever required to act on what they see." Closing that gap — not just opening the seam — is the work ahead.

***

## 10. References

* Amershi, S., Weld, D., Vorvoreanu, M., Fourney, A., Nushi, B., Collisson, P., Suh, J., Iqbal, S., Bennett, P. N., Inkpen, K., Teevan, J., Kikin-Gil, R., & Horvitz, E. (2019). Guidelines for human-AI interaction. In *Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems* (pp. 1–13).
* Baughan, A., Wang, X., Liu, A., Mercurio, A., & Chen, J. (2023). A mixed-methods approach to understanding user trust after voice assistant failures. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems* (pp. 1–17).
* Chalmers, M., & MacColl, I. (2003). Seamful and seamless design in ubiquitous computing. Equator Technical Report Equator-03-005.
* Djajadiningrat, T., Overbeeke, K., & Wensveen, S. (2002). But how, fast forward or rewind? Ordering mechanisms and affordances. In *Proceedings of the 4th Conference on Designing Interactive Systems* (pp. 341–345).
* Grunde-McLaughlin, M., et al. (2026). Overseeing agents without constant oversight: Challenges and opportunities. *arXiv:2602.16844*.
* Luger, E., & Sellen, A. (2016). "Like having a really bad PA": The gulf between user expectation and experience of voice assistants. In *Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems* (pp. 5286–5297).
* Nielsen, J. (1994). Heuristic evaluation. In *Usability Inspection Methods* (pp. 25–62). John Wiley & Sons.
* Norman, D. A. (1986). Cognitive engineering. In *User Centered System Design* (pp. 31–61).
* Porcheron, M., Reeves, S., Sharples, S., & Fischer, J. E. (2018). Voice interfaces in everyday life. In *Proceedings of the 2018 CHI Conference on Human Factors in Computing Systems* (pp. 1–12).
* Schömbs, S., Zhang, Y., Goncalves, J., & Johal, W. (2025). From conversation to orchestration: HCI challenges and opportunities in interactive multi-agentic systems. In *Proceedings of the 13th International Conference on Human-Agent Interaction*.
* Shneiderman, B. (1983). Direct manipulation: A step beyond programming languages. *IEEE Computer*, 16(8), 57–69.
* Tankelevitch, L., Kewenig, V., Simkute, A., Scott, A. E., Sarkar, A., Sellen, A., & Rintel, S. (2024). The metacognitive demands and opportunities of generative AI. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems* (pp. 1–24).
* Zamfirescu-Pereira, J. D., Wong, R. Y., Hartmann, B., & Yang, Q. (2023). Why Johnny can't prompt: How non-AI experts try (and fail) to design LLM prompts. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems* (pp. 1–21).
