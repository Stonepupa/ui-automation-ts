import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BasePage } from './base_page';

/**
 * 类型配置页面 — 工单类型 CRUD、表单设计、流程设计
 * 操作位于 iframe[name="webiframe"] 内
 */
export class TypeConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── iframe 层级 ──
  get webFrame(): FrameLocator {
    return this.page.locator('iframe[name="webiframe"]').contentFrame();
  }
  get formSettingFrame(): FrameLocator {
    return this.webFrame.locator('iframe[name="formSetting"]').contentFrame();
  }
  get bpmSettingFrame(): FrameLocator {
    return this.webFrame.locator('iframe[name="bpmSetting"]').contentFrame();
  }
  get workorderCreateFrame(): FrameLocator {
    return this.webFrame.locator('iframe[name="workorderCreate"]').contentFrame();
  }

  // ── 导航 ──
  async navigateToTypeConfig() {
    // 如果已在类型配置页面（webiframe 可见且列表已加载），跳过导航
    const webIframe = this.page.locator('iframe[name="webiframe"]');
    if (await webIframe.isVisible({ timeout: 2000 }).catch(() => false)) {
      // 验证确实在类型配置页（列表页有「新 增」按钮 或「重 置」按钮）
      const hasAddBtn = await this.webFrame.getByRole('button', { name: /新 增/ }).isVisible({ timeout: 2000 }).catch(() => false);
      const hasResetBtn = await this.webFrame.getByRole('button', { name: '重 置' }).isVisible({ timeout: 2000 }).catch(() => false);
      if (hasAddBtn || hasResetBtn) {
        console.log('[navigateToTypeConfig] 已在类型配置页，跳过导航');
        return;
      }
    }

    // 确保不在欢迎页 — 如果 URL 跳到了首页，先处理
    const currentUrl = this.page.url();
    if (currentUrl.includes('/home') || currentUrl.includes('/welcome')) {
      console.log('[navigateToTypeConfig] 当前在欢迎页，通过侧边栏导航');
    }

    // 项目选择
    try {
      await this.page.getByRole('textbox', { name: '全部' }).click({ timeout: 3000 });
      await this.page.waitForTimeout(500);
      await this.page.getByText('测试项目').click({ timeout: 3000 });
      await this.page.waitForTimeout(2000);
    } catch {
      console.log('[navigateToTypeConfig] 项目选择跳过（可能已选中）');
    }

    // 侧边栏导航
    await this.page.getByText('运营管理', { exact: true }).click();
    await this.page.waitForTimeout(2000);

    await this.page.getByRole('menubar').getByText('工单管理').click();
    await this.page.waitForTimeout(1000);

    await this.page.getByText('类型配置', { exact: true }).click();
    await this.page.waitForTimeout(3000);

    await this.page.locator('iframe[name="webiframe"]').waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForTimeout(1000);

    console.log(`[navigateToTypeConfig] 导航完成，当前 URL: ${this.page.url()}`);
  }

  // ── 类型列表操作 ──
  get addButton()     { return this.webFrame.getByRole('button', { name: ' 新 增' }); }
  get resetButton()   { return this.webFrame.getByRole('button', { name: '重 置' }); }

  async clickAdd() {
    await this.addButton.click();
    await this.waitForLoad();
  }

  async selectProject(projectName: string = '测试项目') {
    await this.webFrame.getByRole('button', { name: '选择项目' }).click();
    await this.webFrame.getByText(projectName).click();
    await this.webFrame.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
    await this.webFrame.getByRole('button', { name: '确 定' }).click();
    await this.waitForLoad();
  }

  // ── 类型基本信息 ──
  async fillTypeName(name: string) {
    await this.webFrame.getByRole('textbox', { name: '请输入' }).fill(name);
  }

  async uploadIcon(filePath: string) {
    // B端图标：第一个 .avatar-uploader 里的 input[type="file"]
    await this.webFrame.locator('.avatar-uploader').first()
      .locator('input[type="file"]').setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  async uploadBanner(filePath: string) {
    // C端图标：第二个 .avatar-uploader 里的 input[type="file"]
    await this.webFrame.locator('.avatar-uploader').nth(1)
      .locator('input[type="file"]').setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  // ── 表单设计 ──
  async addSingleLineField() {
    await this.formSettingFrame.locator('a').filter({ hasText: '单行文本框' }).click();
  }

  async setRequired() {
    await this.formSettingFrame.locator('.float_option').click();
    await this.formSettingFrame.getByText('必填').click();
  }

  // ── 流程设计 ──
  /**
   * 进入设计器 → 全局设置绑定主表单 →
   * 工单池节点：填状态 + 抢单人操作(抢单) →
   * 普通节点1：填状态 + 处理人操作(通过) →
   * 结束节点：填结束时状态。
   */
  async configureProcess(
    poolStatus: string = '这是工单池节点',
    node1Status: string = '这是普通节点1',
    endStatus: string = '已结束',
  ) {
    // Step 1: 进入流程设计器
    const globalSettingsBtn = this.webFrame.getByRole('button', { name: '全局设置 ' });
    const hasGlobalSettings = await globalSettingsBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasGlobalSettings) {
      await globalSettingsBtn.click();
    } else {
      await this.webFrame.getByRole('button', { name: '新 增' }).click();
    }
    await this.page.waitForTimeout(3000);

    // Step 2: 等待设计器加载完成
    await this.webFrame.locator('iframe[name="bpmSetting"]').waitFor({ state: 'visible', timeout: 15_000 });
    // 等待 loading 消失或节点出现（用「工单池」节点作为加载完成标志）
    await this.bpmSettingFrame.locator('.el-loading-mask').first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await this.bpmSettingFrame.locator('.node-wrap-box').filter({ hasText: '工单池' }).first()
      .waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForTimeout(500);

    // Step 3: 绑定主表单字段
    await this.bindMainForm();

    // ── 工单池节点 ──
    await this.bpmSettingFrame.locator('.node-wrap-box').filter({ hasText: '工单池' }).first().click();
    await this.page.waitForTimeout(1500);
    await this.bpmSettingFrame.getByRole('textbox', { name: '请输入节点业务状态' }).fill(poolStatus);
    await this.page.waitForTimeout(300);
    await this.addNodeAction('抢单人操作', '抢单');

    // ── 普通节点1 ──
    await this.bpmSettingFrame.locator('.node-wrap-box').filter({ hasText: '普通节点1' }).first().click();
    await this.page.waitForTimeout(1500);
    await this.bpmSettingFrame.getByRole('textbox', { name: '请输入节点业务状态' }).fill(node1Status);
    await this.page.waitForTimeout(300);
    await this.addNodeAction('处理人操作', '通过');

    // ── 结束节点 ──
    await this.bpmSettingFrame.locator('#screen2').getByText('结束').click();
    await this.page.waitForTimeout(1000);
    await this.bpmSettingFrame.getByRole('textbox', { name: '请输入结束时状态' }).fill(endStatus);
    await this.page.waitForTimeout(300);
  }

  /** 全局设置 → 选择主表单字段 → 选第一个字段 → 确定 */
  private async bindMainForm() {
    const openBtn = this.bpmSettingFrame.locator('.global-field-btn.m-bottom-m');
    if (!(await openBtn.isVisible({ timeout: 3000 }).catch(() => false))) return;

    await openBtn.click();
    await this.page.waitForTimeout(1500);

    const firstField = this.bpmSettingFrame.locator('.dialog-radio-group .el-radio').first();
    if (await firstField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstField.click();
      await this.page.waitForTimeout(300);
    }

    const confirmBtn = this.bpmSettingFrame.locator('.el-dialog__footer').getByRole('button', { name: '确 定' });
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * 通用：节点配置面板中 → 指定操作区域 → 添加 → 选操作类型 → 确认。
   * @param sectionLabel 操作区域标签，如「抢单人操作」「处理人操作」
   * @param actionName   popover 中操作名称，如「抢单」「通过」
   */
  private async addNodeAction(sectionLabel: string, actionName: string) {
    const section = this.bpmSettingFrame.locator('div').filter({ hasText: sectionLabel });
    await section.locator('span:has-text("添加")').first().click();
    await this.page.waitForTimeout(1500);

    // 在 popover 中点击指定操作（如「抢单」「通过」）
    // popover 内容可能不在视口内或被 header 遮挡，使用 dispatchEvent 绕过可见性检查
    const popoverAction = this.bpmSettingFrame.locator('.operation-handle-add-popover:visible')
      .locator('div, span').filter({ hasText: new RegExp(`^${actionName}$`) }).first();
    await popoverAction.dispatchEvent('click');
    await this.page.waitForTimeout(1500);

    const drawer = this.bpmSettingFrame.locator('.el-drawer__wrapper.register-drawer').filter({ hasText: actionName });
    const confirmBtn = drawer.locator('button').filter({ hasText: '确认' }).first();
    await confirmBtn.dispatchEvent('click');
    await this.page.waitForTimeout(2000);

    // 用 Escape 关闭可能残留的 popover，避免遮挡后续节点点击
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  // ── 发布 ──
  /**
   * 发布流程后：
   * 1. 等待跳转到流程列表页
   * 2. 点击流程行中的「选择项目」
   * 3. 在穿梭框弹框中选择项目并右移到右侧已选列表
   * 4. 确定 → 完成 → 回到工单类型列表
   * 5. 打开「是否启用」开关
   * 6. 点击操作列中的「发布」菜单按钮 → 确认发布
   *
   * 穿梭框操作要点：
   * - Element UI Transfer 组件，左侧面板是未选列表，右侧是已选列表
   * - 必须点击 .el-checkbox__input 元素（而不是 .el-checkbox__label）来触发 Vue 的选中状态
   * - 选中后必须验证 checkbox 变为 checked，再点击右移按钮
   * - 验证项目出现在右侧面板后，才点击弹框的「确定」
   */
  async publishAndSelectProject(projectName: string = '测试项目', typeName?: string) {
    // Step 1: 点击发布
    await this.webFrame.getByRole('button', { name: '发布' }).click();
    await this.page.waitForTimeout(5000);

    // Step 2: 点击可见的「选择项目」按钮
    const candidates = await this.webFrame.locator('a, button, span').filter({ hasText: '选择项目' }).all();
    let projectBtnClicked = false;
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click();
        projectBtnClicked = true;
        break;
      }
    }

    if (!projectBtnClicked) {
      const completeBtn = this.webFrame.getByRole('button', { name: '完成' });
      if (await completeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await completeBtn.click();
        await this.page.waitForTimeout(3000);
      }
      await this.page.locator('iframe[name="webiframe"]').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
      return;
    }

    await this.page.waitForTimeout(2000);

    // Step 3: 在项目选择弹框中选中项目并确定
    // 弹框结构：左侧 checkbox-group + 中间按钮组 + 右侧已选列表
    // 关键发现：checkbox "测试项目" 默认已 [checked]，但右侧为 "已选择 0"
    // 可能这个弹框不是标准 Transfer — 也许只需勾选 checkbox 后直接确定即可
    //
    // 策略：直接用 Playwright 定位器操作弹框中的 checkbox

    // 在弹框中找 checkbox "测试项目" 并确保它 checked
    const dialogCheckbox = this.webFrame.locator('[role="dialog"]').filter({ hasText: '选择项目' })
      .locator('input[type="checkbox"]').first();

    // 同时尝试用 label 文本定位
    const dialogLabel = this.webFrame.locator('[role="dialog"]').filter({ hasText: '选择项目' })
      .getByText(projectName).first();

    // 先点击 label 确保勾选
    const labelVisible = await dialogLabel.isVisible({ timeout: 3000 }).catch(() => false);
    if (labelVisible) {
      await dialogLabel.click();
      console.log('[publishAndSelectProject] clicked label');
      await this.page.waitForTimeout(500);
    }

    // 然后找右移按钮 — 用更准确的定位
    // 弹框中的按钮组：可能是 .el-transfer__buttons 或直接的一排 button
    const allDialogBtns = this.webFrame.locator('[role="dialog"]').filter({ hasText: '选择项目' })
      .locator('button');
    const btnCount = await allDialogBtns.count();
    console.log(`[publishAndSelectProject] dialog has ${btnCount} buttons`);

    // 点击右移按钮：btn[0]=Close(图标), btn[1]=左移(disabled), btn[2]=右移(图标)
    // 图标按钮 text 为空字符串，用 disabled 状态来区分
    // 右移按钮 = 第 3 个 button (index 2)，非 disabled 且不是确定/取消
    for (let i = 0; i < btnCount; i++) {
      const btn = allDialogBtns.nth(i);
      const text = (await btn.textContent().catch(() => '')).trim();
      const disabled = await btn.isDisabled().catch(() => true);
      console.log(`[publishAndSelectProject]   btn[${i}]: "${text}" disabled=${disabled}`);
      // 右移按钮：非 disabled，且文本为空（图标按钮），且不是第一个（Close）
      // 或者直接按位置：btn[2]
      if (!disabled && i === 2) {
        console.log(`[publishAndSelectProject]   -> CLICKING right-move btn[${i}]`);
        await btn.click();
        await this.page.waitForTimeout(800);
        break;
      }
    }
    await this.page.waitForTimeout(1500);

    // Step 4: 点击弹框「确定」
    const confirmBtn = this.webFrame.getByRole('button', { name: '确 定' });
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForTimeout(2000);
    }

    // Step 4.5: 验证「适用项目」列是否显示了项目名称
    // 流程列表页表格列：序号 | 流程名称 | 适用项目 | 创建时间 | 操作
    // 适用项目是第三列（cell index 2），如果为空说明关联失败
    const projectCell = this.webFrame.locator('table').last()
      .locator('tbody tr').first()
      .locator('td').nth(2);
    
    const cellText = await projectCell.textContent().catch(() => '');
    console.log(`[publishAndSelectProject] 适用项目列内容: "${cellText?.trim()}"`);

    if (!cellText || cellText.trim() === '') {
      console.log('[publishAndSelectProject] WARNING: 适用项目列为空，项目可能未关联成功！');
    }

    // Step 5: 点击「完成」回到类型列表
    const completeBtn = this.webFrame.getByRole('button', { name: '完成' });
    if (await completeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await completeBtn.click();
      await this.page.waitForTimeout(3000);
    }

    // 确保 webiframe 就绪
    await this.page.locator('iframe[name="webiframe"]').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // Step 6: 回到工单类型列表后，启用 + 发布菜单
    // 新创建的类型一定在列表第一条，用 typeName 确认
    await this.page.waitForTimeout(3000);

    // 等待列表数据加载
    await this.webFrame.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForTimeout(1000);

    // 获取第一行
    const firstRow = this.webFrame.locator('tbody tr').first();
    const firstRowText = await firstRow.textContent().catch(() => '');
    console.log(`[publishAndSelectProject] 第一条: "${firstRowText?.trim()?.substring(0, 120)}"`);

    // 验证第一行是否包含当前类型名称
    if (typeName && firstRowText && !firstRowText.includes(typeName)) {
      console.log(`[publishAndSelectProject] WARNING: 第一条不包含 "${typeName}"，可能列表未刷新`);
      // 尝试点击重置刷新
      const resetBtn = this.resetButton;
      if (await resetBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await resetBtn.click();
        await this.page.waitForTimeout(3000);
        const refreshed = await this.webFrame.locator('tbody tr').first().textContent().catch(() => '');
        console.log(`[publishAndSelectProject] 重置后第一条: "${refreshed?.trim()?.substring(0, 120)}"`);
      }
    }

    // 打开「是否启用」开关
    const enableSwitch = firstRow.locator('.el-switch');
    const switchChecked = await enableSwitch.locator('.is-checked').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[publishAndSelectProject] 开关 checked=${switchChecked}`);

    if (!switchChecked) {
      console.log('[publishAndSelectProject] 打开「是否启用」开关');
      await enableSwitch.click();
      await this.page.waitForTimeout(3000);
    }

    // 点击「发布菜单」— 开关打开后重新获取第一行（DOM 已更新）
    console.log('[publishAndSelectProject] 查找「发布菜单」');
    await this.page.waitForTimeout(1000);

    // 发布菜单在表格右侧固定列（el-table__fixed-right）里，和主表是分开渲染的
    // 需要定位固定列的第一行
    const fixedRight = this.webFrame.locator('.el-table__fixed-right');
    const fixedRow = fixedRight.locator('tbody tr').first();
    const fixedRowText = await fixedRow.textContent().catch(() => '');
    console.log(`[publishAndSelectProject] 固定列第一行: "${fixedRowText?.trim()?.substring(0, 120)}"`);

    // 在固定列第一行中查找包含"发布菜单"的 button
    let publishMenuBtn = fixedRow.getByRole('button', { name: '发布菜单' });
    let publishVisible = await publishMenuBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (!publishVisible) {
      const buttons = fixedRow.locator('button.el-button--text');
      const btnCount = await buttons.count().catch(() => 0);
      for (let i = 0; i < btnCount; i++) {
        const text = (await buttons.nth(i).textContent().catch(() => '')).trim();
        console.log(`[publishAndSelectProject]   fixed button[${i}]: "${text}"`);
        if (text.includes('发布菜单')) {
          publishMenuBtn = buttons.nth(i);
          publishVisible = true;
          break;
        }
      }
    }

    if (publishVisible) {
      console.log('[publishAndSelectProject] 点击「发布菜单」');
      // fixed-right 列可能有隐藏副本，强制点击可见的那个
      await publishMenuBtn.click({ force: true });
      await this.page.waitForTimeout(2000);

      const pubConfirmBtn = this.webFrame.getByRole('button', { name: '确 定' });
      if (await pubConfirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pubConfirmBtn.click();
        await this.page.waitForTimeout(2000);
      }
    } else {
      console.log('[publishAndSelectProject] WARNING: 未找到「发布菜单」');
    }

    if (publishVisible) {
      console.log('[publishAndSelectProject] 点击「发布菜单」');
      // fixed-right 列可能导致 Playwright 找到 hidden 副本，用 force 强制点击
      await publishMenuBtn.click({ force: true });
      await this.page.waitForTimeout(2000);

      const pubConfirmBtn = this.webFrame.getByRole('button', { name: '确 定' });
      if (await pubConfirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pubConfirmBtn.click();
        await this.page.waitForTimeout(2000);
      }
    } else {
      console.log('[publishAndSelectProject] WARNING: 未找到「发布菜单」');
    }
  }

  // ── 下一步/关闭/完成 ──
  async clickNextStep() {
    await this.webFrame.getByRole('button', { name: '下一步' }).click();
    await this.waitForLoad();
  }

  async clickClose() {
    await this.webFrame.getByRole('button', { name: '关闭' }).click();
    await this.waitForLoad();
  }

  async clickCompleteInProcess() {
    await this.webFrame.getByRole('button', { name: '完成' }).click();
    await this.waitForLoad();
  }

  // ── 断言 ──
  get typeNameInput() {
    return this.webFrame.getByRole('textbox', { name: '请输入' });
  }
  get errorToast() {
    return this.webFrame.locator('.el-message--error, .el-message__content, .el-notification__content, [class*="error-tip"], [class*="error-msg"]').first();
  }
  get nameErrorHint() {
    return this.webFrame.locator('.el-form-item__error, [class*="input-error"], [class*="field-error"], [class*="validate-error"]').first();
  }

  async assertDuplicateNameError() {
    const error = this.errorToast.or(this.nameErrorHint);
    await expect(error.first()).toContainText(/重复|已存在|已被使用|已占用|Duplicate|already exists|already used/, { timeout: 10_000 });
  }
  async assertStillOnBasicInfoPage() {
    await expect(this.typeNameInput).toBeVisible({ timeout: 5000 });
  }
  async assertAdvancedToFormDesignPage() {
    await expect(this.webFrame.getByRole('button', { name: '下一步' })).toBeVisible({ timeout: 5000 });
  }
  async assertTypeExists(typeName: string) {
    await this.seeElement(this.webFrame.getByText(typeName).first());
  }
}
