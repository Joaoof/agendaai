"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TaskDialog } from "@/components/task-dialog";
import { createClient } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
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
}

interface WeekViewProps {
  tasks: Task[];
  onTasksChange: () => void;
}

const TIME_SLOTS = [
  { label: "07:00-08:00", start: 7, end: 8 },
  { label: "08:00-12:00", start: 8, end: 12 },
  { label: "12:00-13:00", start: 12, end: 13 },
  { label: "13:00-17:00", start: 13, end: 17 },
  { label: "17:30-19:00", start: 17.5, end: 19 },
  { label: "19:00-20:00", start: 19, end: 20 },
  { label: "20:00-21:00", start: 20, end: 21 },
  { label: "21:00-22:00", start: 21, end: 22 },
  { label: "22:00", start: 22, end: 24 },
];

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

export function WeekView({ tasks, onTasksChange }: WeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; timeSlot: typeof TIME_SLOTS[0] } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  function getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    return date;
  });

  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const getTasksForSlot = (date: Date, timeSlot: typeof TIME_SLOTS[0]) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.start_time);
      const taskHour = taskDate.getHours() + taskDate.getMinutes() / 60;
      
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        taskHour >= timeSlot.start &&
        taskHour < timeSlot.end
      );
    });
  };

  const handleCellClick = (date: Date, timeSlot: typeof TIME_SLOTS[0]) => {
    setSelectedSlot({ date, timeSlot });
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedSlot(null);
    setIsDialogOpen(true);
  };

  const handleTaskDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (!error) {
      onTasksChange();
    }
  };

  const handleTaskComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !task.completed;
    
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq("id", task.id);

    if (!error) {
      onTasksChange();
    }
  };

  const getWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            Agenda Semanal
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <span className="text-lg font-medium">{getWeekRange()}</span>
            </div>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-primary">
              <tr>
                <th className="border border-primary-foreground/20 bg-primary p-3 text-left text-sm font-semibold text-primary-foreground w-32">
                  Horário
                </th>
                {weekDays.map((date, i) => (
                  <th
                    key={i}
                    className="border border-primary-foreground/20 bg-primary p-3 text-center text-sm font-semibold text-primary-foreground min-w-[140px]"
                  >
                    <div>{DAYS[i]}</div>
                    <div className="text-xs font-normal mt-1 opacity-90">
                      {date.getDate()}/{date.getMonth() + 1}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIndex) => (
                <tr key={slotIndex}>
                  <td className="border border-border bg-muted/50 p-3 text-sm font-medium text-center align-top">
                    {slot.label}
                  </td>
                  {weekDays.map((date, dayIndex) => {
                    const cellTasks = getTasksForSlot(date, slot);
                    return (
                      <td
                        key={dayIndex}
                        className="border border-border bg-background p-2 cursor-pointer hover:bg-accent/50 transition-colors align-top min-h-[80px]"
                        onClick={() => handleCellClick(date, slot)}
                      >
                        <div className="space-y-1">
                          {cellTasks.map((task) => (
                            <div
                              key={task.id}
                              className="group relative rounded px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: task.color }}
                              onClick={(e) => handleTaskClick(task, e)}
                            >
                              <div className="flex items-start gap-1.5">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => {}}
                                  onClick={(e) => handleTaskComplete(task, e)}
                                  className="mt-0.5 h-3 w-3 border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-white truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                                      {task.title}
                                    </span>
                                    <button
                                      onClick={(e) => handleTaskDelete(task.id, e)}
                                      className="opacity-0 group-hover:opacity-100 text-white hover:text-red-200 transition-opacity flex-shrink-0"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  {task.description && (
                                    <div className={`text-white/80 text-[10px] truncate mt-0.5 ${task.completed ? 'opacity-60' : ''}`}>
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {cellTasks.length === 0 && (
                            <div className="flex items-center justify-center h-12 opacity-0 hover:opacity-100 transition-opacity">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedSlot?.date || null}
        task={editingTask}
        onTaskSaved={onTasksChange}
        timeSlot={selectedSlot?.timeSlot}
      />
    </div>
  );
}
