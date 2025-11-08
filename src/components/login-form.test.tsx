import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./login-form";
import { toast } from "sonner";

vi.mock("sonner");

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form", () => {
    render(<LoginForm />);

    expect(screen.getByText("Login to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("should allow typing in email and password fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByTestId("login-button");
    await user.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByTestId("field-error");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it("should disable button while submitting", async () => {
    const { authClient } = await import("@/lib/auth-client");
    vi.mocked(authClient.signIn.email).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("should call authClient.signIn.email on submit", async () => {
    const { authClient } = await import("@/lib/auth-client");
    vi.mocked(authClient.signIn.email).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        callbackURL: "/",
        rememberMe: true,
      });
    });
  });

  it("should show error toast on login failure", async () => {
    const { authClient } = await import("@/lib/auth-client");
    vi.mocked(authClient.signIn.email).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred.");
    });
  });

  it("should call Google sign-in when Google button is clicked", async () => {
    const { authClient } = await import("@/lib/auth-client");
    vi.mocked(authClient.signIn.social).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<LoginForm />);

    const googleButton = screen.getByTestId("google-login-button");
    await user.click(googleButton);

    await waitFor(() => {
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: "google",
      });
    });
  });

  it("should have proper accessibility attributes", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should render Google button with icon", () => {
    render(<LoginForm />);

    const googleButton = screen.getByTestId("google-login-button");
    const googleImage = googleButton.querySelector('img[alt="Google"]');

    expect(googleButton).toBeInTheDocument();
    expect(googleImage).toBeInTheDocument();
  });

  it("should render sign up link", () => {
    render(<LoginForm />);

    const signUpLink = screen.getByRole("link", { name: /sign up/i });

    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });
});
