import { Process } from "./Types";

export class TreeNode {
  size: number;
  process: Process | null = null;
  left?: TreeNode;
  right?: TreeNode;

  constructor(size: number) {
    this.size = size;
  }

  isLeaf(): boolean {
    return !this.left && !this.right;
  }

  isFree(): boolean {
    return this.isLeaf() && this.process === null;
  }
}
