// joaoof/agendaai/agendaai-4fc6770d529a9cd71025793dd63d9a7825895368/components/pomodoro-modal.tsx

"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription // Adicionado para dar mais contexto ao modal
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PomodoroTimer } from "./pomodoro-timer";
import { createClient } from "@/lib/supabase/client";

interface Task {
    id: string;
    title: string;
    start_time: string;
}

interface PomodoroModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSessionComplete: () => void;
}

export function PomodoroModal({ open, onOpenChange, onSessionComplete }: PomodoroModalProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (open) {
            loadTasks();
        }
    }, [open]);

    const loadTasks = async () => {
        // Fetch only pending tasks for the current week/future, ordered by start time
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from("tasks")
            .select("id, title, start_time")
            .eq("completed", false)
            .gte("start_time", today.toISOString())
            .order("start_time", { ascending: true });

        if (error) {
            console.error("Error loading tasks for Pomodoro:", error);
            return;
        }

        if (data) {
            setTasks(data);
            // Try to pre-select the earliest pending task
            if (data.length > 0) {
                setSelectedTaskId(data[0].id);
            } else {
                setSelectedTaskId(null);
            }
        }
    };

    const activeTask = tasks.find(t => t.id === selectedTaskId) || null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>🧠 Relógio Pomodoro</DialogTitle>
                    <DialogDescription>
                        Selecione uma tarefa para focar e inicie o ciclo.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Select
                        value={selectedTaskId || ''}
                        onValueChange={setSelectedTaskId}
                    // Adicionado placeholder para o SelectValue
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a Tarefa para Focar" />
                        </SelectTrigger>
                        <SelectContent>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <SelectItem key={task.id} value={task.id}>
                                        {task.title}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-tasks-available" disabled>
                                    Nenhuma tarefa pendente
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <PomodoroTimer
                    activeTask={activeTask}
                    onSessionComplete={onSessionComplete}
                />

            </DialogContent>
        </Dialog>
    );
}