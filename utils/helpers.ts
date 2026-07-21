/**
 * 工具函数
 */
import { Page } from '@playwright/test';
import * as path from 'path';

export function timestamp(): string {
  return Date.now().toString(36);
}

export function uniqueName(prefix: string): string {
  return `${prefix}_${timestamp()}`;
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `reports/${name}_${timestamp()}.png`,
    fullPage: true,
  });
}
