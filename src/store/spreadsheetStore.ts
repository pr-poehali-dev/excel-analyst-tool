import { useState, useCallback } from 'react';

export type CellType = 'text' | 'number' | 'formula' | 'video' | 'link';

export interface CellData {
  value: string;
  type: CellType;
  formatted?: string;
  videoUrl?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
}

export interface Comment {
  id: string;
  cellRef: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  author: string;
  description: string;
  cellRef?: string;
  oldValue?: string;
  newValue?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  activeCellRef?: string;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Record<string, CellData>;
}

export interface SpreadsheetFile {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  sheets: Sheet[];
  activeSheetId: string;
}

const COLS = 26;
const ROWS = 50;

export function generateCellRef(row: number, col: number): string {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = match[1].charCodeAt(0) - 65;
  const row = parseInt(match[2]) - 1;
  return { row, col };
}

export function isVideoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|rutube\.ru/i.test(url);
}

export function getVideoEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  const rutubeMatch = url.match(/rutube\.ru\/video\/([^/?]+)/);
  if (rutubeMatch) return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;

  return null;
}

function createDefaultSheet(id: string, name: string): Sheet {
  return { id, name, cells: {} };
}

function createDefaultFile(id: string, name: string): SpreadsheetFile {
  const sheet1 = createDefaultSheet('sheet-1', 'Лист 1');
  return {
    id,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    sheets: [sheet1],
    activeSheetId: 'sheet-1',
  };
}

const demoFile = createDefaultFile('demo-1', 'Рабочая книга 1');
const demoSheet = demoFile.sheets[0];

// Pre-fill with some demo data
const demoData: Record<string, Partial<CellData>> = {
  A1: { value: 'Продукт', bold: true, bgColor: '#1a2a1a' },
  B1: { value: 'Январь', bold: true, bgColor: '#1a2a1a', align: 'center' },
  C1: { value: 'Февраль', bold: true, bgColor: '#1a2a1a', align: 'center' },
  D1: { value: 'Март', bold: true, bgColor: '#1a2a1a', align: 'center' },
  E1: { value: 'Итого', bold: true, bgColor: '#1a2a1a', align: 'center' },
  A2: { value: 'Телефоны' },
  B2: { value: '1250000', type: 'number' },
  C2: { value: '1380000', type: 'number' },
  D2: { value: '1520000', type: 'number' },
  A3: { value: 'Ноутбуки' },
  B3: { value: '2100000', type: 'number' },
  C3: { value: '1950000', type: 'number' },
  D3: { value: '2300000', type: 'number' },
  A4: { value: 'Планшеты' },
  B4: { value: '890000', type: 'number' },
  C4: { value: '920000', type: 'number' },
  D4: { value: '1100000', type: 'number' },
  A5: { value: 'Аксессуары' },
  B5: { value: '340000', type: 'number' },
  C5: { value: '410000', type: 'number' },
  D5: { value: '380000', type: 'number' },
  A7: { value: 'Обзор продукта', bold: true },
  B7: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video' },
};

Object.entries(demoData).forEach(([ref, data]) => {
  demoSheet.cells[ref] = { value: data.value || '', type: data.type || 'text', ...data } as CellData;
});

const sampleFiles: SpreadsheetFile[] = [
  demoFile,
  createDefaultFile('demo-2', 'Бюджет 2024'),
  createDefaultFile('demo-3', 'Отчёт продаж Q1'),
];

const sampleComments: Comment[] = [
  {
    id: 'c1',
    cellRef: 'B2',
    author: 'Алексей К.',
    avatar: 'АК',
    text: 'Нужно перепроверить данные за январь',
    timestamp: new Date(Date.now() - 3600000),
    resolved: false,
  },
  {
    id: 'c2',
    cellRef: 'D3',
    author: 'Мария С.',
    avatar: 'МС',
    text: 'Отличный рост! +18% к предыдущему кварталу',
    timestamp: new Date(Date.now() - 7200000),
    resolved: false,
  },
];

const sampleCollaborators: Collaborator[] = [
  { id: 'u1', name: 'Алексей К.', avatar: 'АК', color: '#00f5a0', activeCellRef: 'B3' },
  { id: 'u2', name: 'Мария С.', avatar: 'МС', color: '#a855f7', activeCellRef: 'D5' },
];

const sampleHistory: HistoryEntry[] = [
  {
    id: 'h1',
    timestamp: new Date(Date.now() - 1800000),
    author: 'Алексей К.',
    description: 'Изменено значение',
    cellRef: 'B2',
    oldValue: '1200000',
    newValue: '1250000',
  },
  {
    id: 'h2',
    timestamp: new Date(Date.now() - 3600000),
    author: 'Мария С.',
    description: 'Добавлена строка',
    cellRef: 'A5',
  },
  {
    id: 'h3',
    timestamp: new Date(Date.now() - 7200000),
    author: 'Вы',
    description: 'Создан документ',
  },
];

export const TEMPLATES = [
  {
    id: 't1',
    name: 'Бюджет семьи',
    category: 'Финансы',
    icon: '💰',
    description: 'Учёт доходов и расходов',
    color: '#00f5a0',
  },
  {
    id: 't2',
    name: 'Отчёт продаж',
    category: 'Продажи',
    icon: '📈',
    description: 'Анализ продаж по периодам',
    color: '#a855f7',
  },
  {
    id: 't3',
    name: 'График проекта',
    category: 'Управление',
    icon: '📋',
    description: 'Диаграмма Ганта для проекта',
    color: '#38bdf8',
  },
  {
    id: 't4',
    name: 'Инвентаризация',
    category: 'Склад',
    icon: '📦',
    description: 'Учёт товаров на складе',
    color: '#fb923c',
  },
  {
    id: 't5',
    name: 'KPI сотрудников',
    category: 'HR',
    icon: '👥',
    description: 'Показатели эффективности',
    color: '#f472b6',
  },
  {
    id: 't6',
    name: 'Медиаплан',
    category: 'Маркетинг',
    icon: '🎯',
    description: 'Планирование рекламы с видео',
    color: '#34d399',
  },
];

export { sampleFiles, sampleComments, sampleCollaborators, sampleHistory, COLS, ROWS };
