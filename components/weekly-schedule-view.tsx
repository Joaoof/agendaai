"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  category: string;
  priority: string;
  completed: boolean;
  color?: string;
}

interface WeeklyScheduleViewProps {
  tasks: Task[];
  weekStart: Date;
  isFlexibleMode: boolean;
  onTasksChange: () => void;
}

const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00'
];

const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function WeeklyScheduleView({ tasks, weekStart, isFlexibleMode, onTasksChange }: WeeklyScheduleViewProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: string } | null>(null);

  const getDayTasks = (dayIndex: number) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.start_time);
      return taskDate.toDateString() === dayDate.toDateString();
    });
  };

  const getTasksForTimeSlot = (dayIndex: number, hour: string) => {
    const dayTasks = getDayTasks(dayIndex);
    const [slotHour] = hour.split(':').map(Number);
    
    return dayTasks.filter(task => {
      const taskStart = new Date(task.start_time);
      const taskHour = taskStart.getHours();
      return taskHour === slotHour;
    });
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from('tasks')
      .update({ 
        completed: !currentStatus,
        completed_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', taskId);
    
    onTasksChange();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'study': 'bg-blue-100 text-blue-700 border-blue-300',
      'work': 'bg-purple-100 text-purple-700 border-purple-300',
      'exercise': 'bg-green-100 text-green-700 border-green-300',
      'personal': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'break': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const hasConflict = (dayIndex: number, hour: string) => {
    const tasksInSlot = getTasksForTimeSlot(dayIndex, hour);
    return tasksInSlot.length > 1;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-8 gap-px bg-border">
          {/* Header - Horários */}
          <div className="bg-muted p-3 font-semibold text-center border">
            Horário
          </div>
          
          {/* Header - Dias da Semana */}
          {daysOfWeek.map((day, index) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + index);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={day}
                className={`bg-muted p-3 font-semibold text-center border ${
                  isToday ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <div>{day}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {dayDate.getDate()}/{dayDate.getMonth() + 1}
                </div>
              </div>
            );
          })}

          {/* Grid de horários */}
          {timeSlots.map((hour) => (
            <>
              {/* Coluna de horário */}
              <div key={`hour-${hour}`} className="bg-muted p-3 font-medium text-sm text-center border">
                {hour}
              </div>
              
              {/* Células para cada dia */}
              {daysOfWeek.map((_, dayIndex) => {
                const tasksInSlot = getTasksForTimeSlot(dayIndex, hour);
                const conflict = hasConflict(dayIndex, hour);
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`bg-background p-2 min-h-[80px] border relative transition-colors ${
                      hoveredCell?.day === dayIndex && hoveredCell?.hour === hour
                        ? 'bg-accent/5'
                        : ''
                    } ${conflict ? 'border-red-300 bg-red-50' : ''}`}
                    onMouseEnter={() => setHoveredCell({ day: dayIndex, hour })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {conflict && (
                      <AlertTriangle className="absolute top-1 right-1 h-4 w-4 text-red-500" />
                    )}
                    
                    <div className="space-y-1">
                      {tasksInSlot.map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded border text-xs ${getCategoryColor(task.category)} ${
                            task.completed ? 'opacity-60' : ''
                          } ${isFlexibleMode ? 'border-dashed' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <button
                              onClick={() => toggleTaskCompletion(task.id, task.completed)}
                              className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Circle className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium leading-tight ${
                                task.completed ? 'line-through' : ''
                              }`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-[10px]">
                                <Clock className="h-2.5 w-2.5" />
                                <span>
                                  {new Date(task.start_time).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
            <span className="text-sm">Estudo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span className="text-sm">Exercício</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded" />
            <span className="text-sm">Trabalho</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
            <span className="text-sm">Descanso</span>
          </div>
          {isFlexibleMode && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 border-dashed rounded" />
              <span className="text-sm">Modo Alternativo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
