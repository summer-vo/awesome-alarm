/**
 * InlineSelectRow.tsx
 * 行内标签切换器。
 * 负责在有限横向空间内展示主选项，并把溢出选项收纳进“更多”下拉。
 */
import { DownOutline } from 'antd-mobile-icons';
import { useEffect, useRef, useState } from 'react';

interface SelectOption<T extends string> {
  key: T;
  label: string;
}

interface InlineSelectRowProps<T extends string> {
  options: Array<SelectOption<T>>;
  activeKey: T;
  primaryKeys: T[];
  onChange: (value: T) => void;
  variant: 'metric' | 'range';
  triggerDefaultLabel?: string;
}

/**
 * 渲染行内标签切换器。
 * @param options 全量选项。
 * @param activeKey 当前选中项。
 * @param primaryKeys 默认直接展示的主选项键值。
 * @param onChange 切换选项时的回调。
 * @param variant 当前选择器类型，用于切换不同视觉样式。
 * @param triggerDefaultLabel “更多”触发器在未命中溢出选项时的默认文案。
 * @returns 行内选择器组件。
 */
export function InlineSelectRow<T extends string>({
  options,
  activeKey,
  primaryKeys,
  onChange,
  variant,
  triggerDefaultLabel = '更多',
}: InlineSelectRowProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 下拉打开时监听点击外部区域，保证移动端操作后快速收口。
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    // 点击外部区域时自动关闭下拉菜单，保证移动端操作利落。
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

  const primaryOptions = primaryKeys
    .map((key) => options.find((option) => option.key === key))
    .filter((option): option is SelectOption<T> => Boolean(option));
  const overflowOptions = options.filter((option) => !primaryKeys.includes(option.key));
  const activeOverflowOption = overflowOptions.find((option) => option.key === activeKey);
  const triggerLabel = activeOverflowOption?.label ?? triggerDefaultLabel;
  const columnCount = primaryOptions.length + (overflowOptions.length > 0 ? 1 : 0);
  const baseClassName = variant === 'metric' ? 'segment-pill' : 'range-pill';
  const activeClassName = variant === 'metric' ? 'segment-pill--active' : 'range-pill--active';

  return (
    <div
      ref={containerRef}
      className={`inline-select-row ${open ? 'is-open' : ''}`}
      style={{ ['--inline-columns' as string]: `${columnCount}` }}
    >
      {/* 主选项：直接平铺展示，降低移动端切换成本。 */}
      {primaryOptions.map((option) => (
        <button
          type="button"
          key={option.key}
          className={`${baseClassName} ${activeKey === option.key ? activeClassName : ''}`}
          onClick={() => {
            onChange(option.key);
            setOpen(false);
          }}
        >
          {option.label}
        </button>
      ))}

      {overflowOptions.length > 0 ? (
        <div className="inline-select-row__more">
          {/* 溢出项触发器：当前选中溢出项时直接展示该项文案。 */}
          <button
            type="button"
            className={`${baseClassName} inline-select-row__trigger ${activeOverflowOption ? activeClassName : ''}`}
            onClick={() => setOpen((current) => !current)}
          >
            <span>{triggerLabel}</span>
            <DownOutline className={open ? 'inline-select-row__chevron is-open' : 'inline-select-row__chevron'} />
          </button>

          {open ? (
            <div className="inline-select-row__menu">
              {/* 下拉菜单：承接未平铺展示的额外选项。 */}
              {overflowOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={`inline-select-row__menu-item ${activeKey === option.key ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
