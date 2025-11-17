"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { TaskDialog } from "@/components/task-dialog";
import { useRouter } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";
import { WeekView } from "@/components/week-view";
import { KanbanView } from "@/components/kanban-view";
import { PomodoroModal } from "@/components/pomodoro-modal";

type Task = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  color: string;
  user_id: string;
  completed: boolean;
  completed_at: string | null;
  category: string;
  priority: string;
};

interface WeekViewProps {
  tasks: Task[];
  onTasksChange: () => void;
}

export default function Calendar() {
  const [viewMode, setViewMode] = useState<'week' | 'kanban'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadTasks();
  }, [viewMode]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Erro ao carregar tarefas:", error);
      return;
    }

    const mappedTasks = (data || []).map((task) => ({
      ...task,
      category: task.category || "geral",
      priority: task.priority || "media",
    }));

    setTasks(mappedTasks);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDay = (date: Date | null) => {
    if (!date) return [];
    return tasks.filter((task) => {
      const taskDate = new Date(task.start_time);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setEditingTask(null);
      setIsDialogOpen(true);
    }
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setSelectedDate(new Date(task.start_time));
    setIsDialogOpen(true);
  };

  const handleTaskSaved = () => {
    loadTasks();
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handlePomodoroSessionComplete = () => {
    loadTasks();
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Sidebar viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'week' ? (
          <WeekView tasks={tasks} onTasksChange={loadTasks} />
        ) : (
          <KanbanView tasks={tasks} onTasksChange={loadTasks} />
        )}

        {/* Botão flutuante Pomodoro - Design Premium */}
        <div
          className="fixed bottom-8 right-8 z-40 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Glow Effect Background */}
          <div className="absolute inset-0 bg-linear-to-r from-red-500 via-orange-500 to-red-500 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

          {/* Label flutuante */}
          {isHovering && (
            <div className="absolute bottom-16 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-linear-to-r from-red-500 to-orange-500 text-white px-4 py-2.5 rounded-lg shadow-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Iniciar Pomodoro
                <ChevronRight className="h-4 w-4" />
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-3 translate-y-0 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-orange-500"></div>
            </div>
          )}

          {/* Botão Principal */}
          <button
            onClick={() => setIsPomodoroOpen(true)}
            className="relative w-14 h-14 rounded-full bg-linear-to-br from-red-500 via-red-600 to-orange-600 shadow-2xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 flex items-center justify-center group-hover:rotate-12 active:scale-95 cursor-pointer overflow-hidden"
            title="Abrir Pomodoro"
            style={{
              boxShadow: isHovering
                ? "0 20px 40px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)"
                : "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Icon container */}
            <div className="relative z-10">
              <Clock className="h-7 w-7 text-white animate-pulse" />
            </div>

            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white group-hover:animate-spin animation-duration-3000"></div>
          </button>

          {/* Floating pill info */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-full text-xs whitespace-nowrap" style={{ fontFamily: "Open Sans, sans-serif" }}>
              ⏱️ Pomodoro 25min
            </div>
          </div>
        </div>

        {/* Background decoration - Floating elements */}
        <div className="absolute top-10 right-20 w-64 h-64 bg-linear-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-blob pointer-events-none"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-linear-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>
      </div>

      {/* Diálogo de Tarefas */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
        task={editingTask}
        onTaskSaved={handleTaskSaved}
      />

      {/* Modal do Pomodoro */}
      <PomodoroModal
        open={isPomodoroOpen}
        onOpenChange={setIsPomodoroOpen}
        onSessionComplete={handlePomodoroSessionComplete}
      />
    </div>
  );
}
