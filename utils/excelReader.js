const XLSX = require('xlsx');
const fs = require('fs');

function readCurrencyRates(filePath) {

    console.log('\n📊 Reading Excel file...');

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Excel file not found:\n${filePath}`
        );
    }

    const workbook = XLSX.readFile(filePath);

    // Use Rates sheet if available, otherwise use first sheet
    let sheetName = workbook.SheetNames.find(
        name => name.trim().toLowerCase() === 'rates'
    );

    if (!sheetName) {
        sheetName = workbook.SheetNames[0];

        console.log(
            `⚠️ "Rates" sheet not found. Using "${sheetName}".`
        );
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(
        worksheet,
        {
            defval: ''
        }
    );

    if (rows.length === 0) {
        throw new Error(
            'Excel sheet is empty.'
        );
    }

    console.log(
        `✅ Sheet loaded: ${sheetName}`
    );

    // Required columns
    const requiredColumns = [
        'Currency',
        'Amount',
        'ExpectedRate'
    ];

    for (const column of requiredColumns) {

        if (!(column in rows[0])) {
            throw new Error(
                `Missing required Excel column: ${column}`
            );
        }
    }

    const supportedCurrencies = [
        'GBP',
        'EUR',
        'AUD'
    ];

    const testData = [];

    for (const row of rows) {

        const currency =
            String(row.Currency)
                .trim()
                .toUpperCase();

        const amount =
            Number(row.Amount);

        const expectedRate =
            Number(row.ExpectedRate);

        // Ignore blank rows
        if (!currency) {
            continue;
        }

        // Currency validation
        if (!supportedCurrencies.includes(currency)) {

            console.log(
                `⚠️ Skipping unsupported currency: ${currency}`
            );

            continue;
        }

        // Amount validation
        if (
            Number.isNaN(amount) || 
            amount <= 0
        ) {

            console.log(
                `⚠️ Invalid amount for ${currency}: ${row.Amount}`
            );

            continue;
        }

        // Rate validation
        if (
            Number.isNaN(expectedRate) ||
            expectedRate <= 0
        ) {

            console.log(
                `⚠️ Invalid expected rate for ${currency}: ${row.ExpectedRate}`
            );

            continue;
        }

        testData.push({
            currency,
            amount,
            expectedRate
        });
    }

    if (testData.length === 0) {
        throw new Error(
            'No valid GBP, EUR or AUD data found in Excel.'
        );
    }

    console.log(
        '\n✅ Valid currency data imported from Excel:'
    );

    console.table(testData);

    return testData;
}

module.exports = {
    readCurrencyRates
};