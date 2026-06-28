import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHouseholdBooks } from "@/hooks/use-household-books";

vi.mock("@/lib/firebase", () => ({ db: {} }));

const { addDoc, arrayUnion, collection, doc, onSnapshot, query, updateDoc, where } =
  vi.hoisted(() => ({
    addDoc: vi.fn(),
    arrayUnion: vi.fn((value: string) => ({ __arrayUnion: value })),
    collection: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  }));

vi.mock("firebase/firestore", () => ({
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
}));

const user = { uid: "user-1", email: "test@example.com" };

describe("useHouseholdBooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes and exposes household books once Firestore emits a snapshot", async () => {
    let emitSnapshot: (snapshot: unknown) => void = () => {};
    onSnapshot.mockImplementation((_query, onNext) => {
      emitSnapshot = onNext;
      return vi.fn();
    });

    const { result } = renderHook(() => useHouseholdBooks(user, false));

    expect(result.current.loading).toBe(true);

    act(() =>
      emitSnapshot({
        docs: [
          {
            id: "book-1",
            data: () => ({
              name: "Vakantie",
              description: "Reisbudget",
              ownerId: "user-1",
              memberEmails: ["test@example.com"],
              archived: false,
              createdAt: "2026-01-01T00:00:00.000Z",
            }),
          },
        ],
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.books).toHaveLength(1);
  });

  it("returns an empty, non-loading state when there is no signed-in user", async () => {
    const { result } = renderHook(() => useHouseholdBooks(null, false));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.books).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("creates a household book with the current user as owner via addBook", async () => {
    onSnapshot.mockImplementation(() => vi.fn());
    addDoc.mockResolvedValue({ id: "book-2" });

    const { result } = renderHook(() => useHouseholdBooks(user, false));

    await act(async () => {
      await result.current.addBook({ name: "Boodschappen", description: "" });
    });

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ ownerId: "user-1", memberEmails: ["test@example.com"] }),
    );
  });

  it("updates a household book via editBook", async () => {
    onSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHouseholdBooks(user, false));

    await act(async () => {
      await result.current.editBook("book-1", {
        name: "Nieuwe naam",
        description: "Nieuwe omschrijving",
      });
    });

    expect(updateDoc).toHaveBeenCalledWith(undefined, {
      name: "Nieuwe naam",
      description: "Nieuwe omschrijving",
    });
  });

  it("archives a household book via archiveBook", async () => {
    onSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHouseholdBooks(user, false));

    await act(async () => {
      await result.current.archiveBook("book-1", true);
    });

    expect(updateDoc).toHaveBeenCalledWith(undefined, { archived: true });
  });

  it("invites a participant via inviteParticipant", async () => {
    onSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHouseholdBooks(user, false));

    await act(async () => {
      await result.current.inviteParticipant("book-1", "Friend@Example.com");
    });

    expect(updateDoc).toHaveBeenCalledWith(undefined, {
      memberEmails: { __arrayUnion: "friend@example.com" },
    });
  });
});
