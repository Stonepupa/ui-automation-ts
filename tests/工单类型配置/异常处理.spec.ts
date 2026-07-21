/**
 * 工单类型配置 — 异常处理
 *
 * 校验点：
 *   - 断网保存：API 断连时页面不崩溃
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';

test.describe('异常处理', () => {

  test('断网保存: 拦截 API 后点下一步 → 页面不崩溃', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('网络测试'));

    // 拦截所有 API 请求模拟断网
    await typeConfigPage.page.route('**/api/**', route => route.abort());
    await typeConfigPage.clickNextStep();

    // 页面仍然存在，没有白屏崩溃
    await expect(typeConfigPage.page.locator('body')).toBeVisible();

    // 恢复网络
    await typeConfigPage.page.unroute('**/api/**');
  });

});
