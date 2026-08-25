class RateChecker {

    constructor(page, context) {

        this.page = page;
        this.context = context;

        this.orderUrl =
            'https://onlineexamhelp.co.uk/order/';

        this.results = [];

        // Test customer information
        this.testFirstName = 'Aleena';
        this.testLastName = 'Test';

        // Service to select from the order form
        this.testService = 'Assignment';
    }


    // =========================================================
    // OPEN ORDER PAGE
    // =========================================================

    async openOrderPage() {

        console.log('\n🌐 Opening order page...');

        await this.page.goto(
            this.orderUrl,
            {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            }
        );

        await this.page.waitForTimeout(1500);

        console.log(
            `✅ Page loaded: ${this.page.url()}`
        );
    }


    // =========================================================
    // FILL FIRST NAME
    // =========================================================

    async fillFirstName() {

        console.log(
            `👤 Entering First Name: ${this.testFirstName}`
        );

        const possibleSelectors = [

            'input[placeholder*="First Name" i]',

            'input[name*="first" i]',

            'input[id*="first" i]',

            'input[aria-label*="First Name" i]'
        ];


        let input = null;


        for (
            const selector
            of possibleSelectors
        ) {

            const locator =
                this.page.locator(selector);

            if (
                await locator.count() > 0
            ) {

                input =
                    locator.first();

                break;
            }
        }


        if (!input) {

            throw new Error(
                'First Name input was not found.'
            );
        }


        await input.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await input.fill(
            this.testFirstName
        );


        console.log(
            '✅ First Name entered'
        );
    }


    // =========================================================
    // FILL LAST NAME
    // =========================================================

    async fillLastName() {

        console.log(
            `👤 Entering Last Name: ${this.testLastName}`
        );

        const possibleSelectors = [

            'input[placeholder*="Last Name" i]',

            'input[name*="last" i]',

            'input[id*="last" i]',

            'input[aria-label*="Last Name" i]'
        ];


        let input = null;


        for (
            const selector
            of possibleSelectors
        ) {

            const locator =
                this.page.locator(selector);

            if (
                await locator.count() > 0
            ) {

                input =
                    locator.first();

                break;
            }
        }


        if (!input) {

            throw new Error(
                'Last Name input was not found.'
            );
        }


        await input.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await input.fill(
            this.testLastName
        );


        console.log(
            '✅ Last Name entered'
        );
    }


    // =========================================================
    // FIND SERVICE DROPDOWN
    // =========================================================

    async findServiceDropdown() {

        const selects =
            this.page.locator('select');

        const count =
            await selects.count();


        console.log(
            `🔎 Select elements found: ${count}`
        );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const select =
                selects.nth(i);


            const options =
                await select
                    .locator('option')
                    .evaluateAll(
                        elements =>
                            elements.map(
                                option => ({
                                    text:
                                        option.textContent
                                            .trim(),

                                    value:
                                        option.value
                                })
                            )
                    );


            console.log(
                `Select ${i + 1}:`,
                options
            );


            const optionText =
                options
                    .map(
                        option =>
                            `${option.text} ${option.value}`
                    )
                    .join(' ')
                    .toLowerCase();


            /*
             * Service dropdown contains options such as:
             *
             * Essay
             * Coursework
             * Assignment
             * Dissertation
             * etc.
             *
             * Currency dropdown contains GBP/EUR/AUD.
             */

            const isCurrencyDropdown =
                optionText.includes('gbp') &&
                optionText.includes('eur') &&
                optionText.includes('aud');


            if (
                !isCurrencyDropdown &&
                optionText.includes('assignment') &&
                optionText.includes('essay')
            ) {

                console.log(
                    `✅ Service dropdown found: select ${i + 1}`
                );

                return select;
            }
        }


        return null;
    }


    // =========================================================
    // SELECT SERVICE
    // =========================================================

    async selectService() {

        console.log(
            `\n📚 Selecting service: ${this.testService}`
        );


        const dropdown =
            await this.findServiceDropdown();


        if (!dropdown) {

            throw new Error(
                'Service dropdown was not found.'
            );
        }


        const options =
            await dropdown
                .locator('option')
                .evaluateAll(
                    elements =>
                        elements.map(
                            option => ({
                                text:
                                    option.textContent
                                        .trim(),

                                value:
                                    option.value
                            })
                        )
                );


        const matchingOption =
            options.find(
                option => {

                    const text =
                        option.text
                            .trim()
                            .toLowerCase();

                    const value =
                        option.value
                            .trim()
                            .toLowerCase();


                    return (
                        text ===
                            this.testService.toLowerCase()
                        ||
                        value ===
                            this.testService.toLowerCase()
                    );
                }
            );


        if (!matchingOption) {

            throw new Error(
                `Service "${this.testService}" was not found.`
            );
        }


        console.log(
            'Using service option:',
            matchingOption
        );


        await dropdown.selectOption(
            matchingOption.value
        );


        await this.page.waitForTimeout(
            500
        );


        console.log(
            `✅ Service selected: ${this.testService}`
        );
    }


    // =========================================================
    // FIND CURRENCY DROPDOWN
    // =========================================================

    async findCurrencyDropdown() {

        const selects =
            this.page.locator('select');

        const count =
            await selects.count();


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const select =
                selects.nth(i);


            const options =
                await select
                    .locator('option')
                    .evaluateAll(
                        elements =>
                            elements.map(
                                option => ({
                                    text:
                                        option.textContent
                                            .trim(),

                                    value:
                                        option.value
                                })
                            )
                    );


            const optionText =
                options
                    .map(
                        option =>
                            `${option.text} ${option.value}`
                    )
                    .join(' ')
                    .toUpperCase();


            if (
                optionText.includes('GBP') &&
                optionText.includes('EUR') &&
                optionText.includes('AUD')
            ) {

                console.log(
                    `✅ Currency dropdown found: select ${i + 1}`
                );

                return select;
            }
        }


        return null;
    }


    // =========================================================
    // SELECT CURRENCY
    // =========================================================

    async selectCurrency(currency) {

        console.log(
            `\n💱 Selecting currency: ${currency}`
        );


        const dropdown =
            await this.findCurrencyDropdown();


        if (!dropdown) {

            throw new Error(
                'Currency dropdown was not found.'
            );
        }


        const options =
            await dropdown
                .locator('option')
                .evaluateAll(
                    elements =>
                        elements.map(
                            option => ({
                                text:
                                    option.textContent
                                        .trim(),

                                value:
                                    option.value
                            })
                        )
                );


        const matchingOption =
            options.find(
                option => {

                    const text =
                        option.text
                            .trim()
                            .toUpperCase();

                    const value =
                        option.value
                            .trim()
                            .toUpperCase();


                    return (
                        text === currency ||
                        value === currency ||
                        text.includes(currency)
                    );
                }
            );


        if (!matchingOption) {

            throw new Error(
                `Currency ${currency} was not found in dropdown.`
            );
        }


        console.log(
            'Using option:',
            matchingOption
        );


        await dropdown.selectOption(
            matchingOption.value
        );


        await this.page.waitForTimeout(
            500
        );


        console.log(
            `✅ ${currency} selected`
        );
    }


    // =========================================================
    // FIND AMOUNT INPUT
    // =========================================================

    async findAmountInput() {

        const selectors = [

            'input[placeholder="Amount"]',

            'input[placeholder*="amount" i]',

            'input[name*="amount" i]',

            'input[id*="amount" i]'
        ];


        for (
            const selector
            of selectors
        ) {

            const locator =
                this.page.locator(selector);


            if (
                await locator.count() > 0
            ) {

                return locator.first();
            }
        }


        return null;
    }


    // =========================================================
    // FILL AMOUNT
    // =========================================================

    async fillAmount(amount) {

        console.log(
            `💰 Entering amount: ${amount}`
        );


        const amountInput =
            await this.findAmountInput();


        if (!amountInput) {

            throw new Error(
                'Amount input was not found.'
            );
        }


        await amountInput.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await amountInput.fill(
            String(amount)
        );


        console.log(
            '✅ Amount entered'
        );
    }


    // =========================================================
    // ACCEPT TERMS
    // =========================================================

    async acceptTerms() {

        console.log(
            '☑️ Checking terms and conditions...'
        );


        const checkbox =
            this.page.locator(
                'input[type="checkbox"]'
            );


        const count =
            await checkbox.count();


        if (count === 0) {

            throw new Error(
                'Terms and conditions checkbox was not found.'
            );
        }


        /*
         * There is currently one checkbox
         * on the order form.
         */

        const termsCheckbox =
            checkbox.first();


        if (
            !(await termsCheckbox.isChecked())
        ) {

            await termsCheckbox.check();
        }


        console.log(
            '✅ Terms and conditions accepted'
        );
    }


    // =========================================================
    // CHECK FORM BEFORE PAY NOW
    // =========================================================

    async verifyFormBeforePayment() {

        console.log(
            '\n🔎 Verifying required fields before Pay Now...'
        );


        const fields = [

            {
                name: 'First Name',
                selector:
                    'input[placeholder*="First Name" i]'
            },

            {
                name: 'Last Name',
                selector:
                    'input[placeholder*="Last Name" i]'
            },

            {
                name: 'Amount',
                selector:
                    'input[placeholder="Amount"]'
            }
        ];


        for (
            const field
            of fields
        ) {

            const locator =
                this.page.locator(
                    field.selector
                ).first();


            if (
                await locator.count() === 0
            ) {

                console.log(
                    `⚠️ ${field.name}: input not found`
                );

                continue;
            }


            const value =
                await locator.inputValue();


            console.log(
                `${field.name}: ${value || 'EMPTY'}`
            );


            if (!value) {

                throw new Error(
                    `${field.name} is empty before Pay Now.`
                );
            }
        }


        console.log(
            '✅ Required text fields are filled'
        );
    }


    // =========================================================
    // CLICK PAY NOW AND DETECT NEW PAGE
    // =========================================================

    async clickPayNow() {

        console.log(
            '💳 Clicking Pay Now...'
        );


        const payNow =
            this.page.getByRole(
                'button',
                {
                    name: /pay now/i
                }
            );


        if (
            await payNow.count() === 0
        ) {

            throw new Error(
                'Pay Now button was not found.'
            );
        }


        await payNow.first().waitFor({
            state: 'visible',
            timeout: 10000
        });


        /*
         * Remember existing pages.
         */

        const pagesBefore =
            this.context.pages();


        const oldUrl =
            this.page.url();


        console.log(
            `Current page: ${oldUrl}`
        );


        await payNow.first().click();


        console.log(
            '✅ Pay Now clicked'
        );


        /*
         * Give the website time to submit
         * the form.
         */

        await this.page.waitForTimeout(
            3000
        );


        /*
         * Check whether a new page/tab was opened.
         */

        const pagesAfter =
            this.context.pages();


        if (
            pagesAfter.length >
            pagesBefore.length
        ) {

            console.log(
                '🆕 New browser page detected.'
            );


            const newPages =
                pagesAfter.filter(
                    page =>
                        !pagesBefore.includes(page)
                );


            if (
                newPages.length > 0
            ) {

                this.page =
                    newPages[
                        newPages.length - 1
                    ];


                await this.page.waitForLoadState(
                    'domcontentloaded'
                ).catch(() => {});


                await this.page.waitForTimeout(
                    2000
                );


                console.log(
                    `🔗 New page URL: ${this.page.url()}`
                );
            }
        }


        /*
         * Also check whether the same page
         * navigated.
         */

        const newUrl =
            this.page.url();


        if (
            newUrl !== oldUrl
        ) {

            console.log(
                `🔄 Page navigated to: ${newUrl}`
            );
        }


        /*
         * Search all open pages for Stripe.
         */

        for (
            const currentPage
            of this.context.pages()
        ) {

            const url =
                currentPage.url();


            console.log(
                `🔍 Open page: ${url}`
            );


            if (
                url
                    .toLowerCase()
                    .includes(
                        'checkout.stripe.com'
                    )
            ) {

                console.log(
                    '🎉 Stripe checkout detected!'
                );


                this.page =
                    currentPage;


                await this.page.waitForLoadState(
                    'domcontentloaded'
                ).catch(() => {});


                await this.page.waitForTimeout(
                    3000
                );


                return true;
            }
        }


        return false;
    }


    // =========================================================
    // WAIT FOR STRIPE
    // =========================================================

    async waitForStripe() {

        console.log(
            '⏳ Waiting for Stripe checkout...'
        );


        const timeout =
            30000;


        const startTime =
            Date.now();


        while (
            Date.now() - startTime <
            timeout
        ) {


            const pages =
                this.context.pages();


            for (
                const currentPage
                of pages
            ) {

                const url =
                    currentPage.url();


                if (
                    url
                        .toLowerCase()
                        .includes(
                            'checkout.stripe.com'
                        )
                ) {

                    console.log(
                        '✅ Stripe checkout detected'
                    );


                    this.page =
                        currentPage;


                    await this.page.waitForLoadState(
                        'domcontentloaded'
                    ).catch(() => {});


                    await this.page.waitForTimeout(
                        3000
                    );


                    console.log(
                        `🔗 Stripe URL: ${this.page.url()}`
                    );


                    return this.page;
                }
            }


            /*
             * Also inspect page text.
             */

            try {

                const text =
                    await this.page
                        .locator('body')
                        .innerText();


                if (
                    text
                        .toLowerCase()
                        .includes(
                            'pay online services'
                        )
                ) {

                    /*
                     * We may already be on the
                     * Stripe checkout page even
                     * if URL detection is delayed.
                     */

                    if (
                        this.page.url()
                            .includes(
                                'checkout.stripe'
                            )
                    ) {

                        return this.page;
                    }
                }

            } catch {
                // Ignore temporary page errors
            }


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );
        }


        throw new Error(
            'Stripe checkout was not detected within 30 seconds.'
        );
    }


    // =========================================================
    // EXTRACT NUMBER
    // =========================================================

    extractNumber(value) {

        if (!value) {
            return null;
        }


        const cleaned =
            String(value)
                .replace(/,/g, '')
                .replace(/[^\d.-]/g, '');


        const number =
            Number(cleaned);


        if (
            Number.isNaN(number)
        ) {

            return null;
        }


        return number;
    }


    // =========================================================
    // EXTRACT PKR
    // =========================================================

    extractPKR(text) {

        const patterns = [

            /PKR\s*([\d,.]+)/i,

            /Rs\.?\s*([\d,.]+)/i,

            /₨\s*([\d,.]+)/i
        ];


        for (
            const pattern
            of patterns
        ) {

            const match =
                text.match(pattern);


            if (match) {

                return this.extractNumber(
                    match[1]
                );
            }
        }


        return null;
    }


    // =========================================================
    // EXTRACT FOREIGN CURRENCY
    // =========================================================

    extractForeignAmount(
        text,
        currency
    ) {

        const patterns = {

            GBP: [

                /£\s*([\d,.]+)/i,

                /GBP\s*([\d,.]+)/i
            ],

            EUR: [

                /€\s*([\d,.]+)/i,

                /EUR\s*([\d,.]+)/i
            ],

            AUD: [

                /A\$\s*([\d,.]+)/i,

                /AUD\s*([\d,.]+)/i
            ]
        };


        const currencyPatterns =
            patterns[currency] || [];


        for (
            const pattern
            of currencyPatterns
        ) {

            const match =
                text.match(pattern);


            if (match) {

                return this.extractNumber(
                    match[1]
                );
            }
        }


        return null;
    }


    // =========================================================
    // EXTRACT DISPLAYED RATE
    // =========================================================

    extractDisplayedRate(
        text,
        currency
    ) {

        const pattern =
            new RegExp(
                `1\\s*${currency}\\s*=\\s*([\\d,.]+)\\s*PKR`,
                'i'
            );


        const match =
            text.match(pattern);


        if (match) {

            return this.extractNumber(
                match[1]
            );
        }


        return null;
    }


    // =========================================================
    // READ STRIPE CONVERSION
    // =========================================================

    async readStripeConversion(
        currency
    ) {

        console.log(
            '\n🔍 Reading Stripe conversion...'
        );


        const bodyText =
            await this.page
                .locator('body')
                .innerText();


        console.log(
            '\n---------- STRIPE PAGE TEXT ----------'
        );


        console.log(
            bodyText.substring(
                0,
                3000
            )
        );


        console.log(
            '---------------------------------------'
        );


        const pkrAmount =
            this.extractPKR(
                bodyText
            );


        const foreignAmount =
            this.extractForeignAmount(
                bodyText,
                currency
            );


        const displayedRate =
            this.extractDisplayedRate(
                bodyText,
                currency
            );


        let calculatedRate =
            null;


        if (
            pkrAmount !== null &&
            foreignAmount !== null &&
            foreignAmount !== 0
        ) {

            calculatedRate =
                pkrAmount /
                foreignAmount;
        }


        console.log(
            '\n💱 Stripe conversion data:'
        );


        console.table([{

            Currency:
                currency,

            ForeignAmount:
                foreignAmount ?? 'N/A',

            PKRAmount:
                pkrAmount ?? 'N/A',

            DisplayedRate:
                displayedRate ?? 'N/A',

            CalculatedRate:
                calculatedRate !== null
                    ? Number(
                        calculatedRate.toFixed(6)
                    )
                    : 'N/A'
        }]);


        return {

            foreignAmount,

            pkrAmount,

            displayedRate,

            calculatedRate
        };
    }


    // =========================================================
    // TEST ONE CURRENCY
    // =========================================================

    async testCurrency(data) {

        const {
            currency,
            amount,
            expectedRate
        } = data;


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


        try {

            // -------------------------------------------------
            // 1. Open page
            // -------------------------------------------------

            await this.openOrderPage();


            // -------------------------------------------------
            // 2. Fill first name
            // -------------------------------------------------

            await this.fillFirstName();


            // -------------------------------------------------
            // 3. Fill last name
            // -------------------------------------------------

            await this.fillLastName();


            // -------------------------------------------------
            // 4. Select service
            // -------------------------------------------------

            await this.selectService();


            // -------------------------------------------------
            // 5. Select currency
            // -------------------------------------------------

            await this.selectCurrency(
                currency
            );


            // -------------------------------------------------
            // 6. Enter amount
            // -------------------------------------------------

            await this.fillAmount(
                amount
            );


            // -------------------------------------------------
            // 7. Accept terms
            // -------------------------------------------------

            await this.acceptTerms();


            // -------------------------------------------------
            // 8. Verify fields
            // -------------------------------------------------

            await this.verifyFormBeforePayment();


            // -------------------------------------------------
            // 9. Click Pay Now
            // -------------------------------------------------

            const stripeOpened =
                await this.clickPayNow();


            if (!stripeOpened) {

                console.log(
                    '\n⚠️ Stripe did not open immediately.'
                );

                console.log(
                    'Current URL:',
                    this.page.url()
                );


                /*
                 * Take screenshot so we can see
                 * what the website is showing.
                 */

                await this.page.screenshot({

                    path:
                        `reports/${currency}-after-pay-now.png`,

                    fullPage:
                        true
                });


                /*
                 * Now wait for Stripe.
                 */

                await this.waitForStripe();

            } else {

                console.log(
                    '✅ Payment page opened successfully.'
                );
            }


            // -------------------------------------------------
            // 10. Read conversion
            // -------------------------------------------------

            const stripeData =
                await this.readStripeConversion(
                    currency
                );


            // -------------------------------------------------
            // 11. Determine actual rate
            // -------------------------------------------------

            let actualRate =
                stripeData.displayedRate;


            if (
                actualRate === null
            ) {

                actualRate =
                    stripeData.calculatedRate;
            }


            let difference =
                null;


            let status =
                'FAIL';


            // -------------------------------------------------
            // 12. Compare
            // -------------------------------------------------

            if (
                actualRate !== null
            ) {

                difference =
                    Math.abs(
                        actualRate -
                        expectedRate
                    );


                /*
                 * Tolerance:
                 * 0.05 PKR
                 */

                const tolerance =
                    0.05;


                if (
                    difference <=
                    tolerance
                ) {

                    status =
                        'PASS';
                }
            }


            // -------------------------------------------------
            // 13. Result
            // -------------------------------------------------

            const result = {

                Currency:
                    currency,

                Amount:
                    amount,

                ExpectedRate:
                    Number(
                        expectedRate.toFixed(6)
                    ),

                ActualRate:
                    actualRate !== null
                        ? Number(
                            actualRate.toFixed(6)
                        )
                        : 'N/A',

                Difference:
                    difference !== null
                        ? Number(
                            difference.toFixed(6)
                        )
                        : 'N/A',

                ForeignAmount:
                    stripeData.foreignAmount
                        ?? 'N/A',

                PKRAmount:
                    stripeData.pkrAmount
                        ?? 'N/A',

                Status:
                    status,

                Error:
                    ''
            };


            this.results.push(
                result
            );


            console.log(
                '\n📊 Currency result:'
            );


            console.table([
                result
            ]);


            return result;


        } catch (error) {

            console.error(
                `\n❌ ${currency} test failed`
            );


            console.error(
                error.message
            );


            try {

                await this.page.screenshot({

                    path:
                        `reports/${currency}-error.png`,

                    fullPage:
                        true
                });


                console.log(
                    `📸 Screenshot saved: reports/${currency}-error.png`
                );

            } catch {
                // Ignore screenshot errors
            }


            const result = {

                Currency:
                    currency,

                Amount:
                    amount,

                ExpectedRate:
                    expectedRate,

                ActualRate:
                    'N/A',

                Difference:
                    'N/A',

                ForeignAmount:
                    'N/A',

                PKRAmount:
                    'N/A',

                Status:
                    'ERROR',

                Error:
                    error.message
            };


            this.results.push(
                result
            );


            return result;
        }
    }


    // =========================================================
    // RUN ALL CURRENCIES
    // =========================================================

    async run(testData) {

        for (
            const data
            of testData
        ) {

            await this.testCurrency(
                data
            );
        }


        return this.results;
    }
}


// =============================================================
// EXPORT
// =============================================================

module.exports = RateChecker;