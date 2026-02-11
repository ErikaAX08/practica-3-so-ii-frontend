import { TreeNode } from "./TreeNode";

export interface Process {
  name: string;
  size: number;
  color: string;
}

export interface Step {
  message: string;
  snapshot: TreeNode;
}
