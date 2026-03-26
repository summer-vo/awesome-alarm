/**
 * App.tsx
 * 应用根组件。
 * 统一管理分栏、当前系统、时间范围、指标维度和方法拆分页的主状态，
 * 并把状态与回调分发给总览、详情、告警和系统选择弹层。
 */
import { SafeArea, TabBar, Toast } from 'antd-mobile';
import { BellOutline, LeftOutline, PieOutline, TextOutline } from 'antd-mobile-icons';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { OverviewTab } from './components/OverviewTab';
import { SystemPickerPopup } from './components/SystemPickerPopup';
import { alertRecords, getSystemById, monitoringSystems } from './data/mockData';
import type { TabKey, TimeRangeKey, TrendMetricKey } from './types/monitor';

const DetailTab = lazy(async () => {
  const module = await import('./components/DetailTab');
  return { default: module.DetailTab };
});

const AlertsTab = lazy(async () => {
  const module = await import('./components/AlertsTab');
  return { default: module.AlertsTab };
});

const MethodSplitPage = lazy(async () => {
  const module = await import('./components/MethodSplitPopup');
  return { default: module.MethodSplitPage };
});

const pageTitleMap: Record<TabKey, string> = {
  overview: '系统总览',
  detail: '系统详情',
  alerts: '告警列表',
};

/**
 * 根应用组件。
 * @returns 移动端监控工作台的整体框架。
 */
export default function App() {
  // 一级导航与上下文主状态。
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'detail' | 'alerts'>('detail');
  const [selectedMetric, setSelectedMetric] = useState<TrendMetricKey>('throughput');
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>('24h');
  const [splitPageVisible, setSplitPageVisible] = useState(false);
  const [splitPageMeta, setSplitPageMeta] = useState<{ title: string } | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const selectedSystem = getSystemById(selectedSystemId);
  const pageTitle = splitPageVisible ? '方法拆分图' : pageTitleMap[activeTab];

  // 切换分栏、切换系统或进出拆分页时，统一把主滚动区域拉回顶部。
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab, selectedSystemId, splitPageVisible]);

  /**
   * 打开系统选择弹层，并记录当前要跳转的目标页。
   * @param target 选择系统后需要进入的目标分栏。
   */
  function openSystemPicker(target: 'detail' | 'alerts') {
    setPickerTarget(target);
    setPickerVisible(true);
  }

  /**
   * 处理底部分栏切换。
   * 如果目标页需要系统上下文但当前未选系统，则先弹出系统选择层。
   * @param nextTab 用户点击的下一个分栏键值。
   */
  function handleTabChange(nextTab: string) {
    const nextValue = nextTab as TabKey;

    if (nextValue === 'overview') {
      setActiveTab('overview');
      return;
    }

    if (!selectedSystemId) {
      Toast.show({
        content: '请先选择一个系统',
        position: 'bottom',
      });
      openSystemPicker(nextValue);
      return;
    }

    setActiveTab(nextValue);
  }

  /**
   * 统一处理系统选择后的跳转逻辑。
   * @param systemId 用户选中的系统 ID。
   * @param targetTab 选择完成后应进入的目标分栏，默认回到当前弹层记录的目标页。
   */
  function handleSystemSelect(systemId: string, targetTab?: 'detail' | 'alerts') {
    setSelectedSystemId(systemId);
    setActiveTab(targetTab ?? pickerTarget);
    setSplitPageVisible(false);
    setSplitPageMeta(null);
    setPickerVisible(false);
  }

  /**
   * 从总览卡片直接进入详情页。
   * @param systemId 用户点击的系统 ID。
   */
  function handleOpenDetail(systemId: string) {
    handleSystemSelect(systemId, 'detail');
  }

  /**
   * 从详情页直接进入告警页。
   * @param systemId 当前系统 ID。
   */
  function handleOpenAlerts(systemId: string) {
    handleSystemSelect(systemId, 'alerts');
  }

  /**
   * 为懒加载页面提供统一的加载占位。
   * @returns 模块加载中的占位面板。
   */
  function renderLoadingPanel() {
    return (
      <div className="panel-block empty-selection">
        <p>页面模块加载中...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="ambient ambient--cyan" />
      <div className="ambient ambient--gold" />

      <div className="mobile-shell">
        {/* 顶部固定导航：展示当前工作区标题与返回操作。 */}
        <header className="top-nav">
          <div className="top-nav__content">
            <div className="top-nav__left">
              {splitPageVisible ? (
                <button
                  type="button"
                  className="top-nav__back"
                  aria-label="返回详情页"
                  onClick={() => setSplitPageVisible(false)}
                >
                  <LeftOutline />
                </button>
              ) : null}
              <div className={splitPageVisible && splitPageMeta ? 'top-nav__title-row' : ''}>
                <h1>{pageTitle}</h1>
                {splitPageVisible && splitPageMeta ? (
                  <p className="top-nav__detail top-nav__detail--inline">{splitPageMeta.title}</p>
                ) : null}
              </div>
            </div>
            {!splitPageVisible && activeTab === 'overview' ? (
              <span className="top-nav__badge">系统总数：{monitoringSystems.length}</span>
            ) : null}
          </div>
        </header>

        {/* 中间滚动工作区：根据当前分栏与方法拆分页状态切换内容。 */}
        <main ref={mainRef} className="app-main">
          {splitPageVisible && selectedSystem ? (
            <Suspense fallback={renderLoadingPanel()}>
              <MethodSplitPage
                system={selectedSystem}
                selectedMetric={selectedMetric}
                rangeKey={selectedRange}
                onMetaChange={setSplitPageMeta}
              />
            </Suspense>
          ) : null}

          {!splitPageVisible && activeTab === 'overview' && (
            <OverviewTab systems={monitoringSystems} onOpenDetail={handleOpenDetail} />
          )}

          {!splitPageVisible && activeTab === 'detail' && (
            <Suspense fallback={renderLoadingPanel()}>
              <DetailTab
                system={selectedSystem}
                selectedMetric={selectedMetric}
                selectedRange={selectedRange}
                onMetricChange={setSelectedMetric}
                onRangeChange={setSelectedRange}
                onOpenAlerts={handleOpenAlerts}
                onChangeSystem={() => openSystemPicker('detail')}
                onOpenSplit={() => setSplitPageVisible(true)}
              />
            </Suspense>
          )}

          {!splitPageVisible && activeTab === 'alerts' && (
            <Suspense fallback={renderLoadingPanel()}>
              <AlertsTab
                system={selectedSystem}
                alerts={alertRecords}
                onChangeSystem={() => openSystemPicker('alerts')}
              />
            </Suspense>
          )}
        </main>

        {/* 底部固定分栏：在方法拆分页打开时隐藏，避免二级页面交互冲突。 */}
        {!splitPageVisible ? (
          <div className="tabbar-wrap">
            <TabBar activeKey={activeTab} onChange={handleTabChange} safeArea={false}>
              <TabBar.Item key="overview" icon={<PieOutline />} title="总览" />
              <TabBar.Item key="detail" icon={<TextOutline />} title="详情" />
              <TabBar.Item key="alerts" icon={<BellOutline />} title="告警" />
            </TabBar>
            <SafeArea position="bottom" />
          </div>
        ) : null}
      </div>

      {/* 系统选择弹层：详情页和告警页都复用同一套选择逻辑。 */}
      <SystemPickerPopup
        visible={pickerVisible}
        systems={monitoringSystems}
        onSelect={(systemId) => handleSystemSelect(systemId, pickerTarget)}
        onClose={() => setPickerVisible(false)}
      />
    </div>
  );
}
