import { useRef, useState, useCallback } from 'react';

function SpecViewer({ specUrl, onFileUpload, analyzing }) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileUpload(file);
    }, [onFileUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) onFileUpload(file);
    }, [onFileUpload]);

    return (
        <div className="spec-viewer">
            <div className="spec-viewer-header">
                <h2>📑 納入仕様書</h2>
            </div>

            {specUrl ? (
                <div className="spec-viewer-content" style={{ position: 'relative' }}>
                    <embed
                        src={specUrl}
                        type="application/pdf"
                        style={{ width: '100%', height: '100%' }}
                    />
                    {analyzing && (
                        <div className="analyzing-overlay">
                            <div className="analyzing-spinner" />
                            <p>AI が仕様書を解析中...</p>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="upload-icon">📤</div>
                    <h3>納入仕様書をアップロード</h3>
                    <p>ドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
                    <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        ファイルを選択
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </div>
            )}
        </div>
    );
}

export default SpecViewer;
