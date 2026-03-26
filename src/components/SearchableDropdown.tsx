/**
 * SearchableDropdown.tsx
 * 可搜索下拉组件。
 * 主要用于总览页系统筛选，兼顾移动端空间占用和快速检索。
 */
import { DownOutline } from 'antd-mobile-icons';
import { SearchBar } from 'antd-mobile';
import { useEffect, useMemo, useRef, useState } from 'react';

interface DropdownOption {
  key: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  activeKey: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * 渲染可搜索下拉列表。
 * @param options 可选项集合。
 * @param activeKey 当前激活项 key。
 * @param onChange 选项切换回调。
 * @param placeholder 未命中时的占位文案。
 * @returns 下拉选择组件。
 */
export function SearchableDropdown({
  options,
  activeKey,
  onChange,
  placeholder,
}: SearchableDropdownProps) {
  // 组件内部仅维护展开状态与搜索关键字。
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    /**
     * 点击容器外部时收起下拉。
     * @param event 浏览器鼠标事件。
     */
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const activeOption = options.find((option) => option.key === activeKey);
  const filteredOptions = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(keyword.trim().toLowerCase())),
    [keyword, options],
  );

  return (
    <div ref={containerRef} className="searchable-dropdown">
      {/* 触发器区域：展示当前值并负责展开菜单。 */}
      <button
        type="button"
        className={`searchable-dropdown__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{activeOption?.label ?? placeholder}</span>
        <DownOutline className={open ? 'searchable-dropdown__chevron is-open' : 'searchable-dropdown__chevron'} />
      </button>

      {open ? (
        <div className="searchable-dropdown__menu">
          {/* 搜索框：在同一套下拉中完成检索与选择。 */}
          <SearchBar
            value={keyword}
            placeholder="输入系统名称筛选"
            onChange={setKeyword}
            className="monitor-search monitor-search--compact"
          />

          <div className="searchable-dropdown__list">
            {filteredOptions.map((option) => (
              <button
                type="button"
                key={option.key}
                className={`searchable-dropdown__option ${option.key === activeKey ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
