import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addParticipant,
  createHouseholdBook,
  setHouseholdBookArchived,
  subscribeToHouseholdBooks,
  updateHouseholdBook,
} from "@/services/household-books";

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

describe("household-books service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribeToHouseholdBooks", () => {
    it("maps Firestore documents to HouseholdBook objects on every snapshot, filtered by member email and archived state", () => {
      let emitSnapshot: (snapshot: unknown) => void = () => {};
      const unsubscribe = vi.fn();
      onSnapshot.mockImplementation((_query, onNext) => {
        emitSnapshot = onNext;
        return unsubscribe;
      });
      const onChange = vi.fn();
      const onError = vi.fn();

      const result = subscribeToHouseholdBooks(
        "Test@Example.com",
        false,
        onChange,
        onError,
      );

      expect(where).toHaveBeenCalledWith(
        "memberEmails",
        "array-contains",
        "test@example.com",
      );
      expect(where).toHaveBeenCalledWith("archived", "==", false);

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
      });

      expect(onChange).toHaveBeenCalledWith([
        {
          id: "book-1",
          name: "Vakantie",
          description: "Reisbudget",
          ownerId: "user-1",
          memberEmails: ["test@example.com"],
          archived: false,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]);
      expect(result).toBe(unsubscribe);
    });

    it("emits an empty array when the user has no household books", () => {
      let emitSnapshot: (snapshot: unknown) => void = () => {};
      onSnapshot.mockImplementation((_query, onNext) => {
        emitSnapshot = onNext;
        return vi.fn();
      });
      const onChange = vi.fn();

      subscribeToHouseholdBooks("test@example.com", false, onChange, vi.fn());
      emitSnapshot({ docs: [] });

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("forwards Firestore errors to the onError callback", () => {
      let emitError: (error: Error) => void = () => {};
      onSnapshot.mockImplementation((_query, _onNext, onErr) => {
        emitError = onErr;
        return vi.fn();
      });
      const onError = vi.fn();

      subscribeToHouseholdBooks("test@example.com", false, vi.fn(), onError);
      const error = new Error("permission-denied");
      emitError(error);

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("createHouseholdBook", () => {
    it("creates the household book with the creator set as owner and member", async () => {
      addDoc.mockResolvedValue({ id: "book-2" });

      const id = await createHouseholdBook("user-1", "Test@Example.com", {
        name: "Boodschappen",
        description: "Maandelijkse boodschappen",
      });

      expect(id).toBe("book-2");
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          name: "Boodschappen",
          ownerId: "user-1",
          memberEmails: ["test@example.com"],
          archived: false,
        }),
      );
    });

    it("rejects an empty name without calling Firestore", async () => {
      await expect(
        createHouseholdBook("user-1", "test@example.com", {
          name: "  ",
          description: "",
        }),
      ).rejects.toThrow("Name is required");

      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe("updateHouseholdBook", () => {
    it("updates the name and description", async () => {
      await updateHouseholdBook("book-1", {
        name: "Vakantie 2026",
        description: "Bijgewerkte omschrijving",
      });

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        name: "Vakantie 2026",
        description: "Bijgewerkte omschrijving",
      });
    });

    it("rejects an empty name without calling Firestore", async () => {
      await expect(
        updateHouseholdBook("book-1", { name: "  ", description: "" }),
      ).rejects.toThrow("Name is required");

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe("setHouseholdBookArchived", () => {
    it("updates the archived flag on the household book", async () => {
      await setHouseholdBookArchived("book-1", true);

      expect(updateDoc).toHaveBeenCalledWith(undefined, { archived: true });
    });
  });

  describe("addParticipant", () => {
    it("adds the lowercased email to memberEmails", async () => {
      await addParticipant("book-1", "New@Example.com");

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        memberEmails: { __arrayUnion: "new@example.com" },
      });
    });

    it("rejects an empty email without calling Firestore", async () => {
      await expect(addParticipant("book-1", "  ")).rejects.toThrow(
        "Email is required",
      );

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});
