/**
 * mockData.ts
 * 页面模拟数据中心。
 * 负责定义系统模板、指标元信息、时间范围选项，以及总览、详情、方法拆分和告警所需的所有模拟数据生成逻辑。
 */
import type {
  AlertRecord,
  DetailMetricItem,
  MethodBreakdownResult,
  MethodTrendSeries,
  MetricKey,
  MetricMeta,
  SourceTag,
  SystemMetricSummary,
  SystemMonitor,
  TimeRangeKey,
  TimeRangeOption,
  TrendMetricKey,
  TrendDataset,
  TrendPoint,
  TrendStats,
} from '../types/monitor';

/**
 * 内部系统模板。
 * 用于描述一个系统的基础画像，并作为所有派生数据的输入源。
 */
interface SystemTemplate {
  id: string;
  name: string;
  businessGroup: string;
  sources: SourceTag[];
  methods: string[];
  base: Record<MetricKey, number>;
}

const now = Date.now();

// 图表调色板：保证方法拆分图中各序列颜色稳定且足够区分。
const chartPalette = [
  '#3bd3ff',
  '#7f8dff',
  '#4fd18b',
  '#f6c66b',
  '#ff8f70',
  '#5ee0c6',
  '#9c88ff',
  '#64b5f6',
  '#ef6c99',
  '#8bc34a',
  '#ffd166',
  '#00c2ff',
  '#7be495',
  '#a978ff',
  '#ff6b6b',
  '#4dd0e1',
  '#b39ddb',
  '#ffb74d',
  '#90caf9',
  '#26c6da',
];

/**
 * 指标元信息表。
 * 统一定义指标标签、单位、精度与颜色，供总览、详情和拆分页复用。
 */
export const metricMetaMap: Record<TrendMetricKey, MetricMeta> = {
  throughput: {
    key: 'throughput',
    label: '交易量',
    unit: '笔/分',
    precision: 0,
    color: '#3bd3ff',
    polarity: 'higher-better',
  },
  avgRt: {
    key: 'avgRt',
    label: '响应时间',
    unit: 'ms',
    precision: 0,
    color: '#7f8dff',
    polarity: 'lower-better',
  },
  successRate: {
    key: 'successRate',
    label: '响应率',
    unit: '%',
    precision: 2,
    color: '#4fd18b',
    polarity: 'higher-better',
  },
  accuracyRate: {
    key: 'accuracyRate',
    label: '正确率',
    unit: '%',
    precision: 3,
    color: '#f6c66b',
    polarity: 'higher-better',
  },
  tps: {
    key: 'tps',
    label: 'TPS',
    unit: '笔/秒',
    precision: 1,
    color: '#ff9d6c',
    polarity: 'higher-better',
  },
};

/**
 * 详情页趋势分析可切换的指标集合。
 */
export const detailTrendMetricKeys: TrendMetricKey[] = [
  'throughput',
  'avgRt',
  'successRate',
  'accuracyRate',
  'tps',
];

/**
 * 统一的时间范围选项。
 * 每个选项同时定义点数和点间隔，供趋势生成器与图表共用。
 */
export const timeRangeOptions: TimeRangeOption[] = [
  { key: '5m', label: '5 分钟', points: 60, stepMinutes: 0.0833 },
  { key: '15m', label: '15 分钟', points: 90, stepMinutes: 0.1667 },
  { key: '30m', label: '30 分钟', points: 90, stepMinutes: 0.3333 },
  { key: '1h', label: '1 小时', points: 120, stepMinutes: 0.5 },
  { key: '6h', label: '6 小时', points: 72, stepMinutes: 5 },
  { key: '24h', label: '24 小时', points: 96, stepMinutes: 15 },
  { key: '3d', label: '3 天', points: 72, stepMinutes: 60 },
  { key: '7d', label: '7 天', points: 84, stepMinutes: 120 },
  { key: '14d', label: '14 天', points: 112, stepMinutes: 180 },
];

