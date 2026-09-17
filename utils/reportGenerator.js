const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function generateReport(results) {

    const reportsDir = path.join(__dirname, '..', 'reports');

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // =========================================================
    // CLEAN RESULTS FOR REPORT
    // =========================================================

    const cleanResults = results.map(result => {

        let paymentDetected = 'NO';
        let paymentDomain = 'N/A';

        if (
            result.PaymentURL &&
            result.PaymentURL !== 'N/A' &&
            result.PaymentURL !== ''
        ) {
            paymentDetected = 'YES';

            try {
                paymentDomain = new URL(result.PaymentURL).hostname;
            } catch {
                paymentDomain = 'N/A';
            }
        }

        let failureReason = '';

        if (result.Status === 'FAIL') {

            if (
                result.ActualRate === 'N/A' ||
                result.ActualRate === null ||
                result.ActualRate === undefined
            ) {
                if (
                    result.PKRAmount === 'N/A' &&
                    paymentDetected === 'YES'
                ) {
                    failureReason =
                        'Payment page did not expose PKR/rate data';
                } else {
                    failureReason =
                        'Currency rate could not be extracted';
                }
            } else if (
                typeof result.Difference === 'number' &&
                result.Difference > 1
            ) {
                failureReason = 'Rate mismatch';
            } else {
                failureReason = 'Validation failed';
            }
        }

        if (result.Status === 'ERROR') {
            failureReason =
                result.Error || 'Unexpected automation error';
        }

        return {

            Website: result.Website || 'N/A',

            URL: result.URL || 'N/A',

            Currency: result.Currency || 'N/A',

            Amount: result.Amount ?? 'N/A',

            ExpectedRate: result.ExpectedRate ?? 'N/A',

            ActualRate: result.ActualRate ?? 'N/A',

            Difference: result.Difference ?? 'N/A',

            ForeignAmount: result.ForeignAmount ?? 'N/A',

            PKRAmount: result.PKRAmount ?? 'N/A',

            ConversionFee:
                result.ConversionFee !== undefined
                    ? `${result.ConversionFee}%`
                    : 'N/A',

            PaymentDetected: paymentDetected,

            PaymentDomain: paymentDomain,

            Status: result.Status || 'N/A',

            FailureReason: failureReason
        };
    });


    // =========================================================
    // SUMMARY
    // =========================================================

    const totalTests = cleanResults.length;

    const passed = cleanResults.filter(
        result => result.Status === 'PASS'
    ).length;

    const failed = cleanResults.filter(
        result => result.Status === 'FAIL'
    ).length;

    const errors = cleanResults.filter(
        result => result.Status === 'ERROR'
    ).length;


    // =========================================================
    // EXCEL WORKBOOK
    // =========================================================

    const workbook = XLSX.utils.book_new();


    // Results sheet
    const resultsWorksheet =
        XLSX.utils.json_to_sheet(cleanResults);

    XLSX.utils.book_append_sheet(
        workbook,
        resultsWorksheet,
        'Results'
    );


    // Summary sheet
    const summaryData = [

        ['CURRENCY RATE TEST SUMMARY', ''],

        ['Websites',
            new Set(
                cleanResults.map(result => result.Website)
            ).size
        ],

        ['Currencies',
            new Set(
                cleanResults.map(result => result.Currency)
            ).size
        ],

        ['Total Tests', totalTests],

        ['PASS', passed],

        ['FAIL', failed],

        ['ERROR', errors]
    ];


    const summaryWorksheet =
        XLSX.utils.aoa_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        'Summary'
    );


    // =========================================================
    // FILE PATHS
    // =========================================================

    const xlsxPath =
        path.join(
            reportsDir,
            'currency-rate-report.xlsx'
        );

    const jsonPath =
        path.join(
            reportsDir,
            'currency-rate-report.json'
        );

    const csvPath =
        path.join(
            reportsDir,
            'currency-rate-report.csv'
        );


    // =========================================================
    // WRITE EXCEL
    // =========================================================

    try {

        XLSX.writeFile(
            workbook,
            xlsxPath
        );

    } catch (error) {

        if (
            error.code === 'EBUSY' ||
            error.code === 'EPERM'
        ) {

            const timestamp =
                new Date()
                    .toISOString()
                    .replace(/[:.]/g, '-');

            const alternativePath =
                path.join(
                    reportsDir,
                    `currency-rate-report-${timestamp}.xlsx`
                );

            console.log(
                '\n⚠️ Existing Excel report is locked.'
            );

            console.log(
                `📄 New Excel report created: ${alternativePath}`
            );

            XLSX.writeFile(
                workbook,
                alternativePath
            );

        } else {

            throw error;
        }
    }


    // =========================================================
    // WRITE JSON
    // =========================================================

    fs.writeFileSync(
        jsonPath,
        JSON.stringify(
            cleanResults,
            null,
            2
        ),
        'utf8'
    );


    // =========================================================
    // WRITE CSV
    // =========================================================

    const csvWorksheet =
        XLSX.utils.json_to_sheet(cleanResults);

    const csvData =
        XLSX.utils.sheet_to_csv(
            csvWorksheet
        );

    fs.writeFileSync(
        csvPath,
        csvData,
        'utf8'
    );


    // =========================================================
    // FINAL SUMMARY
    // =========================================================

    console.log('\n');
    console.log('==========================================');
    console.log('        CURRENCY RATE TEST SUMMARY');
    console.log('==========================================');

    console.log(
        `Websites    : ${
            new Set(
                cleanResults.map(
                    result => result.Website
                )
            ).size
        }`
    );

    console.log(
        `Currencies  : ${
            new Set(
                cleanResults.map(
                    result => result.Currency
                )
            ).size
        }`
    );

    console.log(
        `Total Tests : ${totalTests}`
    );

    console.log(
        `PASS        : ${passed}`
    );

    console.log(
        `FAIL        : ${failed}`
    );

    console.log(
        `ERROR       : ${errors}`
    );

    console.log(
        '=========================================='
    );


    console.log('\n📄 Excel report:');
    console.log(xlsxPath);

    console.log('\n📄 JSON report:');
    console.log(jsonPath);

    console.log('\n📄 CSV report:');
    console.log(csvPath);

    console.log('\n🏁 All website tests completed.');
}


module.exports = {
    generateReport
};