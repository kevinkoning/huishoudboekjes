import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateBalance,
  createTransaction,
  deleteTransaction,
  subscribeToTransactions,
  sumByCategory,
  updateTransaction,
} from "@/services/transactions";
import type { Transaction } from "@/types/transaction";

vi.mock("@/lib/firebase", () => ({ db: {} }));

const {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} = vi.hoisted(() => ({
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

describe("transactions service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("subscribeToTransactions", () => {
    it("emits only transactions within the requested month, ordered by date, on every snapshot", () => {
      let emitSnapshot: (snapshot: unknown) => void = () => {};
      const unsubscribe = vi.fn();
      onSnapshot.mockImplementation((_query, onNext) => {
        emitSnapshot = onNext;
        return unsubscribe;
      });
      const onChange = vi.fn();

      const result = subscribeToTransactions(
        "book-1",
        "2026-06",
        onChange,
        vi.fn(),
      );

      expect(orderBy).toHaveBeenCalledWith("date", "asc");

      emitSnapshot({
        docs: [
          {
            id: "t-1",
            data: () => ({
              householdBookId: "book-1",
              categoryId: "cat-1",
              type: "expense",
              amount: 20,
              date: "2026-06-05",
              description: "Boodschappen",
            }),
          },
          {
            id: "t-2",
            data: () => ({
              householdBookId: "book-1",
              categoryId: "cat-1",
              type: "expense",
              amount: 15,
              date: "2026-05-20",
              description: "Vorige maand",
            }),
          },
        ],
      });

      expect(onChange).toHaveBeenCalledWith([
        {
          id: "t-1",
          householdBookId: "book-1",
          categoryId: "cat-1",
          type: "expense",
          amount: 20,
          date: "2026-06-05",
          description: "Boodschappen",
        },
      ]);
      expect(result).toBe(unsubscribe);
    });

    it("forwards Firestore errors to the onError callback", () => {
      let emitError: (error: Error) => void = () => {};
      onSnapshot.mockImplementation((_query, _onNext, onErr) => {
        emitError = onErr;
        return vi.fn();
      });
      const onError = vi.fn();

      subscribeToTransactions("book-1", "2026-06", vi.fn(), onError);
      const error = new Error("permission-denied");
      emitError(error);

      expect(onError).toHaveBeenCalledWith(error);
    });

    it("emits all transactions across months when no month filter is given", () => {
      let emitSnapshot: (snapshot: unknown) => void = () => {};
      onSnapshot.mockImplementation((_query, onNext) => {
        emitSnapshot = onNext;
        return vi.fn();
      });
      const onChange = vi.fn();

      subscribeToTransactions("book-1", null, onChange, vi.fn());

      emitSnapshot({
        docs: [
          {
            id: "t-1",
            data: () => ({
              householdBookId: "book-1",
              categoryId: "cat-1",
              type: "expense",
              amount: 20,
              date: "2026-06-05",
              description: "Boodschappen",
            }),
          },
          {
            id: "t-2",
            data: () => ({
              householdBookId: "book-1",
              categoryId: "cat-1",
              type: "expense",
              amount: 15,
              date: "2026-05-20",
              description: "Vorige maand",
            }),
          },
        ],
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "t-1" }),
          expect.objectContaining({ id: "t-2" }),
        ]),
      );
      expect((onChange.mock.calls[0][0] as unknown[]).length).toBe(2);
    });
  });

  describe("createTransaction", () => {
    it("defaults the date to today when none is provided", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-27T12:00:00.000Z"));
      addDoc.mockResolvedValue({ id: "t-3" });

      const id = await createTransaction("book-1", {
        categoryId: "cat-1",
        type: "expense",
        amount: 10,
        date: "",
        description: "Koffie",
      });

      expect(id).toBe("t-3");
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ date: "2026-06-27" }),
      );
    });

    it("rejects a missing amount without calling Firestore", async () => {
      await expect(
        createTransaction("book-1", {
          categoryId: null,
          type: "expense",
          amount: 0,
          date: "2026-06-27",
          description: "",
        }),
      ).rejects.toThrow("Amount is required");

      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe("updateTransaction", () => {
    it("updates the transaction fields", async () => {
      await updateTransaction("t-1", {
        categoryId: "cat-2",
        type: "income",
        amount: 50,
        date: "2026-06-27",
        description: "Salaris",
      });

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        categoryId: "cat-2",
        type: "income",
        amount: 50,
        date: "2026-06-27",
        description: "Salaris",
      });
    });
  });

  describe("deleteTransaction", () => {
    it("deletes the transaction document", async () => {
      await deleteTransaction("t-1");
      expect(deleteDoc).toHaveBeenCalledWith(undefined);
    });
  });

  describe("calculateBalance", () => {
    const transactions: Transaction[] = [
      {
        id: "t-1",
        householdBookId: "book-1",
        categoryId: "cat-1",
        type: "income",
        amount: 1000,
        date: "2026-06-01",
        description: "Salaris",
      },
      {
        id: "t-2",
        householdBookId: "book-1",
        categoryId: "cat-1",
        type: "expense",
        amount: 300,
        date: "2026-06-05",
        description: "Boodschappen",
      },
    ];

    it("sums income and subtracts expenses to produce the balance", () => {
      expect(calculateBalance(transactions)).toBe(700);
    });

    it("returns 0 for an empty list", () => {
      expect(calculateBalance([])).toBe(0);
    });
  });

  describe("sumByCategory", () => {
    it("sums expense amounts per category and ignores income and uncategorized transactions", () => {
      const transactions: Transaction[] = [
        {
          id: "t-1",
          householdBookId: "book-1",
          categoryId: "cat-1",
          type: "expense",
          amount: 20,
          date: "2026-06-01",
          description: "",
        },
        {
          id: "t-2",
          householdBookId: "book-1",
          categoryId: "cat-1",
          type: "expense",
          amount: 30,
          date: "2026-06-02",
          description: "",
        },
        {
          id: "t-3",
          householdBookId: "book-1",
          categoryId: null,
          type: "expense",
          amount: 15,
          date: "2026-06-03",
          description: "",
        },
        {
          id: "t-4",
          householdBookId: "book-1",
          categoryId: "cat-1",
          type: "income",
          amount: 100,
          date: "2026-06-04",
          description: "",
        },
      ];

      expect(sumByCategory(transactions)).toEqual({ "cat-1": 50 });
    });
  });
});
