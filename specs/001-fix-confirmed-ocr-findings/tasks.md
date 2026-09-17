# Tasks: Fix Confirmed OCR Security and Bug Findings

## Dependencies

User stories must be implemented in priority order:
- US1 (Critical Security) must complete before US2 (Critical Bugs)
- US2 (Critical Bugs) must complete before US3 (High Severity)

## Parallel Execution Opportunities

Each user story can be worked on independently by different team members with coordination at integration points.

## Implementation Strategy

MVP scope includes US1 (Critical Security) which addresses the most urgent vulnerabilities. Subsequent user stories build upon this foundation to address remaining bugs and security concerns.

## Phase 1: Setup

- [ ] T001 Set up development environment with security scanning tools
- [ ] T002 Configure secure credential storage for environment variables
- [ ] T003 Install and configure dependency security scanners (npm audit, etc.)

## Phase 2: Foundational Security Infrastructure

- [ ] T004 Implement centralized credential management utility
- [ ] T005 Set up Subresource Integrity (SRI) validation framework
- [ ] T006 Create input sanitization utility functions
- [ ] T007 Establish authentication validation middleware

## Phase 3: [US1] Critical Security Fixes

### Story Goal
Remove all hardcoded credentials and implement proper authentication to eliminate critical security vulnerabilities.

### Independent Test Criteria
- No hardcoded credentials remain in source code
- Authentication cannot be bypassed by client manipulation
- PII data is not accessible through client inspection

### Implementation Tasks

- [ ] T008 [US1] Remove hardcoded bearer token from src/lib/api.ts
- [ ] T009 [US1] Move API credentials to environment variables in src/lib/api.ts
- [ ] T010 [US1] Implement server-side authentication validation for login status
- [ ] T011 [US1] Replace client-side 'logged' flag with proper token validation
- [ ] T012 [US1] Remove farmer names from client-side admin components in frontend/src/components/admin-review/*.tsx
- [ ] T013 [US1] Implement server-side PII access control with proper authorization
- [ ] T014 [US1] Add actual access controls to restrict sensitive data operations
- [ ] T015 [US1] Remove misleading UI elements that suggest restrictions without enforcement

## Phase 4: [US2] Critical Bug Fixes

### Story Goal
Fix critical bugs affecting core functionality including card selection and GPS validation.

### Independent Test Criteria
- Card selection updates all relevant fields consistently
- GPS validation cannot be bypassed without explicit override
- All interactive elements have proper event handlers

### Implementation Tasks

- [ ] T016 [US2] Fix card selection state management to update all fields in frontend/src/components/admin-review/*.tsx
- [ ] T017 [US2] Ensure panel-farm-id and all other card details update together
- [ ] T018 [US2] Implement proper GPS validation enforcement in frontend/src/app/camera/page.tsx
- [ ] T019 [US2] Remove ability to bypass GPS validation with "Continue Upload" option
- [ ] T020 [US2] Add explicit override mechanism for GPS validation when required
- [ ] T021 [US2] Implement click handlers for approval/reject buttons in admin components
- [ ] T022 [US2] Add event handlers to all interactive elements missing them
- [ ] T023 [US2] Fix liff.getProfile() call to properly await in async contexts
- [ ] T024 [US2] Ensure all async functions are properly awaited throughout codebase

## Phase 5: [US3] High Severity Fixes

### Story Goal
Address high severity security and bug findings to improve overall application robustness.

### Independent Test Criteria
- XSS vulnerabilities eliminated through proper input sanitization
- External scripts have integrity attributes for security
- All forms and inputs are properly controlled and validated

### Implementation Tasks

- [ ] T025 [US3] Replace unsafe innerHTML usage with textContent or sanitized alternatives
- [ ] T026 [US3] Implement DOMPurify or similar for any necessary HTML rendering
- [ ] T027 [US3] Add SRI hashes to all external scripts in HTML templates
- [ ] T028 [US3] Add integrity attributes to script/link tags in HTML templates
- [ ] T029 [US3] Convert uncontrolled form inputs to controlled components
- [ ] T030 [US3] Add proper null/undefined checks throughout codebase
- [ ] T031 [US3] Connect hardcoded data to proper state management
- [ ] T032 [US3] Implement proper form submission handling with action/method/listeners
- [ ] T033 [US3] Add proper error handling for all critical operations

## Phase 6: [US4] Medium Severity and Polish

### Story Goal
Address medium severity findings and improve overall code quality and maintainability.

### Independent Test Criteria
- All medium severity issues from OCR report are addressed
- Code quality and maintainability improved
- Performance and accessibility concerns resolved

### Implementation Tasks

- [ ] T034 [US4] Refactor deeply nested ternary statements for readability
- [ ] T035 [US4] Add proper TypeScript types for better type safety
- [ ] T036 [US4] Add missing validation for form inputs and data processing
- [ ] T037 [US4] Improve state management for complex components
- [ ] T038 [US4] Add proper error boundaries for component failure handling
- [ ] T039 [US4] Implement proper accessibility attributes (ARIA labels, etc.)
- [ ] T040 [US4] Add performance optimizations for memory leaks and inefficiencies
- [ ] T041 [US4] Clean up unused imports and variables throughout codebase
- [ ] T042 [US4] Add proper documentation for complex code sections

## Phase 7: Testing and Validation

### Story Goal
Ensure all fixes are properly implemented and validated against original OCR findings.

### Independent Test Criteria
- All security vulnerabilities are remediated
- All critical bugs are fixed and functioning properly
- No regression in existing functionality
- Automated scans show acceptable security posture

### Implementation Tasks

- [ ] T043 Run automated security scan to verify critical vulnerability fixes
- [ ] T044 Perform manual testing of authentication and authorization flows
- [ ] T045 Test card selection functionality for proper state updates
- [ ] T046 Validate GPS validation cannot be bypassed inappropriately
- [ ] T047 Test all interactive elements for proper event handling
- [ ] T048 Run full application test suite to ensure no regressions
- [ ] T049 Verify all hardcoded credentials are removed from codebase
- [ ] T050 Document remaining findings as false positives if applicable