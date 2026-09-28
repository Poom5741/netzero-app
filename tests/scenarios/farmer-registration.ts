import type { ConversationScenario } from "../helpers/conversation-runner";

export const farmerRegistration: ConversationScenario = {
  name: "farmer-registration",
  description: "Complete farmer registration flow from welcome to pending_review",
  setup: {
    farmer: {
      phone: "0812345678",
      full_name: "Somchai Jaidee",
      addr_province: "Bangkok",
      addr_district: "Phaya Thai",
    },
    initialState: "welcome",
  },
  steps: [
    { user_sends: "ลงทะเบียน", expect_state: "consent", expect_reply_contains: "ยินยอม" },
    { user_sends: "ยอมรับ", expect_state: "phone", expect_reply_contains: "เบอร์โทรศัพท์" },
    {
      user_sends: "0812345678",
      expect_state: "identity_confirm",
      expect_reply_contains: "Somchai Jaidee",
    },
    { user_sends: "ใช่", expect_state: "conditions", expect_reply_contains: "เงื่อนไข" },
    { user_sends: "ยอมรับ", expect_state: "registration", expect_reply_contains: "ฟอร์มสมัคร" },
    { user_sends: "กรอกเสร็จ", expect_state: "documents", expect_reply_contains: "อัปโหลด" },
    {
      user_sends: "อัปโหลด",
      expect_state: "pending_review",
      expect_reply_contains: "รอการตรวจสอบ",
      pre_seed: [
        {
          table: "application_documents",
          row: {
            id: "doc-001",
            farmer_id: "{farmer_id}",
            doc_type: "DOC-01",
            r2_key: "test/doc1.jpg",
            submitted_at: "2026-01-01 00:00:00",
          },
        },
        {
          table: "application_documents",
          row: {
            id: "doc-002",
            farmer_id: "{farmer_id}",
            doc_type: "DOC-03",
            r2_key: "test/doc2.jpg",
            submitted_at: "2026-01-01 00:00:00",
          },
        },
      ],
    },
  ],
};
