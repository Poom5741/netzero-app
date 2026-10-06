"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface SidebarEntry {
  key: string;
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

interface DashboardSidebarProps {
  entries: SidebarEntry[];
  userName: string;
  userEmail: string;
  brand?: string;
}

/**
 * T-211 — Dark navy sidebar restyled to the artifact shell chrome
 * (admin-design-spec.md GAP A "ConsoleShell", :864-906). T-501 — responsive
 * split rebuilt on the SINGLE R-003 boundary at 1024px:
 *
 * >=1024px (lg): fixed 232px rail, exactly as shipped by T-211 — bg
 * var(--navy-900) (rgb(6,30,92)), full viewport height, out-of-flow fixed so
 * the consumer main offsets (dashboard-shell, sponsor pages, globals.css
 * .dashboard-main/.dashboard-header 1024px block) keep working (deviation
 * recorded at T-211). The old intermediate states are GONE: no 72px
 * mini-rail, no mid-range variants, no bottom-nav reuse (R-003: one boundary, no
 * intermediate breakpoints).
 *
 * <1024px: a hamburger button (28px glyph, fixed into the header band top
 * left; rendered by this component so drawer state, focus management and
 * focus return stay co-located — the header is composed separately by
 * DashboardShell and by the three sponsor pages, and the header reserves
 * hamburger clearance below 1024px via its pl-16 base padding). The
 * hamburger opens an overlay drawer: role="dialog" aria-modal="true",
 * rendered from the SAME nav source as the rail (renderNav maps the entries
 * prop once for both — single source of truth, so SP-AREA divider semantics
 * in R-002 hold in both modes). Focus is trapped inside (Tab cycles),
 * Escape and backdrop click close it, focus returns to the hamburger on
 * close, and body scroll is locked while open (WCAG 2.2 AA baseline,
 * plan.md drawer notes).
 *
 * DATA/route contracts preserved (R-001/R-002/R-026): the entries prop
 * (key/label/href/icon/active) and Link href routing are untouched; the
 * layouts keep computing the active flag via usePathname. Nav items per GAP
 * A :885-893; user chip per GAP A :896-904 (unchanged from T-211). Colours
 * are artifact CSS vars only (R-006: no raw hex in source).
 */
export function DashboardSidebar({
  entries,
  userName = "Admin User",
  userEmail = "admin@netzero.com",
  brand = "NetZero",
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  function closeDrawer() {
    setOpen(false);
  }

  // R-003 single source of truth: BOTH the rail and the drawer render this
  // one nav tree from the same entries data (the T-501 suite asserts a
  // single nav mapping in this file). Variant deltas are cosmetic only.
  function renderNav(variant: "rail" | "drawer") {
    return (
      <>
        <div
          className={
            variant === "rail"
              ? "px-4 lg:px-6 mb-10 flex items-center gap-2"
              : "px-4 mb-10 flex items-center gap-2"
          }
        >
          <span className="w-8 h-8 rounded-full bg-[var(--teal-600)] text-white flex items-center justify-center text-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">eco</span>
          </span>
          <span className="text-headline-md text-white tracking-tight font-bold">
            {brand}
          </span>
        </div>

        <nav className="flex-1 px-2 lg:px-4 space-y-2" aria-label="นำทางหลัก">
          {entries.map((entry) => (
            <Link
              key={entry.key}
              href={entry.href}
              onClick={variant === "drawer" ? closeDrawer : undefined}
              aria-current={entry.active ? "page" : undefined}
              className={[
                "flex items-center group",
                // GAP A :886 borderRadius --radius-sm; padding 9px 11px inline
                entry.active
                  ? "bg-white/[0.12] text-white"
                  : "bg-transparent text-white/[0.72] hover:bg-white/[0.08]",
              ].join(" ")}
              style={{
                padding: "9px 11px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: "var(--weight-semibold)",
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] flex-shrink-0">
                {entry.icon}
              </span>
              <span className="ml-[10px]">{entry.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 lg:p-6 border-t border-[var(--border-on-dark)]">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--teal-600)] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-[12px] font-semibold truncate">{userName}</p>
              <p className="text-white/60 text-[10.5px] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Open side effects: move focus into the drawer and lock body scroll while
  // open. The cleanup (close OR unmount) restores scroll and returns focus
  // to the hamburger (WCAG 2.2 AA focus return).
  useEffect(() => {
    if (!open) return;
    const first = drawerRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    first?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const hamburger = hamburgerRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      hamburger?.focus();
    };
  }, [open]);

  // Focus trap: Tab / Shift+Tab cycle inside the drawer; Escape closes.
  function handleDrawerKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      closeDrawer();
      return;
    }
    if (event.key !== "Tab") return;
    const root = drawerRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]",
      ),
    ).filter((el) => el.getAttribute("tabindex") !== "-1");
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const containsActive = active instanceof Node && root.contains(active);
    if (event.shiftKey) {
      if (!containsActive || active === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }
    if (!containsActive || active === last) {
      event.preventDefault();
      first.focus();
    }
  }


  return (
    <>
      {/* Hamburger — <1024px only (lg:hidden); header band, 28px glyph */}
      <button
        ref={hamburgerRef}
        type="button"
        onClick={() => (open ? closeDrawer() : setOpen(true))}
        onKeyDown={(event) => {
          if (open && event.key === "Escape") closeDrawer();
        }}
        aria-expanded={open}
        aria-controls="dashboard-drawer"
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        data-testid="dashboard-hamburger"
        className="fixed top-4 left-4 z-[60] lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--navy-900)] text-white shadow-lg"
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
          {open ? "close" : "menu"}
        </span>
      </button>

      {/* >=1024px docked rail — hidden below the single 1024px boundary */}
      <aside
        data-testid="sidebar-rail"
        className="fixed left-0 top-0 hidden lg:flex lg:w-[232px] bg-[var(--navy-900)] z-50 flex-col pt-6 shadow-xl"
        style={{ height: "100vh" }}
      >
        {renderNav("rail")}
      </aside>

      {/* <1024px overlay drawer — same nav source as the rail, dialog semantics */}
      {open && (
        <>
          <div
            data-testid="drawer-backdrop"
            onClick={closeDrawer}
            aria-hidden="true"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <aside
            ref={drawerRef}
            id="dashboard-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="เมนูนำทาง"
            data-testid="dashboard-drawer"
            onKeyDown={handleDrawerKeyDown}
            className="fixed left-0 top-0 z-50 flex w-[232px] flex-col bg-[var(--navy-900)] pt-6 shadow-xl lg:hidden"
            style={{ height: "100vh" }}
          >
            {renderNav("drawer")}
          </aside>
        </>
      )}
    </>
  );
}
