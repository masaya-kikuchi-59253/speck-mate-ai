import { useState } from 'react';
import AiProposalPanel from './AiProposalPanel';

const categoryClassMap = {
    '電気的特性': 'category-electrical',
    '環境条件': 'category-environment',
    '機械的特性': 'category-mechanical',
    '実装条件': 'category-mounting',
    '信頼性': 'category-reliability',
    '規制対応': 'category-regulation',
    '品質・管理': 'category-quality',
};

function CheckItemRow({ item, result, onUpdate }) {
    const [expanded, setExpanded] = useState(false);

    if (!result) return null;

    const categoryClass = categoryClassMap[item.category] || 'category-electrical';

    return (
        <div className="check-item-row">
            <div className="check-item-main" onClick={() => setExpanded(!expanded)}>
                <div className="check-item-no">{item.id}</div>
                <div className={`check-item-category ${categoryClass}`}>
                    {item.category}
                </div>
                <div className="check-item-name">{item.item}</div>
                <div style={{ textAlign: 'center' }}>
                    <span className={`judgment-badge judgment-${result.aiJudgment}`}>
                        {result.aiJudgment === 'ok' ? '○' : '×'}
                    </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span className={`judgment-badge judgment-${result.finalJudgment}`}>
                        {result.finalJudgment === 'ok' ? '○' : '×'}
                    </span>
                </div>
                <div className="human-status">
                    <span className={`human-badge ${result.humanReviewed ? 'reviewed' : 'pending'}`}>
                        {result.humanReviewed ? '✓' : '—'}
                    </span>
                </div>
            </div>

            {expanded && (
                <AiProposalPanel
                    item={item}
                    result={result}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}

export default CheckItemRow;
