"use client";

import { useAuth } from "@/hooks/use-auth";
import { useHouseholdBooks } from "@/hooks/use-household-books";
import { LoginForm } from "@/components/login-form";
import { HouseholdBookList } from "@/components/household-book-list";

export default function ArchivedHouseholdBooksPage() {
  const { user, loading: authLoading } = useAuth();
  const { books, loading, error, archiveBook } = useHouseholdBooks(
    user?.uid ?? null,
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
          <a href="/">Terug naar overzicht</a>
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
          onArchive={archiveBook}
          archivedView={true}
        />
      )}
    </main>
  );
}
