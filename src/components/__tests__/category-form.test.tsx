import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryForm } from "@/components/category-form";

describe("CategoryForm", () => {
  it("submits the entered name and max budget, then clears the fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Naam"), "Boodschappen");
    await user.type(screen.getByLabelText("Maximaal budget"), "300");
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Boodschappen",
      maxBudget: 300,
      endDate: undefined,
    });
    expect(screen.getByLabelText("Naam")).toHaveValue("");
  });

  it("shows an error message when submitting fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Name is required"));
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Naam en maximaal budget zijn verplicht",
    );
  });
});
