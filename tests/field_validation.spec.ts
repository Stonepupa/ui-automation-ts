/**
 * 字段元属性校验
 */
import { test, expect } from '../fixtures/test_fixtures';

test.describe('类型配置 — 字段元属性校验', () => {

  test('名称必填: 不填名称 → 保存拦截', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName('');
    await typeConfigPage.clickNextStep();
    await expect(typeConfigPage.typeNameInput).toBeVisible();
  });

  test('正常名称 → 可进入下一步', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName('正常工单类型');
    await typeConfigPage.clickNextStep();
    await typeConfigPage.assertAdvancedToFormDesignPage();
  });

});
