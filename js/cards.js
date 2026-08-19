document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".raksti-container");

    if (!container) {
        return;
    }

    if (typeof raksti === "undefined") {
        console.error("raksti.js nav ielādēts.");
        return;
    }


    /* =====================================================
       VALODAS
       ===================================================== */

    const supportedLanguages = [
        "lv",
        "en",
        "fr",
        "it"
    ];


    let currentLanguage =
        localStorage.getItem("zeltainsLanguage") || "lv";


    if (
        !supportedLanguages.includes(
            currentLanguage
        )
    ) {
        currentLanguage = "lv";
    }


    /* =====================================================
       LAPAS IESTATĪJUMI
       ===================================================== */

    const category =
        container.dataset.category || "all";


    const limitValue =
        container.dataset.limit;


    const limit =
        limitValue
            ? Number(limitValue)
            : null;


    /* =====================================================
       VALODU IZVĒLNE
       ===================================================== */

    createLanguageSelector();


    /* =====================================================
       RAKSTU ATLASE
       ===================================================== */

    let redzamieRaksti =
        [...raksti];


    if (category !== "all") {

        redzamieRaksti =
            redzamieRaksti.filter(
                function (raksts) {

                    return (
                        raksts.category ===
                        category
                    );

                }
            );
    }


    /* =====================================================
       JAUNĀKAIS PIRMAIS
       ===================================================== */

    redzamieRaksti.sort(
        function (a, b) {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );


    /* =====================================================
       LIMITS
       ===================================================== */

    if (limit !== null) {

        redzamieRaksti =
            redzamieRaksti.slice(
                0,
                limit
            );
    }


    /* =====================================================
       SĀKOTNĒJĀ IZVEIDE
       ===================================================== */

    renderCards();


    /* =====================================================
       CARDS
       ===================================================== */

    function renderCards() {

        container.innerHTML = "";


        redzamieRaksti.forEach(
            function (raksts) {

                const valoda =
                    getAvailableLanguage(
                        raksts
                    );


                const saturs =
                    raksts[valoda];


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "raksts-card";


                card.innerHTML = `

                    <img
                        class="raksts-card-image"
                        src="${raksts.image}"
                        alt="${saturs.title}"
                    >

                    <div class="raksts-card-content">

                        <div class="raksts-card-category">
                            ${getCategoryName(
                                raksts.category
                            )}
                        </div>

                        <h2 class="raksts-card-title">
                            ${saturs.title}
                        </h2>

                        <p class="raksts-card-excerpt">
                            ${saturs.excerpt}
                        </p>

                    </div>

                `;


                card.addEventListener(
                    "click",
                    function () {

                        openArticle(raksts);

                    }
                );


                container.appendChild(card);

            }
        );
    }


    /* =====================================================
       PIEEJAMĀ VALODA
       ===================================================== */

    function getAvailableLanguage(
        raksts
    ) {

        if (
            raksts[currentLanguage]
        ) {

            return currentLanguage;
        }


        if (raksts.lv) {

            return "lv";
        }


        for (
            const language
            of supportedLanguages
        ) {

            if (raksts[language]) {

                return language;
            }
        }


        return "lv";
    }


    /* =====================================================
       VALODAS IZVĒLNE
       ===================================================== */

    function createLanguageSelector() {

        let selector =
            document.querySelector(
                ".valodu-izvele"
            );


        if (!selector) {

            selector =
                document.createElement(
                    "nav"
                );


            selector.className =
                "valodu-izvele";


            document.body.insertBefore(
                selector,
                document.body.firstChild
            );
        }


        selector.innerHTML = "";


        supportedLanguages.forEach(
            function (language) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type = "button";


                button.dataset.language =
                    language;


                button.textContent =
                    language.toUpperCase();


                if (
                    language ===
                    currentLanguage
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                button.addEventListener(
                    "click",
                    function () {

                        currentLanguage =
                            language;


                        localStorage.setItem(
                            "zeltainsLanguage",
                            language
                        );


                        updateLanguageButtons();

                        renderCards();

                    }
                );


                selector.appendChild(
                    button
                );

            }
        );
    }


    /* =====================================================
       VALODU POGU AKTĪVAIS STĀVOKLIS
       ===================================================== */

    function updateLanguageButtons() {

        const buttons =
            document.querySelectorAll(
                ".valodu-izvele button"
            );


        buttons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",

                    button.dataset.language ===
                    currentLanguage
                );

            }
        );
    }


    /* =====================================================
       RAKSTA ATVĒRŠANA
       ===================================================== */

    function openArticle(
        raksts
    ) {

        let modal =
            document.querySelector(
                ".raksts-modal"
            );


        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );


            modal.className =
                "raksts-modal";


            modal.innerHTML = `

                <div class="raksts-modal-content">

                    <button
                        class="raksts-modal-close"
                        type="button"
                        aria-label="Aizvērt"
                    >
                        ×
                    </button>

                    <div
                        class="raksts-modal-body"
                    ></div>

                </div>

            `;


            document.body.appendChild(
                modal
            );


            modal
                .querySelector(
                    ".raksts-modal-close"
                )
                .addEventListener(
                    "click",
                    closeArticle
                );


            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeArticle();
                    }

                }
            );
        }


        const valoda =
            getAvailableLanguage(
                raksts
            );


        const saturs =
            raksts[valoda];


        const translationMissing =
            valoda !==
            currentLanguage;


        const body =
            modal.querySelector(
                ".raksts-modal-body"
            );


        body.innerHTML = `

            <img
                class="raksts-modal-image"
                src="${raksts.image}"
                alt="${saturs.title}"
            >

            <div class="raksts-modal-category">
                ${getCategoryName(
                    raksts.category
                )}
            </div>

            ${
                translationMissing
                    ? `
                        <div class="raksts-translation-notice">

                            Šis raksts pašlaik nav
                            pieejams
                            ${getLanguageName(
                                currentLanguage
                            )}
                            valodā.

                            Tiek rādīta
                            ${getLanguageName(
                                valoda
                            )}
                            versija.

                        </div>
                    `
                    : ""
            }

            <h1 class="raksts-modal-title">
                ${saturs.title}
            </h1>

            <div class="raksts-modal-text">
                ${saturs.content}
            </div>

        `;


        modal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";
    }


    /* =====================================================
       RAKSTA AIZVĒRŠANA
       ===================================================== */

    function closeArticle() {

        const modal =
            document.querySelector(
                ".raksts-modal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";
    }


    /* =====================================================
       KATEGORIJAS NOSAUKUMS
       ===================================================== */

    function getCategoryName(
        category
    ) {

        const names = {

            piedzivojumi:
                "Piedzīvojumi",

            dzivesstils:
                "Dzīvesstils"

        };


        return (
            names[category] ||
            category
        );
    }


    /* =====================================================
       VALODU NOSAUKUMI
       ===================================================== */

    function getLanguageName(
        language
    ) {

        const names = {

            lv: "latviešu",

            en: "angļu",

            fr: "franču",

            it: "itāļu"

        };


        return (
            names[language] ||
            language
        );
    }


    /* =====================================================
       ESC
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeArticle();

            }

        }
    );

});