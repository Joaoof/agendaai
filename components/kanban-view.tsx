"use client";

import { useState } from "react";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

interface KanbanViewProps {
  tasks: Task[];
  onTasksChange: () => void;
}

const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: '#ef4444', status: false },
  { id: 'done', title: 'Concluído', color: '#10b981', status: true },
];

export function KanbanView({ tasks, onTasksChange }: KanbanViewProps) {
  const [selectedColumn, setSelectedColumn] = useState<boolean | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  const getTasksByStatus = (status: boolean) => {
    return tasks.filter(task => task.completed === status);
  };

  const handleAddTask = (status: boolean) => {
    setSelectedColumn(status);
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setSelectedColumn(null);
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

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-card p-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Modo Trello
        </h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <div
                key={column.id}
                className="flex flex-col bg-muted/50 rounded-lg border"
              >
                <div
                  className="p-4 border-b flex items-center justify-between"
                  style={{ backgroundColor: column.color }}
                >
                  <h3 className="font-semibold text-white">
                    {column.title}
                    <span className="ml-2 text-sm opacity-80">
                      ({columnTasks.length})
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => handleAddTask(column.status)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-auto">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group bg-background rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => {}}
                          onClick={(e) => handleTaskComplete(task, e)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <button
                              onClick={(e) => handleTaskDelete(task.id, e)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {task.category === 'work' ? 'Trabalho' :
                               task.category === 'personal' ? 'Pessoal' :
                               task.category === 'study' ? 'Estudo' :
                               task.category === 'health' ? 'Saúde' : 'Outros'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(task.start_time).toLocaleDateString('pt-BR')}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(task.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma tarefa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={new Date()}
        task={editingTask}
        onTaskSaved={onTasksChange}
      />
    </div>
  );
}
