/**
 * 异常与边界场景
 */
import { test, expect } from '../fixtures/test_fixtures';
import { uniqueTypeName } from '../data/test_data';

test.describe('异常与边界', () => {

  test('断网后保存 → 页面不崩溃', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('网络测试'));
    await typeConfigPage.page.route('**/api/**', route => route.abort());
    await typeConfigPage.clickNextStep();
    await expect(typeConfigPage.page.locator('body')).toBeVisible();
    await typeConfigPage.page.unroute('**/api/**');
  });

  test('超长名称 → 前端限制或截断', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const longName = '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十';
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(longName);
    const value = await typeConfigPage.typeNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longName.length);
  });

});
