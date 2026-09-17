# Feature Specification: Admin Farmer Registration

**Feature Branch**: `011-admin-farmer-registration`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Enable admins to register new farmers via the admin dashboard, so farmers can complete LINE registration without requiring database-level intervention."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Adds New Farmer (Priority: P1)

As an admin, I want to add new farmers to the system through the admin dashboard, so that farmers can register via LINE without requiring database-level intervention.

**Why this priority**: This is the core functionality that enables the entire feature - without it, farmers cannot register via LINE unless manually added to the database.

**Independent Test**: Admin can successfully create a new farmer through the dashboard UI, and that farmer can immediately register via LINE using their phone number.

**Acceptance Scenarios**:

1. **Given** admin is on the farmers dashboard page, **When** admin clicks "Add Farmer" button and fills in required fields (name, phone), **Then** farmer is created successfully and appears in the farmer list
2. **Given** admin attempts to add a farmer with an existing phone number, **When** admin submits the form, **Then** system shows error message "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" (Phone number already in use)
3. **Given** admin enters invalid phone format, **When** admin submits the form, **Then** system shows error message "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมีความยาว 10 หลัก)" (Invalid phone format - must start with 0 and be 10 digits)

---

### User Story 2 - Farmer Registers via LINE After Admin Creation (Priority: P1)

As a farmer who has been added by an admin, I want to be able to register via LINE chat using my phone number, so that I can participate in the NetZeroCarbon program.

**Why this priority**: This validates that the admin creation successfully integrates with the existing LINE flow, which is the ultimate goal.

**Independent Test**: A farmer created by an admin can immediately register via LINE using their phone number and proceed through the existing flow.

**Acceptance Scenarios**:

1. **Given** admin has created a farmer with phone number, **When** farmer sends their phone number to the LINE bot, **Then** system recognizes the farmer and allows them to proceed with registration
2. **Given** farmer was created by admin but hasn't registered via LINE yet, **When** farmer sends their phone number to the LINE bot, **Then** system treats them the same as any existing farmer in the database

---

### User Story 3 - Admin Views Farmer Details (Priority: P2)

As an admin, I want to see all farmer information including those I've added, so that I can manage and verify farmer data.

**Why this priority**: This ensures that farmers created via admin interface are properly integrated into the existing admin dashboard experience.

**Independent Test**: Farmers created via admin interface appear in the farmer list and can be viewed with all their details.

**Acceptance Scenarios**:

1. **Given** admin has created a farmer, **When** admin views the farmer list, **Then** the newly created farmer appears in the list
2. **Given** admin has created a farmer, **When** admin clicks "View Details" for that farmer, **Then** all farmer information is displayed correctly

---

### Edge Cases

- What happens when admin enters a phone number that doesn't match the required format (10 digits, starts with 0)?
- How does system handle concurrent admin attempts to add the same farmer with identical phone number? (Should be prevented by database unique constraint)
- What happens if admin tries to add a farmer with a very long name or other edge case input?
- How does the system handle network failures during farmer creation?
- What is the expected behavior when the farmer creation process encounters a database constraint error?
- What happens to farmers created by admin but never registered via LINE? (Should they be purged after a certain time?)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Add Farmer" button on the admin farmers dashboard page
- **FR-002**: System MUST validate phone number format on both client and server side (10 digits, starts with 0)
- **FR-003**: System MUST enforce phone number uniqueness across all farmers in the database
- **FR-004**: System MUST return appropriate error messages in Thai when validation fails
- **FR-005**: System MUST create a new farmer record in the database when validation passes
- **FR-006**: System MUST generate a unique farmer ID using the format "farmer-{uuid}" where uuid is a properly formatted UUID string
- **FR-007**: System MUST ensure newly created farmers can immediately register via LINE using their phone number
- **FR-008**: System MUST authenticate admin users before allowing farmer creation using existing admin authentication middleware
- **FR-009**: System MUST return HTTP 201 Created status when farmer is successfully created
- **FR-010**: System MUST return HTTP 409 Conflict when phone number already exists
- **FR-011**: System MUST return HTTP 400 Bad Request when validation fails
- **FR-012**: System MUST refresh the farmer list after successful creation to show the new farmer
- **FR-013**: System MUST log farmer creation activities in the audit log with admin user ID, timestamp, and farmer details
- **FR-014**: System MUST sanitize all input fields to prevent injection attacks during farmer creation
- **FR-015**: System MUST implement rate limiting on farmer creation endpoint to prevent abuse
- **FR-016**: System MUST provide rollback mechanism to handle partial failures during farmer creation process

### Key Entities

- **Farmer**: Represents a farmer in the system with attributes including full_name, gender, phone (unique), address fields (province, district, subdistrict, village), and timestamps
- **Admin User**: Represents an authenticated administrator who has permission to create new farmers
- **LINE Registration Flow**: The existing chatbot flow that verifies farmer phone numbers against the database

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can successfully create new farmers in under 2 minutes including form completion and validation
- **SC-002**: 100% of farmers created by admins can immediately register via LINE using their phone number
- **SC-003**: Phone number validation catches 100% of invalid formats before attempting database insertion
- **SC-004**: Admin dashboard shows real-time updates with newly created farmers appearing immediately after creation
- **SC-005**: System prevents duplicate phone number creation with 100% accuracy, showing appropriate error messages

## Clarification Responses

- **Farmers created by admin but never registered via LINE**: These farmers will remain in the system indefinitely. A separate purge policy may be implemented later if needed, but for now, any farmer created by admin should be expected to eventually register via LINE.
- **Admin role-based permissions**: Any admin user with appropriate privileges can create farmers. The feature will use existing admin role patterns and permissions as defined in the system.
- **Additional farmer fields**: Admins should be able to set all farmer fields during creation, not just name and phone. This includes gender, address fields (province, district, subdistrict, village), and any other applicable farmer information.
- **Database constraint errors**: When the farmer creation process encounters a database constraint error, the system will return an appropriate HTTP error response (409 Conflict for unique constraint violations, 500 for other constraint errors) with a clear error message.

## Assumptions

- Admin users already have authentication and authorization mechanisms in place that can be reused
- The existing LINE flow (handlePhone function) works correctly and doesn't need modification (but integration with newly created farmers will be tested)
- The database schema already supports all required farmer fields (no schema changes needed, but all required fields exist in the current farmers table)
- Admins have sufficient training to properly enter farmer information
- The system has adequate logging capabilities to implement the required audit logging for farmer creation activities
- Network connectivity is available during farmer creation process
- Existing farmer creation patterns in src/farmer/create.ts can be referenced for implementation
- Any admin user with appropriate privileges can create farmers (role-based permissions will follow existing admin patterns)