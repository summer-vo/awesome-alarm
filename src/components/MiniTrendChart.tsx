/**
 * MiniTrendChart.tsx
 * 总览卡片内使用的微趋势图。
 * 通过 SVG 渲染轻量级折线与面积图，避免为小图引入额外图表实例成本。
 */
import { useId } from 'react';

interface MiniTrendChartProps {
  values: number[];
  average: number;
  color: string;
}

/**
 * 渲染单个指标的微趋势图。
 * @param values 趋势数值序列。
 * @param average 指标均值，用于绘制均值虚线。
 * @param color 当前指标主色。
 * @returns 用于卡片内展示的 SVG 趋势图。
 */
export function MiniTrendChart({ values, average, color }: MiniTrendChartProps) {
  const gradientId = useId();
  const width = 100;
  const height = 58;
  const padding = 6;
  const rawMin = Math.min(...values, average);
  const rawMax = Math.max(...values, average);
  const rawRange = rawMax - rawMin;
  const fallbackPadding = Math.max(Math.abs(average) * 0.0008, 0.02);
  const visualPadding = rawRange === 0 ? fallbackPadding : Math.max(rawRange * 0.18, fallbackPadding);
  const visualMin = rawMin - visualPadding;
  const visualMax = rawMax + visualPadding;
  const range = Math.max(visualMax - visualMin, 0.01);

  // 将原始数值映射到 SVG 坐标空间，保证四类指标在小尺寸下都可读。
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = padding + (1 - (value - visualMin) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - padding).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;
  const averageY = padding + (1 - (average - visualMin) / range) * (height - padding * 2);

  return (
    <svg className="mini-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={`${color}66`} />
          <stop offset="100%" stopColor={`${color}08`} />
        </linearGradient>
      </defs>

      <line
        x1="0"
        x2={width}
        y1={averageY}
        y2={averageY}
        stroke="rgba(183, 204, 238, 0.55)"
        strokeDasharray="4 4"
      />
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
