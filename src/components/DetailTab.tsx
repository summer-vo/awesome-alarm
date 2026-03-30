/**
 * DetailTab.tsx
 * 系统详情页。
 * 负责串联当前系统的时间范围、指标总览、趋势分析和方法拆分页入口。
 */
import { Button, Popover, Tag } from 'antd-mobile';
import { AppstoreOutline, BellOutline, HistogramOutline, QuestionCircleOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';
import {
  buildMetricTrend,
  detailTrendMetricKeys,
  metricMetaMap,
  timeRangeOptions,
} from '../data/mockData';
import type { SystemMonitor, TimeRangeKey, TrendMetricKey } from '../types/monitor';
import { formatMetricValue, getChangeTone, getVarianceLabel } from '../utils/format';
import { InlineSelectRow } from './InlineSelectRow';
import { SystemSwitchIcon } from './SystemSwitchIcon';
import { TrendChart } from './TrendChart';

interface DetailTabProps {
  system?: SystemMonitor;
  selectedMetric: TrendMetricKey;
  selectedRange: TimeRangeKey;
  onMetricChange: (metric: TrendMetricKey) => void;
  onRangeChange: (range: TimeRangeKey) => void;
  onOpenAlerts: (systemId: string) => void;
  onChangeSystem: () => void;
  onOpenSplit: () => void;
}

const percentileHelpTextMap: Record<string, string> = {
  p50: '50%请求响应时间不超过该值',
  p90: '90%请求响应时间不超过该值',
  p99: '99%请求响应时间不超过该值',
};

// 接入来源统一映射到共享的标签色，避免总览、详情和系统选择层视觉漂移。
const sourceTagToneClassMap: Record<string, string> = {
  日志接入: 'tag-tone-log',
  Hades接入: 'tag-tone-hades',
  APM接入: 'tag-tone-apm',
  链路追踪: 'tag-tone-trace',
};

/**
 * 渲染系统详情分栏。
 * @param system 当前选中的系统。
 * @param selectedMetric 当前趋势指标。
 * @param selectedRange 当前时间范围。
 * @param onMetricChange 趋势指标切换回调。
 * @param onRangeChange 时间范围切换回调。
 * @param onOpenAlerts 进入告警页回调。
 * @param onChangeSystem 打开系统选择弹层回调。
 * @param onOpenSplit 打开方法拆分页回调。
 * @returns 详情页内容。
 */
export function DetailTab({
  system,
  selectedMetric,
  selectedRange,
  onMetricChange,
  onRangeChange,
  onOpenAlerts,
  onChangeSystem,
  onOpenSplit,
}: DetailTabProps) {
  // 本页仅维护指标总览的展开态，其余关键状态由根组件统一管理。
  const [metricsExpanded, setMetricsExpanded] = useState(false);
  const [multiTrendView, setMultiTrendView] = useState(false);

  // 切换系统后收起扩展指标，避免沿用上一个系统的展开状态。
  useEffect(() => {
    setMetricsExpanded(false);
    setMultiTrendView(false);
  }, [system?.id]);

  if (!system) {
    return (
      <section className="tab-panel">
        <div className="panel-block empty-selection">
          <p>系统详情需要先选定一个系统。</p>
          <Button color="primary" onClick={onChangeSystem}>
            选择系统
          </Button>
        </div>
      </section>
    );
  }

  // 派生数据区：详情图表与统计摘要都基于当前系统、指标和时间范围实时生成。
  const allTrendDatasets = detailTrendMetricKeys.map((key) => buildMetricTrend(system.id, key, selectedRange));
  const trendDataset = allTrendDatasets.find((dataset) => dataset.key === selectedMetric) ?? allTrendDatasets[0];
  const metricOptions = detailTrendMetricKeys.map((key) => metricMetaMap[key]);
  const primaryMetricKeys: TrendMetricKey[] = ['throughput', 'avgRt', 'successRate', 'accuracyRate', 'tps'];
  const primaryRangeKeys: TimeRangeKey[] = ['5m', '15m', '30m', '1h', '24h'];
  const changeTone = getChangeTone(trendDataset.stats.changeRate);
  const primaryMetric = system.detailMetrics.find((metric) => metric.key === 'throughput');
  const secondaryMetrics = system.detailMetrics.filter((metric) => metric.key !== 'throughput');
  const featuredMetricKeys = ['avgRt', 'p99', 'successRate', 'accuracyRate'];
  const featuredMetrics = featuredMetricKeys
    .map((key) => secondaryMetrics.find((metric) => metric.key === key))
    .filter((metric): metric is NonNullable<typeof secondaryMetrics[number]> => Boolean(metric));
  const foldedMetrics = secondaryMetrics.filter((metric) => !featuredMetricKeys.includes(metric.key));
  const trendStats = [
    { label: '当前值', value: formatMetricValue(trendDataset.stats.current, trendDataset.unit, trendDataset.precision) },
    { label: '最大值', value: formatMetricValue(trendDataset.stats.max, trendDataset.unit, trendDataset.precision) },
    { label: '最小值', value: formatMetricValue(trendDataset.stats.min, trendDataset.unit, trendDataset.precision) },
    { label: '均值', value: formatMetricValue(trendDataset.stats.average, trendDataset.unit, trendDataset.precision) },
    { label: '方差', value: getVarianceLabel(trendDataset.stats.variance, 2) },
    { label: '标准差', value: getVarianceLabel(trendDataset.stats.stdDeviation, 2) },
  ];

  /**
   * 在多图模式下直接从当前指标打开方法拆分页。
   * @param metricKey 需要切换并下钻的趋势指标。
   */
  function handleOpenSplitFromTrend(metricKey: TrendMetricKey) {
    onMetricChange(metricKey);
    onOpenSplit();
  }

  /**
   * 统一渲染指标总览卡片，并为百分位指标挂载说明气泡。
   * @param metric 当前指标项。
   * @param folded 当前卡片是否属于折叠区。
   * @returns 单个指标卡片节点。
   */
  const renderMetricCard = (metric: (typeof system.detailMetrics)[number], folded = false) => {
    const percentileHelpText = percentileHelpTextMap[metric.key];
    const cardContent = (
      <div className={`detail-metric-card ${folded ? 'detail-metric-card--folded' : ''}`}>
        <div className="detail-metric-card__label-row">
          {percentileHelpText ? (
            <span className="detail-metric-card__label-help-trigger" aria-label={`查看${metric.label}说明`}>
              <span className="detail-metric-card__label-underlined">{metric.label}</span>
              <QuestionCircleOutline className="detail-metric-card__help-icon" />
            </span>
          ) : (
            <span>{metric.label}</span>
          )}
        </div>
        <strong>{formatMetricValue(metric.value, metric.unit, metric.precision)}</strong>
      </div>
    );

    if (!percentileHelpText) {
      return <div key={metric.key}>{cardContent}</div>;
    }

    return (
      <Popover
        key={metric.key}
        mode="dark"
        trigger="click"
        placement="top"
        content={<span className="detail-metric-card__popover-content">{percentileHelpText}</span>}
      >
        <div className="detail-metric-card__popover-trigger">{cardContent}</div>
      </Popover>
    );
  };

  return (
    <>
      <section className="tab-panel detail-panel">
        {/* 顶部系统卡：展示系统身份信息、健康度与时间范围选择。 */}
        <div className="panel-block system-hero">
          <div className="section-heading">
            <div className="detail-hero__title-wrap">
              <div className="detail-hero__title-row">
                <h2>{system.name}</h2>
              </div>
              <div className="detail-hero__meta-row">
                <span className="detail-hero__business">{system.businessGroup}</span>
                <div className="detail-hero__tags">
                  {system.sources.map((source) => (
                    <Tag
                      key={source}
                      fill="outline"
                      color="primary"
                      className={sourceTagToneClassMap[source] ?? ''}
                    >
                      {source}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
            <div className="detail-hero__side">
              <div className="detail-hero__score">
                <span>健康</span>
                <strong>{system.healthScore}</strong>
              </div>
              <div className="hero-actions">
                <button
                  type="button"
                  className="icon-button icon-button--stacked"
                  aria-label="查看告警列表"
                  onClick={() => onOpenAlerts(system.id)}
                >
                  <BellOutline />
                  <span className="icon-button__label">告警</span>
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--stacked"
                  aria-label="切换系统"
                  onClick={onChangeSystem}
                >
                  <SystemSwitchIcon />
                  <span className="icon-button__label">系统</span>
                </button>
              </div>
            </div>
          </div>

          <div className="detail-hero__range">
            <InlineSelectRow
              options={timeRangeOptions.map((range) => ({
                key: range.key,
                label: range.label,
              }))}
              activeKey={selectedRange}
              primaryKeys={primaryRangeKeys}
              onChange={onRangeChange}
              variant="range"
            />
          </div>
        </div>

        {/* 指标总览区：先展示重点指标，剩余指标通过展开动作补充。 */}
        <div className="panel-block">
          <div className="subsection-heading">
            <h3>指标总览</h3>
            {foldedMetrics.length > 0 ? (
              <button
                type="button"
                className={`detail-metric-toggle ${metricsExpanded ? 'is-open' : ''}`}
                onClick={() => setMetricsExpanded((current) => !current)}
              >
                {metricsExpanded ? '收起' : '展开更多'}
              </button>
            ) : null}
          </div>

          {primaryMetric ? (
            <div className="detail-primary-metric">
              <span className="detail-primary-metric__label">{primaryMetric.label}</span>
              <strong>{formatMetricValue(primaryMetric.value, primaryMetric.unit, primaryMetric.precision)}</strong>
            </div>
          ) : null}

          <div className="detail-metric-grid detail-metric-grid--compact">
            {featuredMetrics.map((metric) => renderMetricCard(metric))}
          </div>

          {foldedMetrics.length > 0 && metricsExpanded ? (
            <div className="detail-metric-grid detail-metric-grid--compact detail-metric-grid--folded">
              {foldedMetrics.map((metric) => renderMetricCard(metric, true))}
            </div>
          ) : null}
        </div>

        {/* 趋势分析区：切换指标后驱动趋势图、变化率和统计摘要联动更新。 */}
        <div className="panel-block trend-panel">
          <div className="subsection-heading">
            <h3>趋势分析</h3>
            <div className="trend-panel__actions">
              {!multiTrendView ? (
                <button
                  type="button"
                  className="icon-button icon-button--stacked"
                  aria-label="查看方法拆分图"
                  onClick={onOpenSplit}
                >
                  <HistogramOutline />
                  <span className="icon-button__label">拆分图</span>
                </button>
              ) : null}
              <button
                type="button"
                className={`icon-button icon-button--stacked ${multiTrendView ? 'is-active' : ''}`}
                aria-label={multiTrendView ? '退出多图查看' : '同时查看五项趋势'}
                onClick={() => setMultiTrendView((current) => !current)}
              >
                <AppstoreOutline />
                <span className="icon-button__label">总览</span>
              </button>
            </div>
          </div>

          {!multiTrendView ? (
            <>
              <InlineSelectRow
                options={metricOptions.map((metric) => ({
                  key: metric.key,
                  label: metric.label,
                }))}
                activeKey={selectedMetric}
                primaryKeys={primaryMetricKeys}
                onChange={onMetricChange}
                variant="metric"
              />

              <div className="trend-summary">
                <div>
                  <span>当前时刻</span>
                  <strong>{formatMetricValue(trendDataset.stats.current, trendDataset.unit, trendDataset.precision)}</strong>
                </div>
                <span className={`trend-summary__change trend-summary__change--${changeTone}`}>
                  变化率 {trendDataset.stats.changeRate > 0 ? '+' : ''}
                  {trendDataset.stats.changeRate.toFixed(2)}%
                </span>
              </div>

              <TrendChart dataset={trendDataset} rangeKey={selectedRange} height={260} />

              {/* 趋势统计区：与上方趋势图共享同一批数据源。 */}
              <div className="trend-insight">
                <div className="trend-insight__head">
                  <span>趋势数据分析</span>
                </div>

                <div className="detail-stats-grid detail-stats-grid--compact">
                  {trendStats.map((item) => (
                    <div key={item.label} className="stats-card">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="multi-trend-grid">
              {allTrendDatasets.map((dataset) => {
                return (
                  <section key={dataset.key} className="multi-trend-card">
                    <div className="multi-trend-card__head">
                      <span className="multi-trend-card__label">{dataset.label}</span>
                      <button
                        type="button"
                        className="icon-button multi-trend-card__split-button"
                        aria-label={`查看${dataset.label}方法拆分图`}
                        onClick={() => handleOpenSplitFromTrend(dataset.key)}
                      >
                        <HistogramOutline />
                      </button>
                    </div>
                    <TrendChart dataset={dataset} rangeKey={selectedRange} height={110} compact />
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
