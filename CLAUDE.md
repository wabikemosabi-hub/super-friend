@AGENTS.md

## Project workflow

- Start by reading `HANDOFF.md` for the current state, the decisions made, and the next steps.
- **Strict red → green → refactor TDD.** Write a failing test first and run it to see it fail. Then write the minimum code to pass, then refactor. No feature or fix lands without unit tests; aim for thorough coverage. This includes pgTAP tests for every RPC and RLS policy and `deno test` for edge functions.
- Playwright end-to-end tests against the web build are planned.
