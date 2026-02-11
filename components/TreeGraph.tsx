"use client";

import { useEffect, useRef } from "react";
import { TreeNode } from "./TreeNode";

interface TreeGraphProps {
  tree: TreeNode;
}

// Utility functions to handle plain objects
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

export default function TreeGraph({ tree }: TreeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 500;
    }

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
        const leftX = x - horizontalSpacing;
        const leftY = y + 80;
        calculatePositions(node.left, leftX, leftY, horizontalSpacing / 2);
      }

      if (node.right) {
        const rightX = x + horizontalSpacing;
        const rightY = y + 80;
        calculatePositions(node.right, rightX, rightY, horizontalSpacing / 2);
      }
    };

    calculatePositions(tree, canvas.width / 2, 50, canvas.width / 4);

    // Draw connections first
    positions.forEach(({ x, y, node }) => {
      if (node.left) {
        const leftPos = positions.find((p) => p.node === node.left);
        if (leftPos) {
          ctx.beginPath();
          ctx.moveTo(x, y + 25);
          ctx.lineTo(leftPos.x, leftPos.y - 25);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      if (node.right) {
        const rightPos = positions.find((p) => p.node === node.right);
        if (rightPos) {
          ctx.beginPath();
          ctx.moveTo(x, y + 25);
          ctx.lineTo(rightPos.x, rightPos.y - 25);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });

    // Draw nodes
    positions.forEach(({ x, y, node }) => {
      const radius = 40;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      if (node.process) {
        // Filled with process color
        ctx.fillStyle = node.process.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (isFree(node)) {
        // Free node - white border
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Split node - gray
        ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Text
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
    });
  }, [tree]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full bg-slate-700 rounded border border-slate-600"
      />
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
    </div>
  );
}
