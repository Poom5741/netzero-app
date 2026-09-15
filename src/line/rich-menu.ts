/**
 * LINE Rich Menu — 6-item postback menu for NetZeroCarbon.
 *
 * Items (per artifact):
 * BL_HOME:     หน้าหลัก (Home)
 * SEASON_HOME: ฤดูปัจจุบัน (Current season / calendar)
 * TODO:        งานค้าง (Pending tasks)
 * FIELD_LIST:  แปลงนาของฉัน (My plots)
 * SUMMARY:     สรุปผล (Results dashboard)
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

const _COLOR_PRIMARY = "#06c755";
const _COLOR_BG = "#FFFFFF";
const _COLOR_TEXT = "#333333";

/**
 * Get the 6 rich menu items with Thai labels and postback actions.
 */
export function getRichMenuItems(): RichMenuItem[] {
  return [
    {
      label: "🏠 หน้าหลัก",
      action: { type: "postback", label: "🏠 หน้าหลัก", data: "action=BL_HOME" },
    },
    {
      label: "📅 ฤดูปัจจุบัน",
      action: { type: "postback", label: "📅 ฤดูปัจจุบัน", data: "action=SEASON_HOME" },
    },
    {
      label: "📋 งานค้าง",
      action: { type: "postback", label: "📋 งานค้าง", data: "action=TODO" },
    },
    {
      label: "🌾 แปลงนาของฉัน",
      action: { type: "postback", label: "🌾 แปลงนาของฉัน", data: "action=FIELD_LIST" },
    },
    {
      label: "📊 สรุปผล",
      action: { type: "postback", label: "📊 สรุปผล", data: "action=SUMMARY" },
    },
    {
      label: "📞 ติดต่อเจ้าหน้าที่",
      action: { type: "postback", label: "📞 ติดต่อเจ้าหน้าที่", data: "action=CONTACT" },
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
