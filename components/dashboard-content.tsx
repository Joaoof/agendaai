"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Clock, Target, TrendingUp, CalendarIcon, BarChart3, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  category: string;
  priority: string;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  completionRate: number;
}

export function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalHours: 0,
    completedHours: 0,
    completionRate: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    const supabase = createClient();
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (data && !error) {
      setTasks(data);
      calculateStats(data);
    }
  };

  const calculateStats = (tasks: Task[]) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    let totalHours = 0;
    let completedHours = 0;

    tasks.forEach(task => {
      const hours = (new Date(task.end_time).getTime() - new Date(task.start_time).getTime()) / (1000 * 60 * 60);
      totalHours += hours;
      if (task.completed) {
        completedHours += hours;
      }
    });

    setStats({
      totalTasks,
      completedTasks,
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  };

  const getCategoryData = () => {
    const categories: { [key: string]: { total: number; completed: number } } = {};

    tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = { total: 0, completed: 0 };
      }
      categories[task.category].total++;
      if (task.completed) {
        categories[task.category].completed++;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: data.total,
      completed: data.completed,
      pending: data.total - data.completed
    }));
  };

  const getWeeklyData = () => {
    const weeks: { [key: string]: number } = {};

    tasks.forEach(task => {
      const date = new Date(task.start_time);
      const weekNum = Math.ceil(date.getDate() / 7);
      const weekKey = `Semana ${weekNum}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = 0;
      }
      if (task.completed) {
        weeks[weekKey]++;
      }
    });

    return Object.entries(weeks).map(([week, completed]) => ({
      week,
      completed
    }));
  };

  const getCompletionData = () => [
    { name: 'Concluídas', value: stats.completedTasks, fill: '#10b981' },
    { name: 'Pendentes', value: stats.totalTasks - stats.completedTasks, fill: '#e5e7eb' }
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const StatCard = ({ icon: Icon, title, value, description, trend }: any) => (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</CardTitle>
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white shadow-lg">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
              Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: "Open Sans, sans-serif" }}>
            Acompanhe suas métricas e progresso em tempo real
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:border-purple-400 transition-colors"
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>{name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:border-purple-400 transition-colors"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarIcon}
          title="Tarefas Totais"
          value={stats.totalTasks}
          description={`${monthNames[selectedMonth]} ${selectedYear}`}
          trend={12}
        />
        <StatCard
          icon={CheckCircle2}
          title="Concluídas"
          value={stats.completedTasks}
          description={`${stats.completionRate}% de conclusão`}
          trend={8}
        />
        <StatCard
          icon={Clock}
          title="Horas Totais"
          value={`${stats.totalHours}h`}
          description="Planejadas no mês"
          trend={5}
        />
        <StatCard
          icon={TrendingUp}
          title="Horas Concluídas"
          value={`${stats.completedHours}h`}
          description={`${stats.totalHours > 0 ? Math.round((stats.completedHours / stats.totalHours) * 100) : 0}% do planejado`}
          trend={15}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="border-b border-slate-200 dark:border-slate-700 bg-transparent p-0 h-auto">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Semanal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Taxa de Conclusão</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Distribuição de tarefas concluídas vs pendentes</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCompletionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getCompletionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Progresso Semanal</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Tarefas concluídas por semana</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Tarefas por Categoria</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Distribuição de tarefas concluídas e pendentes</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoryData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Concluídas" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Análise Semanal</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Tarefas concluídas ao longo das semanas</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="completed" fill="#3b82f6" name="Concluídas" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Tasks */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Tarefas Recentes</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Últimas tarefas do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.slice(0, 10).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-1.5 rounded-lg ${task.completed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                    <CheckCircle2
                      className={`h-5 w-5 ${task.completed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-400 dark:text-slate-500'
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${task.completed
                        ? 'line-through text-slate-400 dark:text-slate-600'
                        : 'text-slate-900 dark:text-white'
                      }`} style={{ fontFamily: "Poppins, sans-serif" }}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: "Open Sans, sans-serif" }}>
                      {new Date(task.start_time).toLocaleDateString('pt-BR')} • {task.category}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${task.priority === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    task.priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                  {task.priority === 'high' ? '🔴 Alta' : task.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
