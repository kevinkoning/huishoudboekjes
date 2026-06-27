"use client";

import { useEffect, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  subscribeToTransactions,
  updateTransaction,
} from "@/services/transactions";
import type { Transaction, TransactionInput } from "@/types/transaction";

export function useTransactions(
  householdBookId: string | null,
  month: string | null,
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdBookId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToTransactions(
      householdBookId,
      month,
      (result) => {
        setTransactions(result);
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Kon transacties niet laden");
        setLoading(false);
      },
    );
  }, [householdBookId, month]);

  const addTransaction = async (input: TransactionInput) => {
    if (!householdBookId) {
      return;
    }
    await createTransaction(householdBookId, input);
  };

  const editTransaction = async (id: string, input: TransactionInput) => {
    await updateTransaction(id, input);
  };

  const removeTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
  };
}
