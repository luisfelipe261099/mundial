"use client";

import { useState } from "react";
import { SignalHigh, Wifi, BatteryFull } from "lucide-react";
import TopBar from "./top-bar";
import BottomNav from "./bottom-nav";
import Drawer from "./drawer";

// "Casca" do app: no desktop renderiza um frame de celular centralizado; no
// mobile ocupa a viewport inteira. O <main> rola por dentro; top bar e bottom
// nav ficam fixos. O Drawer é um overlay absoluto dentro do próprio frame.
export default function AppShell({
  children,
  unread,
}: {
  children: React.ReactNode;
  unread: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#05070c] sm:py-6">
      <div className="app-viewport relative flex h-dvh w-full flex-col overflow-hidden bg-[var(--app-bg)] sm:h-[860px] sm:max-h-[92dvh] sm:w-[400px] sm:rounded-[2.3rem] sm:border sm:border-[var(--app-line)] sm:shadow-2xl">
        {/* status bar fictícia — só aparece no frame de desktop */}
        <div className="hidden shrink-0 items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold t-ink sm:flex">
          <span>9:41</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <SignalHigh className="size-4" />
            <Wifi className="size-4" />
            <BatteryFull className="size-5" />
          </span>
        </div>

        <TopBar onMenu={() => setDrawerOpen(true)} unread={unread} />

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</main>

        <BottomNav />
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}
