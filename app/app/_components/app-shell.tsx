"use client";

import { useState } from "react";
import TopBar from "./top-bar";
import BottomNav from "./bottom-nav";
import Drawer from "./drawer";
import { AppSidebar } from "./app-sidebar";

// Casca responsiva: no desktop (lg+) usa menu lateral + área de conteúdo larga;
// no mobile, top bar + conteúdo + bottom-nav (e o drawer pelo menu ☰). Sem
// "frame de celular" — cada dispositivo usa a tela do seu jeito.
export default function AppShell({
  children,
  unread,
}: {
  children: React.ReactNode;
  unread: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="h-dvh bg-[var(--app-bg)] lg:flex">
      <AppSidebar unread={unread} />

      <div className="relative flex h-dvh flex-1 flex-col">
        <TopBar onMenu={() => setDrawerOpen(true)} unread={unread} />

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl lg:px-4">{children}</div>
        </main>

        <BottomNav />
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}
