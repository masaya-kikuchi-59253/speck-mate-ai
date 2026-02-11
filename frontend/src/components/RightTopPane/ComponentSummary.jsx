function ComponentSummary({ summary, onCollapse }) {
    const labelMap = {
        partName: '部品名',
        partNumber: '型番',
        manufacturer: 'メーカー',
        category: 'カテゴリ',
        package: 'パッケージ',
        capacitance: '静電容量',
        ratedVoltage: '定格電圧',
        temperatureCharacteristic: '温度特性',
        status: 'ステータス',
    };

    return (
        <div className="component-summary">
            <div className="component-summary-header">
                <h2>🔧 部品サマリ</h2>
                <button className="collapse-btn" onClick={onCollapse} title="折りたたむ">
                    ▲
                </button>
            </div>

            <div className="summary-content">
                {summary ? (
                    <div className="summary-grid">
                        {Object.entries(summary).map(([key, value]) => (
                            <div key={key} className="summary-item">
                                <div className="summary-label">{labelMap[key] || key}</div>
                                <div className="summary-value">{value}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="summary-empty">
                        <span style={{ fontSize: 28, opacity: 0.4 }}>📦</span>
                        <span>仕様書をアップロードすると部品情報が表示されます</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComponentSummary;
