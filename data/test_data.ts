/**
 * 测试数据工厂 — 工单类型、工单数据
 */
import * as path from 'path';

const TEST_ASSETS = path.resolve(__dirname, 'assets');

export interface TypeConfigData {
  name: string;
  iconPath?: string;
  bannerPath?: string;
  fields: FormFieldData[];
  nodes: ProcessNodeData[];
  projectName: string;
}

export interface FormFieldData {
  type: '单行文本框' | '多行文本框' | '下拉框' | '日期' | '附件';
  required: boolean;
  label?: string;
}

export interface ProcessNodeData {
  label: string;
  status: string;
  actions: string[];
}

export interface WorkOrderData {
  typeName: string;
  fieldValues: Record<string, string>;
}

// ── 默认工单类型配置 ──
export const defaultTypeConfig: TypeConfigData = {
  name: 'ui自动化测试工单类型',
  fields: [
    { type: '单行文本框', required: true, label: '单行文本框' },
  ],
  nodes: [
    { label: '普通节点1', status: '普通节点1', actions: ['通过流程进入下一步'] },
  ],
  projectName: '测试项目',
};

export const workOrder: WorkOrderData = {
  typeName: 'ui自动化测试工单类型',
  fieldValues: { '单行文本框': 'ui自动化测试' },
};

// ── 参数化测试数据 ──

// 类型名称边界值
export const typeNameScenarios = [
  { name: '正常名称', expectValid: true },
  { name: 'AB', expectValid: true, description: '2字符' },
  { name: '这是一个很长的工单类型名称测试数据', expectValid: true, description: '长名称' },
  { name: '', expectValid: false, expectError: '请输入' },
];

// 必填字段校验
export const requiredFieldScenarios = [
  { fillValue: '', expectError: true, description: '空值' },
  { fillValue: '正常值', expectError: false, description: '正常值' },
];

// 流程状态枚举
export const nodeStatusScenarios = [
  { status: '待处理', description: '中文状态' },
  { status: 'pending', description: '英文状态' },
  { status: '', description: '空状态', expectError: true },
];

// ── 唯一性校验场景 ──
export const uniquenessScenarios = [
  {
    description: '完全相同名称',
    existingName: 'ui自动化测试工单类型',
    newName: 'ui自动化测试工单类型',
    expectBlocked: true,
    expectMessage: '重复/已存在',
  },
  {
    description: '前后空格（Trim 后重复）',
    existingName: 'ui自动化测试工单类型',
    newName: '  ui自动化测试工单类型  ',
    expectBlocked: true,
    expectMessage: '重复/已存在',
  },
  {
    description: '不同名称',
    existingName: 'ui自动化测试工单类型',
    newName: '完全不同的新类型',
    expectBlocked: false,
  },
];

// 用于创建新类型时生成不重复的名称
export function uniqueTypeName(prefix: string = 'ui自动化'): string {
  return `${prefix}_${Date.now()}`;
}
