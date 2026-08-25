const { chromium } = require('playwright');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    excelFile: path.join(__dirname, 'data', 'currencyRates.xlsx'),

    orderPage: 'https://onlineexamhelp.co.uk/order/',

    firstName: 'Aleena',
    lastName: 'Test',

    email: 'playwrighttest@example.com',
    phone: '03001234567',

    service: 'Essay',

    reportsDir: path.join(__dirname, 'reports'),

    headless: false,

    pageTimeout: 30000,
    elementTimeout: 10000,

    // Difference allowed between Excel expected rate
    // and Stripe rate AFTER removing conversion fee.
    tolerance: 1
};


// ============================================================
// CREATE REPORT DIRECTORY
// ============================================================

if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
}


// ============================================================
// READ EXCEL
// ============================================================

function readCurrencyExcel() {

    console.log('\n📊 Reading Excel file...');

    if (!fs.existsSync(CONFIG.excelFile)) {
        throw new Error(
            `Excel file not found: ${CONFIG.excelFile}`
        );
    }

    const workbook = XLSX.readFile(CONFIG.excelFile);

    let sheetName;

    if (workbook.SheetNames.includes('Rates')) {
        sheetName = 'Rates';
    } else {

        console.log(
            '⚠️ "Rates" sheet not found. Using "Sheet1".'
        );

        if (workbook.SheetNames.includes('Sheet1')) {
            sheetName = 'Sheet1';
        } else {
            sheetName = workbook.SheetNames[0];
        }
    }

    console.log(`✅ Sheet loaded: ${sheetName}`);

    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    const currencies = data
        .map(row => {

            const currency =
                row.currency ??
                row.Currency ??
                row.CURRENCY;

            const amount =
                row.amount ??
                row.Amount ??
                row.AMOUNT;

            const expectedRate =
                row.expectedRate ??
                row.ExpectedRate ??
                row['Expected Rate'] ??
                row.expected_rate;

            return {
                currency: currency
                    ? String(currency).trim().toUpperCase()
                    : '',

                amount: Number(amount),

                expectedRate: Number(expectedRate)
            };
        })
        .filter(row => {

            return (
                row.currency &&
                !isNaN(row.amount) &&
                !isNaN(row.expectedRate)
            );
        });

    if (currencies.length === 0) {
        throw new Error(
            'No valid currency data found in Excel file.'
        );
    }

    console.log(
        '\n✅ Valid currency data imported from Excel:'
    );

    console.table(currencies);

    return currencies;
}


// ============================================================
// FIND VISIBLE LOCATOR
// ============================================================

async function findVisibleLocator(page, selectors) {

    for (const selector of selectors) {

        try {

            const locator = page.locator(selector);

            const count = await locator.count();

            for (let i = 0; i < count; i++) {

                const element = locator.nth(i);

                try {

                    if (
                        await element.isVisible() &&
                        await element.isEnabled()
                    ) {
                        return element;
                    }

                } catch {
                    // Continue
                }
            }

        } catch {
            // Continue with next selector
        }
    }

    return null;
}


// ============================================================
// WAIT FOR FORM
// ============================================================

async function waitForForm(page) {

    const selectors = [
        'input[name*="first" i]',
        'input[id*="first" i]',
        'input[placeholder*="first" i]',
        'input[aria-label*="first" i]'
    ];

    const startTime = Date.now();

    while (
        Date.now() - startTime <
        CONFIG.elementTimeout
    ) {

        const field =
            await findVisibleLocator(
                page,
                selectors
            );

        if (field) {
            return field;
        }

        await page.waitForTimeout(500);
    }

    return null;
}


// ============================================================
// FILL FIELD
// ============================================================

async function fillField(
    page,
    selectors,
    value,
    fieldName,
    required = false
) {

    let element =
        await findVisibleLocator(
            page,
            selectors
        );

    // Retry once if field isn't immediately available.
    if (!element) {

        await page.waitForTimeout(1000);

        element =
            await findVisibleLocator(
                page,
                selectors
            );
    }

    if (!element) {

        if (required) {

            throw new Error(
                `${fieldName} field was not found.`
            );
        }

        console.log(
            `⚠️ ${fieldName} field not found.`
        );

        return false;
    }

    try {

        await element.waitFor({
            state: 'visible',
            timeout: CONFIG.elementTimeout
        });

        await element.fill(String(value));

        console.log(
            `✅ ${fieldName}: ${value}`
        );

        return true;

    } catch (error) {

        if (required) {

            throw new Error(
                `${fieldName} field could not be filled: ${error.message}`
            );
        }

        console.log(
            `⚠️ Could not fill ${fieldName}: ${error.message}`
        );

        return false;
    }
}


