import { useState, useCallback, useRef } from 'react';
import SpecViewer from './components/LeftPane/SpecViewer';
import ComponentSummary from './components/RightTopPane/ComponentSummary';
import ChecklistTable from './components/RightBottomPane/ChecklistTable';
import ExportBar from './components/RightBottomPane/ExportBar';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [specFile, setSpecFile] = useState(null);
  const [specUrl, setSpecUrl] = useState(null);
  const [componentSummary, setComponentSummary] = useState(null);
  const [checkItems, setCheckItems] = useState([]);
  const [checkResults, setCheckResults] = useState({});
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [summaryHeight, setSummaryHeight] = useState(25); // percentage
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [analyzing, setAnalyzing] = useState(false);

  const mainRef = useRef(null);
  const rightPaneRef = useRef(null);

  // Fetch check items
  const fetchCheckItems = useCallback(async () => {
    const res = await fetch(`${API_BASE}/check-items`);
    const items = await res.json();
    setCheckItems(items);
    return items;
  }, []);

  // Upload file (Mock)
  const handleFileUpload = useCallback(async (file) => {
    setSpecFile(file);

    // Mock upload - just trigger endpoint to get metadata
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST' });
    const data = await res.json();

    // Create local preview URL
    const localUrl = URL.createObjectURL(file);
    setSpecUrl(localUrl);

    setComponentSummary(data.componentSummary);

    // Fetch check items and run analysis
    const items = await fetchCheckItems();
    setAnalyzing(true);

    // Analyze each item (mock AI)
    const results = {};
    for (const item of items) {
      try {
        const analyzeRes = await fetch(`${API_BASE}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkItemId: item.id }),
        });
        const analysis = await analyzeRes.json();
        results[item.id] = {
          aiJudgment: analysis.judgment,
          proposals: analysis.proposals,
          // Default: adopt AI's top proposal
          finalJudgment: analysis.judgment,
          selectedProposalIndex: 0,
          page: analysis.proposals[0]?.page || null,
          excerpt: analysis.proposals[0]?.excerpt || '',
          humanReviewed: false,
          manualInput: false,
          manualPage: '',
          manualExcerpt: '',
          note: '',
        };
      } catch (e) {
        results[item.id] = {
          aiJudgment: 'ng',
          proposals: [],
          finalJudgment: 'ng',
          selectedProposalIndex: -1,
          page: null,
          excerpt: '',
          humanReviewed: false,
          manualInput: false,
          manualPage: '',
          manualExcerpt: '',
          note: '',
        };
      }
    }
    setCheckResults(results);
    setAnalyzing(false);
  }, [fetchCheckItems]);

  // Update check result
  const updateCheckResult = useCallback((itemId, updates) => {
    setCheckResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        humanReviewed: true, // Default to reviewed on any update
        ...updates, // Allow overriding (e.g. toggling back to false)
      }
    }));
  }, []);

  // Horizontal splitter drag
  const handleHSplitterMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const containerWidth = mainRef.current?.getBoundingClientRect().width || window.innerWidth;

    const onMouseMove = (e) => {
      const delta = e.clientX - startX;
      const newWidth = startWidth + (delta / containerWidth) * 100;
      setLeftWidth(Math.max(20, Math.min(70, newWidth)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  // Vertical splitter drag (right pane)
  const handleVSplitterMouseDown = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = summaryHeight;
    const containerHeight = rightPaneRef.current?.getBoundingClientRect().height || window.innerHeight;

    const onMouseMove = (e) => {
      const delta = e.clientY - startY;
      const newHeight = startHeight + (delta / containerHeight) * 100;
      setSummaryHeight(Math.max(10, Math.min(60, newHeight)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [summaryHeight]);

  const allReviewed = checkItems.length > 0 &&
    checkItems.every(item => checkResults[item.id]?.humanReviewed);

  const reviewedCount = checkItems.filter(item => checkResults[item.id]?.humanReviewed).length;

  // Export handler
  const handleExport = useCallback(async () => {
    const exportData = checkItems.map(item => ({
      id: item.id,
      category: item.category,
      item: item.item,
      aiJudgment: checkResults[item.id]?.aiJudgment || 'ng',
      finalJudgment: checkResults[item.id]?.finalJudgment || 'ng',
      page: checkResults[item.id]?.page || null,
      excerpt: checkResults[item.id]?.excerpt || '',
      humanReviewed: checkResults[item.id]?.humanReviewed || false,
      note: checkResults[item.id]?.note || '',
    }));

    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: exportData, componentSummary }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SpecMate_CheckResult.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [checkItems, checkResults, componentSummary]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">📋</span>
          <h1>SpecMate AI</h1>
          <span className="header-badge">Mock</span>
        </div>
        <div className="header-status">
          {specFile && (
            <span className="file-badge">
              📄 {specFile.name}
            </span>
          )}
          {checkItems.length > 0 && (
            <span className={`review-progress ${allReviewed ? 'all-done' : ''}`}>
              確認済: {reviewedCount}/{checkItems.length}
            </span>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="app-main" ref={mainRef}>
        {/* Left pane - Spec Viewer */}
        <div className="left-pane" style={{ width: `${leftWidth}%` }}>
          <SpecViewer
            specUrl={specUrl}
            onFileUpload={handleFileUpload}
            analyzing={analyzing}
          />
        </div>

        {/* Horizontal splitter */}
        <div
          className="splitter-h"
          onMouseDown={handleHSplitterMouseDown}
        />

        {/* Right pane */}
        <div className="right-pane" style={{ width: `${100 - leftWidth}%` }} ref={rightPaneRef}>
          {/* Right top - Component Summary */}
          <div className={`right-top-pane ${summaryCollapsed ? 'hidden' : ''}`} style={{
            height: `${summaryHeight}%`
          }}>
            <ComponentSummary
              summary={componentSummary}
              onCollapse={() => setSummaryCollapsed(true)}
            />
          </div>
          {/* Vertical splitter */}
          <div
            className={`splitter-v ${summaryCollapsed ? 'hidden' : ''}`}
            onMouseDown={handleVSplitterMouseDown}
          />

          {/* Right bottom - Checklist */}
          <div className="right-bottom-pane" style={{
            height: summaryCollapsed ? '100%' : `${100 - summaryHeight}%`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {summaryCollapsed && (
              <button
                className="expand-summary-btn"
                onClick={() => setSummaryCollapsed(false)}
                title="部品サマリを展開"
              >
                ▼ 部品サマリを表示
              </button>
            )}
            <div className="checklist-header">
              <h2>✅ チェックリスト</h2>
            </div>
            <div className="checklist-scroll-area">
              <ChecklistTable
                checkItems={checkItems}
                checkResults={checkResults}
                onUpdateResult={updateCheckResult}
                analyzing={analyzing}
              />
            </div>
            {checkItems.length > 0 && (
              <ExportBar
                onExport={handleExport}
                allReviewed={allReviewed}
                reviewedCount={reviewedCount}
                totalCount={checkItems.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
