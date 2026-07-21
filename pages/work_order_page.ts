import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';

/**
 * 我的工单页面 — 工单创建、提交、审批
 */
export class WorkOrderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── iframe ──
  get webFrame() {
    return this.page.locator('iframe[name="webiframe"]').contentFrame();
  }

  get workorderCreateFrame() {
    return this.webFrame.locator('iframe[name="workorderCreate"]').contentFrame();
  }

  // ── 导航 ──
  /**
   * 从任意页面导航到「我的工单」。
   * 流程：侧边栏点击「我的工单」→ 等待 webiframe 加载 → 切换项目
   */
  async navigateToMyWorkOrder(projectName: string = '测试项目') {
    // 使用与 navigateToTypeConfig 相同的导航路径：先进入类型配置再切到我的工单
    // 这确保了侧边栏状态一致

    // 等待侧边栏加载
    await this.page.waitForTimeout(1000);

    // 先导航到类型配置页面（复用可靠的导航逻辑）
    const typeConfig = this.page.getByText('类型配置', { exact: true });
    const isAlreadyThere = await typeConfig.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isAlreadyThere) {
      // 通过侧边栏逐级展开
      // 点击「运营管理」
      await this.page.getByText('运营管理', { exact: true }).click();
      await this.page.waitForTimeout(1500);
      // 点击「工单管理」
      await this.page.getByRole('menubar').getByText('工单管理').click();
      await this.page.waitForTimeout(1000);
    }

    // 点击「我的工单」
    await this.page.getByText('我的工单', { exact: true }).click();
    await this.page.waitForTimeout(3000);

    // 等待 webiframe 出现
    await this.page.locator('iframe[name="webiframe"]').waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // 切换项目
    await this.selectProjectInSidebar(projectName);

    // 等待类型树完全加载 — 需要 treeitem 出现
    await this.webFrame.locator('.el-tree-node, [role="treeitem"]').first()
      .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
    await this.page.waitForTimeout(3000);
  }

  async navigateToTypeConfigFromSidebar() {
    await this.page.locator('#appSidebar').getByText('类型配置', { exact: true }).click();
    await this.waitForLoad();
  }

  async selectProjectInSidebar(projectName: string = '测试项目') {
    // 等待项目选择器出现
    const projectInput = this.page.getByRole('textbox', { name: '全部' });
    await projectInput.waitFor({ state: 'visible', timeout: 15_000 });
    await projectInput.click();
    await this.page.waitForTimeout(800);

    // 点击目标项目
    const targetItem = this.page.getByRole('listitem').filter({ hasText: projectName });
    await targetItem.waitFor({ state: 'visible', timeout: 10_000 });
    await targetItem.click();
    await this.page.waitForTimeout(2000);
  }

  // ── 工单创建 ──
  get createButton() { return this.webFrame.getByRole('button', { name: '新 增' }); }
  get detailButton() { return this.webFrame.getByRole('button', { name: '详情' }).first(); }
  get approveButton() { return this.webFrame.getByRole('button', { name: '通过' }); }
  get confirmButton() { return this.webFrame.getByRole('button', { name: '确认' }); }

  async clickCreate() {
    await this.createButton.click();
    await this.waitForLoad();
  }

  async fillWorkOrderField(value: string) {
    await this.workorderCreateFrame.getByRole('textbox', { name: '请输入' }).fill(value);
  }

  async submitWorkOrder() {
    await this.workorderCreateFrame.getByRole('button', { name: '提 交' }).click();
    await this.waitForLoad();
  }

  async clickDetail() {
    await this.detailButton.click();
    await this.waitForLoad();
  }

  async approve() {
    await this.approveButton.click();
    await this.confirmButton.click();
    await this.waitForLoad();
  }

  // ── 断言 ──
  async assertWorkOrderExists(title: string) {
    await this.seeElement(this.webFrame.getByTitle(title));
  }
}
