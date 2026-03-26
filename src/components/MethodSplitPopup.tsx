/**
 * MethodSplitPopup.tsx
 * 方法拆分页。
 * 负责在详情页趋势基础上继续下钻到方法级别，提供筛选、多选、聚焦和统计联动能力。
 */
import { Popover, SearchBar } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import { useEffect, useMemo, useState } from 'react';
import { buildMethodBreakdown } from '../data/mockData';
import type { SystemMonitor, TimeRangeKey, TrendMetricKey } from '../types/monitor';
import { formatChartTime, formatDateTime, formatNumber, getVarianceLabel } from '../utils/format';
import { type EChartsOption } from '../utils/echarts';
import { BaseChart } from './BaseChart';

interface MethodSplitPageProps {
  system: SystemMonitor;
  selectedMetric: TrendMetricKey;
  rangeKey: TimeRangeKey;
  onMetaChange: (meta: { title: string }) => void;
}

type StatSortKey = 'max' | 'min' | 'average' | 'variance';

/**
 * 渲染方法拆分页。
 * @param system 当前系统。
 * @param selectedMetric 当前指标类型。
 * @param rangeKey 当前时间范围。
 * @param onMetaChange 将当前系统和指标文案同步给顶部导航。
 * @returns 方法拆分页内容。
 */
