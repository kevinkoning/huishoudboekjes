import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryList } from "@/components/category-list";
import type { Category } from "@/types/category";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
}));

describe("CategoryList", () => {
  it("shows an empty state when there are no categories", () => {
    render(
      <CategoryList
        categories={[]}
        spentByCategory={{}}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Nog geen categorieën aangemaakt."),
    ).toBeInTheDocument();
  });

  it("shows the remaining budget and an 'ok' status when spending is low", () => {
    const categories: Category[] = [
      { id: "cat-1", householdBookId: "book-1", name: "Boodschappen", maxBudget: 300 },
    ];

    render(
      <CategoryList
        categories={categories}
        spentByCategory={{ "cat-1": 50 }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Binnen budget/)).toBeInTheDocument();
    expect(screen.getByText(/€250.00 over van €300.00/)).toBeInTheDocument();
  });

  it("flags a category as over budget once spending exceeds the max budget", () => {
    const categories: Category[] = [
      { id: "cat-1", householdBookId: "book-1", name: "Boodschappen", maxBudget: 300 },
    ];

    render(
      <CategoryList
        categories={categories}
        spentByCategory={{ "cat-1": 350 }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Over budget/)).toBeInTheDocument();
  });
});
