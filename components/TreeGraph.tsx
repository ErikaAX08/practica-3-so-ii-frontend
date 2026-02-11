"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { TreeNode } from "./TreeNode";

interface TreeGraphProps {
  tree: TreeNode;
}

const isLeaf = (node: any): boolean => {
  return !node.left && !node.right;
};

const isFree = (node: any): boolean => {
  return isLeaf(node) && node.process === null;
};

interface NodePosition {
  x: number;
  y: number;
  node: TreeNode;
}

export default function TreeGraphAdvanced({ tree }: TreeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });
  const [showMinimap, setShowMinimap] = useState(true);

  // Calculate tree dimensions
  const getTreeDimensions = useCallback(
    (node: TreeNode | null): { depth: number; width: number } => {
      if (!node) return { depth: 0, width: 0 };

      const leftDim = getTreeDimensions(node.left);
      const rightDim = getTreeDimensions(node.right);

      return {
        depth: 1 + Math.max(leftDim.depth, rightDim.depth),
        width: 1 + leftDim.width + rightDim.width,
      };
    },
    [],
  );

  // Draw tree function
  const drawTree = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      positions: NodePosition[],
      nodeRadius: number,
      applyTransform: boolean = true,
    ) => {
      if (applyTransform) {
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
      }

      // Draw connections
      positions.forEach(({ x, y, node }) => {
        if (node.left) {
          const leftPos = positions.find((p) => p.node === node.left);
          if (leftPos) {
            ctx.beginPath();
            ctx.moveTo(x, y + nodeRadius);
            ctx.lineTo(leftPos.x, leftPos.y - nodeRadius);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = applyTransform ? 2 : 1;
            ctx.stroke();
          }
        }

        if (node.right) {
          const rightPos = positions.find((p) => p.node === node.right);
          if (rightPos) {
            ctx.beginPath();
            ctx.moveTo(x, y + nodeRadius);
            ctx.lineTo(rightPos.x, rightPos.y - nodeRadius);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = applyTransform ? 2 : 1;
            ctx.stroke();
          }
        }
      });

      // Draw nodes
      positions.forEach(({ x, y, node }) => {
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);

        if (node.process) {
          ctx.fillStyle = node.process.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = applyTransform ? 3 : 1.5;
          ctx.stroke();
        } else if (isFree(node)) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = applyTransform ? 2 : 1;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = applyTransform ? 2 : 1;
          ctx.stroke();
        }

        if (applyTransform) {
          // Text (only on main canvas)
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (node.process) {
            ctx.fillText(node.process.name, x, y - 8);
            ctx.font = "12px sans-serif";
            ctx.fillText(`${node.size} KB`, x, y + 8);
          } else {
            ctx.fillText(`${node.size} KB`, x, y - 4);
            if (isFree(node)) {
              ctx.font = "10px sans-serif";
              ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
              ctx.fillText("LIBRE", x, y + 10);
            }
          }
        }
      });

      if (applyTransform) {
        ctx.restore();
      }
    },
    [pan, zoom],
  );

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const minimap = minimapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate tree dimensions
    const dimensions = getTreeDimensions(tree);
    const treeDepth = dimensions.depth;
    const treeWidth = Math.pow(2, treeDepth - 1);

    const nodeRadius = 40;
    const verticalSpacing = 100;
    const horizontalSpacing = 120;

    const canvasWidth = Math.max(1200, treeWidth * horizontalSpacing);
    const canvasHeight = Math.max(600, treeDepth * verticalSpacing + 100);

    setCanvasSize({ width: canvasWidth, height: canvasHeight });
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate positions
    const positions: NodePosition[] = [];

    const calculatePositions = (
      node: TreeNode,
      x: number,
      y: number,
      horizontalSpacing: number,
    ) => {
      positions.push({ x, y, node });

      if (node.left) {
        calculatePositions(
          node.left,
          x - horizontalSpacing,
          y + verticalSpacing,
          horizontalSpacing / 2,
        );
      }

      if (node.right) {
        calculatePositions(
          node.right,
          x + horizontalSpacing,
          y + verticalSpacing,
          horizontalSpacing / 2,
        );
      }
    };

    const initialSpacing = Math.max(horizontalSpacing * 2, canvasWidth / 4);
    calculatePositions(tree, canvasWidth / 2, 60, initialSpacing);

    // Draw main tree
    drawTree(ctx, positions, nodeRadius, true);

    // Draw minimap
    if (minimap && showMinimap) {
      const minimapCtx = minimap.getContext("2d");
      if (minimapCtx) {
        const minimapWidth = 200;
        const minimapHeight = 150;
        minimap.width = minimapWidth;
        minimap.height = minimapHeight;

        const scale = Math.min(
          minimapWidth / canvasWidth,
          minimapHeight / canvasHeight,
        );

        minimapCtx.clearRect(0, 0, minimapWidth, minimapHeight);
        minimapCtx.save();
        minimapCtx.scale(scale, scale);

        // Draw tree on minimap
        drawTree(minimapCtx, positions, nodeRadius / 2, false);

        minimapCtx.restore();

        // Draw viewport indicator
        const container = containerRef.current;
        if (container) {
          const viewportWidth = container.clientWidth;
          const viewportHeight = Math.min(container.clientHeight, 600);

          const viewX = (-pan.x / zoom) * scale;
          const viewY = (-pan.y / zoom) * scale;
          const viewW = (viewportWidth / zoom) * scale;
          const viewH = (viewportHeight / zoom) * scale;

          minimapCtx.strokeStyle = "rgba(255, 215, 0, 0.8)";
          minimapCtx.lineWidth = 2;
          minimapCtx.strokeRect(viewX, viewY, viewW, viewH);
          minimapCtx.fillStyle = "rgba(255, 215, 0, 0.1)";
          minimapCtx.fillRect(viewX, viewY, viewW, viewH);
        }
      }
    }
  }, [tree, zoom, pan, showMinimap, drawTree, getTreeDimensions]);

  // Event handlers
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(0.1, prev * delta), 3));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev * 0.8, 0.1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitView = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(container.clientHeight, 600);
    const scaleX = containerWidth / canvasSize.width;
    const scaleY = containerHeight / canvasSize.height;
    const newZoom = Math.min(scaleX, scaleY) * 0.9;

    setZoom(newZoom);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-600 transition-colors shadow-lg"
          title="Zoom In"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-600 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          onClick={handleFitView}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-600 transition-colors shadow-lg"
          title="Fit to View"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-600 transition-colors shadow-lg"
          title="Reset View"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-600 transition-colors shadow-lg"
          title="Toggle Minimap"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg border border-slate-600 text-sm shadow-lg">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-600 p-2 shadow-lg">
          <canvas ref={minimapRef} className="rounded" />
          <div className="text-xs text-slate-400 text-center mt-1">Mapa</div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="overflow-auto max-h-[600px] bg-slate-700 rounded border border-slate-600 shadow-xl">
        <canvas
          ref={canvasRef}
          className={`${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-slate-400 border-dashed bg-slate-700"></div>
          <span className="text-slate-300">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-slate-500 bg-slate-600"></div>
          <span className="text-slate-300">Dividido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-600"></div>
          <span className="text-slate-300">Ocupado</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">🖱️ Arrastrar:</span>
            <span>Haz clic y arrastra para mover el árbol</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">🔍 Zoom:</span>
            <span>Usa la rueda del mouse o los botones +/-</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">📐 Ajustar:</span>
            <span>Usa el botón "Fit to View" para ver todo el árbol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
