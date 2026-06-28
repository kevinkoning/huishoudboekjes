import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/login-form";

const { login } = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ login }),
}));

describe("LoginForm", () => {
  it("calls login with the entered email and password", async () => {
    login.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "test@example.com");
    await user.type(screen.getByLabelText("Wachtwoord"), "secret123");
    await user.click(screen.getByRole("button", { name: "Inloggen" }));

    expect(login).toHaveBeenCalledWith("test@example.com", "secret123");
  });

  it("shows an error message when login fails", async () => {
    login.mockRejectedValue(new Error("auth/wrong-password"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Inloggen" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Inloggen mislukt",
    );
  });
});
