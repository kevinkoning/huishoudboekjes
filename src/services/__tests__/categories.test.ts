import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategory,
  deleteCategory,
  getBudgetStatus,
  subscribeToCategories,
  updateCategory,
} from "@/services/categories";
import type { Category } from "@/types/category";

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

describe("categories service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribeToCategories", () => {
    it("emits categories scoped to the given household book on every snapshot", () => {
      let emitSnapshot: (snapshot: unknown) => void = () => {};
      const unsubscribe = vi.fn();
      onSnapshot.mockImplementation((_query, onNext) => {
        emitSnapshot = onNext;
        return unsubscribe;
      });
      const onChange = vi.fn();

      const result = subscribeToCategories("book-1", onChange, vi.fn());

      expect(where).toHaveBeenCalledWith("householdBookId", "==", "book-1");

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
      });

      expect(onChange).toHaveBeenCalledWith([
        { id: "cat-1", householdBookId: "book-1", name: "Boodschappen", maxBudget: 300 },
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

      subscribeToCategories("book-1", vi.fn(), onError);
      const error = new Error("permission-denied");
      emitError(error);

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("createCategory", () => {
    it("creates a category with a name and max budget", async () => {
      addDoc.mockResolvedValue({ id: "cat-2" });

      const id = await createCategory("book-1", {
        name: "Vervoer",
        maxBudget: 150,
      });

      expect(id).toBe("cat-2");
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          householdBookId: "book-1",
          name: "Vervoer",
          maxBudget: 150,
          endDate: null,
        }),
      );
    });

    it("rejects a missing name without calling Firestore", async () => {
      await expect(
        createCategory("book-1", { name: "", maxBudget: 100 }),
      ).rejects.toThrow("Name is required");
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("rejects a non-positive max budget without calling Firestore", async () => {
      await expect(
        createCategory("book-1", { name: "Vervoer", maxBudget: 0 }),
      ).rejects.toThrow("Max budget must be greater than 0");
      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe("updateCategory", () => {
    it("updates the category fields", async () => {
      await updateCategory("cat-1", { name: "Vervoer", maxBudget: 200 });

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        name: "Vervoer",
        maxBudget: 200,
        endDate: null,
      });
    });
  });

  describe("deleteCategory", () => {
    it("deletes the category document", async () => {
      await deleteCategory("cat-1");

      expect(deleteDoc).toHaveBeenCalledWith(undefined);
    });
  });

  describe("getBudgetStatus", () => {
    const category: Category = {
      id: "cat-1",
      householdBookId: "book-1",
      name: "Boodschappen",
      maxBudget: 300,
    };

    it("returns 'ok' when spending is well within budget", () => {
      expect(getBudgetStatus(category, 100)).toBe("ok");
    });

    it("returns 'near-limit' when spending reaches 90% of the budget", () => {
      expect(getBudgetStatus(category, 270)).toBe("near-limit");
    });

    it("returns 'over-budget' when spending exceeds the budget", () => {
      expect(getBudgetStatus(category, 301)).toBe("over-budget");
    });
  });
});
