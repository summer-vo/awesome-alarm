/**
 * echarts.ts
 * ECharts 能力注册与类型导出入口。
 * 统一收口图表依赖，避免组件侧直接依赖整包 ECharts，便于后续做按需裁剪。
 */
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import {
  graphic,
  init,
  type EChartsCoreOption,
  type EChartsType,
  use,
} from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

// 仅注册当前页面实际使用到的 ECharts 能力，避免打包整库。
use([LineChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

export type EChartsOption = EChartsCoreOption;

export { graphic, init, type EChartsType };
