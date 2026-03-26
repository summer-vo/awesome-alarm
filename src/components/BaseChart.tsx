/**
 * BaseChart.tsx
 * ECharts 基础封装组件。
 * 负责创建图表实例、监听容器尺寸变化并在配置变化时刷新图表。
 */
import { useEffect, useRef } from 'react';
import { init, type EChartsOption, type EChartsType } from '../utils/echarts';

interface BaseChartProps {
  option: EChartsOption;
  height: number | string;
  className?: string;
}

/**
 * 通用图表容器。
 * @param option ECharts 配置对象。
 * @param height 图表高度。
 * @param className 额外样式类名。
 * @returns 统一的图表挂载节点。
 */
export function BaseChart({ option, height, className }: BaseChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    // 图表实例仅在容器挂载时初始化，避免重复创建。
    const chart = init(containerRef.current);
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    chartRef.current = chart;
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    chartRef.current.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} className={className} style={{ height, width: '100%' }} />;
}
