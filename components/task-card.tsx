interface Task {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  color: string;
}

interface TaskCardProps {
  task: Task;
  onClick: (e: React.MouseEvent) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const startTime = new Date(task.start_time);
  const endTime = new Date(task.end_time);
  const timeString = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div
      className="rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
      style={{ backgroundColor: task.color }}
      onClick={onClick}
    >
      <div className="font-medium text-white truncate">{task.title}</div>
      <div className="text-white/90 text-[10px]">{timeString}</div>
    </div>
  );
}
