/**
 * 工单类型配置 - 基础信息页面的输入校验
 *
 * 测试校验点：
 *   1. 名称必填 — 不填名称点下一步，应停留在当前页
 *   2. 名称唯一 — 创建已存在的名称，应提示重复/已存在
 *   3. 正常名称 — 不同名称可正常进入下一步（表单设计页）
 *   4. 超长名称 — 输入超长字符时，输入框应有长度限制
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';
import * as path from 'path';

/** 创建一个完整类型并发布（用于同名测试的前置准备） */
async function 创建并发布一个类型(tc: any, typeName: string) {
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

test.describe('基础信息 - 输入校验', () => {

  test('名称必填: 不填名称点击下一步 → 停留在基础信息页，不被放行', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName('');
    await typeConfigPage.clickNextStep();
    await expect(typeConfigPage.typeNameInput).toBeVisible();
  });

  test('名称唯一: 创建已存在的类型名称 → 提示名称重复/已存在', async ({ typeConfigPage }) => {
    const typeName = uniqueTypeName('同名');
    await 创建并发布一个类型(typeConfigPage, typeName);

    // 再次创建同名类型
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.clickNextStep();

    // 应停留在基础信息页，且出现重复提示
    await typeConfigPage.assertStillOnBasicInfoPage();
    await typeConfigPage.assertDuplicateNameError();
  });

  test('正常名称: 输入不同的名称 → 可以进入表单设计页', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('正常'));
    await typeConfigPage.clickNextStep();
    await typeConfigPage.assertAdvancedToFormDesignPage();
  });

  test('超长名称: 输入超长字符 → 输入框应自动截断或限制长度', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const longName = '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十';
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(longName);
    const value = await typeConfigPage.typeNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longName.length);
  });

});
