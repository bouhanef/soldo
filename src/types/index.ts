export interface Category {
  _id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface Source {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Expense {
  _id: string;
  date: string;
  categoryId: Category;
  sourceId: Source;
  amount: number;
  comment?: string;
  createdAt: string;
}

export type SortBy = 'date' | 'amount';
export type SortDir = 'asc' | 'desc';
export interface Sort { by: SortBy; dir: SortDir }

export interface MonthlyTotal {
  month: string; // YYYY-MM
  total: number;
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export interface SourceStat {
  sourceId: string;
  name: string;
  total: number;
}

export interface Stats {
  year: number;
  totalYear: number;
  count: number;
  monthlyTotals: MonthlyTotal[];
  byCategory: CategoryStat[];
  bySource: SourceStat[];
}
