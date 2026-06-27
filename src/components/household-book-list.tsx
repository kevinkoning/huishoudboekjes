"use client";

import { useState } from "react";
import Link from "next/link";
import type { HouseholdBook, HouseholdBookInput } from "@/types/household-book";
import { HouseholdBookForm } from "@/components/household-book-form";

interface HouseholdBookListProps {
  books: HouseholdBook[];
  onArchive: (id: string, value: boolean) => void;
  onEdit?: (id: string, input: HouseholdBookInput) => Promise<void>;
  archivedView: boolean;
}

export function HouseholdBookList({
  books,
  onArchive,
  onEdit,
  archivedView,
}: HouseholdBookListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (books.length === 0) {
    return <p className="empty-state">Geen huishoudboekjes gevonden.</p>;
  }

  return (
    <ul className="book-list">
      {books.map((book) => (
        <li key={book.id} className="book-item">
          {editingId === book.id && onEdit ? (
            <HouseholdBookForm
              initialValue={{ name: book.name, description: book.description }}
              submitLabel="Opslaan"
              onCancel={() => setEditingId(null)}
              onSubmit={async (input) => {
                await onEdit(book.id, input);
                setEditingId(null);
              }}
            />
          ) : (
            <>
              <div className="book-item-info">
                {archivedView ? (
                  <strong>{book.name}</strong>
                ) : (
                  <Link href={`/boekje/${book.id}`}>
                    <strong>{book.name}</strong>
                  </Link>
                )}
                <span>{book.description}</span>
              </div>
              <div className="book-item-actions">
                {onEdit && (
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => setEditingId(book.id)}
                  >
                    Bewerken
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => onArchive(book.id, !archivedView)}
                >
                  {archivedView ? "Herstellen" : "Archiveren"}
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