// ============================================================
// FILL BASIC FORM
// ============================================================

async function fillBasicForm(page) {

    console.log('\n📝 Filling basic form...');

    // --------------------------------------------------------
    // Wait for form to appear
    // --------------------------------------------------------

    await waitForForm(page);

    // --------------------------------------------------------
    // First Name
    // --------------------------------------------------------

    await fillField(
        page,
        [
            'input:not([type="hidden"])[placeholder*="First Name" i]',
            'input:not([type="hidden"])[placeholder*="First name" i]',
            'input:not([type="hidden"])[name*="first" i]',
            'input:not([type="hidden"])[id*="first" i]',
            'input:not([type="hidden"])[aria-label*="First Name" i]',
            'input:not([type="hidden"])[aria-label*="First name" i]'
        ],
        CONFIG.firstName,
        'First Name',
        true
    );

    // --------------------------------------------------------
    // Last Name
    // --------------------------------------------------------

    await fillField(
        page,
        [
            'input:not([type="hidden"])[placeholder*="Last Name" i]',
            'input:not([type="hidden"])[placeholder*="Last name" i]',
            'input:not([type="hidden"])[name*="last" i]',
            'input:not([type="hidden"])[id*="last" i]',
            'input:not([type="hidden"])[aria-label*="Last Name" i]',
            'input:not([type="hidden"])[aria-label*="Last name" i]'
        ],
        CONFIG.lastName,
        'Last Name',
        true
    );

    // --------------------------------------------------------
    // Email
    // --------------------------------------------------------

    await fillField(
        page,
        [
            'input:not([type="hidden"])[type="email"]',
            'input:not([type="hidden"])[placeholder*="email" i]',
            'input:not([type="hidden"])[name*="email" i]',
            'input:not([type="hidden"])[id*="email" i]'
        ],
        CONFIG.email,
        'Email',
        false
    );

    // --------------------------------------------------------
    // Phone
    // --------------------------------------------------------

    await fillField(
        page,
        [
            'input:not([type="hidden"])[type="tel"]',
            'input:not([type="hidden"])[placeholder*="phone" i]',
            'input:not([type="hidden"])[placeholder*="mobile" i]',
            'input:not([type="hidden"])[name*="phone" i]',
            'input:not([type="hidden"])[name*="mobile" i]',
            'input:not([type="hidden"])[id*="phone" i]'
        ],
        CONFIG.phone,
        'Phone',
        false
    );
}


// ============================================================
// SELECT SERVICE
// ============================================================

async function selectService(page) {

    console.log('\n🛠️ Selecting service...');

    const selects = page.locator('select');

    const count = await selects.count();

    for (let i = 0; i < count; i++) {

        const select = selects.nth(i);

        try {

            if (!await select.isVisible()) {
                continue;
            }

            const options =
                await select.locator('option').evaluateAll(
                    options =>
                        options.map(option => ({
                            value: option.value,
                            text: option.textContent.trim()
                        }))
                );

            const option = options.find(item =>
                item.text
                    .toLowerCase()
                    .includes(CONFIG.service.toLowerCase())
            );

            if (!option) {
                continue;
            }

            await select.selectOption(option.value);

            console.log(
                `🛠️ Service selected: ${CONFIG.service}`
            );

            return true;

        } catch {
            // Continue
        }
    }

    console.log(
        `⚠️ Service "${CONFIG.service}" was not found.`
    );

    return false;
}


// ============================================================
// FIND CURRENCY SELECT
// ============================================================

