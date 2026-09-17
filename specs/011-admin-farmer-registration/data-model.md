# Data Model: Admin Farmer Registration

## Farmer Entity

### Fields
- **id** (TEXT, PRIMARY KEY)
  - Format: "farmer-{uuid}"
  - Generated on creation
  - Immutable

- **full_name** (TEXT, NOT NULL)
  - Required field
  - Min length: 1 character
  - Max length: 100 characters
  - Sanitized to prevent injection

- **gender** (TEXT, NULLABLE)
  - Values: "male", "female", "unspecified"
  - Default: "unspecified" if not provided

- **phone** (TEXT, UNIQUE, NOT NULL)
  - Format: 10 digits starting with "0"
  - Regex validation: `/^0\d{9}$/`
  - Uniqueness enforced at database level
  - Sanitized to prevent injection

- **addr_province** (TEXT, NULLABLE)
  - Max length: 50 characters
  - Sanitized to prevent injection

- **addr_district** (TEXT, NULLABLE)
  - Max length: 50 characters
  - Sanitized to prevent injection

- **addr_subdistrict** (TEXT, NULLABLE)
  - Max length: 50 characters
  - Sanitized to prevent injection

- **addr_village** (TEXT, NULLABLE)
  - Max length: 50 characters
  - Sanitized to prevent injection

- **national_id_enc** (TEXT, NULLABLE)
  - Encrypted national ID
  - Optional field

- **group_id** (TEXT, NULLABLE)
  - Group identifier
  - Optional field

- **created_at** (TEXT)
  - ISO 8601 timestamp
  - Auto-generated on creation

- **updated_at** (TEXT)
  - ISO 8601 timestamp
  - Auto-updated on modification

### Relationships
- **Admin User**: Foreign key to admin users table (for audit logging)
- **Line Links**: One-to-many relationship with line_links table (after farmer registers via LINE)

### Validation Rules
1. **Phone Format**: Must match `/^0\d{9}$/` regex (10 digits, starts with 0)
2. **Phone Uniqueness**: Enforced at database level via UNIQUE constraint
3. **Full Name**: Required, minimum 1 character, maximum 100 characters
4. **Gender**: If provided, must be one of "male", "female", "unspecified"
5. **Address Fields**: If provided, maximum 50 characters each
6. **Input Sanitization**: All text fields must be sanitized to prevent injection

### State Transitions
- **Newly Created**: Farmer exists in database but has not registered via LINE
- **LINE Registered**: Farmer has completed LINE registration process
- **Active**: Farmer is participating in carbon program
- **Pending Review**: Farmer application is under review (not applicable to admin-created farmers)

## Admin User Entity (Reference)

### Fields Relevant to Farmer Creation
- **id** (TEXT, PRIMARY KEY)
  - Admin user identifier
  - Required for audit logging

- **email** (TEXT)
  - Admin email address
  - Required for identification

### Permissions
- **farmer.create**: Required permission to create farmers via admin interface

## Audit Log Entry (Reference)

### Fields for Farmer Creation
- **id** (TEXT, PRIMARY KEY)
  - Unique identifier for audit entry

- **actor_id** (TEXT)
  - Admin user ID who performed the action

- **action** (TEXT)
  - "farmer.create" for farmer creation events

- **timestamp** (TEXT)
  - ISO 8601 timestamp of the action

- **entity_type** (TEXT)
  - "farmer" for farmer-related actions

- **entity_id** (TEXT)
  - ID of the farmer that was created

- **previous_value** (JSON, NULLABLE)
  - NULL for creation events

- **new_value** (JSON, NULLABLE)
  - Farmer data that was created (excluding sensitive fields)

- **metadata** (JSON, NULLABLE)
  - Additional context about the creation (IP address, user agent, etc.)