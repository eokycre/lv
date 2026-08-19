document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".raksti-container");


    if (!container) {
        return;
    }


    if (typeof raksti === "undefined") {

        console.error(
            "raksti.js nav ielādēts."
        );

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
        localStorage.getItem(
            "zeltainsLanguage"
        ) || "lv";


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
       VALODAS MAIŅA NO HEADERA
       ===================================================== */

    document.addEventListener(
        "zeltainsLanguageChange",
        function (event) {

            const language =
                event.detail &&
                event.detail.language;


            if (
                !supportedLanguages.includes(
                    language
                )
            ) {

                return;
            }


            currentLanguage =
                language;


            renderCards();

        }
    );


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


                if (!saturs) {
                    return;
                }


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
                        alt="${escapeHtml(
                            saturs.title
                        )}"
                        loading="lazy"
                    >

                    <div class="raksts-card-content">

                        <div
                            class="raksts-card-category"
                        >
                            ${escapeHtml(
                                getCategoryName(
                                    raksts.category
                                )
                            )}
                        </div>

                        <h2
                            class="raksts-card-title"
                        >
                            ${escapeHtml(
                                saturs.title
                            )}
                        </h2>

                        <p
                            class="raksts-card-excerpt"
                        >
                            ${escapeHtml(
                                saturs.excerpt
                            )}
                        </p>

                    </div>

                `;


                card.addEventListener(
                    "click",
                    function () {

                        openArticle(
                            raksts
                        );

                    }
                );


                container.appendChild(
                    card
                );

            }
        );
    }


    /* =====================================================
       PIEEJAMĀ VALODA
       ===================================================== */

    function getAvailableLanguage(
        raksts
    ) {

        /*
         * Vispirms mēģinām izvēlēto valodu.
         */

        if (
            raksts[currentLanguage]
        ) {

            return currentLanguage;
        }


        /*
         * Ja tās nav, izmantojam LV.
         */

        if (raksts.lv) {

            return "lv";
        }


        /*
         * Drošības variants:
         * atrodam jebkuru pieejamu valodu.
         */

        for (
            const language
            of supportedLanguages
        ) {

            if (raksts[language]) {

                return language;
            }
        }


        return null;
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

                <div
                    class="raksts-modal-content"
                >

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


        if (!valoda) {
            return;
        }


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
                alt="${escapeHtml(
                    saturs.title
                )}"
            >

            <div
                class="raksts-modal-category"
            >
                ${escapeHtml(
                    getCategoryName(
                        raksts.category
                    )
                )}
            </div>

            ${
                translationMissing
                    ? `
                        <div
                            class="
                                raksts-translation-notice
                            "
                        >

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

            <h1
                class="raksts-modal-title"
            >
                ${escapeHtml(
                    saturs.title
                )}
            </h1>

            <div
                class="raksts-modal-text"
            >
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
       HTML DROŠĪBA
       ===================================================== */

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       ESC — AIZVĒRT RAKSTU
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