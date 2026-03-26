/**
 * monitor.ts
 * 页面核心领域类型定义。
 * 统一描述分栏、系统、指标、趋势、方法拆分和告警等数据结构，降低组件间耦合。
 */

export type TabKey = 'overview' | 'detail' | 'alerts';

export type MetricKey = 'throughput' | 'avgRt' | 'successRate' | 'accuracyRate';

export type TrendMetricKey = MetricKey | 'tps';

export type TimeRangeKey = '5m' | '15m' | '30m' | '1h' | '6h' | '24h' | '3d' | '7d' | '14d';

export type SourceTag = '日志接入' | 'Hades接入' | 'APM接入' | '链路追踪';

export type AlertLevel = '故障' | '警戒';

export type AlertStatus = '持续中' | '已解除';

/**
 * 单个趋势点。
 */
export interface TrendPoint {
  timestamp: number;
  value: number;
}

/**
 * 趋势图附带的统计摘要。
 */
export interface TrendStats {
  current: number;
  max: number;
  min: number;
  average: number;
  variance: number;
  stdDeviation: number;
  changeRate: number;
}

/**
 * 指标元信息。
 * TKey 用于约束指标键值，保证图表与指标卡共用一套定义。
 */
export interface MetricMeta<TKey extends string = TrendMetricKey> {
  key: TKey;
  label: string;
  unit: string;
  precision: number;
  color: string;
  polarity: 'higher-better' | 'lower-better';
}

/**
 * 总览页使用的系统级指标摘要。
 */
export interface SystemMetricSummary extends MetricMeta<MetricKey> {
  value: number;
  average: number;
  trend: number[];
}

/**
 * 详情页指标卡项。
 */
export interface DetailMetricItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  precision: number;
}

/**
 * 单个系统在页面中的完整监控模型。
 */
export interface SystemMonitor {
  id: string;
  name: string;
  businessGroup: string;
  healthScore: number;
  sources: SourceTag[];
  lastUpdated: string;
  methodNames: string[];
  overviewMetrics: Record<MetricKey, SystemMetricSummary>;
  detailMetrics: DetailMetricItem[];
}

/**
 * 时间范围选项。
 */
export interface TimeRangeOption {
  key: TimeRangeKey;
  label: string;
  points: number;
  stepMinutes: number;
}

/**
 * 详情趋势图所需的完整数据结构。
 */
export interface TrendDataset {
  key: TrendMetricKey;
  label: string;
  unit: string;
  precision: number;
  color: string;
  rangeLabel: string;
  average: number;
  points: TrendPoint[];
  stats: TrendStats;
}

/**
 * 方法拆分图中的单方法趋势序列。
 */
export interface MethodTrendSeries {
  name: string;
  color: string;
  variance: number;
  points: TrendPoint[];
}

/**
 * 方法拆分页的数据载荷。
 */
export interface MethodBreakdownResult {
  metricKey: TrendMetricKey;
  label: string;
  unit: string;
  precision: number;
  totalSeriesCount: number;
  defaultVisibleSeriesNames: string[];
  series: MethodTrendSeries[];
}

/**
 * AI 分析内容。
 */
export interface AlertAnalysis {
  diagnosis: string;
  rootCause: string;
  suggestion: string;
}

/**
 * 告警卡片记录。
 */
export interface AlertRecord {
  id: string;
  systemId: string;
  systemName: string;
  level: AlertLevel;
  status: AlertStatus;
  ruleName: string;
  content: string;
  time: number;
  analysis: AlertAnalysis;
}
