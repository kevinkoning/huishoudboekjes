export interface HouseholdBook {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  archived: boolean;
  createdAt: string;
}

export type HouseholdBookInput = Pick<HouseholdBook, "name" | "description">;
