"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, LogOut } from 'lucide-react';
import { TaskDialog } from "@/components/task-dialog";
import { TaskCard } from "@/components/task-card";
import { useRouter } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";
import { WeekView } from "@/components/week-view";
import { KanbanView } from "@/components/kanban-view";

interface Task {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  color: string;
  user_id: string;
}

export default function Calendar() {
  const [viewMode, setViewMode] = useState<'week' | 'kanban'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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

    setTasks(data || []);
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

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar viewMode={viewMode} onViewModeChange={setViewMode} />
      
      <div className="flex-1 overflow-hidden">
        {viewMode === 'week' ? (
          <WeekView tasks={tasks} onTasksChange={loadTasks} />
        ) : (
          <KanbanView tasks={tasks} onTasksChange={loadTasks} />
        )}
      </div>
    </div>
  );
}
