/**
 * TrendChart.tsx
 * 详情页趋势图组件。
 * 负责渲染单指标趋势、均值参考线和 tooltip 信息，是详情页趋势分析的核心可视化组件。
 */
import { formatChartTime } from '../utils/format';
import { graphic, type EChartsOption } from '../utils/echarts';
import type { TimeRangeKey, TrendDataset } from '../types/monitor';
import { BaseChart } from './BaseChart';

interface TrendChartProps {
  dataset: TrendDataset;
  rangeKey: TimeRangeKey;
  height?: number;
}

/**
 * 渲染详情页单指标趋势图。
 * @param dataset 当前指标对应的趋势数据集。
 * @param rangeKey 当前时间范围。
 * @param height 图表高度。
 * @returns 趋势图组件。
 */
export function TrendChart({ dataset, rangeKey, height = 280 }: TrendChartProps) {
  const labels = dataset.points.map((point) => formatChartTime(point.timestamp, rangeKey));
  const values = dataset.points.map((point) => point.value);
  const labelInterval = Math.max(0, Math.floor(labels.length / 4));

  // 图表配置统一在组件内部完成组装，便于趋势分析模块单独维护。
  const option: EChartsOption = {
    animationDuration: 500,
    grid: {
      top: 40,
      left: 12,
      right: 18,
      bottom: 28,
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
      /**
       * 生成 tooltip 内容。
       * @param params ECharts 传入的序列信息。
       * @returns tooltip HTML 字符串。
       */
      formatter: (params: unknown) => {
        const tooltipItems = Array.isArray(params)
          ? (params as Array<{ dataIndex: number; value: number }>)
          : ([params] as Array<{ dataIndex: number; value: number }>);
        const firstItem = tooltipItems[0];
        const dataIndex = firstItem.dataIndex;
        const point = dataset.points[dataIndex];
        const value = firstItem.value as number;

        return [
          `<div class="echart-tooltip__title">${formatChartTime(point.timestamp, rangeKey)}</div>`,
          `<div>${dataset.label}：${value.toFixed(dataset.precision)} ${dataset.unit}</div>`,
          `<div>均值：${dataset.average.toFixed(dataset.precision)} ${dataset.unit}</div>`,
        ].join('');
      },
      /**
       * 约束 tooltip 位置，避免超出可视区域。
       * @param point 当前悬浮点坐标。
       * @param _params ECharts 传入的序列信息。
       * @param _dom tooltip DOM。
       * @param _rect 当前图形区域。
       * @param size tooltip 与视口尺寸。
       * @returns 经过约束后的 tooltip 坐标。
       */
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: { contentSize: number[]; viewSize: number[] }) => {
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
      data: labels,
      axisLine: {
        lineStyle: {
          color: 'rgba(106, 135, 178, 0.26)',
        },
      },
      axisLabel: {
        color: '#7f95bd',
        interval: labelInterval,
        fontSize: 11,
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
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(88, 116, 156, 0.16)',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'line',
        smooth: 0.28,
        symbol: 'none',
        data: values,
        lineStyle: {
          width: 2,
          color: dataset.color,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${dataset.color}4d` },
            { offset: 1, color: `${dataset.color}05` },
          ]),
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(208, 223, 246, 0.6)',
          },
          label: {
            show: false,
          },
          data: [{ yAxis: dataset.average }],
        },
      },
    ],
  };

  return <BaseChart option={option} height={height} className="trend-chart" />;
}
