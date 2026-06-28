import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionList } from "@/components/transaction-list";
import type { Category } from "@/types/category";
import type { Transaction } from "@/types/transaction";

const categories: Category[] = [
  { id: "cat-1", householdBookId: "book-1", name: "Boodschappen", maxBudget: 300 },
];

const expense: Transaction = {
  id: "t-1",
  householdBookId: "book-1",
  categoryId: "cat-1",
  type: "expense",
  amount: 25.5,
  date: "2026-06-05",
  description: "Albert Heijn",
};

const income: Transaction = {
  id: "t-2",
  householdBookId: "book-1",
  categoryId: null,
  type: "income",
  amount: 2000,
  date: "2026-06-01",
  description: "Salaris",
};

describe("TransactionList", () => {
  it("shows an empty state when there are no transactions", () => {
    render(
      <TransactionList
        transactions={[]}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Geen transacties in deze maand."),
    ).toBeInTheDocument();
  });

  it("shows the amount, description and category name for an expense", () => {
    render(
      <TransactionList
        transactions={[expense]}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("-€25.50")).toBeInTheDocument();
    expect(screen.getByText("Albert Heijn")).toBeInTheDocument();
    expect(screen.getByText(/Boodschappen/)).toBeInTheDocument();
  });

  it("shows the amount without a category for an income transaction", () => {
    render(
      <TransactionList
        transactions={[income]}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("+€2000.00")).toBeInTheDocument();
  });

  it("deletes a transaction when Verwijderen is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionList
        transactions={[expense]}
        categories={categories}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Verwijderen" }));

    expect(onDelete).toHaveBeenCalledWith("t-1");
  });

  it("edits a transaction inline and submits the updated amount", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TransactionList
        transactions={[expense]}
        categories={categories}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Bewerken" }));
    const amountInput = screen.getByLabelText("Bedrag");
    await user.clear(amountInput);
    await user.type(amountInput, "30");
    await user.click(screen.getByRole("button", { name: "Opslaan" }));

    expect(onEdit).toHaveBeenCalledWith(
      "t-1",
      expect.objectContaining({ amount: 30 }),
    );
  });
});
