/**
 * SystemPickerPopup.tsx
 * 系统选择弹层。
 * 为详情页和告警页提供统一的系统切换入口，并支持按系统名称即时筛选。
 */
import { Popup, SearchBar, Tag } from 'antd-mobile';
import { useEffect, useMemo, useState } from 'react';
import type { SystemMonitor } from '../types/monitor';

interface SystemPickerPopupProps {
  visible: boolean;
  systems: SystemMonitor[];
  onSelect: (systemId: string) => void;
  onClose: () => void;
}

// 与系统卡片、详情头部保持同一套标签色映射，避免系统来源语义漂移。
const sourceTagToneClassMap: Record<string, string> = {
  日志接入: 'tag-tone-log',
  Hades接入: 'tag-tone-hades',
  APM接入: 'tag-tone-apm',
  链路追踪: 'tag-tone-trace',
};

/**
 * 渲染系统选择弹层。
 * @param visible 当前弹层是否显示。
 * @param systems 可供选择的系统列表。
 * @param onSelect 选择系统后的回调。
 * @param onClose 关闭弹层回调。
 * @returns 系统选择弹层。
 */
export function SystemPickerPopup({
  visible,
  systems,
  onSelect,
  onClose,
}: SystemPickerPopupProps) {
  const [keyword, setKeyword] = useState('');

  // 弹层关闭时重置关键字，避免下一次打开时残留筛选条件。
  useEffect(() => {
    if (!visible) {
      setKeyword('');
    }
  }, [visible]);

  // 搜索范围覆盖系统名称、业务域和接入来源，减少切系统的来回操作。
  const filteredSystems = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) {
      return systems;
    }

    return systems.filter((system) => {
      const sourceText = system.sources.join(' ');
      return `${system.name} ${system.businessGroup} ${sourceText}`.toLowerCase().includes(searchText);
    });
  }, [keyword, systems]);

  return (
    <Popup
      className="picker-popup"
      visible={visible}
      onMaskClick={onClose}
    >
      <div className="picker-sheet">
        <div className="picker-sheet__handle" />
        <div className="picker-sheet__header">
          <h3>请选择系统</h3>
        </div>

        {/* 搜索区：用于按系统名、业务域和来源做模糊过滤。 */}
        <SearchBar
          value={keyword}
          placeholder="输入系统名称筛选"
          onChange={setKeyword}
          className="monitor-search monitor-search--compact picker-sheet__search"
        />

        {/* 系统列表：每个卡片只保留最关键的身份信息与健康度。 */}
        <div className="picker-sheet__list">
          {filteredSystems.map((system) => (
            <button
              type="button"
              key={system.id}
              className="picker-item"
              onClick={() => onSelect(system.id)}
            >
              <div className="picker-item__title">
                <p>{system.businessGroup}</p>
                <h4>{system.name}</h4>
                <div className="picker-item__tags">
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
              <strong className="picker-item__score">{system.healthScore}</strong>
            </button>
          ))}

          {filteredSystems.length === 0 ? <div className="chart-empty">没有匹配的系统</div> : null}
        </div>
      </div>
    </Popup>
  );
}
