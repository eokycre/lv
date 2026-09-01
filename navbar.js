document.addEventListener("DOMContentLoaded", function () {

    if (document.querySelector(".navbar")) {
        return;
    }


    /* =========================================================
       VALODAS
       ========================================================= */

    const supportedLanguages = [
        "lv",
        "en",
        "fr",
        "it"
    ];


    let currentLanguage =
        localStorage.getItem("zeltainsLanguage") || "lv";


    if (!supportedLanguages.includes(currentLanguage)) {
        currentLanguage = "lv";
    }


    /* =========================================================
       HEADER
       ========================================================= */

    document.body.insertAdjacentHTML("afterbegin", `

        <nav class="navbar">

            <div class="menu">

                <a
                    href="piedzivojumi.html"
                    data-nav="adventure"
                >
                    PIEDZĪVOJUMI
                </a>

                <a
                    href="dzivesstils.html"
                    data-nav="lifestyle"
                >
                    DZĪVESSTILS
                </a>

            </div>


            <a
                href="index.html"
                class="logo-title"
                aria-label="ZELTAINS sākumlapa"
            >

                <span data-letter="Z">Z</span>
                <span data-letter="E">E</span>
                <span data-letter="L">L</span>
                <span data-letter="T">T</span>
                <span data-letter="A">A</span>
                <span data-letter="I">I</span>
                <span data-letter="N">N</span>
                <span data-letter="S">S</span>

            </a>


            <div class="header-right">

                <div
                    class="valodu-izvele"
                    aria-label="Valoda"
                >

                    <button
                        type="button"
                        data-language="lv"
                    >
                        LV
                    </button>

                    <button
                        type="button"
                        data-language="en"
                    >
                        EN
                    </button>

                    <button
                        type="button"
                        data-language="fr"
                    >
                        FR
                    </button>

                    <button
                        type="button"
                        data-language="it"
                    >
                        IT
                    </button>

                </div>


                <a
                    class="contacts"
                    href="kontakti.html"
                    aria-label="Kontakti"
                >

                    <svg
                        class="svg-envelope"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >

                        <path d="
                            M22,4H2C0.9,4,0,4.9,0,6v12
                            c0,1.1,0.9,2,2,2h20
                            c1.1,0,2-0.9,2-2V6
                            C24,4.9,23.1,4,22,4z
                            M22,6l-10,7L2,6H22z
                            M2,18V8l10,7l10-7v10H2z
                        "/>

                    </svg>

                </a>

            </div>

        </nav>
    `);


    const navbar =
        document.querySelector(".navbar");


    const letters =
        document.querySelectorAll(
            ".logo-title span"
        );


    const languageButtons =
        document.querySelectorAll(
            ".valodu-izvele button"
        );


    /* =========================================================
       TEKSTI
       ========================================================= */

    const translations = {

        lv: {
            adventure: "PIEDZĪVOJUMI",
            lifestyle: "DZĪVESSTILS",
            contacts: "KONTAKTI"
        },

        en: {
            adventure: "ADVENTURES",
            lifestyle: "LIFESTYLE",
            contacts: "CONTACTS"
        },

        fr: {
            adventure: "AVENTURES",
            lifestyle: "STYLE DE VIE",
            contacts: "CONTACTS"
        },

        it: {
            adventure: "AVVENTURE",
            lifestyle: "STILE DI VITA",
            contacts: "CONTATTI"
        }

    };


    function updateNavigationText() {

        const texts =
            translations[currentLanguage] ||
            translations.lv;


        document
            .querySelectorAll("[data-nav]")
            .forEach(function (element) {

                const key =
                    element.dataset.nav;

                if (texts[key]) {
                    element.textContent =
                        texts[key];
                }

            });


        const contacts =
            document.querySelector(".contacts");

        if (contacts) {

            contacts.setAttribute(
                "aria-label",
                texts.contacts
            );
        }


        const heading =
            document.querySelector(
                ".page-heading h1"
            );


        if (heading) {

            const page =
                document.body.dataset.page;


            if (
                page === "adventure" &&
                texts.adventure
            ) {
                heading.textContent =
                    texts.adventure;
            }


            if (
                page === "lifestyle" &&
                texts.lifestyle
            ) {
                heading.textContent =
                    texts.lifestyle;
            }


            if (
                page === "contacts" &&
                texts.contacts
            ) {
                heading.textContent =
                    texts.contacts;
            }
        }
    }


    /* =========================================================
       VALODU POGAS
       ========================================================= */

    function updateLanguageButtons() {

        languageButtons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",

                    button.dataset.language ===
                    currentLanguage
                );

            }
        );
    }


    languageButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const nextLanguage =
                        button.dataset.language;

                    document.documentElement.classList.remove("lang-ready");

                    currentLanguage =
                        nextLanguage;


                    localStorage.setItem(
                        "zeltainsLanguage",
                        currentLanguage
                    );


                    updateLanguageButtons();

                    updateNavigationText();

                    window.setTimeout(function () {
                        document.documentElement.classList.add("lang-ready");
                    }, 120);

                    document.dispatchEvent(
                        new CustomEvent(
                            "zeltainsLanguageChanged",
                            {
                                detail: {
                                    language:
                                        currentLanguage
                                }
                            }
                        )
                    );

                }
            );

        }
    );


    updateLanguageButtons();

    updateNavigationText();

    requestAnimationFrame(function () {
        document.documentElement.classList.add("lang-ready");
    });


    /* =========================================================
       ZELTAINS PELĒ
       ========================================================= */

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let active = false;
    let touchActive = false;
    let animationRunning = false;


    function setGlow(value) {

        letters.forEach(
            function (letter) {

                letter.style.setProperty(
                    "--glow-opacity",
                    value
                );

            }
        );
    }


    function updatePosition(x, y) {

        targetX = x;
        targetY = y;


        if (!active) {

            currentX = x;
            currentY = y;

        }
    }


    function startAnimation() {

        if (animationRunning) {
            return;
        }


        animationRunning = true;

        requestAnimationFrame(
            animate
        );
    }


    /* =========================================================
       POINTER
       ========================================================= */

    navbar.addEventListener(
        "pointerenter",
        function (event) {

            if (event.pointerType === "touch") {
                return;
            }


            active = true;


            updatePosition(
                event.clientX,
                event.clientY
            );


            setGlow("1");

            startAnimation();

        }
    );


    navbar.addEventListener(
        "pointermove",
        function (event) {

            if (event.pointerType === "touch") {
                return;
            }


            updatePosition(
                event.clientX,
                event.clientY
            );

        }
    );


    navbar.addEventListener(
        "pointerleave",
        function (event) {

            if (event.pointerType === "touch") {
                return;
            }


            active = false;

            setGlow("0");

        }
    );


    /* =========================================================
       TOUCH
       ========================================================= */

    navbar.addEventListener(
        "touchstart",
        function (event) {

            if (!event.touches.length) {
                return;
            }


            const touch =
                event.touches[0];


            touchActive = true;
            active = true;


            updatePosition(
                touch.clientX,
                touch.clientY
            );


            setGlow("1");

            startAnimation();

        },
        {
            passive: true
        }
    );


    navbar.addEventListener(
        "touchmove",
        function (event) {

            if (!touchActive) {
                return;
            }


            if (!event.touches.length) {
                return;
            }


            const touch =
                event.touches[0];


            updatePosition(
                touch.clientX,
                touch.clientY
            );


            setGlow("1");

        },
        {
            passive: true
        }
    );


    navbar.addEventListener(
        "touchend",
        function () {

            touchActive = false;
            active = false;

            setGlow("0");

        },
        {
            passive: true
        }
    );


    navbar.addEventListener(
        "touchcancel",
        function () {

            touchActive = false;
            active = false;

            setGlow("0");

        },
        {
            passive: true
        }
    );


    /* =========================================================
       ANIMĀCIJA
       ========================================================= */

    function animate() {

        if (!active) {
            animationRunning = false;
            return;
        }

        currentX +=
            (targetX - currentX) * 0.12;


        currentY +=
            (targetY - currentY) * 0.12;


        if (active) {

            letters.forEach(
                function (letter) {

                    const rect =
                        letter.getBoundingClientRect();


                    const x =
                        currentX - rect.left;


                    const y =
                        currentY - rect.top;


                    letter.style.setProperty(
                        "--mouse-x",
                        `${x}px`
                    );


                    letter.style.setProperty(
                        "--mouse-y",
                        `${y}px`
                    );

                }
            );

        }


        requestAnimationFrame(
            animate
        );
    }

});