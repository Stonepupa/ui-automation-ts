/**
 * 我的工单 - 提交工单时的表单字段校验
 *
 * 前置条件：系统中已存在已启用并发布的「ui自动化测试工单类型」
 *
 * 测试校验点：
 *   1. 必填字段为空提交 — 应提示「必填」「请输入」「不能为空」
 *   2. 新增工单字段默认值 — 输入框默认值应为空
 */
import { test, expect } from '../../fixtures/test_fixtures';
import { WorkOrderPage } from '../../pages/work_order_page';

/** 系统中已有的稳定工单类型，已启用已发布，且字段设置了必填 */
const 已有类型 = 'ui自动化测试工单类型';

test.describe('提交工单 - 字段校验', () => {

  test('必填字段为空点提交: 不填任何字段 → 点击提交 → 出现必填拦截提示', async ({ typeConfigPage, authenticatedPage }) => {
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(已有类型).first().click();
    await wo.clickCreate();
    await wo.submitWorkOrder();

    // 应出现必填提示
    await expect(wo.workorderCreateFrame.getByText(/必填|请输入|不能为空/)).toBeVisible();
  });

  test('新增工单字段默认值为空: 选择类型 → 点击新增 → 输入框默认值为空字符串', async ({ typeConfigPage, authenticatedPage }) => {
    await typeConfigPage.navigateToTypeConfig();

    const wo = new WorkOrderPage(authenticatedPage);
    await wo.navigateToMyWorkOrder('测试项目');
    await wo.webFrame.getByText(已有类型).first().click();
    await wo.clickCreate();

    // 输入框默认应为空
    const input = wo.workorderCreateFrame.getByRole('textbox', { name: '请输入' });
    await expect(input).toHaveValue('');
  });

});
