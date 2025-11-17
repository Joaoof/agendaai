"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Copy, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_flexible: boolean;
}

interface RoutineTemplateManagerProps {
  onTemplateApplied: () => void;
}

export function RoutineTemplateManager({ onTemplateApplied }: RoutineTemplateManagerProps) {
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('routine_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTemplates(data);
    }
  };

  const createDefaultTemplate = async () => {
    const supabase = createClient();
    
    // Criar template de rotina padrão
    const { data: template } = await supabase
      .from('routine_templates')
      .insert({
        name: 'Rotina Balanceada',
        description: 'Estudo consistente com exercícios e descanso adequado',
        is_active: true,
        is_flexible: false
      })
      .select()
      .single();

    if (!template) return;

    // Definir blocos da rotina
    const routineItems = [
      // Segunda-feira
      { template_id: template.id, title: 'Estudo - Foco', category: 'study', day_of_week: 1, start_time: '14:00', end_time: '15:00', duration_minutes: 60, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Revisão', category: 'study', day_of_week: 1, start_time: '15:15', end_time: '15:45', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Prática', category: 'study', day_of_week: 1, start_time: '16:00', end_time: '16:30', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 30 },
      { template_id: template.id, title: 'Boxe', category: 'exercise', day_of_week: 1, start_time: '19:00', end_time: '20:00', duration_minutes: 60, color: '#10b981', break_after_minutes: 0 },
      
      // Terça-feira
      { template_id: template.id, title: 'Estudo - Foco', category: 'study', day_of_week: 2, start_time: '09:00', end_time: '10:00', duration_minutes: 60, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Revisão', category: 'study', day_of_week: 2, start_time: '10:15', end_time: '10:45', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Prática', category: 'study', day_of_week: 2, start_time: '11:00', end_time: '11:30', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 0 },
      
      // Quarta-feira
      { template_id: template.id, title: 'Estudo - Foco', category: 'study', day_of_week: 3, start_time: '09:00', end_time: '10:00', duration_minutes: 60, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Revisão', category: 'study', day_of_week: 3, start_time: '10:15', end_time: '10:45', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Prática', category: 'study', day_of_week: 3, start_time: '11:00', end_time: '11:30', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 30 },
      { template_id: template.id, title: 'Boxe', category: 'exercise', day_of_week: 3, start_time: '19:00', end_time: '20:00', duration_minutes: 60, color: '#10b981', break_after_minutes: 0 },
      
      // Quinta-feira
      { template_id: template.id, title: 'Estudo - Foco', category: 'study', day_of_week: 4, start_time: '09:00', end_time: '10:00', duration_minutes: 60, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Revisão', category: 'study', day_of_week: 4, start_time: '10:15', end_time: '10:45', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Prática', category: 'study', day_of_week: 4, start_time: '11:00', end_time: '11:30', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 0 },
      
      // Sexta-feira
      { template_id: template.id, title: 'Estudo - Foco', category: 'study', day_of_week: 5, start_time: '09:00', end_time: '10:00', duration_minutes: 60, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Revisão', category: 'study', day_of_week: 5, start_time: '10:15', end_time: '10:45', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 15 },
      { template_id: template.id, title: 'Estudo - Prática', category: 'study', day_of_week: 5, start_time: '11:00', end_time: '11:30', duration_minutes: 30, color: '#3b82f6', break_after_minutes: 30 },
      { template_id: template.id, title: 'Boxe', category: 'exercise', day_of_week: 5, start_time: '19:00', end_time: '20:00', duration_minutes: 60, color: '#10b981', break_after_minutes: 0 },
    ];

    await supabase
      .from('routine_template_items')
      .insert(routineItems);

    loadTemplates();
  };

  const applyTemplateToWeek = async (templateId: string, startDate: Date) => {
    const supabase = createClient();
    
    // Buscar itens do template
    const { data: items } = await supabase
      .from('routine_template_items')
      .select('*')
      .eq('template_id', templateId);

    if (!items) return;

    // Criar tarefas baseadas no template
    const tasks = items.map(item => {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + item.day_of_week);
      
      const [startHour, startMinute] = item.start_time.split(':').map(Number);
      const [endHour, endMinute] = item.end_time.split(':').map(Number);
      
      const startTime = new Date(taskDate);
      startTime.setHours(startHour, startMinute, 0);
      
      const endTime = new Date(taskDate);
      endTime.setHours(endHour, endMinute, 0);

      return {
        title: item.title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category: item.category,
        priority: item.priority,
        color: item.color,
        completed: false
      };
    });

    await supabase.from('tasks').insert(tasks);
    onTemplateApplied();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rotinas Pré-definidas</CardTitle>
              <CardDescription>
                Crie e aplique rotinas completas à sua semana
              </CardDescription>
            </div>
            <Button onClick={createDefaultTemplate} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Rotina Padrão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map(template => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.is_flexible && (
                      <Badge variant="secondary">Flexível</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const monday = getNextMonday();
                        applyTemplateToWeek(template.id, monday);
                      }}
                      className="gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Aplicar na Próxima Semana
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <Alert>
              <AlertDescription>
                Você ainda não tem rotinas criadas. Clique em "Criar Rotina Padrão" para começar!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getNextMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day; // Se domingo, próxima segunda é amanhã, senão calcular
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + diff);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}
