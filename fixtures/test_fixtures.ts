import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login_page';
import { TypeConfigPage } from '../pages/type_config_page';
import { WorkOrderPage } from '../pages/work_order_page';

interface Fixtures {
  authenticatedPage: Page;
  typeConfigPage: TypeConfigPage;
  workOrderPage: WorkOrderPage;
}

/**
 * 共享一个已登录的 page，不在 fixture 里做导航。
 * 导航由各测试按需调用 navigateToTypeConfig()，避免重复导航导致 session 冲突。
 */
export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
    await use(page);
  },

  typeConfigPage: async ({ authenticatedPage }, use) => {
    const page = new TypeConfigPage(authenticatedPage);
    // 不在这里导航，让测试自己调用 navigateToTypeConfig
    await use(page);
  },

  workOrderPage: async ({ authenticatedPage }, use) => {
    const page = new WorkOrderPage(authenticatedPage);
    await use(page);
  },
});

export { expect } from '@playwright/test';
