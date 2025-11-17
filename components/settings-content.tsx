"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
  work_hours_start: string;
  work_hours_end: string;
  default_task_duration: number;
}

export function SettingsContent() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications_enabled: true,
    work_hours_start: '09:00',
    work_hours_end: '18:00',
    default_task_duration: 60
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setPreferences(data);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso."
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência e preferências
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="work">Horário de Trabalho</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select 
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences({...preferences, theme: value})}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Gerencie suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Ativadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre suas tarefas
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications_enabled}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, notifications_enabled: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Trabalho</CardTitle>
              <CardDescription>Defina seu horário padrão de trabalho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="work-start">Início</Label>
                  <Input
                    id="work-start"
                    type="time"
                    value={preferences.work_hours_start}
                    onChange={(e) => 
                      setPreferences({...preferences, work_hours_start: e.target.value})
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-end">Término</Label>
                  <Input
                    id="work-end"
                    type="time"
                    value={preferences.work_hours_end}
                    onChange={(e) => 
                      setPreferences({...preferences, work_hours_end: e.target.value})
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Essas configurações serão usadas como padrão ao criar novas tarefas
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Tarefas</CardTitle>
              <CardDescription>Personalize como suas tarefas são criadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração Padrão (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={preferences.default_task_duration}
                  onChange={(e) => 
                    setPreferences({...preferences, default_task_duration: parseInt(e.target.value)})
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Duração padrão para novas tarefas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
