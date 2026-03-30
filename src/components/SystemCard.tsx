/**
 * SystemCard.tsx
 * 总览页系统卡片。
 * 展示单系统的名称、业务域、接入来源、健康度和四项黄金指标。
 */
import { Tag } from 'antd-mobile';
import type { SystemMonitor } from '../types/monitor';
import { formatMetricValue } from '../utils/format';
import { MiniTrendChart } from './MiniTrendChart';

interface SystemCardProps {
  system: SystemMonitor;
  index: number;
  onOpen: (systemId: string) => void;
}

// 来源标签统一映射为项目内共享的语义色，保证总览和详情视觉一致。
const sourceTagToneClassMap: Record<string, string> = {
  日志接入: 'tag-tone-log',
  Hades接入: 'tag-tone-hades',
  APM接入: 'tag-tone-apm',
  链路追踪: 'tag-tone-trace',
};

/**
 * 渲染总览页中的单个系统卡片。
 * @param system 当前系统数据。
 * @param index 当前卡片索引，用于做入场动画延迟。
 * @param onOpen 点击卡片后的系统打开回调。
 * @returns 单个系统卡片按钮。
 */
export function SystemCard({ system, index, onOpen }: SystemCardProps) {
  const metrics = Object.values(system.overviewMetrics);

  return (
    <button
      type="button"
      className="system-card"
      style={{ ['--delay' as string]: `${index}` }}
      onClick={() => onOpen(system.id)}
    >
      {/* 卡片头：负责系统身份信息与进入详情的视觉引导。 */}
      <div className="system-card__header">
        <div className="system-card__title">
          <h3>{system.name}</h3>
          <div className="system-card__subline">
            <div className="system-card__meta-main">
              <p className="system-card__eyebrow">{system.businessGroup}</p>
              <div className="system-card__tags">
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
        </div>
        <div className="system-card__score">
          <span className="system-card__entry">
            <span>点击进入</span>
            <span className="system-card__entry-arrow" aria-hidden="true">
              <span />
            </span>
          </span>
          <span className="system-card__score-main">
            <span className="system-card__score-label">健康</span>
            <strong>{system.healthScore}</strong>
          </span>
        </div>
      </div>

      {/* 指标区：四个黄金指标各自带一个微趋势图。 */}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <div key={metric.key} className="metric-panel">
            <div className="metric-panel__head">
              <span>{metric.label}</span>
              <strong>{formatMetricValue(metric.value, metric.unit, metric.precision)}</strong>
            </div>
            <MiniTrendChart values={metric.trend} average={metric.average} color={metric.color} />
          </div>
        ))}
      </div>
    </button>
  );
}
