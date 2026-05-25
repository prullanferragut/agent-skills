# Design Spec: No-BS Skill Migration (Wheat Protocol)

**Objective:** Migrate high-context, narrative-heavy engineering skills (Chaff) into token-efficient, imperative instruction sets (Wheat) to minimize latency and maximize signal-to-noise ratio (SNR) for high-performance LLMs.

## 1. Architectural Strategy
- **Isolation:** All optimized skills reside in the `/wheat/` root directory.
- **Compatibility:** Maintain YAML frontmatter for existing `skill` tool discovery.
- **Vocabulary:** Enforce the "Mechanical Accuracy Protocol" via a global translation key.

## 2. The Wheat Transformation Algorithm (Rules)
Every `SKILL.md` must be processed through these filters:
1.  **Strip Narrative:** Delete "Overview", "Philosophy", "Tone", and "Why".
2.  **Compress Steps:** Convert workflows into strictly imperative, numbered lists.
3.  **Stability Anchors (Negative Prompting):** Explicitly list `PROHIBITED:` actions and `FAILURE_MODES:` to anchor the model. Use adversarial examples to show what a failed state looks like (e.g., "Failure: Asked 2 questions instead of 1").
4.  **Adversarial Edge Cases:** Include a `STRESS_TEST:` section for each skill naming specific conditions where the model is likely to drift (e.g., "User is being evasive", "Requirements are contradictory").
5.  **Token Pruning:** Replace verbose descriptions with domain-specific technical terms.
6.  **Remove Examples:** Delete multi-line code blocks unless they are structural templates.

## 3. Global Translation Key (README.wheat.md)
The wheat directory will contain a master key to align model "attention" with mechanical reality:
- **Agent/Subagent** -> Stateful Control Loop
- **Reasoning/Thinking** -> Chain-of-Thought / Token Sampling
- **Hallucination** -> Confabulation (Statistical Pathing Error)
- **Knowledge** -> Context Injection / RAG
- **Confidence** -> Predicted Probability / SNR

## 4. Migration Roadmap (Prioritization)
1.  **Core Loops (Phase 1):** `spec-driven-development`, `incremental-implementation`, `test-driven-development`.
2.  **Analysis Loops (Phase 2):** `debugging-and-error-recovery`, `doubt-driven-development`, `code-review-and-quality`.
3.  **Domain Clusters (Phase 3):** All remaining skills (UI, Security, API).

## 5. Success Criteria
- **Token Reduction:** >75% reduction in total byte count per skill file.
- **Verification:** 0-exit code from standard project verification tools (linters/tests) when using Wheat instructions.
- **Convergence:** Reduction in turns-to-completion for underspecified tasks.
