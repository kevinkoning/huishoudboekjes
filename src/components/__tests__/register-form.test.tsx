import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/register-form";

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ signUp }),
}));

describe("RegisterForm", () => {
  it("calls signUp with the entered email and password", async () => {
    signUp.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("E-mail"), "new@example.com");
    await user.type(screen.getByLabelText("Wachtwoord"), "secret123");
    await user.click(screen.getByRole("button", { name: "Account aanmaken" }));

    expect(signUp).toHaveBeenCalledWith("new@example.com", "secret123");
  });

  it("shows an error message when sign-up fails", async () => {
    signUp.mockRejectedValue(new Error("auth/email-already-in-use"));
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Account aanmaken" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Registreren mislukt",
    );
  });
});
