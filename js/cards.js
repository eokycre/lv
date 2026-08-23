document.addEventListener(
    "DOMContentLoaded",
    function () {

        const containers =
            document.querySelectorAll(
                ".raksti-container"
            );


        if (!containers.length) {
            return;
        }


        if (
            typeof raksti === "undefined"
        ) {

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
           VALODAS
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

                if (
                    raksts[language]
                ) {

                    return language;
                }

            }


            return null;
        }


        /* =====================================================
           KATEGORIJAS
           ===================================================== */

        function getCategoryName(
            category
        ) {

            const names = {

                piedzivojumi: {

                    lv: "Piedzīvojumi",
                    en: "Adventures",
                    fr: "Aventures",
                    it: "Avventure"

                },

                dzivesstils: {

                    lv: "Dzīvesstils",
                    en: "Lifestyle",
                    fr: "Style de vie",
                    it: "Stile di vita"

                }

            };


            if (
                names[category] &&
                names[category][currentLanguage]
            ) {

                return names[category][
                    currentLanguage
                ];
            }


            if (
                names[category] &&
                names[category].lv
            ) {

                return names[category].lv;
            }


            return category;
        }


        /* =====================================================
           HTML DROŠĪBA
           ===================================================== */

        function escapeHTML(
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
           HTML TEKSTAM
           ===================================================== */

        function safeText(
            value
        ) {

            return escapeHTML(
                value || ""
            );
        }


        /* =====================================================
           ATTĒLA DROŠĪBA
           ===================================================== */

        function safeImage(
            value
        ) {

            return escapeHTML(
                value || ""
            );
        }


        /* =====================================================
           DATUMS
           ===================================================== */

        function sortNewestFirst(
            a,
            b
        ) {

            return (
                new Date(b.date) -
                new Date(a.date)
            );
        }


        /* =====================================================
           RAKSTU ATLASE
           ===================================================== */

        const pageArticles =
            new Map();


        containers.forEach(
            function (container) {

                let visible =
                    [...raksti];


                const category =
                    container.dataset.category ||
                    "all";


                const limitValue =
                    container.dataset.limit;


                const limit =
                    limitValue
                        ? Number(limitValue)
                        : null;


                if (
                    category !== "all"
                ) {

                    visible =
                        visible.filter(
                            function (article) {

                                return (
                                    article.category ===
                                    category
                                );

                            }
                        );

                }


                visible.sort(
                    sortNewestFirst
                );


                if (
                    limit !== null &&
                    Number.isFinite(limit)
                ) {

                    visible =
                        visible.slice(
                            0,
                            limit
                        );
                }


                visible.forEach(
                    function (article) {

                        pageArticles.set(
                            String(article.id),
                            article
                        );

                    }
                );

            }
        );


        /* =====================================================
           KARTĪŠU IZVEIDE
           ===================================================== */

        function renderCards() {

            containers.forEach(
                function (container) {

                    container.innerHTML = "";


                    let visible =
                        [...raksti];


                    const category =
                        container.dataset.category ||
                        "all";


                    const limitValue =
                        container.dataset.limit;


                    const limit =
                        limitValue
                            ? Number(limitValue)
                            : null;


                    if (
                        category !== "all"
                    ) {

                        visible =
                            visible.filter(
                                function (article) {

                                    return (
                                        article.category ===
                                        category
                                    );

                                }
                            );

                    }


                    visible.sort(
                        sortNewestFirst
                    );


                    if (
                        limit !== null &&
                        Number.isFinite(limit)
                    ) {

                        visible =
                            visible.slice(
                                0,
                                limit
                            );

                    }


                    visible.forEach(
                        function (article) {

                            const language =
                                getAvailableLanguage(
                                    article
                                );


                            if (!language) {
                                return;
                            }


                            const content =
                                article[language];


                            const card =
                                document.createElement(
                                    "article"
                                );


                            card.className =
                                "raksts-card";


                            card.dataset.articleId =
                                article.id;


                            card.setAttribute(
                                "role",
                                "button"
                            );


                            card.setAttribute(
                                "tabindex",
                                "0"
                            );


                            card.setAttribute(
                                "aria-label",
                                content.title
                            );


                            card.innerHTML = `

                                <img
                                    class="raksts-card-image"
                                    src="${safeImage(article.image)}"
                                    alt="${safeText(content.title)}"
                                >

                                <div
                                    class="raksts-card-content"
                                >

                                    <div
                                        class="raksts-card-category"
                                    >
                                        ${safeText(
                                            getCategoryName(
                                                article.category
                                            )
                                        )}
                                    </div>

                                    <h2
                                        class="raksts-card-title"
                                    >
                                        ${safeText(
                                            content.title
                                        )}
                                    </h2>

                                    <p
                                        class="raksts-card-excerpt"
                                    >
                                        ${safeText(
                                            content.excerpt
                                        )}
                                    </p>

                                </div>

                            `;


                            function activate() {

                                openArticle(
                                    article,
                                    true
                                );

                            }


                            card.addEventListener(
                                "click",
                                activate
                            );


                            card.addEventListener(
                                "keydown",
                                function (event) {

                                    if (
                                        event.key ===
                                        "Enter" ||
                                        event.key ===
                                        " "
                                    ) {

                                        event.preventDefault();

                                        activate();

                                    }

                                }
                            );


                            container.appendChild(
                                card
                            );

                        }
                    );

                }
            );

        }


        /* =====================================================
           MODAL
           ===================================================== */

        let modal = null;


        function createModal() {

            if (modal) {
                return;
            }


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
                    function () {

                        closeArticle(
                            true
                        );

                    }
                );


            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeArticle(
                            true
                        );

                    }

                }
            );

        }


        /* =====================================================
           ATVER RAKSTU
           ===================================================== */

        function openArticle(
            article,
            changeUrl
        ) {

            createModal();


            const language =
                getAvailableLanguage(
                    article
                );


            if (!language) {
                return;
            }


            const content =
                article[language];


            const translationMissing =
                language !==
                currentLanguage;


            const body =
                modal.querySelector(
                    ".raksts-modal-body"
                );


            body.innerHTML = `

                <img
                    class="raksts-modal-image"
                    src="${safeImage(article.image)}"
                    alt="${safeText(content.title)}"
                >

                <div
                    class="raksts-modal-category"
                >
                    ${safeText(
                        getCategoryName(
                            article.category
                        )
                    )}
                </div>

                ${
                    translationMissing
                        ? `

                            <div
                                class="raksts-translation-notice"
                            >

                                Šis raksts pašlaik nav
                                pieejams
                                ${safeText(
                                    getLanguageName(
                                        currentLanguage
                                    )
                                )}
                                valodā.

                                Tiek rādīta
                                ${safeText(
                                    getLanguageName(
                                        language
                                    )
                                )}
                                versija.

                            </div>

                        `
                        : ""
                }

                <h1
                    class="raksts-modal-title"
                >
                    ${safeText(
                        content.title
                    )}
                </h1>

                <div
                    class="raksts-modal-text"
                >
                    ${content.content || ""}
                </div>

            `;


            modal.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";


            if (changeUrl) {

                const url =
                    new URL(
                        window.location.href
                    );


                url.searchParams.set(
                    "raksts",
                    String(article.id)
                );


                history.pushState(
                    {
                        articleId:
                            String(article.id)
                    },
                    "",
                    url
                );

            }

        }


        /* =====================================================
           AIZVER RAKSTU
           ===================================================== */

        function closeArticle(
            changeUrl
        ) {

            if (!modal) {
                return;
            }


            modal.classList.remove(
                "active"
            );


            document.body.style.overflow =
                "";


            if (changeUrl) {

                const url =
                    new URL(
                        window.location.href
                    );


                url.searchParams.delete(
                    "raksts"
                );


                history.pushState(
                    {},
                    "",
                    url
                );

            }

        }


        /* =====================================================
           VALODAS NOSAUKUMI
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
           URL → RAKSTS
           ===================================================== */

        function openArticleFromUrl() {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const articleId =
                params.get(
                    "raksts"
                );


            if (!articleId) {
                return;
            }


            const article =
                raksti.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(articleId)
                        );

                    }
                );


            if (!article) {
                return;
            }


            openArticle(
                article,
                false
            );

        }


        /* =====================================================
           BACK / FORWARD
           ===================================================== */

        window.addEventListener(
            "popstate",
            function () {

                if (!modal) {
                    createModal();
                }


                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const articleId =
                    params.get(
                        "raksts"
                    );


                if (!articleId) {

                    closeArticle(
                        false
                    );

                    return;
                }


                const article =
                    raksti.find(
                        function (item) {

                            return (
                                String(item.id) ===
                                String(articleId)
                            );

                        }
                    );


                if (article) {

                    openArticle(
                        article,
                        false
                    );

                }

            }
        );


        /* =====================================================
           ESC
           ===================================================== */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    if (
                        modal &&
                        modal.classList.contains(
                            "active"
                        )
                    ) {

                        closeArticle(
                            true
                        );

                    }

                }

            }
        );


        /* =====================================================
           VALODAS MAIŅA
           ===================================================== */

        document.addEventListener(
            "zeltainsLanguageChanged",
            function (event) {

                const language =
                    event.detail &&
                    event.detail.language;


                if (
                    supportedLanguages.includes(
                        language
                    )
                ) {

                    currentLanguage =
                        language;

                }


                renderCards();


                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const articleId =
                    params.get(
                        "raksts"
                    );


                if (articleId) {

                    const article =
                        raksti.find(
                            function (item) {

                                return (
                                    String(item.id) ===
                                    String(articleId)
                                );

                            }
                        );


                    if (article) {

                        openArticle(
                            article,
                            false
                        );

                    }

                }

            }
        );


        /* =====================================================
           SĀKUMS
           ===================================================== */

        renderCards();

        openArticleFromUrl();

    }
);