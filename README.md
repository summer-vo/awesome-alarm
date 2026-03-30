# 告警监控

一个基于 `React 18 + TypeScript + Vite` 的移动端监控前端项目，聚焦“系统总览、趋势分析、方法拆分、告警处理”四类核心场景。项目当前使用前端模拟数据驱动，便于在没有后端依赖的情况下完成交互验证、样式迭代和演示交付。

## 项目定位

适用场景：

- 移动端监控工作台原型
- 银行或中后台系统监控大屏的移动收敛版
- 告警与趋势分析类前端方案演示

当前目标：

- 在手机屏幕内承载高信息密度监控内容
- 保持暗色监控主题下的可读性和触达效率
- 用统一的数据模型串联总览、详情、告警和方法拆分
- 保证项目结构、注释和文档可持续维护

## 当前功能

### 1. 系统总览

- 系统列表展示
- 系统筛选下拉与搜索
- 系统健康度展示
- 四项核心指标与迷你趋势图
- 接入来源标签与系统总数徽标

### 2. 系统详情

- 时间范围切换
- 指标维度切换
- 指标总览折叠/展开
- `P50 / P90 / P99` 说明提示
- 单图趋势分析
- 多图趋势查看模式
- 趋势统计摘要
- 进入方法拆分页与告警页入口

### 3. 方法拆分页

- 方法名称搜索
- 方法多选筛选
- `全选 / 默认 / 清空` 批量操作
- 默认按方差展示前 5 项
- 多方法趋势对比
- 最大值/最小值参考线
- 方法统计表
- `最大值 / 最小值 / 均值 / 方差` 点击排序
- 说明提示与聚焦联动

### 4. 告警列表

- 按状态和级别筛选
- 时间线式告警卡片
- AI 分析展开/收起
- 切换系统时自动重置局部筛选状态

## 技术栈

- `React 18`
- `TypeScript`
- `Vite 5`
- `antd-mobile`
- `antd-mobile-icons`
- `ECharts 5`

说明：

- 组件交互层主要依赖 `antd-mobile`。
- 图表统一由 `ECharts` 渲染，并通过基础封装复用生命周期。
- 数据由 `src/data/mockData.ts` 统一生成，便于后续替换为真实接口。

## 快速开始

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

手机同网预览：

```bash
npm run dev -- --host
```

构建生产版本：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

默认开发端口：`5173`

## 项目结构

```text
src/
  App.tsx                     应用根组件，统一管理主状态和页面联动
  main.tsx                    应用入口
  components/
    OverviewTab.tsx           总览页
    DetailTab.tsx             详情页
    AlertsTab.tsx             告警页
    MethodSplitPopup.tsx      方法拆分页
    SystemCard.tsx            系统卡片
    SystemPickerPopup.tsx     系统选择弹层
    TrendChart.tsx            详情趋势图
    MiniTrendChart.tsx        总览卡片微趋势图
    BaseChart.tsx             ECharts 基础封装
    InlineSelectRow.tsx       行内切换器
    SearchableDropdown.tsx    可搜索下拉
    SystemSwitchIcon.tsx      系统切换图标
  data/
    mockData.ts               模拟数据中心
  styles/
    global.css                全局样式、主题变量与页面样式
  types/
    monitor.ts                领域类型定义
  utils/
    echarts.ts                ECharts 注册与导出
    format.ts                 展示格式化工具
docs/
  需求分析.md                 产品范围、交互规则、维护建议
```

## 核心架构

### 1. 状态集中在根组件

`App.tsx` 统一维护：

- 当前分栏 `activeTab`
- 当前系统 `selectedSystemId`
- 当前指标 `selectedMetric`
- 当前时间范围 `selectedRange`
- 系统选择弹层状态
- 方法拆分页状态

这样做的好处：

- 总览、详情、告警共享同一份系统上下文
- 趋势图与方法拆分页天然保持同源
- 页面切换时更容易做状态重置和滚动恢复

### 2. 数据层完全可替换

`src/data/mockData.ts` 负责：

- 系统模板定义
- 指标元信息定义
- 时间范围定义
- 趋势数据生成
- 方法拆分数据生成
- 告警数据生成

后续若要接入真实接口，优先保留 `src/types/monitor.ts` 作为契约层，再将 `mockData.ts` 替换为服务层即可。

### 3. 图表统一封装

- `BaseChart.tsx` 负责 ECharts 实例创建、销毁和 resize
- `TrendChart.tsx` 负责详情趋势图配置
- `MethodSplitPopup.tsx` 内部负责方法拆分图表与表格联动

## 样式维护约定

`src/styles/global.css` 目前按以下层次维护：

1. 主题变量与全局基础
2. 应用骨架与通用面板
3. 页面级模块样式
4. 当前生效主题收口区
5. 动效与补充覆盖

本轮整理后的约定：

- 保留当前生效主题，不再继续堆叠失效配色规则
- 视觉状态优先通过语义类名表达，如 `is-active`、`is-selected`、`is-focused`
- 避免在组件内继续写大段内联样式，优先回收到 `global.css`
- 新增样式优先使用现有颜色变量、边框透明度和间距节奏

## 注释与维护约定

项目内采用以下注释规则：

- 每个源码文件顶部都有文件职责说明
- 关键组件导出函数带用途和参数注释
- 状态复杂组件按“状态区 / 派生数据区 / 事件处理区 / 渲染区”组织
- JSX 内只对模块边界和联动逻辑做必要注释，不堆叠无效注释

建议继续保持：

- 复杂数据加工放在 `data` 或 `utils`
- 组件只负责消费数据和表达交互
- 样式主题统一收敛到 `global.css`

## 开发检查项

提交前至少执行：

```bash
npm run build
```

当前项目未引入额外 lint/test 脚本，因此 `build` 是最直接的类型与打包回归检查。

## 后续建议

1. 抽离接入来源标签颜色映射，避免在多个组件重复维护。
2. 若告警和趋势逻辑继续扩展，可引入路由将方法拆分页升级为独立页面。
3. 若接真实接口，建议把 mock 数据层替换为服务层，并保留当前类型定义。
4. 若页面继续增长，可将 `global.css` 拆分为 `theme / layout / pages` 多文件结构。

## 相关文档

- [需求分析文档](./docs/需求分析.md)
- [应用根组件](./src/App.tsx)
- [模拟数据中心](./src/data/mockData.ts)
