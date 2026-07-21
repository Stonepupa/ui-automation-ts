#!/usr/bin/env bash
# ──────────────────────────────────────────────────
# 工单系统 UI 自动化测试 — 一键运行脚本
# ──────────────────────────────────────────────────

set -euo pipefail
cd "$(dirname "$0")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

check_prereqs() {
  echo -e "${BLUE}[1/3] 检查环境...${NC}"
  if ! command -v node &>/dev/null; then
    echo -e "${RED}错误: 未找到 Node.js${NC}"; exit 1
  fi
  echo "  Node.js: $(node -v)"

  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  安装依赖...${NC}"
    npm install
    npx playwright install chromium --with-deps
  fi
  echo -e "${GREEN}  环境检查通过 ✓${NC}"
}

run_tests() {
  local mode="${1:-all}"
  echo -e "${BLUE}[2/3] 运行模式: ${mode}${NC}"

  case "$mode" in
    smoke)
      echo -e "${YELLOW}  冒烟测试 (创建→审批)...${NC}"
      npx playwright test tests/type_config_create.spec.ts tests/work_order_flow.spec.ts --project=chromium
      ;;
    all)
      echo -e "${YELLOW}  全量测试...${NC}"
      npx playwright test --project=chromium
      ;;
    report)
      echo -e "${YELLOW}  执行并打开报告...${NC}"
      npx playwright test --project=chromium
      npx playwright show-report reports/html
      ;;
    headed)
      echo -e "${YELLOW}  有头模式运行...${NC}"
      npx playwright test --headed --project=chromium
      ;;
    *)
      npx playwright test "$mode" --project=chromium
      ;;
  esac
}

show_report() {
  echo -e "${BLUE}[3/3] 报告...${NC}"
  echo -e "${GREEN}  HTML 报告: reports/html/index.html${NC}"
  echo -e "${GREEN}  JSON 结果: reports/results.json${NC}"
}

main() {
  MODE="${1:-smoke}"
  echo "================================================"
  echo "  工单系统 — UI 自动化测试 (TypeScript)"
  echo "================================================"

  check_prereqs
  run_tests "$MODE"
  show_report

  echo -e "${GREEN}完成 ✓${NC}"
}

main "$@"
