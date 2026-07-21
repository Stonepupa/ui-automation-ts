/**
 * 冒烟测试 — 完整创建类型流程
 */
import { test } from '../fixtures/test_fixtures';
import { uniqueTypeName } from '../data/test_data';
import * as path from 'path';

test.describe('工单类型 — 创建与发布（冒烟）', () => {

  test('完整流程: 创建 → 表单设计 → 流程设计 → 发布 → 启用', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const typeName = uniqueTypeName('冒烟');

    // 基本信息
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.uploadIcon(path.resolve(__dirname, '../data/assets/test_icon.png'));
    await typeConfigPage.uploadBanner(path.resolve(__dirname, '../data/assets/test_banner.png'));
    await typeConfigPage.clickNextStep();

    // 表单设计
    await typeConfigPage.addSingleLineField();
    await typeConfigPage.setRequired();
    await typeConfigPage.clickNextStep();

    // 流程设计：全局设置绑定主表单 → 工单池节点配置 → 抢单人操作 → 结束节点
    await typeConfigPage.configureProcess();
    // publishAndSelectProject 内部已完成：发布 → 选择项目 → 完成 → 启用 → 发布菜单
    await typeConfigPage.publishAndSelectProject('测试项目', typeName);

    // 验证类型出现在列表中
    await typeConfigPage.assertTypeExists(typeName);
  });

});
