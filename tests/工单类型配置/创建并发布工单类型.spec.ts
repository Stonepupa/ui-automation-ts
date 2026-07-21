/**
 * 工单类型配置 - 创建并发布一个完整的工单类型
 *
 * 测试流程：
 *   1. 进入类型配置列表，点击「新增」
 *   2. 填写基础信息：类型名称、上传B端图标、上传C端图标
 *   3. 表单设计：添加单行文本框、设置为必填
 *   4. 流程设计：配置工单池节点（抢单操作）、普通节点（通过操作）、结束节点
 *   5. 点击发布 → 在流程列表中关联项目
 *   6. 回到类型列表 → 打开「是否启用」开关 → 点击「发布菜单」
 *   7. 验证该类型出现在类型列表中
 */
import { test } from '../../fixtures/test_fixtures';
import { uniqueTypeName } from '../../data/test_data';
import * as path from 'path';

test.describe('创建并发布工单类型 - 完整主流程', () => {

  test('新建工单类型 → 填写基础信息 → 表单设计 → 流程设计 → 发布关联项目 → 启用并发布菜单 → 列表中可见', async ({ typeConfigPage }) => {
    await typeConfigPage.navigateToTypeConfig();
    const typeName = uniqueTypeName('冒烟');

    // 基础信息：名称 + B端图标 + C端图标
    await typeConfigPage.clickAdd();
    await typeConfigPage.fillTypeName(typeName);
    await typeConfigPage.uploadIcon(path.resolve(__dirname, '../../data/assets/test_icon.png'));
    await typeConfigPage.uploadBanner(path.resolve(__dirname, '../../data/assets/test_banner.png'));
    await typeConfigPage.clickNextStep();

    // 表单设计：添加字段 + 设置必填
    await typeConfigPage.addSingleLineField();
    await typeConfigPage.setRequired();
    await typeConfigPage.clickNextStep();

    // 流程设计：配置各节点
    await typeConfigPage.configureProcess();

    // 发布 → 关联项目 → 完成 → 启用 → 发布菜单
    await typeConfigPage.publishAndSelectProject('测试项目', typeName);

    // 断言：类型出现在列表中
    await typeConfigPage.assertTypeExists(typeName);
  });

});