async function findCurrencySelect(page) {

    const selects = page.locator('select');

    const count = await selects.count();

    for (let i = 0; i < count; i++) {

        const select = selects.nth(i);

        try {

            if (!await select.isVisible()) {
                continue;
            }

            const options =
                await select.locator('option').evaluateAll(
                    options =>
                        options.map(option => ({
                            value: option.value,
                            text: option.textContent.trim()
                        }))
                );

            const text = options
                .map(option => option.text)
                .join(' ')
                .toUpperCase();

            if (
                text.includes('GBP') ||
                text.includes('EUR') ||
                text.includes('AUD') ||
                text.includes('POUND') ||
                text.includes('EURO') ||
                text.includes('AUSTRALIAN')
            ) {
                return select;
            }

        } catch {
            // Continue
        }
    }

    return null;
}


// ============================================================
// SELECT CURRENCY
// ============================================================

async function selectCurrency(page, currency) {

    console.log(
        `\n💱 Selecting currency: ${currency}`
    );

    const select =
        await findCurrencySelect(page);

    if (!select) {

        throw new Error(
            `Currency dropdown not found for ${currency}.`
        );
    }

    const options =
        await select.locator('option').evaluateAll(
            options =>
                options.map(option => ({
                    value: option.value,
                    text: option.textContent.trim()
                }))
        );

    const matchingOption =
        options.find(option => {

            const text =
                option.text.toUpperCase();

            const value =
                option.value.toUpperCase();

            if (
                text.includes(currency) ||
                value.includes(currency)
            ) {
                return true;
            }

            if (
                currency === 'GBP' &&
                (
                    text.includes('POUND') ||
                    value.includes('POUND')
                )
            ) {
                return true;
            }

            if (
                currency === 'EUR' &&
                (
                    text.includes('EURO') ||
                    value.includes('EURO')
                )
            ) {
                return true;
            }

            if (
                currency === 'AUD' &&
                (
                    text.includes('AUSTRALIAN') ||
                    value.includes('AUSTRALIAN')
                )
            ) {
                return true;
            }

            return false;
        });

    if (!matchingOption) {

        throw new Error(
            `${currency} option not found in currency dropdown.`
        );
    }

    await select.selectOption(
        matchingOption.value
    );

    await select.dispatchEvent('change');

    await page.waitForTimeout(500);

    console.log(
        `✅ Currency selected: ${currency}`
    );

    return true;
}


// ============================================================
// FIND AMOUNT
// ============================================================

async function findAmountInput(page) {

    return await findVisibleLocator(
        page,
        [
            'input:not([type="hidden"])[name*="amount" i]',
            'input:not([type="hidden"])[id*="amount" i]',
            'input:not([type="hidden"])[placeholder*="amount" i]',
            'input:not([type="hidden"])[placeholder*="quantity" i]',
            'input:not([type="hidden"])[type="number"]'
        ]
    );
}


// ============================================================
// ENTER AMOUNT
// ============================================================

async function fillAmount(page, amount) {

    const input =
        await findAmountInput(page);

    if (!input) {

        throw new Error(
            'Amount input was not found.'
        );
    }

    await input.fill(String(amount));

    await input.dispatchEvent('input');
    await input.dispatchEvent('change');

    await page.waitForTimeout(500);

    console.log(
        `💰 Amount entered: ${amount}`
    );

    return true;
}


// ============================================================
// CHECK TERMS
// ============================================================

async function checkTermsAndConditions(page) {

    console.log(
        '\n☑️ Checking Terms & Conditions...'
    );

    const allCheckboxes =
        page.locator('input[type="checkbox"]');

    const count =
        await allCheckboxes.count();

    let checkbox = null;

    // First find checkbox explicitly related to terms.
    for (let i = 0; i < count; i++) {

        const candidate =
            allCheckboxes.nth(i);

        try {

            if (!await candidate.isVisible()) {
                continue;
            }

            const info =
                await candidate.evaluate(el => {

                    const parent =
                        el.closest('label') ||
                        el.parentElement;

                    return {
                        name: el.getAttribute('name') || '',
                        id: el.getAttribute('id') || '',
                        text: parent
                            ? parent.innerText
                            : ''
                    };
                });

            const combined =
                `${info.name} ${info.id} ${info.text}`;

            if (
                /terms?\s*(and|&)?\s*conditions?/i
                    .test(combined)
            ) {

                checkbox = candidate;
                break;
            }

        } catch {
            // Continue
        }
    }

    // If only one checkbox exists, use it.
    if (!checkbox && count === 1) {
        checkbox = allCheckboxes.first();
    }

    if (!checkbox) {

        throw new Error(
            'Terms & Conditions checkbox was not found.'
        );
    }

    if (!await checkbox.isChecked()) {

        await checkbox.check();

        await page.waitForTimeout(300);
    }

    const checked =
        await checkbox.isChecked();

    if (!checked) {

        throw new Error(
            'Terms & Conditions checkbox could not be checked.'
        );
    }

    console.log(
        '✅ Terms & Conditions checkbox checked.'
    );

    console.log(
        `☑️ Terms checkbox status: CHECKED`
    );

    return true;
}


