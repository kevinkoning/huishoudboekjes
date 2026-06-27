export interface Category {
  id: string;
  householdBookId: string;
  name: string;
  maxBudget: number;
  endDate?: string;
}

export type CategoryInput = Omit<Category, "id" | "householdBookId">;
