"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  task: Task | null;
  onTaskSaved: () => void;
  timeSlot?: { start: number; end: number };
  defaultColor?: string;
}

const COLORS = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Verde", value: "#10b981" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
];

export function TaskDialog({
  open,
  onOpenChange,
  selectedDate,
  task,
  onTaskSaved,
  timeSlot,
  defaultColor,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(COLORS[0].value);
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState("medium");
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      const start = new Date(task.start_time);
      const end = new Date(task.end_time);
      setStartTime(
        `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`
      );
      setEndTime(
        `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`
      );
      setColor(task.color);
      setCategory(task.category || "work");
      setPriority(task.priority || "medium");
      setCompleted(task.completed || false);
    } else {
      setTitle("");
      setDescription("");
      if (timeSlot) {
        const startHour = Math.floor(timeSlot.start);
        const startMinute = Math.round((timeSlot.start % 1) * 60);
        const endHour = Math.floor(timeSlot.end);
        const endMinute = Math.round((timeSlot.end % 1) * 60);
        setStartTime(`${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`);
        setEndTime(`${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`);
      } else {
        setStartTime("09:00");
        setEndTime("10:00");
      }
      setColor(defaultColor || COLORS[0].value);
      setCategory("work");
      setPriority("medium");
      setCompleted(false);
    }
  }, [task, open, timeSlot, defaultColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsLoading(true);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setIsLoading(false);
      return;
    }

    try {
      if (task) {
        const { error } = await supabase
          .from("tasks")
          .update({
            title,
            description: description || null,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            color,
            category,
            priority,
            completed,
            completed_at: completed ? (task.completed_at || new Date().toISOString()) : null,
          })
          .eq("id", task.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          title,
          description: description || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          color,
          user_id: userData.user.id,
          category,
          priority,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });

        if (error) throw error;
      }

      onTaskSaved();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) throw error;
      onTaskSaved();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {selectedDate?.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reunião, Tarefa, Evento..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes sobre a tarefa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="study">Estudo</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Início</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">Fim</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === c.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    } transition-all`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {task && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={completed}
                  onCheckedChange={(checked) => setCompleted(checked as boolean)}
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Marcar como concluída
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {task && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
