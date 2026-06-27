"use client";

import { use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { LoginForm } from "@/components/login-form";
import { CategoryForm } from "@/components/category-form";
import { CategoryList } from "@/components/category-list";
import { sumByCategory } from "@/services/transactions";

export default function CategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories(id);
  const { transactions } = useTransactions(id, null);

  if (authLoading) {
    return <p className="loading">Laden...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  const spentByCategory = sumByCategory(transactions);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Categorieën</h1>
        <div className="nav-links">
          <a href={`/boekje/${id}`}>Terug naar boekje</a>
        </div>
      </div>

      <div className="card">
        <CategoryForm onSubmit={addCategory} />
      </div>

      {loading && <p className="loading">Laden...</p>}
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <CategoryList
          categories={categories}
          spentByCategory={spentByCategory}
          onEdit={editCategory}
          onDelete={removeCategory}
        />
      )}
    </main>
  );
}
