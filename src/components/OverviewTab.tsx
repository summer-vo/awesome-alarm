/**
 * OverviewTab.tsx
 * 系统总览页。
 * 负责系统筛选和系统卡片列表展示，是进入详情页的主入口。
 */
import { Empty } from 'antd-mobile';
import { useState } from 'react';
import type { SystemMonitor } from '../types/monitor';
import { SearchableDropdown } from './SearchableDropdown';
import { SystemCard } from './SystemCard';

interface OverviewTabProps {
  systems: SystemMonitor[];
  onOpenDetail: (systemId: string) => void;
}

/**
 * 渲染总览分栏。
 * @param systems 全量系统列表。
 * @param onOpenDetail 点击系统卡片后的跳转回调。
 * @returns 总览页内容。
 */
export function OverviewTab({ systems, onOpenDetail }: OverviewTabProps) {
  const [activeSystemId, setActiveSystemId] = useState('all');

  // 总览系统筛选压缩为一个可搜索下拉，减少顶部空间占用。
  const filteredSystems = systems.filter(
    (system) => activeSystemId === 'all' || system.id === activeSystemId,
  );

  return (
    <section className="tab-panel overview-panel">
      {/* 顶部筛选区：用单个可搜索下拉压缩总览页头部空间。 */}
      <div className="overview-filter-bar">
        <SearchableDropdown
          activeKey={activeSystemId}
          placeholder="筛选系统"
          onChange={setActiveSystemId}
          options={[
            { key: 'all', label: '全部系统' },
            ...systems.map((system) => ({
              key: system.id,
              label: system.name,
            })),
          ]}
        />
      </div>

      {/* 系统列表区：筛选后仅渲染命中的系统卡片。 */}
      <div className="overview-list">
        {filteredSystems.length > 0 ? (
          filteredSystems.map((system, index) => (
            <SystemCard key={system.id} system={system} index={index} onOpen={onOpenDetail} />
          ))
        ) : (
          <div className="panel-block empty-wrap">
            <Empty
              description="没有匹配的系统"
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
