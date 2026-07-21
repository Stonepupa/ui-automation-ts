/**
 * 我的工单 — 审批工单（端到端）
 *
 * 业务流程：
 *   我的工单 → 选择类型 → 新增工单 → 填写字段 → 提交
 *   → 查看详情 → 审批通过
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { WorkOrderPage } from '../../pages/work_order_page';

/** 已有的稳定类型，确保在「我的工单」类型树中存在 */
const EXISTING_TYPE = 'ui自动化测试工单类型';

test.describe('审批工单', () => {

  test('端到端: 选择类型 → 提工单 → 审批通过', async ({ typeConfigPage, authenticatedPage }) => {
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    const fieldValue = `e2e测试_${Date.now()}`;

    // 提工单
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(EXISTING_TYPE).first().click();
    await wo.clickCreate();
    await wo.fillWorkOrderField(fieldValue);
    await wo.submitWorkOrder();

    // 等待列表刷新
    await wo.page.waitForTimeout(2000);
    await expect(wo.webFrame.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });

    // 审批通过
    await wo.clickDetail();
    await wo.approve();
    await expect(wo.webFrame.getByRole('button', { name: '通过' })).not.toBeVisible();
  });

});
