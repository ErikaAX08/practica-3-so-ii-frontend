import { TreeNode } from "./TreeNode";
import { Process, Step } from "./Types";

const COLOR_PALETTE = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F0B27A",
  "#82E0AA",
];

export class BuddySystem {
  private root: TreeNode;
  private steps: Step[] = [];
  private colorIndex: number = 0;
  private memorySize: number;

  constructor(memorySize: number) {
    // Si no es potencia de 2, ajustar automáticamente
    if (!this.isPowerOfTwo(memorySize)) {
      const adjusted = this.nextPowerOfTwo(memorySize);
      this.memorySize = adjusted;
      this.root = new TreeNode(adjusted);
      this.saveStep(
        `Memoria ajustada de ${memorySize} KB a ${adjusted} KB (potencia de 2)`,
      );
    } else {
      this.memorySize = memorySize;
      this.root = new TreeNode(memorySize);
      this.saveStep("Memoria inicializada");
    }
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  private nextPowerOfTwo(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  private getNextColor(): string {
    const color = COLOR_PALETTE[this.colorIndex % COLOR_PALETTE.length];
    this.colorIndex++;
    return color;
  }

  private cloneTree(): TreeNode {
    const clone = (node: TreeNode): TreeNode => {
      const newNode = new TreeNode(node.size);
      newNode.process = node.process ? { ...node.process } : null;
      if (node.left) {
        newNode.left = clone(node.left);
      }
      if (node.right) {
        newNode.right = clone(node.right);
      }
      return newNode;
    };
    return clone(this.root);
  }

  private saveStep(message: string) {
    this.steps.push({
      message,
      snapshot: this.cloneTree(),
    });
  }

  private findProcess(node: TreeNode | undefined, name: string): boolean {
    if (!node) return false;
    if (node.process?.name === name) return true;
    return (
      this.findProcess(node.left, name) || this.findProcess(node.right, name)
    );
  }

  allocate(name: string, size: number): boolean {
    if (!name || size <= 0) {
      this.saveStep("Error: datos inválidos");
      return false;
    }

    if (this.findProcess(this.root, name)) {
      this.saveStep(`Error: proceso "${name}" ya existe`);
      return false;
    }

    const realSize = this.nextPowerOfTwo(size);
    const process: Process = {
      name,
      size: realSize,
      color: this.getNextColor(),
    };

    const ok = this.allocateRec(this.root, process, realSize);
    if (!ok) {
      this.saveStep(`Proceso ${name} muerto`);
    }
    return ok;
  }

  private allocateRec(node: TreeNode, proc: Process, size: number): boolean {
    this.saveStep(`Evaluando bloque ${node.size} KB`);

    if (!node.isLeaf()) {
      return (
        (node.left ? this.allocateRec(node.left, proc, size) : false) ||
        (node.right ? this.allocateRec(node.right, proc, size) : false)
      );
    }

    if (!node.isFree() || node.size < size) return false;

    if (node.size === size) {
      node.process = proc;
      this.saveStep(
        `Proceso ${proc.name} asignado (${size} KB) [${proc.color}]`,
      );
      return true;
    }

    node.left = new TreeNode(node.size / 2);
    node.right = new TreeNode(node.size / 2);
    this.saveStep(`Bloque ${node.size} KB dividido`);

    return this.allocateRec(node.left, proc, size);
  }

  remove(process: string): boolean {
    const ok = this.removeRec(this.root, process);
    if (!ok) {
      this.saveStep(`Proceso ${process} no encontrado`);
    }
    return ok;
  }

  private removeRec(node?: TreeNode, proc?: string): boolean {
    if (!node) return false;

    if (node.process?.name === proc) {
      node.process = null;
      this.saveStep(`Proceso ${proc} liberado`);
      return true;
    }

    const removed =
      this.removeRec(node.left, proc) || this.removeRec(node.right, proc);

    if (removed && node.left?.isFree() && node.right?.isFree()) {
      node.left = undefined;
      node.right = undefined;
      this.saveStep(`Bloques fusionados (${node.size} KB)`);
    }

    return removed;
  }

  private collectProcesses(node: TreeNode | undefined, list: Process[]): void {
    if (!node) return;
    if (node.process) {
      list.push(node.process);
    }
    this.collectProcesses(node.left, list);
    this.collectProcesses(node.right, list);
  }

  getProcesses(): Process[] {
    const list: Process[] = [];
    this.collectProcesses(this.root, list);
    return list;
  }

  reset(memorySize?: number): void {
    const size = memorySize ?? this.memorySize;

    // Si no es potencia de 2, ajustar automáticamente
    if (!this.isPowerOfTwo(size)) {
      const adjusted = this.nextPowerOfTwo(size);
      this.memorySize = adjusted;
      this.root = new TreeNode(adjusted);
      this.steps = [];
      this.colorIndex = 0;
      this.saveStep(
        `Memoria reinicializada y ajustada de ${size} KB a ${adjusted} KB (potencia de 2)`,
      );
    } else {
      this.memorySize = size;
      this.root = new TreeNode(size);
      this.steps = [];
      this.colorIndex = 0;
      this.saveStep("Memoria reinicializada");
    }
  }

  getSteps(): Step[] {
    return this.steps;
  }

  getCurrentState(): TreeNode {
    return this.cloneTree();
  }

  // Método para obtener el tamaño actual de memoria (útil para el frontend)
  getMemorySize(): number {
    return this.memorySize;
  }
}
