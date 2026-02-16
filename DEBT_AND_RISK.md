Senior Project II – Deliverable 2
Team 15

Purpose of This Audit

During Senior Project I, our team used Lovable.dev to rapidly generate a working prototype. While effective for speed and demonstration, this approach optimized for immediate visual output rather than structural integrity. As we transition into Senior Project II, our role shifts from feature builders to system orchestrators.

This audit identifies structural weaknesses introduced by AI scaffolding and converts them into actionable backlog items to support production readiness, architectural modularity, and secure agentic collaboration.

Part 1 – Technical Debt Audit
1. Frontend Acting as Backend

Category: Architectural Debt

Description:
The current system stores and processes all return data within React Context (DemoContext). Business logic such as fraud scoring and status mutation is implemented inside frontend utilities (fraudLogic.ts). Pages directly call useDemo() and generateMockReturns() and mutate application state without an API boundary or persistence abstraction.

This creates a monolithic architecture where UI, business logic, and state management are tightly coupled. While acceptable for a prototype, this structure prevents scalability, makes backend integration difficult, and violates separation-of-concerns principles required for production systems.

Remediation Plan:
Introduce a dedicated service layer (src/services/returnsService.ts) that becomes the single source of truth for return retrieval, mutation, and fraud evaluation. Refactor all UI components to consume this service rather than directly accessing context state.

2. Duplicate Status Display Logic

Category: Architectural Debt

Description:
Status-to-display mappings (approved, flagged, rejected, inspecting, pending) are duplicated across multiple files. Icon, color, and label definitions are scattered across UI pages and utility logic.

This creates multiple sources of truth, increasing maintenance cost and risk of inconsistency when workflow logic changes.

Remediation Plan:
Centralize status definitions in a shared module (statusDisplay.ts) and refactor all UI components to import from this configuration.

3. No Automated Tests

Category: Test Debt

Description:
The repository lacks a test runner, unit tests, or integration tests. Fraud logic and workflow transitions cannot be verified before refactoring. In an AI-augmented workflow, this is particularly dangerous because generated code may introduce silent regressions.

Remediation Plan:
Integrate Vitest and React Testing Library. Add initial unit tests for fraud scoring logic and workflow state transitions. Prepare for CI integration.

4. Documentation Not System-Centric

Category: Documentation Debt

Description:
Current documentation focuses on Lovable.dev usage rather than system architecture, deployment instructions, and traceability to capstone requirements. This weakens maintainability and reduces transparency of system design.

Remediation Plan:
Rewrite README to include:

System architecture overview

Service boundaries

Local setup instructions

Feature-to-requirement traceability

5. Weak Type Safety and Lint Rules

Category: Architectural Debt

Description:
TypeScript strict mode is disabled and console logging is allowed. This reduces compile-time verification and increases runtime bug risk.

Remediation Plan:
Enable TypeScript strict mode, enforce no-console rule in production builds, and resolve resulting type violations.
