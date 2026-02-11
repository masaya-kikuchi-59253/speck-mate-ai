import CheckItemRow from './CheckItemRow';

function ChecklistTable({ checkItems, checkResults, onUpdateResult, analyzing }) {
    if (checkItems.length === 0) {
        return (
            <div className="checklist-table-wrapper">
                <div className="checklist-empty">
                    <span className="empty-icon">📋</span>
                    <span>仕様書をアップロードするとチェック項目が表示されます</span>
                    {analyzing && (
                        <span className="analyzing-pulse" style={{ color: 'var(--accent-blue)', fontSize: 12, marginTop: 4 }}>
                            AI 解析中...
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="checklist-table-wrapper">
            <div className="checklist-header-row">
                <div>No.</div>
                <div>カテゴリ</div>
                <div>チェック項目</div>
                <div style={{ textAlign: 'center' }}>AI判定</div>
                <div style={{ textAlign: 'center' }}>最終判定</div>
                <div style={{ textAlign: 'center' }}>状態</div>
            </div>
            {checkItems.map(item => (
                <CheckItemRow
                    key={item.id}
                    item={item}
                    result={checkResults[item.id]}
                    onUpdate={(updates) => onUpdateResult(item.id, updates)}
                />
            ))}
        </div>
    );
}

export default ChecklistTable;
