/**
 * AlertsTab.tsx
 * 系统告警页。
 * 负责单系统告警筛选、时间线展示和 AI 分析展开/收起。
 */
import { Button, Empty } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';
import type { AlertRecord, SystemMonitor } from '../types/monitor';
import { formatDateTime } from '../utils/format';
import { SystemSwitchIcon } from './SystemSwitchIcon';

interface AlertsTabProps {
  system?: SystemMonitor;
  alerts: AlertRecord[];
  onChangeSystem: () => void;
}

type AlertFilterKey = 'all' | 'ongoing' | 'resolved' | 'warning' | 'fault';

/**
 * 渲染告警分栏。
 * @param system 当前选中的系统。
 * @param alerts 全量告警列表。
 * @param onChangeSystem 切换系统回调。
 * @returns 告警列表页内容。
 */
export function AlertsTab({ system, alerts, onChangeSystem }: AlertsTabProps) {
  // 页面内部状态只负责筛选条件和 AI 分析展开态。
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<AlertFilterKey>('all');

  if (!system) {
    return (
      <section className="tab-panel">
        <div className="panel-block empty-selection">
          <p>告警列表需要先选定一个系统。</p>
          <Button color="primary" onClick={onChangeSystem}>
            选择系统
          </Button>
        </div>
      </section>
    );
  }

  const currentAlerts = alerts.filter((alert) => alert.systemId === system.id);
  const ongoingCount = currentAlerts.filter((alert) => alert.status === '持续中').length;
  const recoveredCount = currentAlerts.length - ongoingCount;
  const faultCount = currentAlerts.filter((alert) => alert.level === '故障').length;
  const warningCount = currentAlerts.length - faultCount;
  const filteredAlerts = currentAlerts.filter((alert) => {
    switch (activeFilter) {
      case 'ongoing':
        return alert.status === '持续中';
      case 'resolved':
        return alert.status === '已解除';
      case 'warning':
        return alert.level === '警戒';
      case 'fault':
        return alert.level === '故障';
      default:
        return true;
    }
  });

  useEffect(() => {
    // 默认折叠 AI 分析，切换系统时清空筛选和展开状态。
    setExpandedAlertId(null);
    setActiveFilter('all');
  }, [system.id]);

  useEffect(() => {
    setExpandedAlertId(null);
  }, [activeFilter]);

  return (
    <section className="tab-panel alerts-panel">
      {/* 顶部系统上下文区：展示当前系统和告警筛选标签。 */}
      <div className="panel-block system-hero">
        <div className="section-heading">
          <h2>{system.name}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="切换系统"
            onClick={onChangeSystem}
          >
            <SystemSwitchIcon />
          </button>
        </div>

        <div className="alert-summary-line">
          <button
            type="button"
            className={`alert-summary-pill alert-summary-pill--all ${activeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span>全部</span>
            <span className="alert-summary-pill__count">{currentAlerts.length}</span>
          </button>
          <button
            type="button"
            className={`alert-summary-pill alert-summary-pill--danger ${activeFilter === 'ongoing' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('ongoing')}
          >
            <span>持续中</span>
            <span className="alert-summary-pill__count">{ongoingCount}</span>
          </button>
          <button
            type="button"
            className={`alert-summary-pill alert-summary-pill--success ${activeFilter === 'resolved' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('resolved')}
          >
            <span>已解除</span>
            <span className="alert-summary-pill__count">{recoveredCount}</span>
          </button>
          <button
            type="button"
            className={`alert-summary-pill alert-summary-pill--warning ${activeFilter === 'warning' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('warning')}
          >
            <span>警戒</span>
            <span className="alert-summary-pill__count">{warningCount}</span>
          </button>
          <button
            type="button"
            className={`alert-summary-pill alert-summary-pill--fault ${activeFilter === 'fault' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('fault')}
          >
            <span>故障</span>
            <span className="alert-summary-pill__count">{faultCount}</span>
          </button>
        </div>
      </div>

      {/* 时间线列表：按筛选条件展示告警，并按需展开 AI 分析。 */}
      <div className="alert-list">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <article
              key={alert.id}
              className={`alert-timeline__item ${alert.level === '故障' ? 'alert-card--danger' : 'alert-card--warning'}`}
              style={{ ['--delay' as string]: `${index}` }}
            >
              <div className="alert-timeline__dot" />
              <div className="alert-timeline__rail" />

              <div className="alert-timeline__content">
                <div className="alert-timeline__meta">
                  <div className="alert-card__tags">
                    <span className={`alert-timeline__badge ${alert.level === '故障' ? 'alert-timeline__badge--danger' : 'alert-timeline__badge--warning'}`}>
                      {alert.level}
                    </span>
                    <span className={`alert-timeline__badge ${alert.status === '持续中' ? 'alert-timeline__badge--ongoing' : 'alert-timeline__badge--resolved'}`}>
                      {alert.status}
                    </span>
                  </div>
                  <span className="alert-card__time">{formatDateTime(alert.time)}</span>
                </div>

                <div className={`panel-block alert-card alert-timeline__card ${alert.level === '故障' ? 'alert-card--danger' : 'alert-card--warning'}`}>
                  <div className="alert-card__body">
                    <h3>{alert.ruleName}</h3>
                    <p>{alert.content}</p>
                  </div>

                  <button
                    type="button"
                    className="alert-card__toggle"
                    aria-expanded={expandedAlertId === alert.id}
                    onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                  >
                    <span>AI 分析</span>
                    <DownOutline className={expandedAlertId === alert.id ? 'alert-card__toggle-icon is-open' : 'alert-card__toggle-icon'} />
                  </button>

                  {expandedAlertId === alert.id ? (
                    <div className="alert-analysis">
                      <div className="alert-analysis__item">
                        <span>故障诊断</span>
                        <p>{alert.analysis.diagnosis}</p>
                      </div>
                      <div className="alert-analysis__item">
                        <span>根因分析</span>
                        <p>{alert.analysis.rootCause}</p>
                      </div>
                      <div className="alert-analysis__item">
                        <span>处置建议</span>
                        <p>{alert.analysis.suggestion}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="panel-block empty-wrap">
            <Empty
              description="没有符合当前筛选条件的告警"
              imageStyle={{
                width: 120,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
