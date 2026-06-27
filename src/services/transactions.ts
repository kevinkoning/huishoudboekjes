import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction, TransactionInput } from "@/types/transaction";

const COLLECTION = "transactions";

export function subscribeToTransactions(
  householdBookId: string,
  month: string | null,
  onChange: (transactions: Transaction[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, COLLECTION),
      where("householdBookId", "==", householdBookId),
      orderBy("date", "asc"),
    ),
    (snapshot) => {
      const transactions = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Transaction, "id">),
      }));
      onChange(
        month ? transactions.filter((t) => t.date.startsWith(month)) : transactions,
      );
    },
    onError,
  );
}

export async function createTransaction(
  householdBookId: string,
  input: TransactionInput,
): Promise<string> {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Amount is required");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    householdBookId,
    categoryId: input.categoryId ?? null,
    type: input.type,
    amount: input.amount,
    date: input.date || new Date().toISOString().slice(0, 10),
    description: input.description ?? "",
  });

  return docRef.id;
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<void> {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Amount is required");
  }

  await updateDoc(doc(db, COLLECTION, id), {
    categoryId: input.categoryId ?? null,
    type: input.type,
    amount: input.amount,
    date: input.date,
    description: input.description ?? "",
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (total, t) => total + (t.type === "income" ? t.amount : -t.amount),
    0,
  );
}

export function sumByCategory(
  transactions: Transaction[],
): Record<string, number> {
  return transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .reduce<Record<string, number>>((sums, t) => {
      const key = t.categoryId as string;
      sums[key] = (sums[key] ?? 0) + t.amount;
      return sums;
    }, {});
}