// ============================================================
// CLOSE TERMS MODAL
// ============================================================

async function closeTermsModalIfOpen(page) {

    const modal =
        page.locator('#openModal');

    try {

        if (
            await modal.count() > 0 &&
            await modal.isVisible()
        ) {

            console.log(
                '⚠️ Terms & Conditions modal is open. Closing it...'
            );

            const closeSelectors = [

                '#openModal a[href="#close"]',

                '#openModal .close',

                '#openModal button',

                '#openModal [aria-label="Close"]',

                '#openModal a'
            ];

            for (const selector of closeSelectors) {

                const close =
                    modal.locator(selector).first();

                try {

                    if (
                        await close.count() > 0 &&
                        await close.isVisible()
                    ) {

                        await close.click({
                            force: true
                        });

                        await page.waitForTimeout(500);

                        if (
                            !await modal.isVisible()
                        ) {

                            console.log(
                                '✅ Terms modal closed.'
                            );

                            return true;
                        }
                    }

                } catch {
                    // Continue
                }
            }

            await page.keyboard.press('Escape');

            await page.waitForTimeout(500);

            if (!await modal.isVisible()) {

                console.log(
                    '✅ Terms modal closed with Escape.'
                );

                return true;
            }
        }

    } catch {
        // Already closed.
    }

    return false;
}


// ============================================================
// CLICK PAY NOW
// ============================================================

async function clickPayNow(page) {

    console.log(
        '\n💳 Clicking Pay Now...'
    );

    await closeTermsModalIfOpen(page);

    const payButton =
        page.locator('#payButton').first();

    if (
        await payButton.count() === 0
    ) {

        throw new Error(
            'Pay Now button not found.'
        );
    }

    console.log(
        `📍 Current URL before Pay Now: ${page.url()}`
    );

    const oldUrl =
        page.url();

    await Promise.all([

        page.waitForURL(
            url => url.toString() !== oldUrl,
            {
                timeout: 30000
            }
        ).catch(() => null),

        payButton.click({
            timeout: CONFIG.elementTimeout
        })
    ]);

    await page.waitForTimeout(3000);

    console.log(
        `📍 Current URL after Pay Now: ${page.url()}`
    );

    if (page.url() !== oldUrl) {

        console.log(
            '✅ Redirect/navigation detected.'
        );

        return true;
    }

    await page.waitForTimeout(5000);

    if (page.url() !== oldUrl) {

        console.log(
            '✅ Redirect detected after waiting.'
        );

        return true;
    }

    throw new Error(
        'Pay Now clicked but no redirect was detected.'
    );
}


// ============================================================
// SAVE REDIRECTED PAGE TEXT
// ============================================================

async function saveRedirectedPageText(
    page,
    currency
) {

    try {

        const text =
            await page.locator('body').innerText();

        const filePath =
            path.join(
                CONFIG.reportsDir,
                `${currency}-redirected-page.txt`
            );

        fs.writeFileSync(
            filePath,
            text,
            'utf8'
        );

        console.log(
            `📄 Redirected page text saved: reports/${currency}-redirected-page.txt`
        );

        return text;

    } catch (error) {

        console.log(
            `⚠️ Could not save redirected page text: ${error.message}`
        );

        return '';
    }
}


// ============================================================
// CURRENCY NAMES
// ============================================================

function currencyNames(currency) {

    const names = {

        GBP: [
            'GBP',
            'POUND',
            'POUNDS',
            '£'
        ],

        EUR: [
            'EUR',
            'EURO',
            'EUROS',
            '€'
        ],

        AUD: [
            'AUD',
            'AUSTRALIAN DOLLAR',
            'AUSTRALIAN DOLLARS'
        ],

        USD: [
            'USD',
            'US DOLLAR',
            'US DOLLARS',
            'DOLLAR',
            'DOLLARS',
            '$'
        ]
    };

    return names[currency] || [currency];
}


