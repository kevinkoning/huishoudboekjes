"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import type { HouseholdBook, HouseholdBookInput } from "@/types/household-book";
import { HouseholdBookForm } from "@/components/household-book-form";

interface HouseholdBookListProps {
  books: HouseholdBook[];
  currentUserId: string;
  onArchive: (id: string, value: boolean) => void;
  onEdit?: (id: string, input: HouseholdBookInput) => Promise<void>;
  onInvite?: (id: string, email: string) => Promise<void>;
  archivedView: boolean;
}

export function HouseholdBookList({
  books,
  currentUserId,
  onArchive,
  onEdit,
  onInvite,
  archivedView,
}: HouseholdBookListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  if (books.length === 0) {
    return <p className="empty-state">Geen huishoudboekjes gevonden.</p>;
  }

  const handleInvite = async (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    if (!onInvite) {
      return;
    }
    try {
      await onInvite(id, inviteEmail);
      setInviteEmail("");
      setInvitingId(null);
      setInviteError(null);
    } catch {
      setInviteError("E-mailadres is verplicht");
    }
  };

  return (
    <ul className="book-list">
      {books.map((book) => {
        const isOwner = book.ownerId === currentUserId;

        if (editingId === book.id && onEdit) {
          return (
            <li key={book.id} className="book-item">
              <HouseholdBookForm
                initialValue={{ name: book.name, description: book.description }}
                submitLabel="Opslaan"
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  await onEdit(book.id, input);
                  setEditingId(null);
                }}
              />
            </li>
          );
        }

        if (invitingId === book.id && onInvite) {
          return (
            <li key={book.id} className="book-item">
              <form className="form" onSubmit={(event) => handleInvite(event, book.id)}>
                <div className="form-row">
                  <label htmlFor={`invite-${book.id}`}>E-mailadres deelnemer</label>
                  <input
                    id={`invite-${book.id}`}
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">
                    Uitnodigen
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      setInvitingId(null);
                      setInviteError(null);
                    }}
                  >
                    Annuleren
                  </button>
                </div>
                {inviteError && (
                  <p className="alert" role="alert">
                    {inviteError}
                  </p>
                )}
              </form>
            </li>
          );
        }

        return (
          <li key={book.id} className="book-item">
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
              {isOwner && onInvite && !archivedView && (
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => setInvitingId(book.id)}
                >
                  Uitnodigen
                </button>
              )}
              {isOwner && onEdit && (
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => setEditingId(book.id)}
                >
                  Bewerken
                </button>
              )}
              {isOwner && (
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => onArchive(book.id, !archivedView)}
                >
                  {archivedView ? "Herstellen" : "Archiveren"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
