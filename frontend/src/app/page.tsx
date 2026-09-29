import { redirect } from "next/navigation";

/**
 * The farmer-facing surface lives in LINE, so the web app serves only the
 * admin and sponsor consoles. The entry point is the shared login page.
 */
export default function Home() {
  redirect("/login");
}
