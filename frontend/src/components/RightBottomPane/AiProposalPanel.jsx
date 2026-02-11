import { useState } from 'react';

function AiProposalPanel({ item, result, onUpdate }) {
    const [showManual, setShowManual] = useState(result.manualInput || false);

    const handleSelectProposal = (index) => {
        const proposal = result.proposals[index];
        onUpdate({
            selectedProposalIndex: index,
            finalJudgment: result.aiJudgment,
            page: proposal.page,
            excerpt: proposal.excerpt,
            manualInput: false,
        });
        setShowManual(false);
    };

    const handleManualToggle = (checked) => {
        setShowManual(checked);
        if (checked) {
            onUpdate({
                manualInput: true,
                selectedProposalIndex: -1,
            });
        } else {
            // Revert to top AI proposal
            if (result.proposals.length > 0) {
                const topProposal = result.proposals[0];
                onUpdate({
                    manualInput: false,
                    selectedProposalIndex: 0,
                    finalJudgment: result.aiJudgment,
                    page: topProposal.page,
                    excerpt: topProposal.excerpt,
                });
            }
        }
    };

    const handleManualJudgment = (value) => {
        onUpdate({ finalJudgment: value });
    };

    const handleManualPage = (value) => {
        onUpdate({ manualPage: value, page: value ? parseInt(value) : null });
    };

    const handleManualExcerpt = (value) => {
        onUpdate({ manualExcerpt: value, excerpt: value });
    };

    const handleNote = (value) => {
        onUpdate({ note: value });
    };

    return (
        <div className="ai-proposal-panel">
            {/* Item description */}
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{item.item}</strong>
                <br />
                {item.description}
            </div>

            {/* AI Proposals */}
            {result.proposals.length > 0 && (
                <>
                    <div className="proposal-section-title">
                        🤖 AI 提案（適合度順）
                    </div>
                    <div className="proposals-list">
                        {result.proposals.map((proposal, index) => {
                            const isSelected = !result.manualInput && result.selectedProposalIndex === index;
                            const rankLabel = index === 0 ? '高' : index === 1 ? '中' : '低';

                            return (
                                <div
                                    key={index}
                                    className={`proposal-card rank-${index + 1} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelectProposal(index)}
                                >
                                    <div className="proposal-rank">
                                        <span className="rank-badge">{rankLabel}</span>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${proposal.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="proposal-content">
                                        {proposal.page && (
                                            <div className="proposal-page">📄 p.{proposal.page}</div>
                                        )}
                                        <div className="proposal-excerpt">{proposal.excerpt}</div>
                                        <div className="proposal-confidence-text">
                                            適合度: {(proposal.confidence * 100).toFixed(0)}%
                                        </div>
                                    </div>

                                    <button
                                        className="proposal-select-btn"
                                        onClick={(e) => { e.stopPropagation(); handleSelectProposal(index); }}
                                    >
                                        {isSelected ? '採用中' : '採用'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Manual input */}
            <div className="manual-input-section">
                <label className="manual-toggle">
                    <input
                        type="checkbox"
                        checked={showManual}
                        onChange={(e) => handleManualToggle(e.target.checked)}
                    />
                    手動で入力する
                </label>

                {showManual && (
                    <div className="manual-fields">
                        <div className="manual-field">
                            <label>最終判定</label>
                            <select
                                value={result.finalJudgment}
                                onChange={(e) => handleManualJudgment(e.target.value)}
                            >
                                <option value="ok">○ 適合</option>
                                <option value="ng">× 不適合</option>
                            </select>
                        </div>

                        <div className="manual-field">
                            <label>該当ページ</label>
                            <input
                                type="text"
                                placeholder="例: 3"
                                value={result.manualPage || ''}
                                onChange={(e) => handleManualPage(e.target.value)}
                            />
                        </div>

                        <div className="manual-field full-width">
                            <label>抜粋</label>
                            <textarea
                                rows={2}
                                placeholder="仕様書からの抜粋を入力..."
                                value={result.manualExcerpt || ''}
                                onChange={(e) => handleManualExcerpt(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Note field (always visible) */}
                <div className="manual-fields" style={{ marginTop: 8 }}>
                    <div className="manual-field full-width">
                        <label>備考</label>
                        <input
                            type="text"
                            placeholder="補足コメントなど"
                            value={result.note || ''}
                            onChange={(e) => handleNote(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiProposalPanel;