export function MethodSplitPage({
  system,
  selectedMetric,
  rangeKey,
  onMetaChange,
}: MethodSplitPageProps) {
  // 页面状态区：关键字、筛选区展开态、可见方法、聚焦方法和统计聚焦点。
  const [keyword, setKeyword] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [visibleSeriesNames, setVisibleSeriesNames] = useState<string[]>([]);
  const [focusedSeriesName, setFocusedSeriesName] = useState<string | null>(null);
  const [focusedStat, setFocusedStat] = useState<{
    seriesName: string;
    type: 'max' | 'min';
    value: number;
    time: number;
  } | null>(null);
  const [statSort, setStatSort] = useState<{ key: StatSortKey; order: 'asc' | 'desc' }>({
    key: 'variance',
    order: 'desc',
  });

  const breakdown = useMemo(
    () => buildMethodBreakdown(system.id, selectedMetric, rangeKey),
    [system.id, selectedMetric, rangeKey],
  );

  // 切系统、切指标或切时间范围时，重置拆分页内部交互状态。
  useEffect(() => {
    setKeyword('');
    setFilterExpanded(false);
    setVisibleSeriesNames(breakdown.defaultVisibleSeriesNames);
    setFocusedSeriesName(null);
    setFocusedStat(null);
    setStatSort({
      key: 'variance',
      order: 'desc',
    });
  }, [system.id, breakdown.metricKey, breakdown.totalSeriesCount, breakdown.defaultVisibleSeriesNames, rangeKey]);

  useEffect(() => {
    onMetaChange({
      title: `${system.name} · ${breakdown.label}`,
    });
  }, [breakdown.label, onMetaChange, system.name]);

  useEffect(() => {
    if (keyword.trim()) {
      setFilterExpanded(true);
    }
  }, [keyword]);

  useEffect(() => {
    if (focusedSeriesName && !visibleSeriesNames.includes(focusedSeriesName)) {
      setFocusedSeriesName(null);
    }
  }, [focusedSeriesName, visibleSeriesNames]);

  // 派生数据区：同一份方法序列同时驱动筛选标签、趋势图和统计表。
  const filteredSeries = breakdown.series.filter((series) =>
    series.name.toLowerCase().includes(keyword.toLowerCase()),
  );
  const activeSeries = breakdown.series.filter((series) => visibleSeriesNames.includes(series.name));
  const focusedSeries = breakdown.series.find((series) => series.name === focusedSeriesName) ?? null;
  const chartSeries = focusedSeries ? [focusedSeries] : activeSeries;
  const chartBounds = useMemo(() => {
    const values = chartSeries.flatMap((series) => series.points.map((point) => point.value));

    if (values.length === 0) {
      return null;
    }

    return {
      max: Math.max(...values),
      min: Math.min(...values),
    };
  }, [chartSeries]);
  const seriesStats = useMemo(
    () =>
      breakdown.series.map((series) => {
        const values = series.points.map((point) => point.value);
        const maxPoint = series.points.reduce((current, point) => (point.value > current.value ? point : current));
        const minPoint = series.points.reduce((current, point) => (point.value < current.value ? point : current));
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;

        return {
          name: series.name,
          color: series.color,
          variance: series.variance,
          average,
          maxPoint,
          minPoint,
          active: visibleSeriesNames.includes(series.name),
        };
      }),
    [breakdown.series, visibleSeriesNames],
  );
  const categoryAxis =
    (chartSeries[0] ?? breakdown.series[0])?.points.map((point) => formatChartTime(point.timestamp, rangeKey)) ??
    [];
  const labelInterval = Math.max(0, Math.floor(categoryAxis.length / 4));
  const sortedSeriesStats = useMemo(() => {
    const getSortValue = (series: (typeof seriesStats)[number]) => {
      if (statSort.key === 'max') return series.maxPoint.value;
      if (statSort.key === 'min') return series.minPoint.value;
      if (statSort.key === 'average') return series.average;
      return series.variance;
    };

    const sorted = [...seriesStats].sort((left, right) => {
      const leftValue = getSortValue(left);
      const rightValue = getSortValue(right);
      return statSort.order === 'desc' ? rightValue - leftValue : leftValue - rightValue;
    });

    return sorted;
  }, [seriesStats, statSort]);

  /**
   * 切换方法是否参与当前多选集合。
   * @param name 方法名称。
   */
  function toggleSeries(name: string) {
    setVisibleSeriesNames((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name);
      }

      return [...current, name];
    });
    setFocusedSeriesName((current) => (current === name ? null : current));
  }

  /**
   * 聚焦单个方法趋势。
   * 若该方法尚未被选中，会先加入可见集合，再切换聚焦态。
   * @param name 方法名称。
   */
  function handleFocusSeries(name: string) {
    setVisibleSeriesNames((current) => (current.includes(name) ? current : [...current, name]));
    setFocusedSeriesName((current) => (current === name ? null : name));
  }

  function toggleStatSort(nextKey: StatSortKey) {
    setStatSort((current) => {
      if (current.key === nextKey) {
        return {
          key: nextKey,
          order: current.order === 'desc' ? 'asc' : 'desc',
        };
      }

      return {
        key: nextKey,
        order: 'desc',
      };
    });
  }

  // 图表配置区：聚焦单方法时只保留单条折线，否则展示当前多选集合。
  const option: EChartsOption = {
    animationDuration: 520,
    grid: {
      top: 18,
      left: 12,
      right: 44,
      bottom: 22,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(8, 15, 28, 0.96)',
      borderColor: 'rgba(102, 142, 197, 0.28)',
      textStyle: {
        color: '#eaf2ff',
      },
      position: (
        point: number[],
        _params: unknown,
        _dom: unknown,
        _rect: unknown,
        size: { contentSize: number[]; viewSize: number[] },
      ) => {
        const [pointX, pointY] = point;
        const [contentWidth, contentHeight] = size.contentSize;
        const [viewWidth, viewHeight] = size.viewSize;
        const left = Math.min(Math.max(8, pointX + 12), viewWidth - contentWidth - 8);
        const top = Math.min(Math.max(8, pointY - contentHeight - 12), viewHeight - contentHeight - 8);
        return [left, top];
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categoryAxis,
      axisLabel: {
        color: '#7f95bd',
        interval: labelInterval,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(106, 135, 178, 0.26)',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        color: '#7f95bd',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(88, 116, 156, 0.16)',
          type: 'dashed',
        },
      },
    },
    series: chartSeries.map((series, index) => ({
      type: 'line',
      name: series.name,
      data: series.points.map((point) => point.value),
      smooth: 0.24,
      showSymbol: false,
      symbol: 'none',
      lineStyle: {
        width: 1.5,
        color: series.color,
      },
      markLine:
        index === 0 && chartBounds
          ? {
              symbol: 'none',
              silent: true,
              label: {
                show: true,
                color: '#8ea6cf',
                fontSize: 9,
                formatter: ({ name }: { name?: string }) => name ?? '',
              },
              data: [
                {
                  name: '最大值',
                  yAxis: chartBounds.max,
                  lineStyle: {
                    color: 'rgba(255, 149, 107, 0.72)',
                    type: 'dashed',
                    width: 1,
                  },
                },
                {
                  name: '最小值',
                  yAxis: chartBounds.min,
                  lineStyle: {
                    color: 'rgba(79, 209, 139, 0.68)',
                    type: 'dashed',
                    width: 1,
                  },
                },
              ],
            }
          : undefined,
    })),
  };

  return (
    <section className="tab-panel split-page">
      {/* 筛选区：先做搜索，再决定方法集合。 */}
      <div className="split-sheet__filter">
        <div className="split-sheet__filter-top">
          <SearchBar
            value={keyword}
            placeholder="输入方法名称筛选"
            onChange={setKeyword}
            className="monitor-search monitor-search--compact split-sheet__search"
          />
          <button
            type="button"
            className={`split-sheet__toggle ${filterExpanded ? 'is-active' : ''}`}
            onClick={() => setFilterExpanded((current) => !current)}
            aria-label={filterExpanded ? '收起筛选器' : '展开筛选器'}
          >
            <FilterOutline />
          </button>
        </div>

        {filterExpanded ? (
          <>
            {/* 已选状态与批量操作。 */}
            <div className="split-sheet__actions-row">
              <div className="split-sheet__selection-note-wrap">
                <span className="split-sheet__selection-note">已选 {activeSeries.length} 项</span>
                <Popover
                  mode="dark"
                  trigger="click"
                  placement="top-start"
                  content={<span className="split-sheet__popover-content">默认展示方差由大到小前五项</span>}
                >
                  <button type="button" className="split-sheet__help" aria-label="查看已选项说明">
                    ?
                  </button>
                </Popover>
              </div>
              <div className="split-sheet__action-group">
                <button
                  type="button"
                  className="split-sheet__action-btn"
                  onClick={() => setVisibleSeriesNames(breakdown.series.map((series) => series.name))}
                >
                  全选
                </button>
                <button
                  type="button"
                  className="split-sheet__action-btn split-sheet__action-btn--primary"
                  onClick={() => setVisibleSeriesNames(breakdown.defaultVisibleSeriesNames)}
                >
                  默认
                </button>
                <button
                  type="button"
                  className="split-sheet__action-btn"
                  onClick={() => setVisibleSeriesNames([])}
                >
                  清空
                </button>
              </div>
            </div>

            {/* 方法标签区：多选集合与下方趋势图、统计表共用同一份 visibleSeriesNames。 */}
            <div className="split-sheet__filter-grid">
              {filteredSeries.map((series) => {
                const active = visibleSeriesNames.includes(series.name);

                return (
                  <button
                    type="button"
                    key={series.name}
                    className={`split-sheet__filter-pill ${active ? 'is-active' : ''} ${
                      focusedSeriesName === series.name ? 'is-focused' : ''
                    }`}
                    onClick={() => toggleSeries(series.name)}
                  >
                    <span className="split-sheet__dimension-dot" style={{ background: series.color }} />
                    <span className="split-sheet__filter-name">{series.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* 图表与表格工作区：上图下表，聚焦方法会同步高亮两侧。 */}
      <div className="split-sheet__chart-card panel-block">
        <div className="split-sheet__chart-head">
          <span className="split-sheet__chart-badge">
            {focusedSeries ? `${focusedSeries.name}` : `当前 ${activeSeries.length} 条`}
          </span>
        </div>

        <div className="split-sheet__chart">
          {chartSeries.length > 0 ? (
            <BaseChart option={option} height={286} />
          ) : (
            <div className="chart-empty">请至少选择一个方法系列</div>
          )}
        </div>

        <div className="split-sheet__table-wrap">
          <div className="split-sheet__table-head">
            <div className="split-sheet__table-title-wrap">
              <span>方法统计</span>
              <Popover
                mode="dark"
                trigger="click"
                placement="top-start"
                content={<span className="split-sheet__popover-content">默认按照方差由大到小排序</span>}
              >
                <button type="button" className="split-sheet__help" aria-label="查看方法统计说明">
                  ?
                </button>
              </Popover>
            </div>
            {focusedStat ? (
              <span className="split-sheet__table-note">
                {focusedStat.seriesName} {focusedStat.type === 'max' ? '最大值' : '最小值'} {formatNumber(focusedStat.value, breakdown.precision)}
                ，时刻 {formatDateTime(focusedStat.time)}
              </span>
            ) : focusedSeries ? (
              <span className="split-sheet__table-note">
                已聚焦 {focusedSeries.name} 趋势，点击方法名可切换
              </span>
            ) : (
              <span className="split-sheet__table-note">点击最大值或最小值查看对应时刻</span>
            )}
          </div>

          <div className="split-sheet__table-scroll">
            <table className="split-sheet__table">
              <colgroup>
                <col className="split-sheet__col--method" />
                <col className="split-sheet__col--value" />
                <col className="split-sheet__col--value" />
                <col className="split-sheet__col--value" />
                <col className="split-sheet__col--value" />
              </colgroup>
              <thead>
                <tr>
                  <th>方法</th>
                  <th>
                    <button
                      type="button"
                      className={`split-sheet__sort-btn ${statSort.key === 'max' ? 'is-active' : ''}`}
                      onClick={() => toggleStatSort('max')}
                    >
                      最大值
                      <span>{statSort.key === 'max' ? (statSort.order === 'desc' ? '↓' : '↑') : '↕'}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className={`split-sheet__sort-btn ${statSort.key === 'min' ? 'is-active' : ''}`}
                      onClick={() => toggleStatSort('min')}
                    >
                      最小值
                      <span>{statSort.key === 'min' ? (statSort.order === 'desc' ? '↓' : '↑') : '↕'}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className={`split-sheet__sort-btn ${statSort.key === 'average' ? 'is-active' : ''}`}
                      onClick={() => toggleStatSort('average')}
                    >
                      均值
                      <span>{statSort.key === 'average' ? (statSort.order === 'desc' ? '↓' : '↑') : '↕'}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className={`split-sheet__sort-btn ${statSort.key === 'variance' ? 'is-active' : ''}`}
                      onClick={() => toggleStatSort('variance')}
                    >
                      方差
                      <span>{statSort.key === 'variance' ? (statSort.order === 'desc' ? '↓' : '↑') : '↕'}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSeriesStats.map((series) => (
                  <tr
                    key={series.name}
                    className={`${series.active ? 'is-active' : ''} ${
                      focusedSeriesName === series.name ? 'is-focused' : ''
                    }`.trim()}
                  >
                    <td className="split-sheet__method-cell">
                      <button
                        type="button"
                        className={`split-sheet__method-trigger ${focusedSeriesName === series.name ? 'is-focused' : ''}`}
                        onClick={() => handleFocusSeries(series.name)}
                      >
                        <span className="split-sheet__method-dot" style={{ background: series.color }} />
                        <span>{series.name}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`split-sheet__table-trigger ${
                          focusedStat?.seriesName === series.name && focusedStat.type === 'max' ? 'is-focused' : ''
                        }`}
                        onClick={() =>
                          setFocusedStat({
                            seriesName: series.name,
                            type: 'max',
                            value: series.maxPoint.value,
                            time: series.maxPoint.timestamp,
                          })
                        }
                      >
                        {formatNumber(series.maxPoint.value, breakdown.precision)}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`split-sheet__table-trigger ${
                          focusedStat?.seriesName === series.name && focusedStat.type === 'min' ? 'is-focused' : ''
                        }`}
                        onClick={() =>
                          setFocusedStat({
                            seriesName: series.name,
                            type: 'min',
                            value: series.minPoint.value,
                            time: series.minPoint.timestamp,
                          })
                        }
                      >
                        {formatNumber(series.minPoint.value, breakdown.precision)}
                      </button>
                    </td>
                    <td>{formatNumber(series.average, breakdown.precision)}</td>
                    <td>{getVarianceLabel(series.variance, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
