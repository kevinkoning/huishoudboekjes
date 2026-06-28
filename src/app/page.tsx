"use client";

import { useAuth } from "@/hooks/use-auth";
import { useHouseholdBooks } from "@/hooks/use-household-books";
import { LoginForm } from "@/components/login-form";
import { HouseholdBookForm } from "@/components/household-book-form";
import { HouseholdBookList } from "@/components/household-book-list";

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const member = user?.email ? { uid: user.uid, email: user.email } : null;
  const { books, loading, error, addBook, editBook, archiveBook, inviteParticipant } =
    useHouseholdBooks(member, false);

  if (authLoading) {
    return <p className="loading">Laden...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Mijn huishoudboekjes</h1>
        <div className="nav-links">
          <a href="/gearchiveerd">Gearchiveerd</a>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => logout()}>
            Uitloggen
          </button>
        </div>
      </div>

      <div className="card">
        <HouseholdBookForm onSubmit={addBook} />
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
          onEdit={editBook}
          onInvite={inviteParticipant}
          archivedView={false}
        />
      )}
    </main>
  );
}
