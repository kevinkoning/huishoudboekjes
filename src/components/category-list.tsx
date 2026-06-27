"use client";

import { useState } from "react";
import type { Category, CategoryInput } from "@/types/category";
import { getBudgetStatus } from "@/services/categories";
import { CategoryForm } from "@/components/category-form";

interface CategoryListProps {
  categories: Category[];
  spentByCategory: Record<string, number>;
  onEdit: (id: string, input: CategoryInput) => Promise<void>;
  onDelete: (id: string) => void;
}

const statusLabel: Record<ReturnType<typeof getBudgetStatus>, string> = {
  ok: "Binnen budget",
  "near-limit": "Bijna op",
  "over-budget": "Over budget",
};

export function CategoryList({
  categories,
  spentByCategory,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (categories.length === 0) {
    return <p className="empty-state">Nog geen categorieën aangemaakt.</p>;
  }

  return (
    <ul className="book-list">
      {categories.map((category) => {
        const spent = spentByCategory[category.id] ?? 0;
        const status = getBudgetStatus(category, spent);
        const remaining = category.maxBudget - spent;

        if (editingId === category.id) {
          return (
            <li key={category.id} className="book-item">
              <CategoryForm
                initialValue={{
                  name: category.name,
                  maxBudget: category.maxBudget,
                  endDate: category.endDate,
                }}
                submitLabel="Opslaan"
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  await onEdit(category.id, input);
                  setEditingId(null);
                }}
              />
            </li>
          );
        }

        return (
          <li key={category.id} className="book-item">
            <div className="book-item-info">
              <strong>{category.name}</strong>
              <span className={`budget-badge budget-${status}`}>
                {statusLabel[status]} — €{remaining.toFixed(2)} over van €
                {category.maxBudget.toFixed(2)}
              </span>
            </div>
            <div className="book-item-actions">
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setEditingId(category.id)}
              >
                Bewerken
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => onDelete(category.id)}
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
