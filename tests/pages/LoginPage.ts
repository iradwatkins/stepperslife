import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
  }

  async loginWithCredentials(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"], input[type="email"]', email);
    await this.page.fill('[data-testid="password-input"], input[type="password"]', password);
    await this.page.click('[data-testid="signin-button"], button:has-text("Sign In")');
  }

  async loginWithGoogle() {
    await this.page.click('button:has-text("Continue with Google")');
  }

  async loginWithMagicLink(email: string) {
    await this.page.click('button:has-text("Sign in with Magic Link")');
    await this.page.fill('input#magic-email', email);
    await this.page.click('button:has-text("Send Magic Link")');
  }

  async quickLogin(accountType: 'admin' | 'test' | 'organizer') {
    await this.page.goto('/quick-signin');
    
    const buttonText = {
      admin: 'Sign in as Admin',
      test: 'Sign in as Test User',
      organizer: 'Sign in as Ira'
    };
    
    await this.page.click(`button:has-text("${buttonText[accountType]}")`);
  }

  async expectDashboard() {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  async expectError(message: string) {
    const errorElement = this.page.locator('.bg-red-50.text-red-600, .bg-red-100');
    await expect(errorElement).toContainText(message);
  }

  async goToSignup() {
    await this.page.click('a:has-text("Sign up")');
    await this.page.waitForURL('**/auth/signup');
  }
}