import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HouseholdBook, HouseholdBookInput } from "@/types/household-book";

const COLLECTION = "householdBooks";

export function subscribeToHouseholdBooks(
  memberEmail: string,
  archived: boolean,
  onChange: (books: HouseholdBook[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, COLLECTION),
      where("memberEmails", "array-contains", memberEmail.toLowerCase()),
      where("archived", "==", archived),
    ),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HouseholdBook, "id">),
        })),
      );
    },
    onError,
  );
}

export async function createHouseholdBook(
  ownerId: string,
  ownerEmail: string,
  input: HouseholdBookInput,
): Promise<string> {
  if (!input.name.trim()) {
    throw new Error("Name is required");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    name: input.name,
    description: input.description,
    ownerId,
    memberEmails: [ownerEmail.toLowerCase()],
    archived: false,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateHouseholdBook(
  id: string,
  input: HouseholdBookInput,
): Promise<void> {
  if (!input.name.trim()) {
    throw new Error("Name is required");
  }

  await updateDoc(doc(db, COLLECTION, id), {
    name: input.name,
    description: input.description,
  });
}

export async function setHouseholdBookArchived(
  id: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { archived });
}

export async function addParticipant(
  id: string,
  email: string,
): Promise<void> {
  if (!email.trim()) {
    throw new Error("Email is required");
  }

  await updateDoc(doc(db, COLLECTION, id), {
    memberEmails: arrayUnion(email.toLowerCase()),
  });
}
