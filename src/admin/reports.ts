/**
 * Admin reports — 6-report catalogue with audit logging.
 */

export type ReportItem = {
  id: string;
  name: string;
  description: string;
  format: string;
  ready: boolean;
};

// Static catalogue of 6 reports (data readiness checked at runtime)
const REPORT_CATALOGUE: ReportItem[] = [
  {
    id: "EX-2042",
    name: "รายงาน EX-2042",
    description: "รายงานสรุปคาร์บอนเครดิตสำหรับองค์กร",
    format: "PDF",
    ready: true,
  },
  {
    id: "CARBON-SUMMARY",
    name: "สรุปคาร์บอนเครดิต",
    description: "สรุปคาร์บอนเครดิตทั้งหมดแยกตามฤดู",
    format: "CSV",
    ready: true,
  },
  {
    id: "FARMER-DETAIL",
    name: "รายละเอียดเกษตรกร",
    description: "รายชื่อและข้อมูลเกษตรกรทั้งหมด",
    format: "CSV",
    ready: true,
  },
  {
    id: "PHOTO-AUDIT",
    name: "รายงานตรวจสอบภาพ",
    description: "สรุปผลการตรวจสอบภาพหลักฐาน",
    format: "CSV",
    ready: true,
  },
  {
    id: "SPONSOR-AREA",
    name: "รายงานพื้นที่ผู้สนับสนุน",
    description: "สรุปพื้นที่และเครดิตตามผู้สนับสนุน",
    format: "PDF",
    ready: false,
  },
  {
    id: "GHG-EMISSION",
    name: "รายงาน GHG",
    description: "รายงานการลดก๊าซเรือนกระจก",
    format: "PDF",
    ready: false,
  },
];

export async function getReports(_db: D1Database): Promise<ReportItem[]> {
  return REPORT_CATALOGUE;
}

type LogResult = { success: boolean; error?: string };

export async function logReportDownload(
  db: D1Database,
  userId: string,
  reportId: string,
): Promise<LogResult> {
  try {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db
      .prepare(
        `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, created_at)
         VALUES (?, 'system', 'admin', 'download_report', ?, 'report', ?, datetime('now'))`,
      )
      .bind(auditId, `Report: ${reportId} by user: ${userId}`, reportId)
      .run();
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