// ============================================================
// DETECT CONVERSION FEE
// ============================================================

function detectConversionFee(bodyText) {

    console.log(
        '\n💳 Checking Stripe conversion fee...'
    );

    const feePatterns = [

        // includes 4% conversion fee
        /includes\s+([\d.]+)\s*%\s*conversion\s*fee/i,

        // conversion fee: 4%
        /conversion\s*fee\s*[:\-]?\s*([\d.]+)\s*%/i,

        // conversion fee of 4%
        /conversion\s*fee\s*(?:of)?\s*([\d.]+)\s*%/i,

        // 4% conversion fee
        /([\d.]+)\s*%\s*conversion\s*fee/i
    ];

    for (const regex of feePatterns) {

        const match =
            bodyText.match(regex);

        if (match) {

            const fee =
                parseFloat(match[1]);

            if (!isNaN(fee)) {

                console.log(
                    `💳 Conversion fee detected: ${fee}%`
                );

                return fee;
            }
        }
    }

    console.log(
        '⚠️ No conversion fee detected.'
    );

    return 0;
}


// ============================================================
// EXTRACT DISPLAYED PKR AMOUNT
// ============================================================

function extractDisplayedPKR(
    bodyText,
    currency
) {

    const lines =
        bodyText
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

    console.log(
        '\n🔍 Currency/PKR related text found:'
    );

    const relevantLines =
        lines.filter(line =>
            /PKR|Rs\.?|₨|EUR|GBP|AUD|USD|Pound|Euro|Australian|conversion fee/i
                .test(line)
        );

    relevantLines
        .slice(0, 30)
        .forEach(line => {
            console.log(`   ${line}`);
        });


    // --------------------------------------------------------
    // First: find explicit selected-currency conversion.
    //
    // Example:
    // 1 EUR = 336.2000 PKR
    // --------------------------------------------------------

    const names =
        currencyNames(currency)
            .join('|')
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


    const directRegex =
        new RegExp(
            `(?:\\d+(?:\\.\\d+)?)\\s*(?:${names})\\s*=\\s*(?:PKR|Rs\\.?|₨)\\s*([\\d,]+(?:\\.\\d+)?)`,
            'i'
        );

    const directMatch =
        bodyText.match(directRegex);

    if (directMatch) {

        const value =
            parseFloat(
                directMatch[1].replace(/,/g, '')
            );

        if (!isNaN(value)) {

            console.log(
                `💱 Direct ${currency} → PKR rate detected: ${value}`
            );

            return value;
        }
    }


    // --------------------------------------------------------
    // Second: Stripe may display:
    //
    // PKR 336.20
    //
    // and separately:
    //
    // 1 EUR = 336.2000 PKR
    //
    // In this situation the PKR amount is still the displayed
    // selected-currency amount.
    // --------------------------------------------------------

    const pkrMatches =
        [
            ...bodyText.matchAll(
                /(?:PKR|Rs\.?|₨)\s*([\d,]+(?:\.\d+)?)/gi
            )
        ];

    const pkrValues =
        pkrMatches
            .map(match =>
                parseFloat(
                    match[1].replace(/,/g, '')
                )
            )
            .filter(value =>
                !isNaN(value)
            );


    console.log(
        `🇵🇰 PKR values detected: ${
            pkrValues.length
                ? pkrValues.join(', ')
                : 'None'
        }`
    );


    // Remove duplicate values.
    const uniqueValues =
        [...new Set(pkrValues)];


    // If one unique value exists, safely use it.
    if (uniqueValues.length === 1) {

        console.log(
            `💱 Using displayed PKR amount: ${uniqueValues[0]}`
        );

        return uniqueValues[0];
    }


    // --------------------------------------------------------
    // If multiple PKR values exist, use the first relevant
    // value instead of Math.max().
    // --------------------------------------------------------

    if (uniqueValues.length > 1) {

        console.log(
            `⚠️ Multiple PKR values found: ${uniqueValues.join(', ')}`
        );

        // Usually the first PKR amount is the selected
        // currency amount on Stripe.
        console.log(
            `💱 Using first displayed PKR amount: ${uniqueValues[0]}`
        );

        return uniqueValues[0];
    }


    return null;
}


