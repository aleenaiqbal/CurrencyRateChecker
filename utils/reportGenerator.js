const fs = require('fs');
const path = require('path');

function generateReport(results) {

    const reportsFolder =
        path.join(
            __dirname,
            '..',
            'reports'
        );


    if (!fs.existsSync(reportsFolder)) {

        fs.mkdirSync(
            reportsFolder,
            {
                recursive: true
            }
        );
    }


    // =========================================================
    // JSON REPORT
    // =========================================================

    const jsonPath =
        path.join(
            reportsFolder,
            'currency-rate-report.json'
        );


    fs.writeFileSync(

        jsonPath,

        JSON.stringify(
            results,
            null,
            2
        ),

        'utf8'
    );


    // =========================================================
    // CSV REPORT
    // =========================================================

    const headers = [

        'Currency',
        'Amount',
        'ExpectedRate',
        'ActualRate',
        'Difference',
        'ForeignAmount',
        'PKRAmount',
        'Status',
        'Error'
    ];


    const csvRows = [];


    csvRows.push(
        headers.join(',')
    );


    for (
        const result
        of results
    ) {

        const row =
            headers.map(
                header => {

                    let value =
                        result[header];

                    if (
                        value === undefined ||
                        value === null
                    ) {

                        value = '';
                    }


                    value =
                        String(value)
                            .replace(
                                /"/g,
                                '""'
                            );


                    return `"${value}"`;
                }
            );


        csvRows.push(
            row.join(',')
        );
    }


    const csvPath =
        path.join(
            reportsFolder,
            'currency-rate-report.csv'
        );


    fs.writeFileSync(

        csvPath,

        csvRows.join('\n'),

        'utf8'
    );


    // =========================================================
    // SUMMARY
    // =========================================================

    const passed =
        results.filter(
            result =>
                result.Status === 'PASS'
        ).length;


    const failed =
        results.filter(
            result =>
                result.Status === 'FAIL'
        ).length;


    const errors =
        results.filter(
            result =>
                result.Status === 'ERROR'
        ).length;


    console.log('\n');

    console.log(
        '=========================================='
    );

    console.log(
        '        CURRENCY RATE TEST SUMMARY'
    );

    console.log(
        '=========================================='
    );

    console.log(
        `Total Tests : ${results.length}`
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


    console.log(
        `\n📄 JSON report:`
    );

    console.log(
        jsonPath
    );


    console.log(
        `\n📄 CSV report:`
    );

    console.log(
        csvPath
    );


    return {
        jsonPath,
        csvPath
    };
}


module.exports = {
    generateReport
};