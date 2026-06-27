"use client";

import { useState } from "react";
import type { Category } from "@/types/category";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { TransactionForm } from "@/components/transaction-form";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (id: string, input: TransactionInput) => Promise<void>;
  onDelete: (id: string) => void;
}

function formatAmount(amount: number, type: Transaction["type"]) {
  const sign = type === "income" ? "+" : "-";
  return `${sign}€${amount.toFixed(2)}`;
}

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return <p className="empty-state">Geen transacties in deze maand.</p>;
  }

  return (
    <ul className="book-list">
      {transactions.map((transaction) => {
        const category = categories.find(
          (c) => c.id === transaction.categoryId,
        );

        if (editingId === transaction.id) {
          return (
            <li key={transaction.id} className="book-item">
              <TransactionForm
                categories={categories}
                initialValue={{
                  type: transaction.type,
                  amount: transaction.amount,
                  date: transaction.date,
                  categoryId: transaction.categoryId,
                  description: transaction.description,
                }}
                submitLabel="Opslaan"
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  await onEdit(transaction.id, input);
                  setEditingId(null);
                }}
              />
            </li>
          );
        }

        return (
          <li key={transaction.id} className="book-item">
            <div className="book-item-info">
              <strong>
                {formatAmount(transaction.amount, transaction.type)}{" "}
                <span style={{ fontWeight: 400 }}>
                  {transaction.description}
                </span>
              </strong>
              <span>
                {transaction.date}
                {category ? ` — ${category.name}` : ""}
              </span>
            </div>
            <div className="book-item-actions">
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setEditingId(transaction.id)}
              >
                Bewerken
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => onDelete(transaction.id)}
              >
                Verwijderen
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
