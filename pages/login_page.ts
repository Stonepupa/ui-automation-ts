import { Page } from '@playwright/test';
import { BasePage } from './base_page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── 定位器 ──
  get usernameInput() { return this.page.getByRole('textbox', { name: '用户名' }); }
  get passwordInput() { return this.page.getByRole('textbox', { name: '密码' }); }
  get loginButton()   { return this.page.getByRole('button', { name: '登 录' }); }
  get companyEntry()  { return this.page.getByText('万筑集团'); }

  // ── 操作 ──
  async open() {
    await this.navigate('/#/login');
    await this.waitForLoad();
  }

  async login(username?: string, password?: string) {
    const u = username || process.env.TEST_USERNAME || '19120159416';
    const p = password || process.env.TEST_PASSWORD || '159416';
    await this.usernameInput.fill(u);
    await this.passwordInput.fill(p);
    await this.loginButton.click();
    await this.waitForLoad();
  }

  async selectCompany(companyName: string = '万筑集团') {
    await this.page.getByText(companyName).click();
    await this.waitForLoad();
  }

  async quickLogin() {
    const currentUrl = this.page.url();

    // 已登录则跳过
    if (currentUrl.includes('/#/') && !currentUrl.includes('/login')) {
      // 确保不在登录页
      const isLoginPage = await this.page.locator('[placeholder="用户���"]').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (!isLoginPage) {
        await this.waitForLoad();
        await this.page.waitForTimeout(500);
        return;
      }
    }

    // 导航到登录页并登录
    await this.open();
    await this.login();
    await this.selectCompany();
  }
}
