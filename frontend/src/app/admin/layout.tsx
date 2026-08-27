import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คิวตรวจสอบภาพ — NetZeroCarbon",
  description: "ตรวจสอบและอนุมัติภาพถ่ายหลักฐานจากเกษตรกร",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
