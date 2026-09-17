class RateChecker {

    constructor(page, context, website) {

        this.page = page;
        this.context = context;

        this.website =
            website || {
                name: 'Online Exam Help',
                url: 'https://onlineexamhelp.co.uk/order/'
            };

        this.websiteName = this.website.name;
        this.orderUrl = this.website.url;

        this.results = [];

        // =====================================================
        // TEST CUSTOMER INFORMATION
        // =====================================================

        this.testFirstName = 'Aleena';
        this.testLastName = 'Test';
        this.testEmail = 'playwrighttest@example.com';
        this.testPhone = '03001234567';

        // =====================================================
        // SERVICE
        // =====================================================

        this.testService = 'Assignment';

        // =====================================================
        // TOLERANCE
        // =====================================================

        // 1 PKR tolerance
        this.tolerance = 1;
    }


    // =========================================================
    // SAFE WEBSITE NAME
    // =========================================================

    getSafeWebsiteName() {

        return this.websiteName
            .replace(/[^a-z0-9]/gi, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }


    // =========================================================
    // SCREENSHOT PATH
    // =========================================================

    getScreenshotPath(currency, type) {

        const path = require('path');

        return path.join(
            'reports',
            `${this.getSafeWebsiteName()}-${currency}-${type}.png`
        );
    }


    // =========================================================
    // OPEN ORDER PAGE
    // =========================================================

    async openOrderPage() {

        console.log('\n🌐 Opening order page...');

        console.log(`🌐 Website: ${this.websiteName}`);
        console.log(`🌐 URL: ${this.orderUrl}`);

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
    // FIND VISIBLE INPUT
    // =========================================================

    async findVisibleInput(selectors) {

        for (const selector of selectors) {

            try {

                const locator =
                    this.page.locator(selector);

                const count =
                    await locator.count();

                for (let i = 0; i < count; i++) {

                    const element =
                        locator.nth(i);

                    if (
                        await element.isVisible() &&
                        await element.isEnabled()
                    ) {

                        return element;
                    }
                }

            } catch {
                // Continue
            }
        }

        return null;
    }


    // =========================================================
    // FIRST NAME
    // =========================================================

    async fillFirstName() {

        console.log(
            `👤 Entering First Name: ${this.testFirstName}`
        );

        const input =
            await this.findVisibleInput([

                'input:not([type="hidden"])[placeholder*="First Name" i]',
                'input:not([type="hidden"])[name*="first" i]',
                'input:not([type="hidden"])[id*="first" i]',
                'input:not([type="hidden"])[aria-label*="First Name" i]'

            ]);

        if (!input) {

            throw new Error(
                'First Name input was not found.'
            );
        }

        await input.fill(
            this.testFirstName
        );

        console.log(
            '✅ First Name entered'
        );
    }


    // =========================================================
    // LAST NAME
    // =========================================================

    async fillLastName() {

        console.log(
            `👤 Entering Last Name: ${this.testLastName}`
        );

        const input =
            await this.findVisibleInput([

                'input:not([type="hidden"])[placeholder*="Last Name" i]',
                'input:not([type="hidden"])[name*="last" i]',
                'input:not([type="hidden"])[id*="last" i]',
                'input:not([type="hidden"])[aria-label*="Last Name" i]'

            ]);

        if (!input) {

            throw new Error(
                'Last Name input was not found.'
            );
        }

        await input.fill(
            this.testLastName
        );

        console.log(
            '✅ Last Name entered'
        );
    }


    // =========================================================
    // EMAIL
    // =========================================================

    async fillEmail() {

        const input =
            await this.findVisibleInput([

                'input:not([type="hidden"])[type="email"]',
                'input:not([type="hidden"])[placeholder*="email" i]',
                'input:not([type="hidden"])[name*="email" i]',
                'input:not([type="hidden"])[id*="email" i]'

            ]);

        if (!input) {

            console.log(
                '⚠️ Email field not found. Continuing...'
            );

            return;
        }

        await input.fill(
            this.testEmail
        );

        console.log(
            `📧 Email entered: ${this.testEmail}`
        );
    }


    // =========================================================
    // PHONE
    // =========================================================

    async fillPhone() {

        const input =
            await this.findVisibleInput([

                'input:not([type="hidden"])[type="tel"]',
                'input:not([type="hidden"])[placeholder*="phone" i]',
                'input:not([type="hidden"])[placeholder*="mobile" i]',
                'input:not([type="hidden"])[name*="phone" i]',
                'input:not([type="hidden"])[name*="mobile" i]',
                'input:not([type="hidden"])[id*="phone" i]'

            ]);

        if (!input) {

            console.log(
                '⚠️ Phone field not found. Continuing...'
            );

            return;
        }

        await input.fill(
            this.testPhone
        );

        console.log(
            `📱 Phone entered: ${this.testPhone}`
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

        for (let i = 0; i < count; i++) {

            try {

                const select =
                    selects.nth(i);

                if (!await select.isVisible()) {
                    continue;
                }

                const options =
                    await select
                        .locator('option')
                        .evaluateAll(
                            elements =>
                                elements.map(
                                    option => ({
                                        text:
                                            option.textContent.trim(),

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
                        .toLowerCase();

                const isCurrency =
                    optionText.includes('gbp') ||
                    optionText.includes('eur') ||
                    optionText.includes('aud') ||
                    optionText.includes('pound') ||
                    optionText.includes('euro') ||
                    optionText.includes('australian');

                if (isCurrency) {
                    continue;
                }

                const hasService =
                    optionText.includes('assignment') ||
                    optionText.includes('essay') ||
                    optionText.includes('coursework') ||
                    optionText.includes('dissertation') ||
                    optionText.includes('thesis') ||
                    optionText.includes('homework');

                if (hasService) {

                    console.log(
                        `✅ Service dropdown found: select ${i + 1}`
                    );

                    return select;
                }

            } catch {
                // Continue
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

            console.log(
                `⚠️ Service dropdown not found on ${this.websiteName}.`
            );

            return false;
        }

        const options =
            await dropdown
                .locator('option')
                .evaluateAll(
                    elements =>
                        elements.map(
                            option => ({
                                text:
                                    option.textContent.trim(),

                                value:
                                    option.value
                            })
                        )
                );

        let matchingOption =
            options.find(
                option =>
                    option.text.toLowerCase() ===
                    this.testService.toLowerCase()
            );

        if (!matchingOption) {

            matchingOption =
                options.find(
                    option =>
                        option.text
                            .toLowerCase()
                            .includes(
                                this.testService.toLowerCase()
                            )
                );
        }

        if (!matchingOption) {

            console.log(
                `⚠️ Service "${this.testService}" was not found.`
            );

            return false;
        }

        console.log(
            'Using service option:',
            matchingOption
        );

        await dropdown.selectOption(
            matchingOption.value
        );

        await dropdown.dispatchEvent(
            'change'
        );

        await this.page.waitForTimeout(500);

        console.log(
            `✅ Service selected: ${matchingOption.text}`
        );

        return true;
    }


    // =========================================================
    // FIND CURRENCY DROPDOWN
    // =========================================================

    async findCurrencyDropdown() {

        const selects =
            this.page.locator('select');

        const count =
            await selects.count();

        for (let i = 0; i < count; i++) {

            try {

                const select =
                    selects.nth(i);

                if (!await select.isVisible()) {
                    continue;
                }

                const options =
                    await select
                        .locator('option')
                        .evaluateAll(
                            elements =>
                                elements.map(
                                    option => ({
                                        text:
                                            option.textContent.trim(),

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

                const currencyCount = [

                    optionText.includes('GBP') ||
                    optionText.includes('POUND'),

                    optionText.includes('EUR') ||
                    optionText.includes('EURO'),

                    optionText.includes('AUD') ||
                    optionText.includes('AUSTRALIAN')

                ].filter(Boolean).length;

                if (currencyCount >= 2) {

                    console.log(
                        `✅ Currency dropdown found: select ${i + 1}`
                    );

                    return select;
                }

            } catch {
                // Continue
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
                `Currency dropdown was not found on ${this.websiteName}.`
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
                                    option.textContent.trim(),

                                value:
                                    option.value
                            })
                        )
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
                `${currency} option was not found on ${this.websiteName}.`
            );
        }

        console.log(
            'Using currency option:',
            matchingOption
        );

        await dropdown.selectOption(
            matchingOption.value
        );

        await dropdown.dispatchEvent(
            'change'
        );

        await this.page.waitForTimeout(500);

        console.log(
            `✅ ${currency} selected`
        );
    }


    // =========================================================
    // FIND AMOUNT INPUT
    // =========================================================

    async findAmountInput() {

        return await this.findVisibleInput([

            'input:not([type="hidden"])[placeholder="Amount"]',
            'input:not([type="hidden"])[placeholder*="amount" i]',
            'input:not([type="hidden"])[name*="amount" i]',
            'input:not([type="hidden"])[id*="amount" i]',
            'input:not([type="hidden"])[type="number"]'

        ]);
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
                `Amount input was not found on ${this.websiteName}.`
            );
        }

        await amountInput.fill(
            String(amount)
        );

        await amountInput.dispatchEvent(
            'input'
        );

        await amountInput.dispatchEvent(
            'change'
        );

        await this.page.waitForTimeout(500);

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

        const checkboxes =
            this.page.locator(
                'input[type="checkbox"]'
            );

        const count =
            await checkboxes.count();

        if (count === 0) {

            throw new Error(
                `Terms and conditions checkbox was not found on ${this.websiteName}.`
            );
        }

        let termsCheckbox = null;

        for (let i = 0; i < count; i++) {

            const candidate =
                checkboxes.nth(i);

            try {

                if (!await candidate.isVisible()) {
                    continue;
                }

                const text =
                    await candidate.evaluate(
                        element => {

                            const parent =
                                element.closest('label') ||
                                element.parentElement;

                            return parent
                                ? parent.innerText
                                : '';
                        }
                    );

                if (
                    /terms|conditions|agree/i.test(text)
                ) {

                    termsCheckbox =
                        candidate;

                    break;
                }

            } catch {
                // Continue
            }
        }

        if (!termsCheckbox && count === 1) {
            termsCheckbox = checkboxes.first();
        }

        if (!termsCheckbox) {

            throw new Error(
                'Terms and conditions checkbox could not be identified.'
            );
        }

        if (!await termsCheckbox.isChecked()) {
            await termsCheckbox.check();
        }

        if (!await termsCheckbox.isChecked()) {

            throw new Error(
                'Terms and conditions checkbox could not be checked.'
            );
        }

        console.log(
            '✅ Terms and conditions accepted'
        );
    }


    // =========================================================
    // VERIFY FORM
    // =========================================================

    async verifyFormBeforePayment() {

        console.log(
            '\n🔎 Verifying form before Pay Now...'
        );

        const firstName =
            await this.findVisibleInput([

                'input:not([type="hidden"])[placeholder*="First Name" i]',
                'input:not([type="hidden"])[name*="first" i]',
                'input:not([type="hidden"])[id*="first" i]'

            ]);

        if (firstName) {

            const value =
                await firstName.inputValue();

            console.log(
                `First Name: ${value || 'EMPTY'}`
            );

            if (!value) {

                throw new Error(
                    'First Name is empty before Pay Now.'
                );
            }
        }

        const lastName =
            await this.findVisibleInput([

                'input:not([type="hidden"])[placeholder*="Last Name" i]',
                'input:not([type="hidden"])[name*="last" i]',
                'input:not([type="hidden"])[id*="last" i]'

            ]);

        if (lastName) {

            const value =
                await lastName.inputValue();

            console.log(
                `Last Name: ${value || 'EMPTY'}`
            );

            if (!value) {

                throw new Error(
                    'Last Name is empty before Pay Now.'
                );
            }
        }

        const amount =
            await this.findAmountInput();

        if (amount) {

            const value =
                await amount.inputValue();

            console.log(
                `Amount: ${value || 'EMPTY'}`
            );

            if (!value) {

                throw new Error(
                    'Amount is empty before Pay Now.'
                );
            }
        }

        console.log(
            '✅ Form verification completed.'
        );
    }


    // =========================================================
    // FIND PAY NOW
    // =========================================================

    async findPayNowButton() {

        const selectors = [

            '#payButton',

            'button:has-text("Pay Now")',

            'button:has-text("Pay now")',

            'input[type="submit"][value*="Pay Now" i]',

            'button[type="submit"]',

            'input[type="submit"]'

        ];

        for (const selector of selectors) {

            try {

                const locator =
                    this.page.locator(selector);

                const count =
                    await locator.count();

                for (let i = 0; i < count; i++) {

                    const element =
                        locator.nth(i);

                    if (
                        await element.isVisible() &&
                        await element.isEnabled()
                    ) {

                        return element;
                    }
                }

            } catch {
                // Continue
            }
        }

        return null;
    }


    // =========================================================
    // IS PAYMENT PAGE
    // =========================================================

    isPaymentPage(url) {

        if (!url) {
            return false;
        }

        const lowerUrl =
            url.toLowerCase();

        return (

            lowerUrl.includes('checkout.stripe.com') ||

            lowerUrl.includes('securepayments702.digiwiser.co') ||

            lowerUrl.includes('digiwiser.co') ||

            lowerUrl.includes('stripe.com') ||

            lowerUrl.includes('payment') ||

            lowerUrl.includes('checkout') ||

            lowerUrl.includes('validator.php')

        );
    }


    // =========================================================
    // CLICK PAY NOW
    // =========================================================

    async clickPayNow() {

        console.log(
            '💳 Clicking Pay Now...'
        );

        const payNow =
            await this.findPayNowButton();

        if (!payNow) {

            throw new Error(
                `Pay Now button was not found on ${this.websiteName}.`
            );
        }

        const oldUrl =
            this.page.url();

        const pagesBefore =
            [...this.context.pages()];

        console.log(
            `Current page: ${oldUrl}`
        );

        await payNow.click({
            timeout: 10000
        });

        console.log(
            '✅ Pay Now clicked'
        );

        // Wait for navigation/new page
        await this.page.waitForTimeout(3000);

        // =====================================================
        // CHECK NEW PAGES
        // =====================================================

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
                    currentPage =>
                        !pagesBefore.includes(
                            currentPage
                        )
                );

            if (newPages.length > 0) {

                this.page =
                    newPages[
                        newPages.length - 1
                    ];

                await this.page
                    .waitForLoadState(
                        'domcontentloaded'
                    )
                    .catch(() => {});

                await this.page.waitForTimeout(2000);
            }
        }

        // =====================================================
        // CHECK ALL OPEN PAGES
        // =====================================================

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
                this.isPaymentPage(url)
            ) {

                console.log(
                    '🎉 Payment page detected!'
                );

                this.page =
                    currentPage;

                await this.page
                    .waitForLoadState(
                        'domcontentloaded'
                    )
                    .catch(() => {});

                await this.page.waitForTimeout(3000);

                console.log(
                    `🔗 Payment URL: ${this.page.url()}`
                );

                return true;
            }
        }

        // =====================================================
        // SAME PAGE NAVIGATION
        // =====================================================

        const currentUrl =
            this.page.url();

        if (
            currentUrl !== oldUrl
        ) {

            console.log(
                `🔄 Page navigated to: ${currentUrl}`
            );

            if (
                this.isPaymentPage(currentUrl)
            ) {

                console.log(
                    '🎉 Payment page detected!'
                );

                return true;
            }
        }

        return false;
    }


    // =========================================================
    // WAIT FOR PAYMENT PAGE
    // =========================================================

    async waitForPaymentPage() {

        console.log(
            '⏳ Waiting for payment page...'
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

                console.log(
                    `🔍 Checking: ${url}`
                );

                if (
                    this.isPaymentPage(url)
                ) {

                    console.log(
                        '✅ Payment page detected'
                    );

                    this.page =
                        currentPage;

                    await this.page
                        .waitForLoadState(
                            'domcontentloaded'
                        )
                        .catch(() => {});

                    await this.page.waitForTimeout(3000);

                    console.log(
                        `🔗 Payment URL: ${this.page.url()}`
                    );

                    return this.page;
                }
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
            'Payment/checkout page was not detected within 30 seconds.'
        );
    }


    // =========================================================
    // EXTRACT NUMBER
    // =========================================================

    extractNumber(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return null;
        }

        const cleaned =
            String(value)
                .replace(/,/g, '')
                .replace(/[^\d.-]/g, '');

        const number =
            Number(cleaned);

        if (Number.isNaN(number)) {
            return null;
        }

        return number;
    }


    // =========================================================
    // EXTRACT PKR
    // =========================================================

    extractPKR(text) {

        if (!text) {
            return null;
        }

        const patterns = [

            /PKR\s*[:\-]?\s*([\d,.]+)/i,

            /([\d,.]+)\s*PKR/i,

            /Rs\.?\s*[:\-]?\s*([\d,.]+)/i,

            /([\d,.]+)\s*Rs\.?/i,

            /₨\s*([\d,.]+)/i,

            /([\d,.]+)\s*₨/i

        ];

        for (const pattern of patterns) {

            const match =
                text.match(pattern);

            if (match) {

                const value =
                    this.extractNumber(
                        match[1]
                    );

                if (
                    value !== null
                ) {

                    return value;
                }
            }
        }

        return null;
    }


    // =========================================================
    // EXTRACT FOREIGN AMOUNT
    // =========================================================

    extractForeignAmount(text, currency) {

        if (!text) {
            return null;
        }

        const patterns = {

            GBP: [

                /£\s*([\d,.]+)/i,
                /GBP\s*[:\-]?\s*([\d,.]+)/i,
                /([\d,.]+)\s*GBP/i

            ],

            EUR: [

                /€\s*([\d,.]+)/i,
                /EUR\s*[:\-]?\s*([\d,.]+)/i,
                /([\d,.]+)\s*EUR/i

            ],

            AUD: [

                /A\$\s*([\d,.]+)/i,
                /AUD\s*[:\-]?\s*([\d,.]+)/i,
                /([\d,.]+)\s*AUD/i

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

                const value =
                    this.extractNumber(
                        match[1]
                    );

                if (
                    value !== null
                ) {

                    return value;
                }
            }
        }

        return null;
    }


    // =========================================================
    // EXTRACT DISPLAYED RATE
    // =========================================================

    extractDisplayedRate(text, currency) {

        if (!text) {
            return null;
        }

        const currencyNames = {

            GBP: '(?:GBP|POUND|POUNDS|£)',

            EUR: '(?:EUR|EURO|EUROS|€)',

            AUD: '(?:AUD|AUSTRALIAN\\s+DOLLAR|A\\$)'

        };

        const currencyPattern =
            currencyNames[currency];

        if (!currencyPattern) {
            return null;
        }

        const patterns = [

            new RegExp(
                `1\\s*${currencyPattern}\\s*=\\s*(?:PKR\\s*)?([\\d,.]+)\\s*PKR?`,
                'i'
            ),

            new RegExp(
                `1\\s*${currencyPattern}\\s*(?:equals|is)\\s*(?:PKR\\s*)?([\\d,.]+)`,
                'i'
            ),

            new RegExp(
                `${currencyPattern}\\s*1\\s*=\\s*(?:PKR\\s*)?([\\d,.]+)\\s*PKR?`,
                'i'
            ),

            new RegExp(
                `(?:PKR\\s*)?([\\d,.]+)\\s*PKR\\s*=\\s*1\\s*${currencyPattern}`,
                'i'
            )

        ];

        for (
            const pattern
            of patterns
        ) {

            const match =
                text.match(pattern);

            if (match) {

                const value =
                    this.extractNumber(
                        match[1]
                    );

                if (
                    value !== null
                ) {

                    return value;
                }
            }
        }

        return null;
    }


    // =========================================================
    // EXTRACT CONVERSION FEE
    // =========================================================

    extractConversionFee(text) {

        if (!text) {
            return 0;
        }

        const patterns = [

            /includes\s+([\d.]+)\s*%\s*conversion\s*fee/i,

            /conversion\s*fee\s*[:\-]?\s*([\d.]+)\s*%/i,

            /conversion\s*fee\s*(?:of)?\s*([\d.]+)\s*%/i,

            /([\d.]+)\s*%\s*conversion\s*fee/i

        ];

        for (
            const pattern
            of patterns
        ) {

            const match =
                text.match(pattern);

            if (match) {

                const fee =
                    Number(match[1]);

                if (
                    !Number.isNaN(fee)
                ) {

                    return fee;
                }
            }
        }

        return 0;
    }


    // =========================================================
    // READ PAYMENT CONVERSION
    // =========================================================

    async readPaymentConversion(
        currency,
        enteredAmount
    ) {

        console.log(
            '\n🔍 Reading payment conversion...'
        );

        const bodyText =
            await this.page
                .locator('body')
                .innerText()
                .catch(() => '');

        console.log(
            '\n---------- PAYMENT PAGE TEXT ----------'
        );

        console.log(
            bodyText.substring(0, 4000)
        );

        console.log(
            '---------------------------------------'
        );

        const pkrAmount =
            this.extractPKR(
                bodyText
            );

        let foreignAmount =
            this.extractForeignAmount(
                bodyText,
                currency
            );

        // The entered amount is known and safer
        // than guessing from payment-page text.
        if (
            foreignAmount === null ||
            foreignAmount === 0
        ) {

            foreignAmount =
                Number(enteredAmount);
        }

        const displayedRate =
            this.extractDisplayedRate(
                bodyText,
                currency
            );

        const conversionFee =
            this.extractConversionFee(
                bodyText
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

        // =====================================================
        // FINAL RATE
        // =====================================================

        let finalRate =
            displayedRate;

        if (
            finalRate === null
        ) {

            finalRate =
                calculatedRate;
        }

        // =====================================================
        // REMOVE CONVERSION FEE
        // =====================================================

        let adjustedRate =
            finalRate;

        if (
            finalRate !== null &&
            conversionFee > 0
        ) {

            adjustedRate =
                finalRate /
                (1 + conversionFee / 100);
        }

        console.log(
            '\n💱 Payment conversion data:'
        );

        console.table([{

            Website:
                this.websiteName,

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
                    : 'N/A',

            ConversionFee:
                `${conversionFee}%`,

            AdjustedRate:
                adjustedRate !== null
                    ? Number(
                        adjustedRate.toFixed(6)
                    )
                    : 'N/A'

        }]);

        return {

            foreignAmount,

            pkrAmount,

            displayedRate,

            calculatedRate,

            conversionFee,

            adjustedRate,

            paymentUrl:
                this.page.url()
        };
    }


    // =========================================================
    // SAVE ERROR SCREENSHOT
    // =========================================================

    async saveErrorScreenshot(currency) {

        try {

            await this.page.screenshot({

                path:
                    this.getScreenshotPath(
                        currency,
                        'error'
                    ),

                fullPage:
                    true
            });

            console.log(
                `📸 Error screenshot saved: ${
                    this.getScreenshotPath(
                        currency,
                        'error'
                    )
                }`
            );

        } catch {

            console.log(
                '⚠️ Could not save error screenshot.'
            );
        }
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
            `Website       : ${this.websiteName}`
        );

        console.log(
            `URL           : ${this.orderUrl}`
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

            // =================================================
            // 1. OPEN
            // =================================================

            await this.openOrderPage();

            // =================================================
            // 2. CUSTOMER
            // =================================================

            await this.fillFirstName();

            await this.fillLastName();

            await this.fillEmail();

            await this.fillPhone();

            // =================================================
            // 3. SERVICE
            // =================================================

            await this.selectService();

            // =================================================
            // 4. CURRENCY
            // =================================================

            await this.selectCurrency(
                currency
            );

            // =================================================
            // 5. AMOUNT
            // =================================================

            await this.fillAmount(
                amount
            );

            // =================================================
            // 6. TERMS
            // =================================================

            await this.acceptTerms();

            // =================================================
            // 7. VERIFY
            // =================================================

            await this.verifyFormBeforePayment();

            // =================================================
            // 8. PRE PAYMENT SCREENSHOT
            // =================================================

            const prePaymentPath =
                this.getScreenshotPath(
                    currency,
                    'pre-payment'
                );

            await this.page.screenshot({

                path:
                    prePaymentPath,

                fullPage:
                    true
            });

            console.log(
                `📸 Pre-payment screenshot saved: ${prePaymentPath}`
            );

            // =================================================
            // 9. CLICK PAY NOW
            // =================================================

            const paymentOpened =
                await this.clickPayNow();

            if (!paymentOpened) {

                console.log(
                    '\n⚠️ Payment page did not open immediately.'
                );

                console.log(
                    `Current URL: ${this.page.url()}`
                );

                await this.page.screenshot({

                    path:
                        this.getScreenshotPath(
                            currency,
                            'after-pay-now'
                        ),

                    fullPage:
                        true
                });

                await this.waitForPaymentPage();
            }

            // =================================================
            // 10. READ PAYMENT PAGE
            // =================================================

            const paymentData =
                await this.readPaymentConversion(
                    currency,
                    amount
                );

            // =================================================
            // 11. ACTUAL RATE
            // =================================================

            const actualRate =
                paymentData.adjustedRate;

            // =================================================
            // 12. DIFFERENCE
            // =================================================

            let difference =
                null;

            let status =
                'FAIL';

            if (
                actualRate !== null
            ) {

                difference =
                    Math.abs(
                        actualRate -
                        expectedRate
                    );

                if (
                    difference <=
                    this.tolerance
                ) {

                    status =
                        'PASS';
                }
            }

            // =================================================
            // 13. RESULT
            // =================================================

            const result = {

                Website:
                    this.websiteName,

                URL:
                    this.orderUrl,

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
                    paymentData.foreignAmount ??
                    'N/A',

                PKRAmount:
                    paymentData.pkrAmount ??
                    'N/A',

                ConversionFee:
                    paymentData.conversionFee,

                PaymentURL:
                    paymentData.paymentUrl,

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

            // =================================================
            // 14. RESULT SCREENSHOT
            // =================================================

            const resultPath =
                this.getScreenshotPath(
                    currency,
                    'result'
                );

            await this.page.screenshot({

                path:
                    resultPath,

                fullPage:
                    true
            });

            console.log(
                `📸 Result screenshot saved: ${resultPath}`
            );

            if (
                status === 'PASS'
            ) {

                console.log(
                    `\n✅ ${this.websiteName} - ${currency} PASS`
                );

            } else {

                console.log(
                    `\n❌ ${this.websiteName} - ${currency} FAIL`
                );
            }

            return result;

        } catch (error) {

            console.error(
                `\n❌ ${this.websiteName} - ${currency} test failed`
            );

            console.error(
                error.message
            );

            await this.saveErrorScreenshot(
                currency
            );

            const result = {

                Website:
                    this.websiteName,

                URL:
                    this.orderUrl,

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

                ConversionFee:
                    'N/A',

                PaymentURL:
                    this.page.url(),

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