"use client";

import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  subscribeToCategories,
  updateCategory,
} from "@/services/categories";
import type { Category, CategoryInput } from "@/types/category";

export function useCategories(householdBookId: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdBookId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToCategories(
      householdBookId,
      (result) => {
        setCategories(result);
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Kon categorieën niet laden");
        setLoading(false);
      },
    );
  }, [householdBookId]);

  const addCategory = async (input: CategoryInput) => {
    if (!householdBookId) {
      return;
    }
    await createCategory(householdBookId, input);
  };

  const editCategory = async (id: string, input: CategoryInput) => {
    await updateCategory(id, input);
  };

  const removeCategory = async (id: string) => {
    await deleteCategory(id);
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
  };
}
