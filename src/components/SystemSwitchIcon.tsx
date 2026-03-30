/**
 * SystemSwitchIcon.tsx
 * 切换系统操作使用的自定义图标组件。
 */
interface SystemSwitchIconProps {
  size?: number;
}

/**
 * 渲染系统切换图标。
 * @param size 图标尺寸，单位为像素。
 * @returns 带“系统节点 + 双向切换箭头”语义的 SVG 图标。
 */
export function SystemSwitchIcon({ size = 18 }: SystemSwitchIconProps) {
  // 使用更明确的“双系统节点 + 双向箭头”图形，避免只像普通左右箭头。
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="5"
        height="5"
        rx="1.7"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="15.5"
        y="14"
        width="5"
        height="5"
        rx="1.7"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9.5 7.5H17.5L15.2 5.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 16.5H6.5L8.8 18.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
