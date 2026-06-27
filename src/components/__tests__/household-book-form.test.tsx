import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HouseholdBookForm } from "@/components/household-book-form";

describe("HouseholdBookForm", () => {
  it("submits the entered name and description, then clears the fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<HouseholdBookForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Naam"), "Vakantie");
    await user.type(screen.getByLabelText("Omschrijving"), "Reisbudget");
    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Vakantie",
      description: "Reisbudget",
    });
    expect(screen.getByLabelText("Naam")).toHaveValue("");
    expect(screen.getByLabelText("Omschrijving")).toHaveValue("");
  });

  it("shows an error message when submitting fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Name is required"));
    const user = userEvent.setup();
    render(<HouseholdBookForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Toevoegen" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Naam is verplicht",
    );
  });
});
