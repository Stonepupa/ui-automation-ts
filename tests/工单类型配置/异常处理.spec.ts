/**
 * 工单类型配置 - 异常情况下的表现
 *
 * 测试校验点：
 *   1. 断网时操作 — 模拟网络断开后点击下一步，页面不应崩溃或白屏
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';

test.describe('异常处理 - 断网时页面不崩溃', () => {

  test('断网时点击下一步: 拦截所有API请求 → 点击下一步 → 页面仍然正常显示不崩溃', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('网络测试'));

    // 模拟断网：拦截所有 API 请求
    await typeConfigPage.page.route('**/api/**', route => route.abort());
    await typeConfigPage.clickNextStep();

    // 页面应仍然存在
    await expect(typeConfigPage.page.locator('body')).toBeVisible();

    // 恢复网络
    await typeConfigPage.page.unroute('**/api/**');
  });

});