// ============================================================
// EXTRACT CONVERSION
// ============================================================

async function extractConversion(
    page,
    currency,
    enteredAmount
) {

    const bodyText =
        await saveRedirectedPageText(
            page,
            currency
        );

    if (!bodyText) {

        throw new Error(
            'Redirected page contains no readable text.'
        );
    }


    // --------------------------------------------------------
    // Detect Stripe conversion fee dynamically.
    // --------------------------------------------------------

    const conversionFee =
        detectConversionFee(bodyText);


    // --------------------------------------------------------
    // Get displayed PKR amount.
    // --------------------------------------------------------

    const displayedPKR =
        extractDisplayedPKR(
            bodyText,
            currency
        );


    if (displayedPKR === null) {

        console.log(
            '❌ Could not identify displayed PKR amount.'
        );

        return {

            foreignAmount: 'N/A',

            pkrAmount: 'N/A',

            displayedRate: null,

            conversionFee,

            adjustedRate: null
        };
    }


    const foreignAmount =
        Number(enteredAmount);


    if (
        isNaN(foreignAmount) ||
        foreignAmount <= 0
    ) {

        throw new Error(
            `Invalid foreign amount: ${enteredAmount}`
        );
    }


    // --------------------------------------------------------
    // Displayed Stripe rate.
    // --------------------------------------------------------

    const displayedRate =
        displayedPKR /
        foreignAmount;


    console.log(
        `\n💱 Foreign amount detected: ${foreignAmount}`
    );

    console.log(
        `🇵🇰 Displayed PKR amount: ${displayedPKR}`
    );

    console.log(
        `💱 Displayed Stripe rate: ${displayedRate.toFixed(4)}`
    );


    // --------------------------------------------------------
    // Remove conversion fee.
    //
    // Example:
    //
    // Stripe = 336.20
    // Fee = 4%
    //
    // Actual rate =
    //
    // 336.20 / 1.04
    //
    // = 323.2692
    // --------------------------------------------------------

    const feeMultiplier =
        1 + (conversionFee / 100);


    const adjustedRate =
        displayedRate /
        feeMultiplier;


    console.log(
        `💳 Conversion fee: ${conversionFee}%`
    );

    console.log(
        `🧮 Fee multiplier: ${feeMultiplier.toFixed(4)}`
    );

    console.log(
        `🧮 Adjusted rate calculation:`
    );

    console.log(
        `${displayedRate.toFixed(4)} ÷ ${feeMultiplier.toFixed(4)} = ${adjustedRate.toFixed(4)}`
    );


    return {

        foreignAmount,

        pkrAmount: Number(
            displayedPKR.toFixed(2)
        ),

        displayedRate,

        conversionFee,

        adjustedRate
    };
}


// ============================================================
// TEST ONE CURRENCY
// ============================================================

