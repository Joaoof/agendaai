"use client";

import { Calendar, LayoutGrid, LogOut, BarChart3, Settings, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  viewMode?: 'week' | 'kanban';
  onViewModeChange?: (mode: 'week' | 'kanban') => void;
}

export function Sidebar({ viewMode, onViewModeChange }: SidebarProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isCalendarPage = pathname === '/';
  const isDashboardPage = pathname === '/dashboard';
  const isSettingsPage = pathname === '/settings';
  const isPlannerPage = pathname === '/planner';

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Agenda Completa</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <Button
          variant={isDashboardPage ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => router.push('/dashboard')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Dashboard
        </Button>

        <Button
          variant={isPlannerPage ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => router.push('/planner')}
        >
          <Brain className="mr-2 h-4 w-4" />
          Planejador Inteligente
        </Button>

        {isCalendarPage && onViewModeChange && (
          <>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewModeChange('week')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Visão Semanal
            </Button>
            
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewModeChange('kanban')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Modo Trello
            </Button>
          </>
        )}

        {!isCalendarPage && !isPlannerPage && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push('/')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </Button>
        )}

        <Button
          variant={isSettingsPage ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Button>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