// 系统模板库：所有页面系统信息都从这里派生，后续接真实接口时可替换为接口数据。
const systemTemplates: SystemTemplate[] = [
  {
    id: 'core-ledger',
    name: '核心账务',
    businessGroup: '账户中心',
    sources: ['日志接入', 'Hades接入'],
    base: {
      throughput: 5680,
      avgRt: 112,
      successRate: 99.98,
      accuracyRate: 99.994,
    },
    methods: [
      'acct.transfer',
      'acct.balanceQuery',
      'acct.freeze',
      'acct.unfreeze',
      'acct.detailSync',
      'acct.batchBook',
      'acct.reconcile',
      'acct.posting',
      'acct.statement',
      'acct.interestCalc',
      'acct.clearingPush',
      'acct.couponVerify',
      'acct.limitCheck',
      'acct.hostRoute',
      'acct.internalSettle',
      'acct.proxyPost',
      'acct.notification',
      'acct.fundControl',
      'acct.creditOffset',
      'acct.marginUpdate',
      'acct.riskReview',
      'acct.branchMirror',
      'acct.reserveAudit',
      'acct.backwrite',
      'acct.reportSnapshot',
      'acct.hostReplay',
      'acct.billArchive',
      'acct.generalLedger',
    ],
  },
  {
    id: 'mobile-banking',
    name: '手机银行',
    businessGroup: '渠道服务',
    sources: ['日志接入', 'APM接入', '链路追踪'],
    base: {
      throughput: 4360,
      avgRt: 146,
      successRate: 99.93,
      accuracyRate: 99.986,
    },
    methods: [
      'app.login',
      'app.homefeed',
      'app.transferSubmit',
      'app.receiptQuery',
      'app.billDownload',
      'app.qrPay',
      'app.loanApply',
      'app.assetView',
      'app.cardBind',
      'app.deviceCheck',
      'app.riskTicket',
      'app.faceVerify',
      'app.messagePull',
      'app.notificationAck',
      'app.quotaUpdate',
      'app.statementQuery',
      'app.walletActivate',
      'app.bannerConfig',
      'app.fundSearch',
      'app.marketFeed',
      'app.vipIdentity',
      'app.safeCenter',
      'app.profileUpdate',
      'app.contactBook',
      'app.limitQuery',
      'app.idempotentCheck',
    ],
  },
  {
    id: 'internet-banking',
    name: '网银交易',
    businessGroup: '对公网银',
    sources: ['Hades接入', '链路追踪'],
    base: {
      throughput: 3820,
      avgRt: 128,
      successRate: 99.95,
      accuracyRate: 99.989,
    },
    methods: [
      'ebank.login',
      'ebank.bulkTransfer',
      'ebank.statement',
      'ebank.accountAuth',
      'ebank.invoiceQuery',
      'ebank.cashPool',
      'ebank.limitApply',
      'ebank.workflowPush',
      'ebank.fileVerify',
      'ebank.corporateAuth',
      'ebank.signature',
      'ebank.sealPreview',
      'ebank.tokenCheck',
      'ebank.statementDownload',
      'ebank.hostSync',
      'ebank.branchRoute',
      'ebank.taxPay',
      'ebank.supplyChain',
      'ebank.reportQuery',
      'ebank.feeSettle',
      'ebank.virtualAccount',
      'ebank.batchRollback',
      'ebank.cardControl',
      'ebank.noticeSend',
    ],
  },
  {
    id: 'payment-clearing',
    name: '支付清算',
    businessGroup: '支付清算',
    sources: ['日志接入', 'Hades接入', '链路追踪'],
    base: {
      throughput: 6240,
      avgRt: 94,
      successRate: 99.97,
      accuracyRate: 99.992,
    },
    methods: [
      'pay.route',
      'pay.fastTransfer',
      'pay.netting',
      'pay.settlement',
      'pay.clearingPush',
      'pay.channelSwitch',
      'pay.hostFallback',
      'pay.msgDispatch',
      'pay.deduction',
      'pay.signVerify',
      'pay.bankRoute',
      'pay.reserveCheck',
      'pay.rcvdCallback',
      'pay.limitControl',
      'pay.tradeRepair',
      'pay.nightBatch',
      'pay.feePosting',
      'pay.failRetry',
      'pay.riskIntercept',
      'pay.accounting',
      'pay.crossBorder',
      'pay.hostAck',
      'pay.rcvConfirm',
      'pay.idempotent',
      'pay.reverse',
      'pay.matchCenter',
      'pay.paramSync',
      'pay.dealCompensate',
    ],
  },
  {
    id: 'risk-engine',
    name: '风控引擎',
    businessGroup: '风险控制',
    sources: ['APM接入', '链路追踪'],
    base: {
      throughput: 2980,
      avgRt: 176,
      successRate: 99.88,
      accuracyRate: 99.972,
    },
    methods: [
      'risk.ruleMatch',
      'risk.featurePull',
      'risk.eventScore',
      'risk.blacklist',
      'risk.ruleCompile',
      'risk.realtimeDecision',
      'risk.asyncDecision',
      'risk.behaviorGraph',
      'risk.sceneMerge',
      'risk.creditModel',
      'risk.geoCheck',
      'risk.antiFraud',
      'risk.smsPattern',
      'risk.deviceMapping',
      'risk.ipReview',
      'risk.limitFallback',
      'risk.profileSnapshot',
      'risk.rulePublish',
      'risk.flowControl',
      'risk.replayAudit',
      'risk.grayBucket',
      'risk.featureCache',
      'risk.externalProbe',
      'risk.caseRoute',
      'risk.signalFusion',
    ],
  },
  {
    id: 'loan-approval',
    name: '贷款审批',
    businessGroup: '信贷流程',
    sources: ['日志接入', 'APM接入'],
    base: {
      throughput: 1860,
      avgRt: 222,
      successRate: 99.84,
      accuracyRate: 99.967,
    },
    methods: [
      'loan.apply',
      'loan.creditPull',
      'loan.ruleAudit',
      'loan.approvalFlow',
      'loan.faceCompare',
      'loan.contractBuild',
      'loan.rateCalc',
      'loan.assetCheck',
      'loan.fraudProbe',
      'loan.documentParse',
      'loan.externalCredit',
      'loan.limitGrant',
      'loan.caseReview',
      'loan.caseRollback',
      'loan.blacklist',
      'loan.pushHost',
      'loan.notifyCenter',
      'loan.interviewRoute',
      'loan.imageArchive',
      'loan.thirdPartyCheck',
      'loan.branchPolicy',
      'loan.grayCheck',
      'loan.afterLoan',
      'loan.supplementApprove',
    ],
  },
  {
    id: 'aml-monitor',
    name: '反洗钱监测',
    businessGroup: '合规监管',
    sources: ['日志接入', 'Hades接入'],
    base: {
      throughput: 1520,
      avgRt: 264,
      successRate: 99.79,
      accuracyRate: 99.961,
    },
    methods: [
      'aml.caseIngest',
      'aml.ruleEval',
      'aml.hitList',
      'aml.customerGraph',
      'aml.txTrace',
      'aml.behaviorTrace',
      'aml.reportBuild',
      'aml.alertDispatch',
      'aml.historicalReplay',
      'aml.sanctionScreen',
      'aml.batchReview',
      'aml.caseClose',
      'aml.branchAudit',
      'aml.listSync',
      'aml.featureLoad',
      'aml.hostAttach',
      'aml.ruleDeploy',
      'aml.caseMerge',
      'aml.ticketRoute',
      'aml.dueDiligence',
      'aml.regulatoryPush',
      'aml.snapshotBuild',
    ],
  },
  {
    id: 'counter-integration',
    name: '柜面集成',
    businessGroup: '渠道接入',
    sources: ['日志接入', 'Hades接入', 'APM接入'],
    base: {
      throughput: 2480,
      avgRt: 134,
      successRate: 99.91,
      accuracyRate: 99.981,
    },
    methods: [
      'counter.openAccount',
      'counter.cashDeposit',
      'counter.cashWithdraw',
      'counter.transfer',
      'counter.receiptPrint',
      'counter.hostCallback',
      'counter.ticketIssue',
      'counter.imageStore',
      'counter.deviceProbe',
      'counter.branchRoute',
      'counter.idCheck',
      'counter.faceVerify',
      'counter.queueSync',
      'counter.accountVerify',
      'counter.templateRender',
      'counter.stampPush',
      'counter.passbookWrite',
      'counter.reserveCheck',
      'counter.limitCheck',
      'counter.hostRepair',
      'counter.parameterPull',
      'counter.flowArchive',
    ],
  },
];

