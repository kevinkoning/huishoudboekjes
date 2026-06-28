"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useHouseholdBooks } from "@/hooks/use-household-books";
import { LoginForm } from "@/components/login-form";
import { HouseholdBookList } from "@/components/household-book-list";

export default function ArchivedHouseholdBooksPage() {
  const { user, loading: authLoading } = useAuth();
  const member = user?.email ? { uid: user.uid, email: user.email } : null;
  const { books, loading, error, archiveBook } = useHouseholdBooks(
    member,
    true,
  );

  if (authLoading) {
    return <p className="loading">Laden...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Gearchiveerde huishoudboekjes</h1>
        <div className="nav-links">
          <Link href="/">Terug naar overzicht</Link>
        </div>
      </div>

      {loading && <p className="loading">Laden...</p>}
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <HouseholdBookList
          books={books}
          currentUserId={user.uid}
          onArchive={archiveBook}
          archivedView={true}
        />
      )}
    </main>
  );
}
