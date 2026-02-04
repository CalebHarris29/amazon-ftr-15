1. Purpose of This Audit

During Senior Project I, our team used Lovable.dev to rapidly generate a working prototype. While effective for speed, this approach introduced structural shortcuts (technical debt) and agentic workflow risks that must be addressed before scaling the system in Senior Project II.

This document serves as a project reset, identifying where our prototype is not production-ready and how we converted those findings into actionable backlog items on our GitHub Project Board.


| Area             | Finding                                                     |
| ---------------- | ----------------------------------------------------------- |
| State management | All data stored in React Context (`DemoContext`)            |
| Business logic   | Fraud scoring and status logic in `fraudLogic.ts`           |
| Pages            | Pages directly call `useDemo()` and `generateMockReturns()` |
| API layer        | **None**                                                    |
| Tests            | **None**                                                    |
| CI               | **None**                                                    |
| Docs             | README is Lovable-centric, not system-centric               |
| Type safety      | TypeScript strict mode off, console allowed                 |
| Status logic     | Duplicated in 3 places                                      |


| Item                             | Category      | Description                                            | Remediation                   |
| -------------------------------- | ------------- | ------------------------------------------------------ | ----------------------------- |
| Frontend acting as backend       | Architectural | Pages use DemoContext and mock data as source of truth | Introduce service/API layer   |
| Duplicate status logic           | Architectural | Status display logic repeated in multiple files        | Centralize into single helper |
| No automated tests               | Test          | No verification for fraud logic or workflow            | Add Vitest + RTL tests        |
| Documentation not system-centric | Documentation | README focused on Lovable, not system                  | Rewrite README + traceability |
| Weak type safety & lint          | Architectural | Strict mode off, console allowed                       | Enable strict TS + lint rules |




| Risk Area                   | Risk                                | Why It Matters                              | Mitigation                           |
| --------------------------- | ----------------------------------- | ------------------------------------------- | ------------------------------------ |
| Reliability / Hallucination | Mock data appears real              | Agents/humans may treat UI as authoritative | Add demo labeling + real data layer  |
| Security & Ethics           | No validation layer                 | Future APIs/user content unsafe             | Add validation/sanitization boundary |
| Dependency Risk             | No CI or version control discipline | Environment drift and breakage              | Add CI, lockfile, Node version       |



| Issue                   | Labels                   | Goal                                 |
| ----------------------- | ------------------------ | ------------------------------------ |
| Introduce service layer | technical-debt, refactor | Separate UI from data logic          |
| Centralize status logic | technical-debt, refactor | Single source of truth for statuses  |
| Add test infrastructure | technical-debt, testing  | Enable verification before refactors |


| VIBE    | How this audit supports it             |
| ------- | -------------------------------------- |
| Verify  | Tests + CI + type safety               |
| Improve | Centralized logic and documentation    |
| Build   | API/service boundaries                 |
| Execute | Reduced agentic and architectural risk |
