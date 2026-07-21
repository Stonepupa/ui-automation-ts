/**
 * 冒烟测试 — 完整创建类型流程
 */
import { test } from '../fixtures/test_fixtures';
import { uniqueTypeName } from '../data/test_data';

test.describe('工单类型 — 创建与发布（冒烟）', () => {

  test('完整流程: 创建 → 表单设计 → 流程设计 → 发布 → 启用', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const typeName = uniqueTypeName('冒烟');

    // 基本信息
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.clickNextStep();

    // 表单设计
    await typeConfigPage.addSingleLineField();
    await typeConfigPage.setRequired();
    await typeConfigPage.clickNextStep();

    // 流程设计：全局设置绑定主表单 → 工单池节点配置 → 抢单人操作 → 结束节点
    await typeConfigPage.configureProcess();
    await typeConfigPage.publishAndSelectProject('测试项目');

    // 回到类型列表 → 重置刷新 → 验证
    // 如果发布没有触发跳转，用关闭+完成回列表
    const resetVisible = await typeConfigPage.resetButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (!resetVisible) {
      await typeConfigPage.clickClose();
      await typeConfigPage.clickCompleteInProcess();
    }
    await typeConfigPage.resetButton.click();
    await typeConfigPage.waitForLoad();
    await typeConfigPage.assertTypeExists(typeName);
  });

});
