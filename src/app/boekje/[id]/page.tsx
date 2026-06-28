"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { LoginForm } from "@/components/login-form";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { calculateBalance } from "@/services/transactions";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function HouseholdBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [month, setMonth] = useState(currentMonth());

  const { categories } = useCategories(id);
  const {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions(id, month);

  if (authLoading) {
    return <p className="loading">Laden...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  const balance = calculateBalance(transactions);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Uitgaven en inkomsten</h1>
        <div className="nav-links">
          <Link href={`/boekje/${id}/categorieen`}>Categorieën</Link>
          <Link href="/">Terug naar overzicht</Link>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <label htmlFor="month">Maand</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        <p style={{ marginTop: "0.75rem" }}>
          Saldo deze maand:{" "}
          <strong style={{ color: balance >= 0 ? "var(--success)" : "var(--danger)" }}>
            €{balance.toFixed(2)}
          </strong>
        </p>
      </div>

      <div className="card">
        <TransactionForm categories={categories} onSubmit={addTransaction} />
      </div>

      {loading && <p className="loading">Laden...</p>}
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <TransactionList
          transactions={transactions}
          categories={categories}
          onEdit={editTransaction}
          onDelete={removeTransaction}
        />
      )}
    </main>
  );
}