async function testCurrency(
    browser,
    currencyData
) {

    const {
        currency,
        amount,
        expectedRate
    } = currencyData;


    console.log('\n');

    console.log(
        '=========================================='
    );

    console.log(
        `🧪 TESTING ${currency}`
    );

    console.log(
        `Amount        : ${amount}`
    );

    console.log(
        `Expected Rate : ${expectedRate}`
    );

    console.log(
        '=========================================='
    );


    const result = {

        Currency: currency,

        Amount: amount,

        ExpectedRate: expectedRate,

        DisplayedRate: 'N/A',

        ConversionFee: 'N/A',

        AdjustedRate: 'N/A',

        Difference: 'N/A',

        ForeignAmount: 'N/A',

        PKRAmount: 'N/A',

        RedirectURL: 'N/A',

        Status: 'ERROR',

        Error: ''
    };


    const context =
        await browser.newContext();


    const page =
        await context.newPage();


    page.setDefaultTimeout(
        CONFIG.elementTimeout
    );


    try {

        // ====================================================
        // OPEN ORDER PAGE
        // ====================================================

        console.log(
            '\n🌐 Opening order page...'
        );

        const startTime =
            Date.now();


        await page.goto(
            CONFIG.orderPage,
            {
                waitUntil: 'domcontentloaded',
                timeout: CONFIG.pageTimeout
            }
        );


        const loadTime =
            Date.now() - startTime;


        console.log(
            `✅ Page loaded: ${page.url()}`
        );

        console.log(
            `⏱️ Page load time: ${loadTime} ms`
        );


        // Give dynamic form time to render.
        await page.waitForTimeout(2000);


        // ====================================================
        // BASIC FORM
        // ====================================================

        await fillBasicForm(page);


        // ====================================================
        // SERVICE
        // ====================================================

        await selectService(page);


        // ====================================================
        // CURRENCY
        // ====================================================

        await selectCurrency(
            page,
            currency
        );


        // ====================================================
        // AMOUNT
        // ====================================================

        await fillAmount(
            page,
            amount
        );


        // ====================================================
        // TERMS
        // ====================================================

        await checkTermsAndConditions(page);


        console.log(
            '✅ Verified: Terms checkbox is checked.'
        );


        // ====================================================
        // PRE-PAYMENT SCREENSHOT
        // ====================================================

        await page.screenshot({

            path: path.join(
                CONFIG.reportsDir,
                `${currency}-pre-payment.png`
            ),

            fullPage: true
        });


        console.log(
            `📸 Pre-payment screenshot saved.`
        );


        // ====================================================
        // PAY NOW
        // ====================================================

        await clickPayNow(page);


        // ====================================================
        // REDIRECT URL
        // ====================================================

        result.RedirectURL =
            page.url();


        console.log(
            '\n📄 Redirected page URL:'
        );

        console.log(
            page.url()
        );


        // ====================================================
        // WAIT FOR STRIPE
        // ====================================================

        await page.waitForTimeout(4000);


        // ====================================================
        // EXTRACT CONVERSION
        // ====================================================

        console.log(
            '\n🔎 Reading conversion from redirected page...'
        );


        const conversion =
            await extractConversion(
                page,
                currency,
                amount
            );


        result.ForeignAmount =
            conversion.foreignAmount;


        result.PKRAmount =
            conversion.pkrAmount;


        result.ConversionFee =
            conversion.conversionFee;


        // ====================================================
        // CALCULATE RATES
        // ====================================================

        if (
            conversion.adjustedRate !== null
        ) {

            result.DisplayedRate =
                Number(
                    conversion.displayedRate.toFixed(2)
                );


            result.AdjustedRate =
                Number(
                    conversion.adjustedRate.toFixed(2)
                );


            result.Difference =
                Number(
                    Math.abs(
                        conversion.adjustedRate -
                        expectedRate
                    ).toFixed(2)
                );


            console.log(
                '\n📊 RATE COMPARISON'
            );


            console.log(
                `Excel Expected       : ${expectedRate}`
            );


            console.log(
                `Stripe Displayed Rate: ${conversion.displayedRate.toFixed(2)}`
            );


            console.log(
                `Conversion Fee      : ${conversion.conversionFee}%`
            );


            console.log(
                `Adjusted Rate       : ${conversion.adjustedRate.toFixed(2)}`
            );


            console.log(
                `Difference          : ${result.Difference}`
            );


            if (
                Math.abs(
                    conversion.adjustedRate -
                    expectedRate
                ) <= CONFIG.tolerance
            ) {

                result.Status = 'PASS';


                console.log(
                    `\n✅ ${currency} RATE PASS`
                );

            } else {

                result.Status = 'FAIL';


                console.log(
                    `\n❌ ${currency} RATE FAIL`
                );

                console.log(
                    `Expected : ${expectedRate}`
                );

                console.log(
                    `Adjusted : ${conversion.adjustedRate.toFixed(2)}`
                );

                console.log(
                    `Difference : ${result.Difference}`
                );
            }

        } else {

            result.Status = 'FAIL';

            console.log(
                `\n❌ ${currency} conversion could not be calculated.`
            );
        }


        // ====================================================
        // RESULT SCREENSHOT
        // ====================================================

        await page.screenshot({

            path: path.join(
                CONFIG.reportsDir,
                `${currency}-result.png`
            ),

            fullPage: true
        });


        console.log(
            `📸 Result screenshot saved: reports/${currency}-result.png`
        );


    } catch (error) {

        result.Status = 'ERROR';

        result.Error = error.message;


        console.log(
            `\n❌ ${currency} test failed`
        );

        console.log(
            error.message
        );


        try {

            await page.screenshot({

                path: path.join(
                    CONFIG.reportsDir,
                    `${currency}-error.png`
                ),

                fullPage: true
            });


            console.log(
                `📸 Screenshot saved: reports/${currency}-error.png`
            );

        } catch {

            console.log(
                '⚠️ Could not save error screenshot.'
            );
        }

    } finally {

        await context.close();
    }


    return result;
}


