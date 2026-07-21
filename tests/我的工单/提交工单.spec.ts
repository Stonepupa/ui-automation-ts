/**
 * 我的工单 — 提交工单
 *
 * 校验点：
 *   - 必填拦截：必填字段为空点提交，提示拦截
 *   - 默认值为空：新增工单时字段默认为空
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { WorkOrderPage } from '../../pages/work_order_page';

/** 已有的稳定类型，确保在「我的工单」类型树中存在 */
const EXISTING_TYPE = 'ui自动化测试工单类型';

test.describe('提交工单', () => {

  test('必填字段为空 → 提交时拦截提示', async ({ typeConfigPage, authenticatedPage }) => {
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(EXISTING_TYPE).first().click();
    await wo.clickCreate();
    await wo.submitWorkOrder();

    // 应提示必填
    await expect(wo.workorderCreateFrame.getByText(/必填|请输入|不能为空/)).toBeVisible();
  });

  test('新增工单 → 字段默认值为空', async ({ typeConfigPage, authenticatedPage }) => {
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(EXISTING_TYPE).first().click();
    await wo.clickCreate();

    // 输入框默认值为空
    const input = wo.workorderCreateFrame.getByRole('textbox', { name: '请输入' });
    await expect(input).toHaveValue('');
  });

});
