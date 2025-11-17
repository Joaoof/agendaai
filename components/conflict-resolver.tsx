"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

interface Conflict {
  id: string;
  date: string;
  conflict_type: string;
  resolution_status: string;
  notes: string;
}

interface ConflictResolverProps {
  conflicts: Conflict[];
  onConflictResolved: () => void;
}

export function ConflictResolver({ conflicts, onConflictResolved }: ConflictResolverProps) {
  const resolveConflict = async (conflictId: string, resolution: 'resolved' | 'rescheduled') => {
    const supabase = createClient();
    await supabase
      .from('scheduling_conflicts')
      .update({ resolution_status: resolution })
      .eq('id', conflictId);
    
    onConflictResolved();
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'overlap':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'unexpected':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConflictLabel = (type: string) => {
    switch (type) {
      case 'overlap':
        return 'Sobreposição';
      case 'missed':
        return 'Dia Perdido';
      case 'unexpected':
        return 'Imprevisto';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolver Conflitos</CardTitle>
        <CardDescription>
          Gerencie conflitos e imprevistos na sua agenda
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Nenhum conflito detectado!</p>
            <p className="text-sm">Sua agenda está organizada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map(conflict => (
              <div key={conflict.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex gap-3">
                  {getConflictIcon(conflict.conflict_type)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {new Date(conflict.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      <Badge variant="outline">{getConflictLabel(conflict.conflict_type)}</Badge>
                    </div>
                    {conflict.notes && (
                      <p className="text-sm text-muted-foreground">{conflict.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict.id, 'rescheduled')}
                  >
                    Reagendar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(conflict.id, 'resolved')}
                  >
                    Resolver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
