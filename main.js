const { chromium } = require('@playwright/test');

const { readCurrencyRates } =
    require('./utils/excelReader');

const RateChecker =
    require('./utils/rateChecker');

const { generateReport } =
    require('./utils/reportGenerator');


// =========================================================
// WEBSITES
// =========================================================

const WEBSITES = [

    {
        name: 'Online Exam Help',
        url: 'https://onlineexamhelp.co.uk/order/'
    },

    {
        name: 'Assignment Help NZ',
        url: 'https://assignmenthelpnz.co.nz/order/'
    },

    {
        name: 'Assignment Helpers DE',
        url: 'https://assignmenthelpers.de/order/'
    },

    {
        name: 'Assignment Bro UK',
        url: 'https://assignmentbro.co.uk/order/'
    },

    {
        name: 'Assignment Help Australia',
        url: 'https://assignmenthelpaustralia.au/order/'
    },

    {
        name: 'Dissertation US',
        url: 'https://dissertation.us.com/order/'
    }

];


// =========================================================
// MAIN
// =========================================================

(async () => {

    console.log('\n');
    console.log('==========================================');
    console.log('       CURRENCY RATE AUTOMATION');
    console.log('==========================================');

    console.log(
        `Websites: ${WEBSITES.length}`
    );


    // =====================================================
    // READ EXCEL
    // =====================================================

    let currencyRates;

    try {

        currencyRates = readCurrencyRates('./data/currencyRates.xlsx');

    } catch (error) {

        console.error(
            '\n❌ Unable to read currency Excel file.'
        );

        console.error(error.message);

        process.exit(1);
    }


    console.log(
        `Currencies: ${currencyRates.length}`
    );

    console.log(
        `Total Tests: ${
            WEBSITES.length *
            currencyRates.length
        }`
    );

    console.log(
        '==========================================\n'
    );


    // =====================================================
    // RESULTS
    // =====================================================

    const results = [];


    // =====================================================
    // START BROWSER
    // =====================================================

    const browser =
        await chromium.launch({
            headless: false
        });


    try {

        // =================================================
        // WEBSITE LOOP
        // =================================================

        for (
            let websiteIndex = 0;
            websiteIndex < WEBSITES.length;
            websiteIndex++
        ) {

            const website =
                WEBSITES[websiteIndex];


            console.log(
                '\n----------------------------------------'
            );

            console.log(
                `Website ${
                    websiteIndex + 1
                }/${WEBSITES.length}`
            );

            console.log(
                website.url
            );

            console.log(
                '----------------------------------------'
            );


            // =============================================
            // CURRENCY LOOP
            // =============================================

            for (
                let currencyIndex = 0;
                currencyIndex < currencyRates.length;
                currencyIndex++
            ) {

                const currencyData =
                    currencyRates[currencyIndex];


                console.log(
                    `\nCurrency ${
                        currencyIndex + 1
                    }/${currencyRates.length}`
                );

                console.log(
                    `${website.url} | ${
                        currencyData.currency
                    }`
                );


                const context =
                    await browser.newContext();


                const page =
                    await context.newPage();


                try {

                    // =====================================
                    // RATE CHECKER
                    // =====================================

                    const checker =
                        new RateChecker(
                            page,
                            context,
                            website
                        );


                    const result =
                        await checker.testCurrency(
                            currencyData
                        );


                    // =====================================
                    // CLEAN PAYMENT URL
                    // =====================================
                    //
                    // Keep the original URL internally
                    // for processing, but don't print/store
                    // the long Stripe checkout session URL.
                    //

                    if (result.PaymentURL) {

                        try {

                            const paymentUrl =
                                new URL(
                                    result.PaymentURL
                                );

                            result.PaymentURL =
                                paymentUrl.origin;

                        } catch {

                            result.PaymentURL =
                                'Payment page detected';

                        }

                    } else {

                        result.PaymentURL =
                            'N/A';
                    }


                    // =====================================
                    // ADD RESULT
                    // =====================================

                    results.push(result);


                    console.log(
                        `\nCompleted: ${
                            website.url
                        } - ${
                            currencyData.currency
                        }`
                    );


                } catch (error) {

                    console.error(
                        `\n❌ Test error: ${
                            error.message
                        }`
                    );


                    results.push({

                        Website:
                            website.name,

                        URL:
                            website.url,

                        Currency:
                            currencyData.currency,

                        Amount:
                            currencyData.amount,

                        ExpectedRate:
                            currencyData.expectedRate,

                        ActualRate:
                            'N/A',

                        Difference:
                            'N/A',

                        ForeignAmount:
                            'N/A',

                        PKRAmount:
                            'N/A',

                        ConversionFee:
                            'N/A',

                        PaymentURL:
                            'N/A',

                        Status:
                            'ERROR',

                        Error:
                            error.message

                    });

                } finally {

                    await context.close();

                }

            }

        }

    } finally {

        await browser.close();

        console.log(
            '\n🌐 Chromium closed.'
        );

    }


    // =====================================================
    // FINAL REPORT
    // =====================================================

    await generateReport(
        results
    );

})();