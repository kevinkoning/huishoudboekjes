import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/types/category";

const categories: Category[] = [
  { id: "cat-1", householdBookId: "book-1", name: "Boodschappen", maxBudget: 300 },
];

describe("TransactionForm", () => {
  it("submits a new expense with the entered amount, date and category", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText("Bedrag"));
    await user.type(screen.getByLabelText("Bedrag"), "25.50");
    await user.selectOptions(screen.getByLabelText("Categorie"), "cat-1");
    await user.type(screen.getByLabelText("Omschrijving"), "Supermarkt");
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "expense",
        amount: 25.5,
        categoryId: "cat-1",
        description: "Supermarkt",
      }),
    );
  });

  it("defaults the date field to today", () => {
    render(<TransactionForm categories={categories} onSubmit={vi.fn()} />);

    const today = new Date().toISOString().slice(0, 10);
    expect(screen.getByLabelText("Datum")).toHaveValue(today);
  });

  it("shows an error message when submitting fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Amount is required"));
    const user = userEvent.setup();
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bedrag is verplicht",
    );
  });
});
