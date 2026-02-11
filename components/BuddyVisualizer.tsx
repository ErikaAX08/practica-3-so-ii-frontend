"use client";

import React, { useState, useEffect } from "react";
import { BuddySystem } from "./BuddySystem";
import { TreeNode } from "./TreeNode";
import { Process, Step } from "./Types";
import TreeGraph from "./TreeGraph";
import MemoryBlocks from "./MemoryBlocks";
import ProcessList from "./ProcessList";

export default function BuddyVisualizer() {
  const [memorySize, setMemorySize] = useState(1024);
  const [buddySystem, setBuddySystem] = useState<BuddySystem | null>(null);
  const [currentTree, setCurrentTree] = useState<TreeNode | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState(false);

  // Form inputs
  const [processName, setProcessName] = useState("");
  const [processSize, setProcessSize] = useState("");
  const [memorySizeInput, setMemorySizeInput] = useState("1024");

  useEffect(() => {
    const bs = new BuddySystem(memorySize);
    setBuddySystem(bs);
    setCurrentTree(bs.getCurrentState());
    setSteps(bs.getSteps());
    setCurrentStepIndex(bs.getSteps().length - 1);
  }, [memorySize]);

  useEffect(() => {
    if (buddySystem) {
      setCurrentTree(buddySystem.getCurrentState());
      setProcesses(buddySystem.getProcesses());
      const allSteps = buddySystem.getSteps();
      setSteps(allSteps);
      setCurrentStepIndex(allSteps.length - 1);

      // Actualizar el input con el tamaño real de memoria
      const actualSize = buddySystem.getMemorySize();
      setMemorySizeInput(actualSize.toString());

      // Si el tamaño fue ajustado, actualizar también el estado
      if (actualSize !== memorySize) {
        setMemorySize(actualSize);
      }
    }
  }, [buddySystem]);

  const handleAllocate = () => {
    if (!buddySystem || !processName || !processSize) return;

    const size = parseInt(processSize);
    if (isNaN(size) || size <= 0) {
      alert("Ingresa un tamaño válido");
      return;
    }

    buddySystem.allocate(processName, size);
    setCurrentTree(buddySystem.getCurrentState());
    setProcesses(buddySystem.getProcesses());
    const allSteps = buddySystem.getSteps();
    setSteps(allSteps);
    setCurrentStepIndex(allSteps.length - 1);

    setProcessName("");
    setProcessSize("");
  };

  const handleRemove = (processName: string) => {
    if (!buddySystem) return;

    buddySystem.remove(processName);
    setCurrentTree(buddySystem.getCurrentState());
    setProcesses(buddySystem.getProcesses());
    const allSteps = buddySystem.getSteps();
    setSteps(allSteps);
    setCurrentStepIndex(allSteps.length - 1);
  };

  const handleReset = () => {
    if (!buddySystem) return;

    buddySystem.reset(memorySize);
    setCurrentTree(buddySystem.getCurrentState());
    setProcesses(buddySystem.getProcesses());
    const allSteps = buddySystem.getSteps();
    setSteps(allSteps);
    setCurrentStepIndex(allSteps.length - 1);
  };

  const handleMemorySizeChange = () => {
    const newSize = parseInt(memorySizeInput);
    if (isNaN(newSize) || newSize <= 0) {
      alert("Ingresa un tamaño de memoria válido");
      return;
    }

    // Guardar el tamaño solicitado
    const requestedSize = newSize;

    // Aplicar el nuevo tamaño
    setMemorySize(newSize);

    // Verificar si se ajustó el tamaño (esto se reflejará en el siguiente render)
    // El ajuste se hace automáticamente en BuddySystem
    setTimeout(() => {
      if (buddySystem) {
        const actualSize = buddySystem.getMemorySize();
        if (actualSize !== requestedSize) {
          alert(
            `El tamaño de memoria se ajustó de ${requestedSize} KB a ${actualSize} KB (debe ser potencia de 2)`,
          );
          setMemorySizeInput(actualSize.toString());
        }
      }
    }, 100);
  };

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index);
    if (steps[index]) {
      setCurrentTree(steps[index].snapshot);
    }
  };

  const handlePlayback = () => {
    setPlaybackMode(!playbackMode);
  };

  useEffect(() => {
    if (playbackMode && currentStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        handleStepChange(currentStepIndex + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (playbackMode && currentStepIndex >= steps.length - 1) {
      setPlaybackMode(false);
    }
  }, [playbackMode, currentStepIndex, steps.length]);

  if (!buddySystem || !currentTree) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-200">
        Cargando...
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 p-4 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* Header - Compacto */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-slate-100 text-center">
            Sistema de Asignación Buddy
          </h1>
        </div>

        {/* Controls - Compacto */}
        <div className="bg-slate-800 rounded border border-slate-700 p-3 mb-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Tamaño Memoria (KB)
              </label>
              <input
                type="number"
                value={memorySizeInput}
                onChange={(e) => setMemorySizeInput(e.target.value)}
                placeholder="1024"
                className="w-full px-3 py-1.5 text-sm rounded bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) =>
                  e.key === "Enter" && handleMemorySizeChange()
                }
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Se ajusta a potencia de 2
              </p>
            </div>
            <div className="col-span-3">
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Nombre del Proceso
              </label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="ej: P1"
                className="w-full px-3 py-1.5 text-sm rounded bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAllocate()}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Tamaño (KB)
              </label>
              <input
                type="number"
                value={processSize}
                onChange={(e) => setProcessSize(e.target.value)}
                placeholder="ej: 100"
                className="w-full px-3 py-1.5 text-sm rounded bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAllocate()}
              />
            </div>
            <div className="col-span-5 flex items-center gap-2">
              <button
                onClick={handleMemorySizeChange}
                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors"
              >
                Aplicar Memoria
              </button>
              <button
                onClick={handleAllocate}
                className="flex-1 px-4 py-1.5 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Asignar
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-slate-600 text-white text-sm rounded font-medium hover:bg-slate-700 transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        {/* Memory Info - Compacto */}
        <div className="bg-slate-800 rounded border border-slate-700 p-2 mb-3">
          <div className="flex items-center justify-around text-slate-300 text-sm">
            <div>
              <span className="font-medium text-slate-200">Memoria Total:</span>{" "}
              {memorySize} KB
            </div>
            <div>
              <span className="font-medium text-slate-200">Procesos:</span>{" "}
              {processes.length}
            </div>
            <div>
              <span className="font-medium text-slate-200">Memoria Usada:</span>{" "}
              {processes.reduce((acc, p) => acc + p.size, 0)} KB
            </div>
          </div>
        </div>

        {/* Main Content - Grid de 2 columnas */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          {/* Columna Izquierda - Árbol y Memoria */}
          <div className="col-span-8 flex flex-col gap-3 min-h-0">
            {/* Tree Visualization */}
            <div className="flex-1 bg-slate-800 rounded border border-slate-700 p-3 min-h-0 overflow-hidden">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                Árbol de Bloques
              </h2>
              <div className="h-[calc(100%-2rem)] overflow-auto">
                <TreeGraph tree={currentTree} />
              </div>
            </div>

            {/* Memory Blocks - Compacto */}
            <div className="bg-slate-800 rounded border border-slate-700 p-3">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                Vista de Memoria
              </h2>
              <MemoryBlocks tree={currentTree} totalSize={memorySize} />
            </div>
          </div>

          {/* Columna Derecha - Procesos y Timeline */}
          <div className="col-span-4 flex flex-col gap-3 min-h-0">
            {/* Process List */}
            <div className="flex-1 bg-slate-800 rounded border border-slate-700 p-3 min-h-0 overflow-hidden">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                Procesos Activos
              </h2>
              <div className="h-[calc(100%-2rem)] overflow-auto">
                <ProcessList processes={processes} onRemove={handleRemove} />
              </div>
            </div>

            {/* Timeline - Compacto */}
            <div className="bg-slate-800 rounded border border-slate-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-100">
                  Línea de Tiempo
                </h2>
                <button
                  onClick={handlePlayback}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                    playbackMode
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {playbackMode ? "Pausar" : "Reproducir"}
                </button>
              </div>

              <div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, steps.length - 1)}
                  value={currentStepIndex}
                  onChange={(e) => handleStepChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-slate-400 text-xs mt-1">
                  <span>
                    Paso {currentStepIndex + 1} / {steps.length}
                  </span>
                  <span className="truncate ml-2">
                    {steps[currentStepIndex]?.message}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
