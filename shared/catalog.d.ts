import { AppData } from '../src/types';
export function canonical(value: unknown): string;
export function sharedData(data: AppData): AppData;
export interface CatalogDelta { format: number; meta: Record<string, unknown>; categories: unknown; changelog: unknown }
export function createCatalogDelta(base: AppData, next: AppData): CatalogDelta;
export function applyCatalogDelta(base: AppData, delta: CatalogDelta): AppData;
export function validateCatalog(data: unknown): AppData;
export function mergeCatalog(base: AppData, local: AppData, remote: AppData): { data: AppData; conflicts: string[] };