// ============================================================
// SAVE JSON REPORT
// ============================================================

function saveJSONReport(results) {

    const filePath =
        path.join(
            CONFIG.reportsDir,
            'currency-rate-report.json'
        );


    fs.writeFileSync(
        filePath,
        JSON.stringify(results, null, 2),
        'utf8'
    );


    console.log(
        '\n📄 JSON report:'
    );

    console.log(
        filePath
    );
}


// ============================================================
// SAVE CSV REPORT
// ============================================================

function saveCSVReport(results) {

    const filePath =
        path.join(
            CONFIG.reportsDir,
            'currency-rate-report.csv'
        );


    if (
        !results ||
        results.length === 0
    ) {
        return;
    }


    const headers =
        Object.keys(results[0]);


    const escapeCSV =
        value => {

            if (
                value === null ||
                value === undefined
            ) {
                return '';
            }


            const text =
                String(value);


            if (
                text.includes(',') ||
                text.includes('"') ||
                text.includes('\n')
            ) {

                return `"${text.replace(
                    /"/g,
                    '""'
                )}"`;
            }


            return text;
        };


    const rows = [];


    rows.push(
        headers
            .map(escapeCSV)
            .join(',')
    );


    results.forEach(result => {

        rows.push(
            headers
                .map(header =>
                    escapeCSV(result[header])
                )
                .join(',')
        );
    });


    fs.writeFileSync(
        filePath,
        rows.join('\n'),
        'utf8'
    );


    console.log(
        '\n📄 CSV report:'
    );

    console.log(
        filePath
    );
}


// ============================================================
// FINAL RESULTS
// ============================================================

function printFinalResults(results) {

    console.log('\n');

    console.log(
        '=========================================='
    );

    console.log(
        '             FINAL RESULTS'
    );

    console.log(
        '=========================================='
    );


    console.table(results);


    const total =
        results.length;


    const pass =
        results.filter(
            result =>
                result.Status === 'PASS'
        ).length;


    const fail =
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
        `Total Tests : ${total}`
    );

    console.log(
        `PASS        : ${pass}`
    );

    console.log(
        `FAIL        : ${fail}`
    );

    console.log(
        `ERROR       : ${errors}`
    );


    console.log(
        '=========================================='
    );
}


// ============================================================
// MAIN
// ============================================================

async function main() {

    console.log('\n');

    console.log(
        '=========================================='
    );

    console.log(
        '       CURRENCY RATE CHECKER'
    );

    console.log(
        '=========================================='
    );


    let currencyData;


    // ========================================================
    // READ EXCEL
    // ========================================================

    try {

        currencyData =
            readCurrencyExcel();

    } catch (error) {

        console.error(
            `\n❌ Excel error: ${error.message}`
        );

        process.exit(1);
    }


    // ========================================================
    // START BROWSER
    // ========================================================

    console.log(
        '\n🌐 Starting Chromium...'
    );


    const browser =
        await chromium.launch({

            headless:
                CONFIG.headless
        });


    const results = [];


    try {

        for (
            const currencyDataItem
            of currencyData
        ) {

            const result =
                await testCurrency(
                    browser,
                    currencyDataItem
                );


            results.push(result);
        }

    } finally {

        await browser.close();
    }


    // ========================================================
    // FINAL RESULTS
    // ========================================================

    printFinalResults(
        results
    );


    // ========================================================
    // REPORTS
    // ========================================================

    saveJSONReport(
        results
    );


    saveCSVReport(
        results
    );


    console.log('\n');

    console.log(
        '🏁 Test execution completed.'
    );

    console.log('\n');
}


// ============================================================
// RUN
// ============================================================

main().catch(error => {

    console.error(
        '\n❌ Fatal error:'
    );

    console.error(error);

    process.exit(1);
});