# API Contract: Admin Farmer Registration

## POST /api/admin/farmers

Creates a new farmer record via the admin interface.

### Authentication
- **Required**: Admin authentication via existing middleware
- **Header**: `Authorization: Bearer <admin-jwt-token>`
- **Role**: Must have `farmer.create` permission

### Request

#### Headers
```
Content-Type: application/json
Authorization: Bearer <admin-jwt-token>
```

#### Body
```json
{
  "full_name": "string (required, 1-100 chars)",
  "phone": "string (required, 10 digits starting with 0)",
  "gender": "string (optional, 'male'|'female'|'unspecified')",
  "addr_province": "string (optional, max 50 chars)",
  "addr_district": "string (optional, max 50 chars)",
  "addr_subdistrict": "string (optional, max 50 chars)",
  "addr_village": "string (optional, max 50 chars)"
}
```

#### Validation
- `full_name`: Required, 1-100 characters, sanitized
- `phone`: Required, exactly 10 digits, starts with "0", unique across all farmers
- `gender`: If provided, must be one of "male", "female", "unspecified"
- Address fields: If provided, max 50 characters each

### Responses

#### 201 Created
Successfully created a new farmer.

```json
{
  "id": "string (farmer-{uuid})",
  "full_name": "string",
  "gender": "string",
  "phone": "string",
  "addr_province": "string (nullable)",
  "addr_district": "string (nullable)",
  "addr_subdistrict": "string (nullable)",
  "addr_village": "string (nullable)",
  "created_at": "string (ISO 8601 timestamp)",
  "updated_at": "string (ISO 8601 timestamp)"
}
```

#### 400 Bad Request
Validation failed.

```json
{
  "error": "string (validation error message)",
  "details": {
    "field": "string",
    "message": "string"
  }
}
```

Example:
```json
{
  "error": "Invalid phone format",
  "details": {
    "field": "phone",
    "message": "Phone number must be 10 digits starting with 0"
  }
}
```

#### 401 Unauthorized
Admin authentication failed.

```json
{
  "error": "Unauthorized",
  "message": "Admin authentication required"
}
```

#### 403 Forbidden
Insufficient permissions.

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to create farmers"
}
```

#### 409 Conflict
Phone number already exists.

```json
{
  "error": "Conflict",
  "message": "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว"
}
```

#### 500 Internal Server Error
Unexpected server error.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Rate Limiting
- Endpoint is rate-limited to prevent abuse
- Threshold: 10 requests per admin user per minute
- Exceeding limit returns 429 Too Many Requests

### Audit Trail
- All successful creations are logged in audit system
- Logs include: admin user ID, timestamp, farmer ID created, and basic farmer details
- Failed attempts are logged with reduced detail for security

### Integration Points
- Validates against existing farmers table schema
- Compatible with existing LINE registration flow
- Follows same data model as farmers created through other channels