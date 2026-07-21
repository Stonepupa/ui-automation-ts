import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async see(text: string) {
    await expect(this.page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
  }

  async notSee(text: string) {
    await expect(this.page.getByText(text).first()).toBeHidden({ timeout: 10_000 });
  }

  async seeElement(locator: Locator) {
    await expect(locator).toBeVisible({ timeout: 10_000 });
  }

  async notSeeElement(locator: Locator) {
    await expect(locator).toBeHidden({ timeout: 10_000 });
  }

  async assertText(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  async assertCount(locator: Locator, count: number) {
    await expect(locator).toHaveCount(count);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `reports/${name}.png`, fullPage: true });
  }
}
