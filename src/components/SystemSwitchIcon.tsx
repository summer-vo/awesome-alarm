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
 * @returns 双向切换语义的 SVG 图标。
 */
export function SystemSwitchIcon({ size = 18 }: SystemSwitchIconProps) {
  // 使用自定义 SVG，尽量贴近你给的双向切换图标样式。
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 7H8L11 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 17H16L13 20"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
