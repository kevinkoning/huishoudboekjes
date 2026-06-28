import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HouseholdBookList } from "@/components/household-book-list";
import type { HouseholdBook } from "@/types/household-book";

const ownedBook: HouseholdBook = {
  id: "book-1",
  name: "Vakantie",
  description: "Reisbudget",
  ownerId: "user-1",
  memberEmails: ["owner@example.com"],
  archived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const sharedBook: HouseholdBook = {
  id: "book-2",
  name: "Studentenhuis",
  description: "Gedeelde kosten",
  ownerId: "other-user",
  memberEmails: ["owner@example.com", "other@example.com"],
  archived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("HouseholdBookList", () => {
  it("shows an empty state when there are no books", () => {
    render(
      <HouseholdBookList
        books={[]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        archivedView={false}
      />,
    );

    expect(
      screen.getByText("Geen huishoudboekjes gevonden."),
    ).toBeInTheDocument();
  });

  it("links the book name to its detail page when not archived", () => {
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        archivedView={false}
      />,
    );

    expect(screen.getByRole("link", { name: "Vakantie" })).toHaveAttribute(
      "href",
      "/boekje/book-1",
    );
  });

  it("shows owner-only actions for a book the user owns", () => {
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        onEdit={vi.fn()}
        onInvite={vi.fn()}
        archivedView={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Bewerken" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archiveren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Uitnodigen" })).toBeInTheDocument();
  });

  it("hides owner-only actions for a book the user only participates in", () => {
    render(
      <HouseholdBookList
        books={[sharedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        onEdit={vi.fn()}
        onInvite={vi.fn()}
        archivedView={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Bewerken" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archiveren" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Uitnodigen" })).not.toBeInTheDocument();
  });

  it("archives a book when the owner clicks Archiveren", async () => {
    const onArchive = vi.fn();
    const user = userEvent.setup();
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={onArchive}
        archivedView={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Archiveren" }));

    expect(onArchive).toHaveBeenCalledWith("book-1", true);
  });

  it("shows 'Herstellen' instead of 'Archiveren' in the archived view", () => {
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        archivedView={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Herstellen" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Vakantie" })).not.toBeInTheDocument();
  });

  it("edits a book inline and submits the updated name and description", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        onEdit={onEdit}
        archivedView={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Bewerken" }));
    const nameInput = screen.getByLabelText("Naam");
    await user.clear(nameInput);
    await user.type(nameInput, "Vakantie 2026");
    await user.click(screen.getByRole("button", { name: "Opslaan" }));

    expect(onEdit).toHaveBeenCalledWith("book-1", {
      name: "Vakantie 2026",
      description: "Reisbudget",
    });
  });

  it("invites a participant by email", async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <HouseholdBookList
        books={[ownedBook]}
        currentUserId="user-1"
        onArchive={vi.fn()}
        onInvite={onInvite}
        archivedView={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Uitnodigen" }));
    await user.type(
      screen.getByLabelText("E-mailadres deelnemer"),
      "friend@example.com",
    );
    const form = screen.getByLabelText("E-mailadres deelnemer").closest("form")!;
    await user.click(within(form).getByRole("button", { name: "Uitnodigen" }));

    expect(onInvite).toHaveBeenCalledWith("book-1", "friend@example.com");
  });
});
