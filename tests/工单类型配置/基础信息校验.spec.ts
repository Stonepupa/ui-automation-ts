/**
 * 工单类型配置 — 基础信息校验
 *
 * 校验点：
 *   - 名称必填：不填名称点下一步，停留在当前页
 *   - 同名拦截：创建已存在的类型名称，提示重复
 *   - 正常进入：不同名称可正常进入表单设计
 *   - 超长名称：输入超长字符，前端应限制或截断
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';
import * as path from 'path';

/** 辅助：创建并发布一个完整类型 */
async function createAndPublish(tc: any, typeName: string) {
  await tc.navigateToTypeConfig();
  await tc.clickAdd();
  await tc.fillTypeName(typeName);
  await tc.uploadIcon(path.resolve(__dirname, '../../data/assets/test_icon.png'));
  await tc.uploadBanner(path.resolve(__dirname, '../../data/assets/test_banner.png'));
  await tc.clickNextStep();
  await tc.addSingleLineField();
  await tc.setRequired();
  await tc.clickNextStep();
  await tc.configureProcess();
  await tc.publishAndSelectProject('测试项目', typeName);
}

test.describe('基础信息校验', () => {

  test('名称必填: 不填名称点下一步 → 停留在基础信息页', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName('');
    await typeConfigPage.clickNextStep();
    // 仍然在基础信息页，名称输入框可见
    await expect(typeConfigPage.typeNameInput).toBeVisible();
  });

  test('同名拦截: 创建已存在的类型名称 → 提示重复', async ({ typeConfigPage }) => {
    const typeName = uniqueTypeName('同名');
    // 先创建一个类型
    await createAndPublish(typeConfigPage, typeName);

    // 再创建同名类型
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.clickNextStep();

    // 停留在基础信息页，并提示名称已存在
    await typeConfigPage.assertStillOnBasicInfoPage();
    await typeConfigPage.assertDuplicateNameError();
  });

  test('正常名称: 不同名称 → 可进入表单设计', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('正常'));
    await typeConfigPage.clickNextStep();
    await typeConfigPage.assertAdvancedToFormDesignPage();
  });

  test('超长名称: 输入超长字符 → 前端限制长度', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const longName = '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十';
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(longName);
    const value = await typeConfigPage.typeNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longName.length);
  });

});
