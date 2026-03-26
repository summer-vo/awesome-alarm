/**
 * format.ts
 * 页面格式化工具集合。
 * 统一处理数字、指标值、时间和趋势状态的展示格式，避免组件内散落重复逻辑。
 */

/**
 * 将数字格式化为中文数字字符串。
 * @param value 需要格式化的原始数值。
 * @param precision 保留的小数位数。
 * @returns 适合界面展示的格式化结果。
 */
export function formatNumber(value: number, precision = 0): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/**
 * 将指标值与单位拼接成最终展示文案。
 * @param value 指标数值。
 * @param unit 指标单位。
 * @param precision 保留的小数位数。
 * @returns 例如“5,680 笔/分”这样的展示字符串。
 */
export function formatMetricValue(value: number, unit: string, precision = 0): string {
  return `${formatNumber(value, precision)} ${unit}`;
}

/**
 * 按月/日/时/分格式化时间，适用于告警时间等短时间展示。
 * @param timestamp 时间戳，单位毫秒。
 * @returns 形如“03/25 09:16”的字符串。
 */
export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

/**
 * 根据时间范围格式化趋势图横轴时间。
 * @param timestamp 时间戳，单位毫秒。
 * @param rangeKey 当前选择的时间范围键值。
 * @returns 适配横轴密度的时间标签。
 */
export function formatChartTime(timestamp: number, rangeKey: string): string {
  const date = new Date(timestamp);

  if (rangeKey === '3d' || rangeKey === '7d' || rangeKey === '14d') {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 格式化方差与标准差等统计值。
 * @param value 原始统计值。
 * @param precision 保留的小数位数。
 * @returns 格式化后的统计字符串。
 */
export function getVarianceLabel(value: number, precision = 2): string {
  return formatNumber(value, precision);
}

/**
 * 按变化率返回涨跌趋势色调。
 * @param value 变化率百分比。
 * @returns up/down/flat 三种展示语义之一。
 */
export function getChangeTone(value: number): 'up' | 'down' | 'flat' {
  if (value > 0.5) {
    return 'up';
  }

  if (value < -0.5) {
    return 'down';
  }

  return 'flat';
}
