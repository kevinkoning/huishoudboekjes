"use client";

import { useEffect, useState } from "react";
import {
  createHouseholdBook,
  setHouseholdBookArchived,
  subscribeToHouseholdBooks,
  updateHouseholdBook,
} from "@/services/household-books";
import type { HouseholdBook, HouseholdBookInput } from "@/types/household-book";

export function useHouseholdBooks(ownerId: string | null, archived: boolean) {
  const [books, setBooks] = useState<HouseholdBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToHouseholdBooks(
      ownerId,
      archived,
      (result) => {
        setBooks(result);
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Kon huishoudboekjes niet laden");
        setLoading(false);
      },
    );
  }, [ownerId, archived]);

  const addBook = async (input: HouseholdBookInput) => {
    if (!ownerId) {
      return;
    }
    await createHouseholdBook(ownerId, input);
  };

  const editBook = async (id: string, input: HouseholdBookInput) => {
    await updateHouseholdBook(id, input);
  };

  const archiveBook = async (id: string, value: boolean) => {
    await setHouseholdBookArchived(id, value);
  };

  return { books, loading, error, addBook, editBook, archiveBook };
}
