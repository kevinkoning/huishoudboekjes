import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactions } from "@/hooks/use-transactions";

vi.mock("@/lib/firebase", () => ({ db: {} }));

const { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } =
  vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
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
  orderBy,
  query,
  updateDoc,
  where,
}));

describe("useTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes and exposes transactions for the given month once Firestore emits a snapshot", async () => {
    let emitSnapshot: (snapshot: unknown) => void = () => {};
    onSnapshot.mockImplementation((_query, onNext) => {
      emitSnapshot = onNext;
      return vi.fn();
    });

    const { result } = renderHook(() =>
      useTransactions("book-1", "2026-06"),
    );

    expect(result.current.loading).toBe(true);

    act(() =>
      emitSnapshot({
        docs: [
          {
            id: "t-1",
            data: () => ({
              householdBookId: "book-1",
              categoryId: null,
              type: "expense",
              amount: 10,
              date: "2026-06-01",
              description: "Koffie",
            }),
          },
        ],
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transactions).toHaveLength(1);
  });

  it("returns an empty list and stops loading when there is no household book selected", async () => {
    const { result } = renderHook(() => useTransactions(null, "2026-06"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("calls createTransaction with the household book id when adding a transaction", async () => {
    onSnapshot.mockImplementation(() => vi.fn());
    addDoc.mockResolvedValue({ id: "t-2" });

    const { result } = renderHook(() => useTransactions("book-1", "2026-06"));

    await act(async () => {
      await result.current.addTransaction({
        type: "expense",
        amount: 15,
        date: "2026-06-10",
        categoryId: null,
        description: "Lunch",
      });
    });

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ householdBookId: "book-1", amount: 15 }),
    );
  });
});
