// joaoof/agendaai/agendaai-4fc6770d529a9cd71025793dd63d9a7825895368/components/pomodoro-timer.tsx (Novo Código)

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge"; // Adicionado Badge para o contador

interface Task {
    id: string;
    title: string;
}

interface PomodoroTimerProps {
    activeTask: Task | null;
    onSessionComplete: () => void;
}

const POMODORO_DURATIONS = {
    FOCUS: 25 * 60, // 25 minutes in seconds
    SHORT_BREAK: 5 * 60,   // 5 minutes
    LONG_BREAK: 15 * 60,  // 15 minutes
};

type SessionType = 'focus' | 'short-break' | 'long-break';

export function PomodoroTimer({ activeTask, onSessionComplete }: PomodoroTimerProps) {
    const [sessionType, setSessionType] = useState<SessionType>('focus');
    const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS.FOCUS);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const supabase = createClient();

    const resetTimer = useCallback((type: SessionType = 'focus') => {
        setSessionType(type);
        setIsActive(false);
        switch (type) {
            case 'focus':
                setTimeLeft(POMODORO_DURATIONS.FOCUS);
                break;
            case 'short-break':
                setTimeLeft(POMODORO_DURATIONS.SHORT_BREAK);
                break;
            case 'long-break':
                setTimeLeft(POMODORO_DURATIONS.LONG_BREAK);
                break;
        }
    }, []);

    useEffect(() => {
        resetTimer(sessionType);
    }, [sessionType, resetTimer]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            clearInterval(interval!);
            handleTimerEnd();
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, timeLeft]);

    const saveSession = async (type: SessionType) => {
        if (type !== 'focus' || !activeTask) return;

        const duration = POMODORO_DURATIONS.FOCUS / 60;

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error } = await supabase.from('pomodoro_sessions').insert({
            user_id: userData.user.id,
            task_id: activeTask.id,
            duration_minutes: duration,
            session_type: type,
        });

        if (error) {
            console.error("Error saving pomodoro session:", error);
        } else {
            onSessionComplete();
        }
    };

    const handleTimerEnd = async () => {
        setIsActive(false);

        if (sessionType === 'focus') {
            await saveSession('focus');
            setPomodoroCount(prevCount => prevCount + 1);

            if ((pomodoroCount + 1) % 4 === 0) {
                setSessionType('long-break');
            } else {
                setSessionType('short-break');
            }
        } else {
            setSessionType('focus');
        }

        setTimeout(() => {
            setIsActive(true);
        }, 2000);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const handleReset = () => {
        setPomodoroCount(0);
        resetTimer('focus');
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const getStatusText = () => {
        switch (sessionType) {
            case 'focus':
                return activeTask ? `Focando em: ${activeTask.title}` : 'Selecione uma Tarefa Acima';
            case 'short-break':
                return 'Hora de respirar um pouco!';
            case 'long-break':
                return 'Pausa estendida merecida.';
            default:
                return 'Pronto para começar?';
        }
    };

    const getSessionColorClasses = (type: SessionType) => {
        const base = 'transition-colors duration-300';
        switch (type) {
            case 'focus':
                return {
                    bg: 'bg-red-500',
                    text: 'text-red-500',
                    hover: 'hover:bg-red-600',
                    border: 'border-red-500'
                };
            case 'short-break':
                return {
                    bg: 'bg-green-500',
                    text: 'text-green-500',
                    hover: 'hover:bg-green-600',
                    border: 'border-green-500'
                };
            case 'long-break':
                return {
                    bg: 'bg-blue-500',
                    text: 'text-blue-500',
                    hover: 'hover:bg-blue-600',
                    border: 'border-blue-500'
                };
        }
    }

    const { bg, text, hover, border } = getSessionColorClasses(sessionType);
    const primaryActionDisabled = !activeTask && sessionType === 'focus';

    return (
        <div className="flex flex-col items-center gap-6 p-4 bg-background border rounded-lg w-full">

            {/* HEADER: Session Title & Pomodoro Count */}
            <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-xl font-bold font-heading text-foreground">
                        {sessionType === 'focus' ? 'Foco' : sessionType === 'short-break' ? 'Pausa Curta' : 'Pausa Longa'}
                    </h2>
                    <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {pomodoroCount}
                    </Badge>
                </div>
                <p className="text-muted-foreground text-sm font-sans">{getStatusText()}</p>
            </div>

            {/* TIMER DISPLAY */}
            <div className="relative">
                <div className={`text-8xl font-mono font-extrabold ${text} transition-colors duration-500`}>
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50 animate-pulse">
                        {sessionType === 'focus' ? 'Em Foco' : 'Em Pausa'}
                    </div>
                )}
            </div>

            {/* CONTROLS */}
            <div className="flex gap-4 w-full justify-center">
                <Button
                    onClick={toggleTimer}
                    disabled={primaryActionDisabled}
                    className={`text-white ${bg} ${hover} shadow-lg ${primaryActionDisabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-purple-500/30'}`}
                    size="lg"
                >
                    {isActive ? (
                        <PauseCircle className="h-5 w-5" />
                    ) : (
                        <PlayCircle className="h-5 w-5" />
                    )}
                    {isActive ? 'PAUSAR' : 'INICIAR'}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    size="lg"
                    className="border-input hover:bg-accent"
                >
                    <RotateCcw className="h-4 w-4" />
                    Resetar
                </Button>
            </div>

            {/* SESSION TYPES TABS */}
            <div className="flex gap-2 pt-4 border-t border-border w-full justify-center">
                {/* Use classes de estilo condicional para indicar o tipo ativo */}
                {([
                    { type: 'focus', label: 'Foco (25m)', duration: POMODORO_DURATIONS.FOCUS / 60 },
                    { type: 'short-break', label: 'Pausa Curta (5m)', duration: POMODORO_DURATIONS.SHORT_BREAK / 60 },
                    { type: 'long-break', label: 'Pausa Longa (15m)', duration: POMODORO_DURATIONS.LONG_BREAK / 60 }
                ] as { type: SessionType, label: string, duration: number }[]).map(item => (
                    <Button
                        key={item.type}
                        variant={sessionType === item.type ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => resetTimer(item.type)}
                        className={sessionType === item.type ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}