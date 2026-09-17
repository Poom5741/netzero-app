# Research: Admin Farmer Registration

## Decision: Backend API Endpoint Implementation
**Rationale**: Need to implement a POST endpoint at `/api/admin/farmers` that follows the existing admin authentication pattern and farmer creation logic.
**Alternatives considered**: 
- Reusing existing farmer creation endpoint - rejected because it would bypass admin authentication
- Creating a separate service - rejected because it would duplicate existing patterns

## Decision: Frontend UI Component
**Rationale**: Add an "Add Farmer" button to the existing admin farmers page with a modal form that includes all required farmer fields.
**Alternatives considered**:
- Separate page for farmer creation - rejected because it fragments the admin experience
- Inline form in the farmer list - rejected because it clutters the UI

## Decision: Phone Number Validation
**Rationale**: Implement validation on both client and server side using regex `/^0\d{9}$/` to ensure Thai phone format (10 digits starting with 0).
**Alternatives considered**:
- More lenient validation - rejected because the LINE flow expects this exact format
- Different format requirements - rejected because it would break the existing LINE integration

## Decision: Farmer ID Generation
**Rationale**: Use the format "farmer-{uuid}" where uuid is a properly formatted UUID string, following the existing pattern in the codebase.
**Alternatives considered**:
- Sequential IDs - rejected because they're predictable and potentially expose data
- Random strings - rejected because UUIDs are more standardized

## Decision: Audit Logging Implementation
**Rationale**: Log farmer creation activities using the existing audit logging mechanism with admin user ID, timestamp, and farmer details.
**Alternatives considered**:
- No audit logging - rejected because it violates the project constitution
- Separate logging system - rejected because it would duplicate existing functionality

## Decision: Rate Limiting Approach
**Rationale**: Implement rate limiting on the farmer creation endpoint using Cloudflare Workers KV namespace to track requests per admin user.
**Alternatives considered**:
- No rate limiting - rejected because it could allow abuse
- IP-based rate limiting - rejected because multiple admins might share IPs

## Decision: Rollback Mechanism
**Rationale**: Use database transactions to ensure atomic farmer creation - if any part of the process fails, the entire operation is rolled back.
**Alternatives considered**:
- Manual cleanup functions - rejected because they're error-prone
- No rollback mechanism - rejected because it could leave the database in inconsistent state

## Decision: Integration with Existing LINE Flow
**Rationale**: Ensure that farmers created via admin interface can immediately register via LINE by verifying they exist in the farmers table with the correct phone number format.
**Alternatives considered**:
- Separate process for admin-created farmers - rejected because it would complicate the LINE flow
- Special flags or status fields - rejected because it would require changes to the LINE flow