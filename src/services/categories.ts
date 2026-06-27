import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category, CategoryInput } from "@/types/category";

const COLLECTION = "categories";

export function subscribeToCategories(
  householdBookId: string,
  onChange: (categories: Category[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, COLLECTION),
      where("householdBookId", "==", householdBookId),
    ),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Category, "id">),
        })),
      );
    },
    onError,
  );
}

export async function createCategory(
  householdBookId: string,
  input: CategoryInput,
): Promise<string> {
  if (!input.name.trim()) {
    throw new Error("Name is required");
  }
  if (input.maxBudget <= 0) {
    throw new Error("Max budget must be greater than 0");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    householdBookId,
    name: input.name,
    maxBudget: input.maxBudget,
    endDate: input.endDate ?? null,
  });

  return docRef.id;
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<void> {
  if (!input.name.trim()) {
    throw new Error("Name is required");
  }

  await updateDoc(doc(db, COLLECTION, id), {
    name: input.name,
    maxBudget: input.maxBudget,
    endDate: input.endDate ?? null,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function getBudgetStatus(
  category: Category,
  spent: number,
): "ok" | "near-limit" | "over-budget" {
  if (spent > category.maxBudget) {
    return "over-budget";
  }
  if (spent >= category.maxBudget * 0.9) {
    return "near-limit";
  }
  return "ok";
}
