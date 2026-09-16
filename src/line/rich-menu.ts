/**
 * LINE Rich Menu — 6-item postback menu for NetZeroCarbon.
 *
 * Labels per REQUIREMENTS.md section 1.5 (LO-MENU-01 through LO-MENU-06):
 * BL_HOME:     กรอกข้อมูลย้อนหลัง (Backfill registration)
 * SEASON_HOME: บันทึกงานในแปลง (Record field work)
 * TODO:        งานที่ต้องทำ (Pending tasks)
 * FIELD_LIST:  แปลงของฉัน (My plots)
 * SUMMARY:     สรุปผลของฉัน (My results)
 * CONTACT:     ติดต่อเจ้าหน้าที่ (Contact coordinator)
 */

export interface RichMenuItem {
  label: string;
  action: {
    type: string;
    data: string;
    label: string;
    text?: string;
  };
}

/**
 * Get the 6 rich menu items with Thai labels and postback actions.
 * Labels match REQUIREMENTS.md section 1.5.
 */
export function getRichMenuItems(): RichMenuItem[] {
  return [
    {
      label: "กรอกข้อมูลย้อนหลัง",
      action: { type: "postback", label: "กรอกข้อมูลย้อนหลัง", data: "action=BL_HOME" },
    },
    {
      label: "บันทึกงานในแปลง",
      action: { type: "postback", label: "บันทึกงานในแปลง", data: "action=SEASON_HOME" },
    },
    {
      label: "งานที่ต้องทำ",
      action: { type: "postback", label: "งานที่ต้องทำ", data: "action=TODO" },
    },
    {
      label: "แปลงของฉัน",
      action: { type: "postback", label: "แปลงของฉัน", data: "action=FIELD_LIST" },
    },
    {
      label: "สรุปผลของฉัน",
      action: { type: "postback", label: "สรุปผลของฉัน", data: "action=SUMMARY" },
    },
    {
      label: "ติดต่อเจ้าหน้าที่",
      action: { type: "postback", label: "ติดต่อเจ้าหน้าที่", data: "action=CONTACT" },
    },
  ];
}

/**
 * Build the rich menu configuration object.
 * Returns a JSON-serializable structure for the LINE Messaging API.
 */
export function buildRichMenu(): {
  type: string;
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: { type: string; label: string; data: string };
  }>;
} {
  const items = getRichMenuItems();

  // 3 columns x 2 rows grid
  const colWidth = 833;
  const rowHeight = 420;

  const areas = items.map((item, i) => ({
    bounds: {
      x: (i % 3) * colWidth,
      y: Math.floor(i / 3) * rowHeight,
      width: colWidth,
      height: rowHeight,
    },
    action: {
      type: item.action.type,
      label: item.action.label,
      data: item.action.data,
    },
  }));

  return {
    type: "rich",
    size: { width: 2500, height: 843 },
    selected: false,
    name: "NetZeroCarbon Menu",
    chatBarText: "เมนู",
    areas,
  };
}
