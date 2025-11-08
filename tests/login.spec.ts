import { test, expect } from "@playwright/test";

test.describe("Login Flow - UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form correctly", async ({ page }) => {
    await expect(
      page.getByText("Login to your account", { exact: true })
    ).toBeVisible();

    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
  });

  test("should have proper form structure", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");

    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should allow typing in email and password fields", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");

    await emailInput.fill("user@example.com");
    await expect(emailInput).toHaveValue("user@example.com");

    await passwordInput.fill("mypassword");
    await expect(passwordInput).toHaveValue("mypassword");
  });

  test("should clear form inputs when cleared", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");

    await emailInput.fill("user@example.com");
    await passwordInput.fill("mypassword");

    await emailInput.clear();
    await passwordInput.clear();

    await expect(emailInput).toHaveValue("");
    await expect(passwordInput).toHaveValue("");
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/sign-up");
  });

  test("should have Google sign-in button visible", async ({ page }) => {
    const googleButton = page.getByTestId("google-login-button");

    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
    await expect(googleButton.locator('img[alt="Google"]')).toBeVisible();
  });

  test("should display card layout with title and description", async ({
    page,
  }) => {
    await expect(
      page.getByText("Login to your account", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Enter your email below to login to your account")
    ).toBeVisible();
  });

  test("should show 'Or continue with' divider", async ({ page }) => {
    await expect(page.getByText("Or continue with")).toBeVisible();
  });

  test("should display sign up link with proper text", async ({ page }) => {
    await expect(page.getByText("Don't have an account?")).toBeVisible();

    const signUpLink = page.getByRole("link", { name: "Sign up" });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });

  test("should have password field masked", async ({ page }) => {
    const passwordInput = page.getByTestId("password-input");

    await expect(passwordInput).toHaveAttribute("type", "password");

    await passwordInput.fill("secretpassword");
    await expect(passwordInput).toHaveValue("secretpassword");
  });

  test("should maintain form state while typing incrementally", async ({
    page,
  }) => {
    const emailInput = page.getByTestId("email-input");

    await emailInput.type("t");
    await expect(emailInput).toHaveValue("t");

    await emailInput.type("est@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("should have both authentication methods visible", async ({ page }) => {
    const emailLoginButton = page.getByTestId("login-button");
    const googleLoginButton = page.getByTestId("google-login-button");

    await expect(emailLoginButton).toBeVisible();
    await expect(googleLoginButton).toBeVisible();
  });

  test("should have login button as submit type", async ({ page }) => {
    const loginButton = page.getByTestId("login-button");

    await expect(loginButton).toBeEnabled();
    await expect(loginButton).toHaveAttribute("type", "submit");
  });

  test("should have proper placeholder text", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");

    await expect(emailInput).toHaveAttribute("placeholder", "m@example.com");
  });

  test("should have email label visible", async ({ page }) => {
    await expect(page.getByText("Email", { exact: true })).toBeVisible();
  });

  test("should have password label visible", async ({ page }) => {
    await expect(page.getByText("Password", { exact: true })).toBeVisible();
  });
});

test.describe("Login Flow - Integration Tests with Backend", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should submit form with valid credentials", async ({ page }) => {
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("password-input").fill("password123");

    await page.getByTestId("login-button").click();

    await page.waitForTimeout(1000);
  });

  test("should allow submitting form by pressing Enter", async ({ page }) => {
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("password-input").fill("password123");

    await page.getByTestId("password-input").press("Enter");

    await page.waitForTimeout(1000);
  });

  test("should handle Google sign-in click", async ({ page }) => {
    const googleButton = page.getByTestId("google-login-button");

    await googleButton.click();

    await page.waitForTimeout(1000);
  });
});
