# 银行系统移动端监控页面

一个基于 `React + TypeScript + Vite` 的纯前端移动监控工作台，用于模拟银行系统的总览、详情、告警与方法拆分分析场景。项目重点在于移动端信息密度、监控场景交互联动和后续可维护性。

## 1. 项目概览

当前项目已经完成以下核心能力：

- 中文界面与暗色运维风格
- 固定顶部导航、固定底部分栏、中间内容独立滚动
- 总览 / 详情 / 告警三分栏联动
- 未选择系统时的系统选择弹层
- 总览卡片四个黄金指标与迷你趋势图
- 详情页时间范围切换、趋势分析、指标总览
- 方法拆分页：多选筛选、单方法聚焦、统计表格、最大值/最小值时刻查看
- 告警列表：状态筛选、时间线式卡片、默认折叠 AI 分析

## 2. 技术栈

- `React 18`
- `TypeScript`
- `Vite`
- `Ant Design Mobile`
- `ECharts`

说明：

- UI 交互主要依赖 `antd-mobile` 的移动端组件能力。
- 图表统一走 `ECharts` 按需注册。
- 数据全部由前端模拟生成，便于后续直接替换为真实接口。

## 3. 启动方式

安装依赖：

```bash
npm install
```

本地开发：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 4. 目录结构

```text
src/
  App.tsx                     应用根组件，负责主状态与页面联动
  main.tsx                    应用入口
  components/
    OverviewTab.tsx           总览页
    DetailTab.tsx             详情页
    AlertsTab.tsx             告警页
    MethodSplitPopup.tsx      方法拆分页
    SystemPickerPopup.tsx     系统选择弹层
    SystemCard.tsx            总览系统卡片
    TrendChart.tsx            详情趋势图
    MiniTrendChart.tsx        卡片微趋势图
    BaseChart.tsx             ECharts 基础封装
    InlineSelectRow.tsx       行内标签切换器
    SearchableDropdown.tsx    可搜索下拉
    SystemSwitchIcon.tsx      自定义切换图标
  data/
    mockData.ts               模拟数据与数据生成逻辑
  types/
    monitor.ts                领域类型定义
  utils/
    format.ts                 展示格式化工具
    echarts.ts                ECharts 注册与导出
  styles/
    global.css                全局样式与主题变量
docs/
  需求分析.md                 需求拆解、架构说明与维护建议
```

## 5. 关键数据流

### 5.1 页面状态流

- `App.tsx` 持有主状态：
  - 当前分栏
  - 当前系统
  - 当前指标
  - 当前时间范围
  - 方法拆分页显示状态
- 子页面只消费必要状态，通过回调把交互结果回传给根组件。

### 5.2 数据生成流

- `mockData.ts` 维护系统模板、指标元信息与时间范围定义。
- 通过固定种子随机数生成趋势点，保证刷新后结构稳定、波形可信。
- 详情趋势图和方法拆分图均基于：
  - `系统 ID`
  - `指标 key`
  - `时间范围 key`
  实时派生，不依赖后端。

### 5.3 图表流

- `TrendChart.tsx` 负责详情页单指标趋势图。
- `MethodSplitPopup.tsx` 负责方法拆分页，图表与表格共用同一批方法序列。
- `BaseChart.tsx` 统一管理 ECharts 实例生命周期。

## 6. 代码维护约定

为方便后续维护，本轮整理后采用以下约定：

- 每个源码文件顶部都有文件职责说明。
- 所有具名函数都补充了功能与参数注释。
- 状态复杂的组件会按以下顺序分区：
  - state 区
  - 派生数据区
  - 事件处理区
  - JSX 渲染区
- 复杂 JSX 内部会用中文注释标识模块边界和数据流向。
- 格式化与数据构造逻辑统一下沉到 `utils` 与 `data` 层。

## 7. 依赖审查结果

当前 `package.json` 依赖已经较精简：

- `react / react-dom`：运行时必需
- `antd-mobile / antd-mobile-icons`：移动端 UI 必需
- `echarts`：趋势图与拆分图必需
- `vite / typescript / @types/* / @vitejs/plugin-react`：构建与类型支持必需

本次整理移除了未实际使用的 ECharts 组件注册和未使用的格式化工具函数，其余 npm 依赖未发现可安全卸载的冗余项。

## 8. 后续扩展建议

- 接入真实接口时，优先保留 `types/monitor.ts` 作为接口契约层。
- 可将 `mockData.ts` 拆成：
  - 系统模板
  - 趋势生成器
  - 告警生成器
  三个独立模块。
- 若后续页面继续增长，建议引入路由并将“方法拆分页”升级为独立 route。
- 如需支持真实监控数据轮询，建议在 `App.tsx` 外层增加数据获取层，而不是把请求直接写入组件。

## 9. 相关文档

- [需求分析文档](/Users/summer/Documents/codex/mobile_alarm_2/docs/需求分析.md)
- [应用根组件](/Users/summer/Documents/codex/mobile_alarm_2/src/App.tsx)
- [模拟数据源](/Users/summer/Documents/codex/mobile_alarm_2/src/data/mockData.ts)
