/**
 * 工单类型配置 — 创建并发布工单类型（冒烟测试）
 *
 * 业务流程：
 *   运营管理 → 工单管理 → 类型配置 → 新增
 *   → 填写基础信息（名称、B端图标、C端图标）
 *   → 表单设计（添加字段、设置必填）
 *   → 流程设计（配置工单池、普通节点、结束节点）
 *   → 发布 → 关联项目 → 启用 → 发布菜单
 */
import { test } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';
import * as path from 'path';

test.describe('创建并发布工单类型', () => {

  test('完整流程: 填写基础信息 → 表单设计 → 流程设计 → 发布 → 启用并发布菜单', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const typeName = uniqueTypeName('冒烟');

    // ── 步骤1: 基础信息 ──
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.uploadIcon(path.resolve(__dirname, '../../data/assets/test_icon.png'));
    await typeConfigPage.uploadBanner(path.resolve(__dirname, '../../data/assets/test_banner.png'));
    await typeConfigPage.clickNextStep();

    // ── 步骤2: 表单设计 ──
    await typeConfigPage.addSingleLineField();
    await typeConfigPage.setRequired();
    await typeConfigPage.clickNextStep();

    // ── 步骤3: 流程设计 ──
    await typeConfigPage.configureProcess();

    // ── 步骤4: 发布 → 关联项目 → 完成 → 启用 → 发布菜单 ──
    await typeConfigPage.publishAndSelectProject('测试项目', typeName);

    // ── 断言: 类型出现在列表中 ──
    await typeConfigPage.assertTypeExists(typeName);
  });

});
