export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  householdBookId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
}

export type TransactionInput = Omit<Transaction, "id" | "householdBookId">;