/**
 * 计算字符串哈希值，用于生成稳定随机种子。
 * @param input 原始输入字符串。
 * @returns 无符号哈希结果。
 */
function hashString(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * 基于种子构造可复现的伪随机数生成器。
 * @param seed 随机种子。
 * @returns 每次调用返回 0 到 1 之间随机数的函数。
 */
function createSeededRandom(seed: number): () => number {
  let state = seed || 1;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 将数值按给定精度四舍五入。
 * @param value 原始数值。
 * @param precision 保留的小数位数。
 * @returns 处理后的数值。
 */
function roundValue(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/**
 * 限制数值落在给定区间内。
 * @param value 原始数值。
 * @param min 最小值。
 * @param max 最大值。
 * @returns 截断后的数值。
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 生成总览页“最近更新时间”文案。
 * @param seedLabel 随机种子标签。
 * @returns 格式化后的时间字符串。
 */
function getOverviewUpdatedTime(seedLabel: string): string {
  const random = createSeededRandom(hashString(seedLabel));
  const offsetMinutes = Math.floor(random() * 4);
  const date = new Date(now - offsetMinutes * 60 * 1000);

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 计算数组均值。
 * @param values 数值数组。
 * @returns 平均值。
 */
function calculateAverage(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * 计算数组方差。
 * @param values 数值数组。
 * @returns 方差。
 */
function calculateVariance(values: number[]): number {
  const average = calculateAverage(values);
  return values.reduce((total, value) => total + (value - average) ** 2, 0) / values.length;
}

/**
 * 获取指标的基础基线值。
 * @param template 当前系统模板。
 * @param key 指标 key。
 * @returns 该指标在当前系统上的基线值。
 */
function getBaseMetricValue(template: SystemTemplate, key: TrendMetricKey): number {
  if (key === 'tps') {
    return template.base.throughput / 60;
  }

  return template.base[key];
}

/**
 * 按指标语义对模拟值做边界收敛，避免出现明显不合理的数据。
 * @param key 指标 key。
 * @param value 原始模拟值。
 * @returns 归一化后的指标值。
 */
function normalizeMetricValue(key: TrendMetricKey, value: number): number {
  switch (key) {
    case 'throughput':
      return Math.max(10, value);
    case 'avgRt':
      return clamp(value, 18, 9999);
    case 'successRate':
      return clamp(value, 97.2, 100);
    case 'accuracyRate':
      return clamp(value, 97.4, 100);
    case 'tps':
      return Math.max(0.2, value);
    default:
      return value;
  }
}

/**
 * 生成一组具有趋势感的模拟数列。
 * 组合主波动、微波动、噪声和异常事件，保证监控图表看起来更接近真实场景。
 * @param baseValue 指标基线值。
 * @param key 指标 key。
 * @param length 序列长度。
 * @param seedLabel 随机种子标签。
 * @param intensity 波动强度系数。
 * @returns 模拟值数组。
 */
function buildSyntheticValues(
  baseValue: number,
  key: TrendMetricKey,
  length: number,
  seedLabel: string,
  intensity = 1,
): number[] {
  const meta = metricMetaMap[key];
  const random = createSeededRandom(hashString(seedLabel));
  const waveCount = 2.8 + random() * 2.7;
  const microWaveCount = 5.8 + random() * 3.1;
  const phase = random() * Math.PI;
  const microPhase = random() * Math.PI;
  const eventCenter = 0.35 + random() * 0.4;
  const eventWidth = 0.04 + random() * 0.08;
  const eventDirection = key === 'avgRt' ? 1 : -1;

  return Array.from({ length }, (_, index) => {
    const progress = length === 1 ? 1 : index / (length - 1);
    const mainWave = Math.sin(progress * Math.PI * waveCount + phase);
    const microWave = Math.cos(progress * Math.PI * microWaveCount + microPhase);
    const noise = (random() - 0.5) * 2;
    const eventWeight = Math.exp(-((progress - eventCenter) ** 2) / (2 * eventWidth ** 2));

    let nextValue = baseValue;

    if (key === 'throughput') {
      nextValue =
        baseValue * (1 + mainWave * 0.082 * intensity + microWave * 0.032 + noise * 0.028 - eventWeight * 0.052);
    }

    if (key === 'tps') {
      nextValue =
        baseValue * (1 + mainWave * 0.09 * intensity + microWave * 0.026 + noise * 0.022 - eventWeight * 0.048);
    }

    if (key === 'avgRt') {
      nextValue =
        baseValue * (1 + Math.abs(mainWave) * 0.118 * intensity + microWave * 0.024 + noise * 0.026 + eventWeight * 0.22);
    }

    if (key === 'successRate') {
      nextValue = baseValue + mainWave * 0.065 * intensity + microWave * 0.018 + noise * 0.018 + eventWeight * 0.092 * eventDirection;
    }

    if (key === 'accuracyRate') {
      nextValue = baseValue + mainWave * 0.028 * intensity + microWave * 0.012 + noise * 0.01 + eventWeight * 0.052 * eventDirection;
    }

    return roundValue(normalizeMetricValue(key, nextValue), meta.precision);
  });
}

/**
 * 生成总览页卡片中的单项指标。
 * @param template 当前系统模板。
 * @param key 指标 key。
 * @returns 总览页可直接消费的指标摘要。
 */
function buildOverviewMetric(template: SystemTemplate, key: MetricKey): SystemMetricSummary {
  const meta = metricMetaMap[key] as MetricMeta<MetricKey>;
  const trend = buildSyntheticValues(template.base[key], key, 18, `${template.id}-${key}-overview`, 0.8);
  const average = roundValue(calculateAverage(trend), meta.precision);
  const value = trend[trend.length - 1];

  return {
    ...meta,
    value,
    average,
    trend,
  };
}

/**
 * 生成详情页指标总览。
 * @param template 当前系统模板。
 * @returns 详情页指标卡集合。
 */
function buildDetailMetrics(template: SystemTemplate): DetailMetricItem[] {
  const avgRt = template.base.avgRt;

  return [
    {
      key: 'throughput',
      label: '交易量',
      value: roundValue(template.base.throughput, 0),
      unit: '笔/分',
      precision: 0,
    },
    {
      key: 'avgRt',
      label: '平均响应时间',
      value: roundValue(avgRt, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'minRt',
      label: '最小响应时间',
      value: roundValue(avgRt * 0.38, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'maxRt',
      label: '最大响应时间',
      value: roundValue(avgRt * 2.74, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'p50',
      label: 'P50',
      value: roundValue(avgRt * 0.83, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'p90',
      label: 'P90',
      value: roundValue(avgRt * 1.46, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'p99',
      label: 'P99',
      value: roundValue(avgRt * 2.18, 0),
      unit: 'ms',
      precision: 0,
    },
    {
      key: 'successRate',
      label: '响应率',
      value: roundValue(template.base.successRate, 2),
      unit: '%',
      precision: 2,
    },
    {
      key: 'accuracyRate',
      label: '正确率',
      value: roundValue(template.base.accuracyRate, 3),
      unit: '%',
      precision: 3,
    },
  ];
}

/**
 * 计算系统健康度。
 * @param template 当前系统模板。
 * @returns 0 到 100 之间的健康分数。
 */
function buildSystemHealth(template: SystemTemplate): number {
  const successScore = template.base.successRate * 0.3;
  const accuracyScore = template.base.accuracyRate * 0.35;
  const throughputScore = Math.min(100, template.base.throughput / 80) * 0.2;
  const latencyScore = Math.max(0, 100 - template.base.avgRt / 4) * 0.15;
  return roundValue(successScore + accuracyScore + throughputScore + latencyScore, 1);
}

/**
 * 总览、详情和系统切换弹层使用的系统主数据。
 */
export const monitoringSystems: SystemMonitor[] = systemTemplates.map((template) => ({
  id: template.id,
  name: template.name,
  businessGroup: template.businessGroup,
  healthScore: buildSystemHealth(template),
  sources: template.sources,
  lastUpdated: getOverviewUpdatedTime(template.id),
  methodNames: template.methods,
  overviewMetrics: {
    throughput: buildOverviewMetric(template, 'throughput'),
    avgRt: buildOverviewMetric(template, 'avgRt'),
    successRate: buildOverviewMetric(template, 'successRate'),
    accuracyRate: buildOverviewMetric(template, 'accuracyRate'),
  },
  detailMetrics: buildDetailMetrics(template),
}));

/**
 * 根据系统 ID 查找内部模板。
 * @param systemId 系统 ID。
 * @returns 命中的系统模板。
 */
function findSystemTemplate(systemId: string): SystemTemplate {
  const matched = systemTemplates.find((system) => system.id === systemId);

  if (!matched) {
    throw new Error(`未找到系统模板：${systemId}`);
  }

  return matched;
}

/**
 * 将纯数值序列转换为带时间戳的趋势点数组。
 * @param values 数值数组。
 * @param stepMinutes 点间隔，单位分钟。
 * @returns 趋势点数组。
 */
function buildPoints(values: number[], stepMinutes: number): TrendPoint[] {
  return values.map((value, index) => ({
    value,
    timestamp: now - (values.length - 1 - index) * stepMinutes * 60 * 1000,
  }));
}

/**
 * 计算趋势点集合的统计摘要。
 * @param points 趋势点数组。
 * @returns 详情页趋势分析所需统计结果。
 */
function calculateTrendStats(points: TrendPoint[]): TrendStats {
  const values = points.map((point) => point.value);
  const average = calculateAverage(values);
  const variance = calculateVariance(values);
  const first = values[0];
  const current = values[values.length - 1];

  return {
    current,
    max: Math.max(...values),
    min: Math.min(...values),
    average,
    variance,
    stdDeviation: Math.sqrt(variance),
    changeRate: first === 0 ? 0 : ((current - first) / Math.abs(first)) * 100,
  };
}

/**
 * 构建详情页单指标趋势数据。
 * @param systemId 系统 ID。
 * @param key 指标 key。
 * @param rangeKey 时间范围 key。
 * @returns 可直接供详情趋势图使用的数据集。
 */
export function buildMetricTrend(systemId: string, key: TrendMetricKey, rangeKey: TimeRangeKey): TrendDataset {
  const template = findSystemTemplate(systemId);
  const meta = metricMetaMap[key];
  const range = timeRangeOptions.find((item) => item.key === rangeKey);

  if (!range) {
    throw new Error(`未找到时间范围：${rangeKey}`);
  }

  const values = buildSyntheticValues(
    getBaseMetricValue(template, key),
    key,
    range.points,
    `${systemId}-${key}-${rangeKey}`,
    1.05,
  );
  const points = buildPoints(values, range.stepMinutes);
  const stats = calculateTrendStats(points);

  return {
    key,
    label: meta.label,
    unit: meta.unit,
    precision: meta.precision,
    color: meta.color,
    rangeLabel: range.label,
    average: roundValue(stats.average, meta.precision),
    points,
    stats: {
      current: roundValue(stats.current, meta.precision),
      max: roundValue(stats.max, meta.precision),
      min: roundValue(stats.min, meta.precision),
      average: roundValue(stats.average, meta.precision),
      variance: roundValue(stats.variance, 2),
      stdDeviation: roundValue(stats.stdDeviation, 2),
      changeRate: roundValue(stats.changeRate, 2),
    },
  };
}

/**
 * 构建方法拆分页的所有方法序列。
 * @param template 当前系统模板。
 * @param key 指标 key。
 * @param rangeKey 时间范围 key。
 * @returns 方法趋势序列集合。
 */
function buildMethodSeries(template: SystemTemplate, key: TrendMetricKey, rangeKey: TimeRangeKey): MethodTrendSeries[] {
  const range = timeRangeOptions.find((item) => item.key === rangeKey);

  if (!range) {
    throw new Error(`未找到时间范围：${rangeKey}`);
  }

  return template.methods.map((methodName, index) => {
    const random = createSeededRandom(hashString(`${template.id}-${key}-${methodName}`));
    const scaleFactor = 0.3 + ((index % 7) + 1) * 0.085 + random() * 0.1;
    const keySeed = `${template.id}-${methodName}-${key}-${rangeKey}`;

    let baseValue = getBaseMetricValue(template, key);

    if (key === 'throughput') {
      baseValue = template.base.throughput * scaleFactor * 0.42;
    }

    if (key === 'avgRt') {
      baseValue = template.base.avgRt * (0.78 + scaleFactor * 0.65);
    }

    if (key === 'successRate') {
      baseValue = template.base.successRate - scaleFactor * 0.14;
    }

    if (key === 'accuracyRate') {
      baseValue = template.base.accuracyRate - scaleFactor * 0.08;
    }

    if (key === 'tps') {
      baseValue = (template.base.throughput / 60) * scaleFactor * 0.42;
    }

    const values = buildSyntheticValues(baseValue, key, range.points, keySeed, 1.15 + scaleFactor * 0.2);
    const points = buildPoints(values, range.stepMinutes);
    const variance = calculateVariance(values);

    return {
      name: methodName,
      color: chartPalette[index % chartPalette.length],
      variance: roundValue(variance, 2),
      points,
    };
  });
}

/**
 * 构建方法拆分页的完整数据。
 * 默认按方差排序，并选出前 5 条作为初始可见集合。
 * @param systemId 系统 ID。
 * @param key 指标 key。
 * @param rangeKey 时间范围 key。
 * @returns 方法拆分页数据。
 */
export function buildMethodBreakdown(
  systemId: string,
  key: TrendMetricKey,
  rangeKey: TimeRangeKey,
): MethodBreakdownResult {
  const template = findSystemTemplate(systemId);
  const meta = metricMetaMap[key];
  const allSeries = buildMethodSeries(template, key, rangeKey).sort((left, right) => right.variance - left.variance);
  const defaultVisibleSeriesNames = allSeries.slice(0, 5).map((series) => series.name);

  return {
    metricKey: key,
    label: meta.label,
    unit: meta.unit,
    precision: meta.precision,
    totalSeriesCount: allSeries.length,
    defaultVisibleSeriesNames,
    series: allSeries,
  };
}

/**
 * 为单个系统生成告警记录。
 * @param template 当前系统模板。
 * @param systemIndex 当前系统在模板列表中的索引，用于错开告警时间。
 * @returns 当前系统的告警记录数组。
 */
function buildAlertRecords(template: SystemTemplate, systemIndex: number): AlertRecord[] {
  const alertTemplates = [
    {
      level: '故障' as const,
      status: systemIndex % 2 === 0 ? '持续中' as const : '已解除' as const,
      ruleName: 'P99 响应时间异常抬升',
      content: `${template.name} 在核心交易路径上出现持续抖动，P99 响应时间超过阈值 3 分钟。`,
      diagnosis: `AI 诊断该系统的长尾响应时间在高峰期出现明显拉长，交易拥塞主要集中在核心链路和外部依赖返回阶段。`,
      rootCause: `根因分析显示 ${template.businessGroup} 侧存在热点方法并发抬升，同时下游连接池水位逼近上限，造成排队放大。`,
      suggestion: '建议优先排查连接池占用、线程池水位以及热点方法的限流策略。',
    },
    {
      level: '警戒' as const,
      status: systemIndex % 3 === 0 ? '持续中' as const : '已解除' as const,
      ruleName: '响应率低于阈值',
      content: `${template.name} 的响应率短时跌破基线，接口超时与主动熔断比例上升。`,
      diagnosis: `AI 诊断该系统在分时窗口内出现可恢复性故障，失败样本集中在少数方法上，整体呈现突发波动特征。`,
      rootCause: `根因分析显示上游流量突增后，${template.name} 部分实例进入保护策略，导致业务请求被动降级。`,
      suggestion: '建议关注实例扩缩容状态，并核查近期配置变更和熔断阈值设置。',
    },
    {
      level: '警戒' as const,
      status: systemIndex % 4 === 0 ? '已解除' as const : '持续中' as const,
      ruleName: '正确率波动告警',
      content: `${template.name} 在关键交易链路中出现业务校验失败率抬升，正确率连续波动。`,
      diagnosis: `AI 诊断结果显示业务正确率下降主要源于校验分支命中异常，错误返回码聚集在风控与额度校验阶段。`,
      rootCause: `根因分析推断最近一次规则参数同步后，部分分支规则未完全生效，导致结果分布偏离历史区间。`,
      suggestion: '建议对照最近一次参数发布，重点检查规则灰度范围与缓存刷新时序。',
    },
  ];

  return alertTemplates.map((item, alertIndex) => ({
    id: `${template.id}-${alertIndex}`,
    systemId: template.id,
    systemName: template.name,
    level: item.level,
    status: item.status,
    ruleName: item.ruleName,
    content: item.content,
    time: now - (systemIndex * 3 + alertIndex + 1) * 47 * 60 * 1000,
    analysis: {
      diagnosis: item.diagnosis,
      rootCause: item.rootCause,
      suggestion: item.suggestion,
    },
  }));
}

/**
 * 告警页全量告警数据。
 */
export const alertRecords: AlertRecord[] = systemTemplates
  .flatMap((template, index) => buildAlertRecords(template, index))
  .sort((left, right) => right.time - left.time);

/**
 * 根据系统 ID 获取页面正在使用的系统对象。
 * @param systemId 系统 ID，可为空。
 * @returns 命中的系统对象，若未命中则返回 undefined。
 */
export function getSystemById(systemId: string | null): SystemMonitor | undefined {
  if (!systemId) {
    return undefined;
  }

  return monitoringSystems.find((system) => system.id === systemId);
}
