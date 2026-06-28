import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "@/hooks/use-categories";

vi.mock("@/lib/firebase", () => ({ db: {} }));

const { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } =
  vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  }));

vi.mock("firebase/firestore", () => ({
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
}));

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes and exposes categories once Firestore emits a snapshot", async () => {
    let emitSnapshot: (snapshot: unknown) => void = () => {};
    onSnapshot.mockImplementation((_query, onNext) => {
      emitSnapshot = onNext;
      return vi.fn();
    });

    const { result } = renderHook(() => useCategories("book-1"));

    expect(result.current.loading).toBe(true);

    act(() =>
      emitSnapshot({
        docs: [
          {
            id: "cat-1",
            data: () => ({
              householdBookId: "book-1",
              name: "Boodschappen",
              maxBudget: 300,
            }),
          },
        ],
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(1);
  });

  it("returns an empty, non-loading state when there is no household book id", async () => {
    const { result } = renderHook(() => useCategories(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("creates a category scoped to the household book via addCategory", async () => {
    onSnapshot.mockImplementation(() => vi.fn());
    addDoc.mockResolvedValue({ id: "cat-2" });

    const { result } = renderHook(() => useCategories("book-1"));

    await act(async () => {
      await result.current.addCategory({ name: "Vervoer", maxBudget: 100 });
    });

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ householdBookId: "book-1", name: "Vervoer" }),
    );
  });

  it("updates a category via editCategory", async () => {
    onSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useCategories("book-1"));

    await act(async () => {
      await result.current.editCategory("cat-1", {
        name: "Vervoer",
        maxBudget: 200,
      });
    });

    expect(updateDoc).toHaveBeenCalledWith(undefined, {
      name: "Vervoer",
      maxBudget: 200,
      endDate: null,
    });
  });

  it("deletes a category via removeCategory", async () => {
    onSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useCategories("book-1"));

    await act(async () => {
      await result.current.removeCategory("cat-1");
    });

    expect(deleteDoc).toHaveBeenCalledWith(undefined);
  });
});
