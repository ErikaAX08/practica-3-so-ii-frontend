"use client";

import React from "react";
import { TreeNode } from "./TreeNode";

interface MemoryBlocksProps {
  tree: TreeNode;
  totalSize: number;
}

// Utility functions to handle plain objects
const isLeaf = (node: any): boolean => {
  return !node.left && !node.right;
};

interface Block {
  start: number;
  size: number;
  process: string | null;
  color: string | null;
}

export default function MemoryBlocks({ tree, totalSize }: MemoryBlocksProps) {
  const blocks: Block[] = [];

  const collectBlocks = (node: TreeNode, start: number) => {
    if (isLeaf(node)) {
      blocks.push({
        start,
        size: node.size,
        process: node.process?.name || null,
        color: node.process?.color || null,
      });
    } else {
      if (node.left) {
        collectBlocks(node.left, start);
      }
      if (node.right) {
        collectBlocks(node.right, start + node.size / 2);
      }
    }
  };

  collectBlocks(tree, 0);

  // Sort blocks by start position
  blocks.sort((a, b) => a.start - b.start);

  return (
    <div className="space-y-2">
      {/* Linear representation - más compacto */}
      <div className="relative h-12 bg-slate-700 rounded overflow-hidden flex border border-slate-600">
        {blocks.map((block, index) => {
          const widthPercent = (block.size / totalSize) * 100;
          return (
            <div
              key={index}
              className="relative flex items-center justify-center border-r border-slate-600 last:border-r-0 transition-all"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: block.color || "#334155",
              }}
            >
              {block.process && (
                <div className="text-center px-1">
                  <div className="text-white font-semibold text-xs truncate">
                    {block.process}
                  </div>
                  <div className="text-slate-200 text-[10px]">{block.size} KB</div>
                </div>
              )}
              {!block.process && block.size >= totalSize / 8 && (
                <div className="text-slate-400 text-[10px]">{block.size} KB</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Statistics - más compacto */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-slate-700 rounded border border-slate-600">
          <div className="text-slate-400 text-[10px] uppercase">Total</div>
          <div className="text-slate-100 text-lg font-semibold">{blocks.length}</div>
        </div>
        <div className="text-center p-2 bg-slate-700 rounded border border-slate-600">
          <div className="text-slate-400 text-[10px] uppercase">Libres</div>
          <div className="text-slate-100 text-lg font-semibold">
            {blocks.filter((b) => !b.process).length}
          </div>
        </div>
        <div className="text-center p-2 bg-slate-700 rounded border border-slate-600">
          <div className="text-slate-400 text-[10px] uppercase">Usados</div>
          <div className="text-slate-100 text-lg font-semibold">
            {blocks.filter((b) => b.process).length}
          </div>
        </div>
        <div className="text-center p-2 bg-slate-700 rounded border border-slate-600">
          <div className="text-slate-400 text-[10px] uppercase">Fragmentación</div>
          <div className="text-slate-100 text-lg font-semibold">
            {Math.round(
              (blocks.filter((b) => !b.process).length / blocks.length) * 100,
            )}
            %
          </div>
        </div>
      </div>
    </div>
  );
}