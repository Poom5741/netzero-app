# Contract: LINE Webhook

**Endpoint**: `POST /webhook/line`
**Purpose**: Receive LINE Messaging API events (messages, postbacks, follows)
**Authentication**: LINE signature validation (X-Line-Signature header)

## Request

**Headers**:
- `Content-Type`: application/json
- `X-Line-Signature`: Base64 HMAC-SHA256 signature (LINE channel secret)

**Body**:
```json
{
  "destination": "LINE_USER_ID",
  "events": [
    {
      "type": "message",
      "replyToken": "REPLY_TOKEN",
      "source": {
        "type": "user",
        "userId": "LINE_USER_ID"
      },
      "timestamp": 1234567890123,
      "message": {
        "type": "text",
        "id": "MESSAGE_ID",
        "text": "USER_INPUT"
      }
    }
  ]
}
```

**Event Types**:
- `follow`: User follows the LINE OA
- `unfollow`: User unfollows
- `message`: User sends a message (text, image, video, etc.)
- `postback`: User clicks a postback button

## Response

**Status**: 200 OK (empty body)

**Side Effects**:
- Reply messages sent via LINE Messaging API (using replyToken)
- Conversation state updated in `line_links` table
- Photo evidence created (if image upload)

## Error Handling

**401 Unauthorized**: Invalid or missing X-Line-Signature
**400 Bad Request**: Malformed JSON or missing required fields
**500 Internal Server Error**: Database or LINE API failure

## Constraints

- **ReplyToken single-use**: Must batch all reply messages into one API call
- **Signature validation**: Base64 HMAC-SHA256 (not hex)
- **Timeout**: LINE expects response within 5 seconds (use push messages for async work)
