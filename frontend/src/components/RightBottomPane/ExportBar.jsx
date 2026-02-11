import { useState } from 'react';

function ExportBar({ onExport, allReviewed, reviewedCount, totalCount }) {
    const [toast, setToast] = useState(null);

    const handleCheckAll = () => {
        if (allReviewed) {
            setToast({ type: 'success', message: '✓ 全項目の確認が完了しています' });
        } else {
            setToast({
                type: 'warning',
                message: `⚠ 未確認の項目が ${totalCount - reviewedCount} 件あります`,
            });
        }
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <>
            <div className="export-bar">
                <button
                    className={`check-all-btn ${allReviewed ? 'all-done' : ''}`}
                    onClick={handleCheckAll}
                >
                    {allReviewed ? '✓ 全項目確認済み' : '確認状況チェック'}
                    <span className="check-count">
                        {reviewedCount}/{totalCount}
                    </span>
                </button>

                <button className="export-btn" onClick={onExport}>
                    📊 Excel エクスポート
                </button>
            </div>

            {toast && (
                <div className="toast-overlay">
                    <div className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                </div>
            )}
        </>
    );
}

export default ExportBar;
