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
