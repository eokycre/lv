document.addEventListener("DOMContentLoaded", function () {

    if (document.querySelector(".navbar")) {
        return;
    }


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


    document.body.insertAdjacentHTML(
        "afterbegin",
        `
        <nav class="navbar">

            <div class="menu">

                <a href="piedzivojumi.html">
                    Piedzīvojumi
                </a>

                <a href="dzivesstils.html">
                    Dzīvesstils
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

                    ${supportedLanguages
                        .map(
                            function (language) {
                                return `
                                    <button
                                        type="button"
                                        data-language="${language}"
                                    >
                                        ${language.toUpperCase()}
                                    </button>
                                `;
                            }
                        )
                        .join("")}

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
                        <path
                            d="M22,4H2C0.9,4,0,4.9,0,6v12c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C24,4.9,23.1,4,22,4z M22,6l-10,7L2,6H22z M2,18V8l10,7l10-7v10H2z"
                        />
                    </svg>

                </a>

            </div>

        </nav>
        `
    );


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

                    currentLanguage =
                        button.dataset.language;


                    localStorage.setItem(
                        "zeltainsLanguage",
                        currentLanguage
                    );


                    updateLanguageButtons();


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


    /* =====================================================
       LOGO GOLD EFFECT
       ===================================================== */

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let active = false;


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


    function animate() {

        currentX +=
            (targetX - currentX) * 0.12;

        currentY +=
            (targetY - currentY) * 0.12;


        if (active) {

            letters.forEach(
                function (letter) {

                    const rect =
                        letter.getBoundingClientRect();


                    letter.style.setProperty(
                        "--mouse-x",
                        `${currentX - rect.left}px`
                    );


                    letter.style.setProperty(
                        "--mouse-y",
                        `${currentY - rect.top}px`
                    );

                }
            );
        }


        requestAnimationFrame(animate);
    }


    animate();

});