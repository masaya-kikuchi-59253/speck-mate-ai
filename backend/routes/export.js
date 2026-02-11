const express = require('express');
const ExcelJS = require('exceljs');
const router = express.Router();

// POST /api/export - Export check results as Excel
router.post('/export', async (req, res) => {
    const { results, componentSummary } = req.body;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SpecMate AI';
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('部品サマリ');
    summarySheet.columns = [
        { header: '項目', key: 'key', width: 25 },
        { header: '値', key: 'value', width: 40 },
    ];
    if (componentSummary) {
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
        Object.entries(componentSummary).forEach(([k, v]) => {
            summarySheet.addRow({ key: labelMap[k] || k, value: v });
        });
    }

    // Style summary header
    summarySheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    });

    // Check results sheet
    const checkSheet = workbook.addWorksheet('チェック結果');
    checkSheet.columns = [
        { header: 'No.', key: 'id', width: 6 },
        { header: 'カテゴリ', key: 'category', width: 15 },
        { header: 'チェック項目', key: 'item', width: 35 },
        { header: 'AI判定', key: 'aiJudgment', width: 10 },
        { header: '最終判定', key: 'finalJudgment', width: 10 },
        { header: '該当ページ', key: 'page', width: 12 },
        { header: '抜粋', key: 'excerpt', width: 60 },
        { header: '介入状態', key: 'humanReviewed', width: 12 },
        { header: '備考', key: 'note', width: 30 },
    ];

    if (results && Array.isArray(results)) {
        results.forEach(r => {
            checkSheet.addRow({
                id: r.id,
                category: r.category,
                item: r.item,
                aiJudgment: r.aiJudgment === 'ok' ? '○' : '×',
                finalJudgment: r.finalJudgment === 'ok' ? '○' : '×',
                page: r.page || '-',
                excerpt: r.excerpt || '-',
                humanReviewed: r.humanReviewed ? '確認済' : '未確認',
                note: r.note || '',
            });
        });
    }

    // Style check results header
    checkSheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.alignment = { horizontal: 'center' };
    });

    // Conditional formatting for judgment columns
    checkSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const aiCell = row.getCell('aiJudgment');
        const finalCell = row.getCell('finalJudgment');
        [aiCell, finalCell].forEach(cell => {
            cell.alignment = { horizontal: 'center' };
            if (cell.value === '○') {
                cell.font = { bold: true, color: { argb: 'FF16A34A' } };
            } else {
                cell.font = { bold: true, color: { argb: 'FFDC2626' } };
            }
        });
    });

    // Auto-filter
    checkSheet.autoFilter = {
        from: 'A1',
        to: 'I1',
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=SpecMate_CheckResult.xlsx');

    await workbook.xlsx.write(res);
    res.end();
});

module.exports = router;
