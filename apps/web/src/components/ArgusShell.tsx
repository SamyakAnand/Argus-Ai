"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight, Bell, CaretLeft, CaretRight, ChatCircleText, Command, Cpu,
  Database, Eye, Files, Gauge, Gear, Graph, House, MagnifyingGlass, X,
} from "@phosphor-icons/react";

const destinations = [
  { href: "/overview", label: "Overview", icon: House, detail: "Workspace health and inventory" },
  { href: "/workspace", label: "Data Analysis · legacy", icon: ChatCircleText, detail: "Separate structured-data prototype" },
  { href: "/documents", label: "Knowledge Library", icon: Files, detail: "Markdown and text source passages" },
  { href: "/search", label: "Evidence Search", icon: MagnifyingGlass, detail: "Search local document passages" },
  { href: "/graph", label: "Knowledge Graph", icon: Graph, detail: "Source lineage and relationships" },
  { href: "/sessions", label: "Research Sessions", icon: Database, detail: "Saved in this browser" },
  { href: "/evaluation", label: "Evaluation Lab", icon: Gauge, detail: "Deterministic fixture evaluation" },
  { href: "/models", label: "Model Observatory", icon: Cpu, detail: "Configured provider status" },
  { href: "/settings", label: "Settings", icon: Gear, detail: "Prototype configuration" },
];

export function ArgusNav({ active, collapsed = false, onNavigate }: { active: string; collapsed?: boolean; onNavigate?: () => void }) {
  return <nav className="argus-nav" aria-label="Primary navigation">
    {destinations.map(({ href, label, icon: Icon }) => <Link
      key={href}
      href={href}
      className={`argus-nav-link ${active === href ? "active" : ""}`}
      aria-current={active === href ? "page" : undefined}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
    ><Icon size={18} weight={active === href ? "fill" : "regular"} /><span>{label}</span>{active === href && <i aria-hidden="true" />}</Link>)}
  </nav>;
}

export function ArgusShell({ active, title, eyebrow, children }: { active: string; title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const filteredDestinations = useMemo(() => destinations.filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(commandQuery.toLowerCase())), [commandQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setCommandOpen(true);
      }
      if (event.key === "Escape") { setCommandOpen(false); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return <div className={`argus-shell ${collapsed ? "is-collapsed" : ""}`}>
    <aside className={`argus-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="argus-brand-row">
        <Link href="/" className="argus-brand" aria-label="ARGUS AI home"><span className="argus-brand-mark"><Eye size={19} weight="duotone" /></span>{!collapsed && <><strong>ARGUS</strong><small>AI</small></>}</Link>
        <button className="argus-sidebar-toggle" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed(value => !value)}>{collapsed ? <CaretRight size={15} /> : <CaretLeft size={15} />}</button>
        <button className="argus-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={17} /></button>
      </div>

      {!collapsed && <div className="argus-workspace-switch"><span className="workspace-avatar">A</span><span><strong>Personal workspace</strong><small>ARGUS AI</small></span><CaretRight size={14} /></div>}
      <div className="argus-nav-label">{collapsed ? "NAV" : "INTELLIGENCE"}</div>
      <ArgusNav active={active} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />

      <div className="argus-sidebar-bottom">
        <div className="argus-local-status"><span className="argus-status-led" /><span>{collapsed ? "LOCAL" : "Local API · status varies"}</span></div>
        {!collapsed && <p>Prototype mode<br />Clerk development sign-in</p>}
      </div>
    </aside>

    {mobileOpen && <button className="argus-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="argus-main">
      <header className="argus-topbar">
        <div className="argus-topbar-leading"><button className="argus-mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><span /><span /></button><div className="argus-breadcrumb"><span>ARGUS AI</span><i>/</i><strong>{title}</strong></div></div>
        <div className="argus-topbar-actions">
          <button className="argus-command-trigger" onClick={() => setCommandOpen(true)}><MagnifyingGlass size={16} /><span>Search pages...</span><kbd>⌘ K</kbd></button>
          <Link className="argus-top-action" href="/workspace"><ChatCircleText size={16} /><span>Open workspace</span></Link>
          <button className="argus-notification" aria-label="No notification center is connected"><Bell size={17} /><i /></button>
          <div className="argus-auth-actions" aria-label="Account">
            <Show when="signed-out"><SignInButton><button className="argus-auth-button">Sign in</button></SignInButton><SignUpButton><button className="argus-auth-button primary">Create account</button></SignUpButton></Show>
            <Show when="signed-in"><UserButton /></Show>
          </div>
        </div>
      </header>
      <main className="argus-content">
        <div className="argus-page-heading"><div><span className="argus-eyebrow">{eyebrow}</span><h1>{title}</h1></div><span className="argus-local-pill"><i /> LOCAL PROTOTYPE</span></div>
        {children}
      </main>
    </div>

    {commandOpen && <div className="argus-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
      <section className="argus-command-dialog" role="dialog" aria-modal="true" aria-labelledby="argus-command-title">
        <h2 id="argus-command-title" className="sr-only">Navigate ARGUS AI</h2>
        <div className="argus-command-input"><MagnifyingGlass size={18} /><input autoFocus value={commandQuery} onChange={event => setCommandQuery(event.target.value)} placeholder="Where would you like to go?" aria-label="Search pages" /><kbd>ESC</kbd></div>
        <div className="argus-command-list">{filteredDestinations.map(({ href, label, detail, icon: Icon }) => <Link key={href} href={href} onClick={() => setCommandOpen(false)}><Icon size={17} /><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={14} /></Link>)}{filteredDestinations.length === 0 && <p>No matching pages.</p>}</div>
        <footer><span><Command size={13} /> Navigate</span><span>↑↓ Select <b>↵</b> Open</span></footer>
      </section>
    </div>}
  </div>;
}
