import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

vi.mock("@/lib/firebase", () => ({ auth: {} }));

const { onAuthStateChanged, signInWithEmailAndPassword, signOut } =
  vi.hoisted(() => ({
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when used outside of an AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("exposes the signed-in user once Firebase reports an auth state", async () => {
    let emitUser: (user: unknown) => void = () => {};
    onAuthStateChanged.mockImplementation((_auth, callback) => {
      emitUser = callback;
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);

    act(() => emitUser({ uid: "user-1", email: "test@example.com" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({
      uid: "user-1",
      email: "test@example.com",
    });
  });

  it("calls Firebase signInWithEmailAndPassword on login", async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    signInWithEmailAndPassword.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login("test@example.com", "secret");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "secret",
    );
  });

  it("calls Firebase signOut on logout", async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalledWith({});
  });
});
