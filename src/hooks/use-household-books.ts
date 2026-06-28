"use client";

import { useEffect, useState } from "react";
import {
  addParticipant,
  createHouseholdBook,
  setHouseholdBookArchived,
  subscribeToHouseholdBooks,
  updateHouseholdBook,
} from "@/services/household-books";
import type { HouseholdBook, HouseholdBookInput } from "@/types/household-book";

interface User {
  uid: string;
  email: string;
}

export function useHouseholdBooks(user: User | null, archived: boolean) {
  const [books, setBooks] = useState<HouseholdBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToHouseholdBooks(
      user.email,
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
  }, [user?.uid, user?.email, archived]);

  const addBook = async (input: HouseholdBookInput) => {
    if (!user) {
      return;
    }
    await createHouseholdBook(user.uid, user.email, input);
  };

  const editBook = async (id: string, input: HouseholdBookInput) => {
    await updateHouseholdBook(id, input);
  };

  const archiveBook = async (id: string, value: boolean) => {
    await setHouseholdBookArchived(id, value);
  };

  const inviteParticipant = async (id: string, email: string) => {
    await addParticipant(id, email);
  };

  return {
    books,
    loading,
    error,
    addBook,
    editBook,
    archiveBook,
    inviteParticipant,
  };
}
