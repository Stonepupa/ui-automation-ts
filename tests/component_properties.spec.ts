/**
 * 组件特性 — 必填、默认值、唯一性
 */
import { test, expect } from '../fixtures/test_fixtures';
import { WorkOrderPage } from '../pages/work_order_page';
import { uniqueTypeName } from '../data/test_data';

/** 已有的稳定类型，确保在「我的工单」tree 中存在 */
const EXISTING_TYPE = 'ui自动化测试工单类型';

/** 辅助：创建并发布一个类型。字段始终设置必填。 */
async function createType(tc: any, typeName: string) {
  await tc.navigateToTypeConfig();
  await tc.clickAdd();
  await tc.fillTypeName(typeName);
  await tc.clickNextStep();
  await tc.addSingleLineField();
  await tc.setRequired();
  await tc.clickNextStep();
  await tc.configureProcess();
  await tc.publishAndSelectProject('测试项目', typeName);
}

test.describe('组件特性 — 元属性校验', () => {

  test('必填字段为空 → 提交时拦截', async ({ typeConfigPage, authenticatedPage }) => {
    // 先导航到类型配置页确保侧边栏状态正确
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    // 使用已有稳定类型，避免 tree 缓存问题
    await wo.webFrame.getByText(EXISTING_TYPE).first().click();
    await wo.clickCreate();
    await wo.submitWorkOrder();

    await expect(wo.workorderCreateFrame.getByText(/必填|请输入|不能为空/)).toBeVisible();
  });

  test('新增工单 → 字段默认为空', async ({ typeConfigPage, authenticatedPage }) => {
    // 先导航到类型配置页确保侧边栏状态正确
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(EXISTING_TYPE).first().click();
    await wo.clickCreate();

    const input = wo.workorderCreateFrame.getByRole('textbox', { name: '请输入' });
    await expect(input).toHaveValue('');
  });

  test('创建同名类型 → 拦截并提示名称已存在', async ({ typeConfigPage }) => {
    const typeName = uniqueTypeName('唯一性');
    await createType(typeConfigPage, typeName);

    // 再创建同名
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.clickNextStep();

    await typeConfigPage.assertStillOnBasicInfoPage();
    await typeConfigPage.assertDuplicateNameError();
  });

  test('不同名称 → 正常进入下一步', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(uniqueTypeName('不重复'));
    await typeConfigPage.clickNextStep();
    await typeConfigPage.assertAdvancedToFormDesignPage();
  });

});
