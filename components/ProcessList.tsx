"use client";

import { Process } from "./Types";

interface ProcessListProps {
  processes: Process[];
  onRemove: (processName: string) => void;
}

export default function ProcessList({ processes, onRemove }: ProcessListProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No hay procesos activos</p>
        <p className="text-xs mt-2">Asigna un proceso para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {processes.map((process, index) => (
        <div
          key={index}
          className="p-3 rounded border-2 transition-all"
          style={{
            backgroundColor: `${process.color}15`,
            borderColor: process.color,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: process.color }}
              />
              <div>
                <div className="text-slate-100 font-semibold text-sm">
                  {process.name}
                </div>
                <div className="text-slate-400 text-xs">{process.size} KB</div>
              </div>
            </div>
            <button
              onClick={() => onRemove(process.name)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            >
              Liberar
            </button>
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-slate-700">
        <div className="text-slate-400 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Total procesos:</span>
            <span className="font-semibold text-slate-200">
              {processes.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Memoria total usada:</span>
            <span className="font-semibold text-slate-200">
              {processes.reduce((acc, p) => acc + p.size, 0)} KB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
