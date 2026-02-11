const express = require('express');
const path = require('path');
// const fs = require('fs'); // Not used in mock mode
// const multer = require('multer'); // Not used in mock mode
const router = express.Router();

const checkItems = require('../data/mockCheckItems.json');

// GET /api/check-items
router.get('/check-items', (req, res) => {
    res.json(checkItems);
});

// POST /api/upload - Mock upload (returns fixed component summary)
router.post('/upload', (req, res) => {
    // Simulate upload delay
    setTimeout(() => {
        res.json({
            filename: 'mock_spec.pdf',
            originalname: 'mock_spec.pdf',
            url: '', // Frontend should use local blob URL
            // Mock component summary
            componentSummary: {
                partName: 'セラミックコンデンサ',
                partNumber: 'GRM188R71C104KA01D',
                manufacturer: '村田製作所',
                category: 'コンデンサ',
                package: '0603 (1608 metric)',
                capacitance: '100nF',
                ratedVoltage: '16V',
                temperatureCharacteristic: 'X7R',
                status: '量産中',
            }
        });
    }, 1200); // 1.2s delay for "uploading" effect
});

// POST /api/analyze - Mock AI analysis
router.post('/analyze', (req, res) => {
    const { checkItemId } = req.body;

    // Mock AI proposals (up to 3 per item)
    const mockProposals = {
        1: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.95, page: 3, excerpt: '定格電圧: DC 16V、定格電流: 記載なし（コンデンサのため電圧定格のみ）。表2「電気的特性」に記載。' },
                { confidence: 0.72, page: 5, excerpt: '電圧-容量特性グラフ（図3）において、DC 16V における容量変化率が示されている。' },
                { confidence: 0.41, page: 8, excerpt: '絶対最大定格表に「定格電圧 DC 16V」の記載あり。' },
            ]
        },
        2: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.91, page: 5, excerpt: '絶対最大定格: 動作電圧 DC 25V、保存温度 -55℃〜+125℃。表3に記載。' },
                { confidence: 0.65, page: 8, excerpt: '最大定格を超えた場合の注意事項が「取扱注意事項」セクションに記載。' },
            ]
        },
        3: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.98, page: 4, excerpt: '動作温度範囲: -55℃〜+125℃（X7R特性）。表1「基本仕様」に明記。' },
                { confidence: 0.55, page: 12, excerpt: '温度特性グラフ（図7）に-55℃〜+125℃の範囲でのESR変化を記載。' },
            ]
        },
        4: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.88, page: 10, excerpt: '保管条件: 温度 5℃〜40℃、湿度 20%〜70%RH。「保管・取扱い」セクション参照。' },
                { confidence: 0.62, page: 11, excerpt: '推奨保管期間: 製造日より6ヶ月以内。湿度管理梱包の場合は12ヶ月。' },
                { confidence: 0.33, page: 14, excerpt: '長期保管時のはんだ濡れ性劣化に関する注意事項の記載あり。' },
            ]
        },
        5: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.99, page: 2, excerpt: '外形寸法図: L 1.6±0.1mm × W 0.8±0.1mm × T 0.8±0.1mm。図1に詳細な寸法図を掲載。' },
                { confidence: 0.80, page: 3, excerpt: '端子電極寸法: a 0.1〜0.3mm。パッケージ図面に端子の詳細寸法あり。' },
            ]
        },
        6: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.93, page: 2, excerpt: '2端子構造。外形寸法図（図1）に端子位置・極性マーク位置を記載。' },
            ]
        },
        7: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.96, page: 9, excerpt: 'リフローはんだ付け推奨条件: ピーク温度 250℃±5℃、260℃以下10秒以内。図5にプロファイルを記載。' },
                { confidence: 0.78, page: 9, excerpt: 'フローはんだ付け条件: 260℃±5℃、10秒以内。ディップはんだ付けの条件も併記。' },
                { confidence: 0.45, page: 14, excerpt: '手はんだ付け時の注意事項: 350℃以下、3秒以内を推奨。' },
            ]
        },
        8: {
            judgment: 'ng',
            proposals: [
                { confidence: 0.68, page: 12, excerpt: '信頼性試験の項目リストは記載あるが、試験結果データ（合否判定、故障率等）の具体的な記載が見当たらない。' },
                { confidence: 0.42, page: 13, excerpt: '「別途、信頼性試験データシートをご参照ください」との注記あり。本仕様書には含まれていない。' },
            ]
        },
        9: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.97, page: 11, excerpt: 'RoHS指令（2011/65/EU）適合。鉛フリー対応。REACH SVHC含有なし。環境管理物質調査票あり。' },
                { confidence: 0.71, page: 11, excerpt: 'ハロゲンフリー対応（IEC 61249-2-21準拠）。材料宣言書の提出可能。' },
            ]
        },
        10: {
            judgment: 'ok',
            proposals: [
                { confidence: 0.85, page: 14, excerpt: '品質保証: AQL 0.10% (致命欠点)、0.25% (重欠点)。受入検査基準は別途協定。' },
                { confidence: 0.58, page: 15, excerpt: '品質保証期間: 納入後1年間。ただし推奨保管条件を満たす場合に限る。' },
            ]
        },
    };

    const result = mockProposals[checkItemId] || {
        judgment: 'ng',
        proposals: [
            { confidence: 0.30, page: null, excerpt: '該当する記載が見つかりませんでした。' },
        ]
    };

    // Simulate AI processing delay
    setTimeout(() => {
        res.json(result);
    }, 800);
});

module.exports = router;
