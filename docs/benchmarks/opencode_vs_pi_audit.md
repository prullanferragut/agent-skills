# Audit: Safety, Trust, and the Bridge from Opencode to Pi

**Date:** 2026-05-27
**Subject:** Comparative analysis of safety mechanisms and feature-parity strategy.

## 1. Safety & Trust: Structural vs. Implicit Guardrails

The primary reason you "trust" Opencode not to erase your computer is its **Structural Permission System**.

### Opencode: The "Ask First" Architecture
In Opencode, safety is not a suggestion; it is a requirement of the `Tool.execute` signature.
- **`assertExternalDirectoryEffect`:** Every file-touching tool (read, write, edit, patch) is wrapped in this effect.
- **The `ctx.ask()` Gate:** Before a tool even starts its work, it must yield an `ask` effect. This triggers a Human-in-the-loop (HITL) UI prompt.
- **Instance Isolation:** Opencode has a formal concept of an `Instance`. If a path isn't in `ins.directory`, the tool **cannot** proceed without an explicit permission token.
- **Effect-level Enforcement:** Because it uses the `Effect` framework, if the permission service isn't provided or the "ask" fails, the entire tool execution is aborted at the runtime level.

### Pi: The "Context & Capability" Architecture
Pi's safety is more **Implicit** and depends on the harness configuration.
- **Tool-Level Isolation:** Pi tools (like `read` and `bash`) generally operate relative to the `cwd` (Current Working Directory). 
- **System Prompt Guardrails:** Pi relies heavily on the underlying model's "Safety Alignment" and specific system instructions to prevent destructive behavior.
- **Trust Gap:** Pi feels "faster" because it doesn't interrupt you with as many permission prompts, but this is exactly what creates the "trust deficit" you mentioned. You don't *see* the gate, so you don't know it's there.

---

## 2. The "Bridge" Strategy: Getting the Good Stuff without the Weight

You can have Opencode's superpowers in Pi without the 21k token "tax" and the `Effect` complexity.

### Port 1: The "Trust Bridge" (Safety)
To gain Opencode-level trust in Pi, we don't need `Effect`. We need a **Permission Middleware**.
- **The Plan:** Implement a simple TypeScript wrapper for Pi's `bash`, `write`, and `edit` tools.
- **Logic:** Before executing the command, check if the target path is outside a "Safe List." If it is, use Pi's `question` tool to halt and ask: *"I am about to touch a file outside your project. Proceed?"*
- **Result:** You get the same "External Directory" protection as Opencode, but in plain, readable TypeScript.

### Port 2: The "Utility Bridge" (Websearch)
Opencode's `websearch` is powerful because it's a first-class citizen in the toolset.
- **Pi's Solution:** Pi already supports extensions. We can ensure the `pi-web-access` skill/tool is always active. 
- **The "Better" Websearch:** Instead of Opencode's custom search logic, Pi can use dedicated Search APIs (like Tavily or Exa) via simple tools that return clean Markdown.
- **Prompt Forms:** The "UI Forms" in Opencode are largely for the human. For the *model*, structured `.txt` prompt templates (which Pi already supports via `prompt-templates.md`) are the functional equivalent.

### Port 3: The "Accuracy Bridge" (Fuzzy Edits)
- **The Plan:** Take the `BlockAnchorReplacer` logic from Opencode's `edit.ts`.
- **Logic:** Port the Levenshtein distance and "First-line/Last-line anchor" matching into a Pi extension.
- **Result:** Pi becomes as resilient to "minor file drifts" as Opencode, preventing the "I can't find that string" errors that plague leaner agents.

---

## 3. Final Comparison for Decision Making

| Feature | Opencode (Chaff) | Pi + "Bridge" (Wheat) |
| :--- | :--- | :--- |
| **Trust** | **Built-in** (via `Effect` & `ask`) | **Configurable** (via Middleware/Questions) |
| **Websearch** | **Powerful** (Integrated) | **Powerful** (via Extensions) |
| **UI** | **Rich** (Forms/Buttons) | **Lean** (CLI/TUI) |
| **Speed** | **Slow** (21k token startup) | **Instant** (<1k token startup) |
| **Maintenance**| **Difficult** (Framework-heavy) | **Easy** (Vanilla TS) |

**Conclusion:**
Opencode's "superpowers" are actually just **well-defined utility functions** trapped inside a **heavy framework**. By porting the *logic* of the safety gates and the search tools to Pi, you can eliminate 90% of the "cumbersomeness" while retaining 100% of the "Trust and Power."
