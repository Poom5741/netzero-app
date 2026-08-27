/**
 * Strategy registry — every technique plugs in here.
 */
import type { ClassifierBinding } from "./runner.js";

export interface StrategyEntry {
  name: string;
  description: string;
  binding: ClassifierBinding;
}

const strategies: StrategyEntry[] = [];

export function registerStrategy(entry: StrategyEntry): void {
  if (strategies.some((s) => s.name === entry.name)) {
    throw new Error(`Strategy "${entry.name}" already registered`);
  }
  strategies.push(entry);
}

export function listStrategies(): StrategyEntry[] {
  return [...strategies];
}

export function clearRegistry(): void {
  strategies.length = 0;
}
