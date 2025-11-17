"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Calendar, AlertCircle, CheckCircle2, Clock, Zap, RefreshCw, PlayCircle, PauseCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WeeklyScheduleView } from "@/components/weekly-schedule-view";
import { RoutineTemplateManager } from "@/components/routine-template-manager";
import { ConflictResolver } from "@/components/conflict-resolver";

interface Task {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  category: string;
  priority: string;
  completed: boolean;
}

export function PlannerContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isFlexibleMode, setIsFlexibleMode] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getWeekDates(new Date()));

  useEffect(() => {
    loadWeekData();
    detectConflicts();
  }, [selectedWeek, isFlexibleMode]);

  const loadWeekData = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .gte('start_time', selectedWeek.start.toISOString())
      .lte('start_time', selectedWeek.end.toISOString())
      .order('start_time', { ascending: true });

    if (data) {
      setTasks(data);
    }
  };

  const detectConflicts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('scheduling_conflicts')
      .select('*')
      .gte('date', selectedWeek.start.toISOString().split('T')[0])
      .lte('date', selectedWeek.end.toISOString().split('T')[0])
      .eq('resolution_status', 'pending');

    if (data) {
      setConflicts(data);
    }
  };

  const handleUnexpectedEvent = async (date: Date, reason: string) => {
    const supabase = createClient();
    
    // Registrar o imprevisto
    await supabase
      .from('scheduling_conflicts')
      .insert({
        date: date.toISOString().split('T')[0],
        conflict_type: 'unexpected',
        notes: reason
      });

    // Reagendar tarefas pendentes do dia
    await rescheduleRemainingWeek(date);
    
    await loadWeekData();
    await detectConflicts();
  };

  const rescheduleRemainingWeek = async (fromDate: Date) => {
    const supabase = createClient();
    
    // Buscar tarefas não concluídas do dia
    const { data: pendingTasks } = await supabase
      .from('tasks')
      .select('*')
      .gte('start_time', fromDate.toISOString().split('T')[0])
      .eq('completed', false);

    if (!pendingTasks || pendingTasks.length === 0) return;

    // Redistribuir nos próximos dias da semana
    const nextDays = getRemainingWeekDays(fromDate);
    let dayIndex = 0;

    for (const task of pendingTasks) {
      if (dayIndex >= nextDays.length) break;
      
      const newDate = nextDays[dayIndex];
      const taskStart = new Date(task.start_time);
      const taskEnd = new Date(task.end_time);
      
      // Manter o mesmo horário, mas mudar o dia
      newDate.setHours(taskStart.getHours(), taskStart.getMinutes());
      const newEnd = new Date(newDate);
      newEnd.setHours(taskEnd.getHours(), taskEnd.getMinutes());

      await supabase
        .from('tasks')
        .update({
          start_time: newDate.toISOString(),
          end_time: newEnd.toISOString()
        })
        .eq('id', task.id);

      dayIndex++;
    }
  };

  const getRemainingWeekDays = (fromDate: Date): Date[] => {
    const days: Date[] = [];
    const currentDay = new Date(fromDate);
    currentDay.setDate(currentDay.getDate() + 1);
    
    const endOfWeek = new Date(selectedWeek.end);
    
    while (currentDay <= endOfWeek) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek.start);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(getWeekDates(newDate));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Planejador Inteligente</h1>
              <p className="text-muted-foreground">
                Grade semanal completa com reorganização automática
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={isFlexibleMode ? 'default' : 'outline'}
                onClick={() => setIsFlexibleMode(!isFlexibleMode)}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {isFlexibleMode ? 'Modo Alternativo' : 'Modo Normal'}
              </Button>
            </div>
          </div>

          {conflicts.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Conflitos Detectados</AlertTitle>
              <AlertDescription>
                Existem {conflicts.length} conflito(s) na sua agenda que precisam de atenção.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="schedule" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schedule">Grade Semanal</TabsTrigger>
              <TabsTrigger value="templates">Rotinas</TabsTrigger>
              <TabsTrigger value="conflicts">Conflitos</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agenda da Semana</CardTitle>
                      <CardDescription>
                        {selectedWeek.start.toLocaleDateString('pt-BR')} - {selectedWeek.end.toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                        ← Anterior
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWeek(getWeekDates(new Date()))}>
                        Hoje
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                        Próxima →
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeeklyScheduleView 
                    tasks={tasks}
                    weekStart={selectedWeek.start}
                    isFlexibleMode={isFlexibleMode}
                    onTasksChange={loadWeekData}
                  />
                  
                  <div className="mt-6 flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const today = new Date();
                        const reason = prompt('Qual foi o imprevisto?');
                        if (reason) {
                          handleUnexpectedEvent(today, reason);
                        }
                      }}
                      className="gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Registrar Imprevisto
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => rescheduleRemainingWeek(new Date())}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reorganizar Semana
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <RoutineTemplateManager onTemplateApplied={loadWeekData} />
            </TabsContent>

            <TabsContent value="conflicts">
              <ConflictResolver 
                conflicts={conflicts}
                onConflictResolved={detectConflicts}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function getWeekDates(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}
