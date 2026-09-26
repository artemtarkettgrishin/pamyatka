import { AppData } from '../src/types';
export function canonical(value: unknown): string;
export function sharedData(data: AppData): AppData;
export function validateCatalog(data: unknown): AppData;
export function mergeCatalog(base: AppData, local: AppData, remote: AppData): { data: AppData; conflicts: string[] };
