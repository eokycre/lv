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
                "Kļūda: data/raksti.js nav ielādēts."
            );

            return;
        }


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


            return null;
        }


        function getCategoryName(
            category
        ) {

            const names = {

                piedzivojumi: {
                    lv: "Piedzīvojumi",
                    en: "Adventure",
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

                return (
                    names[category][
                        currentLanguage
                    ]
                );
            }


            return category;
        }


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


        function sortNewestFirst(
            a,
            b
        ) {

            return (
                new Date(b.date) -
                new Date(a.date)
            );
        }


        function getVisibleArticles(
            container
        ) {

            const category =
                container.dataset.category ||
                "all";


            const limit =
                container.dataset.limit
                    ? Number(
                        container.dataset.limit
                    )
                    : null;


            let articles =
                [...raksti];


            if (
                category !== "all"
            ) {

                articles =
                    articles.filter(
                        function (article) {

                            return (
                                article.category ===
                                category
                            );

                        }
                    );

            }


            articles.sort(
                sortNewestFirst
            );


            if (
                limit !== null &&
                !Number.isNaN(limit)
            ) {

                articles =
                    articles.slice(
                        0,
                        limit
                    );

            }


            return articles;
        }


        function renderContainer(
            container
        ) {

            container.innerHTML = "";


            const articles =
                getVisibleArticles(
                    container
                );


            articles.forEach(
                function (raksts) {

                    const language =
                        getAvailableLanguage(
                            raksts
                        );


                    if (!language) {
                        return;
                    }


                    const content =
                        raksts[language];


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "raksts-card";


                    card.setAttribute(
                        "tabindex",
                        "0"
                    );


                    card.setAttribute(
                        "role",
                        "button"
                    );


                    card.innerHTML = `

                        <img
                            class="raksts-card-image"
                            src="${raksts.image}"
                            alt="${escapeHTML(
                                content.title
                            )}"
                            loading="lazy"
                        >

                        <div
                            class="raksts-card-content"
                        >

                            <div
                                class="raksts-card-category"
                            >
                                ${escapeHTML(
                                    getCategoryName(
                                        raksts.category
                                    )
                                )}
                            </div>

                            <h2
                                class="raksts-card-title"
                            >
                                ${escapeHTML(
                                    content.title
                                )}
                            </h2>

                            <p
                                class="raksts-card-excerpt"
                            >
                                ${escapeHTML(
                                    content.excerpt
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

                                openArticle(
                                    raksts
                                );

                            }

                        }
                    );


                    container.appendChild(
                        card
                    );

                }
            );
        }


        function renderAll() {

            containers.forEach(
                function (container) {

                    renderContainer(
                        container
                    );

                }
            );

        }


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


        function createModal() {

            let modal =
                document.querySelector(
                    ".raksts-modal"
                );


            if (modal) {
                return modal;
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


            return modal;
        }


        function openArticle(
            raksts
        ) {

            const modal =
                createModal();


            const language =
                getAvailableLanguage(
                    raksts
                );


            if (!language) {
                return;
            }


            const content =
                raksts[language];


            const missingTranslation =
                language !==
                currentLanguage;


            const body =
                modal.querySelector(
                    ".raksts-modal-body"
                );


            body.innerHTML = `

                <img
                    class="raksts-modal-image"
                    src="${raksts.image}"
                    alt="${escapeHTML(
                        content.title
                    )}"
                >

                <div
                    class="raksts-modal-category"
                >
                    ${escapeHTML(
                        getCategoryName(
                            raksts.category
                        )
                    )}
                </div>

                ${
                    missingTranslation
                        ? `
                            <div
                                class="raksts-translation-notice"
                            >
                                Šis raksts pašlaik nav
                                pieejams
                                ${getLanguageName(
                                    currentLanguage
                                )}
                                valodā.
                                Tiek rādīta
                                ${getLanguageName(
                                    language
                                )}
                                versija.
                            </div>
                        `
                        : ""
                }

                <h1
                    class="raksts-modal-title"
                >
                    ${escapeHTML(
                        content.title
                    )}
                </h1>

                <div
                    class="raksts-modal-text"
                >
                    ${content.content}
                </div>

            `;


            modal.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";
        }


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


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeArticle();

                }

            }
        );


        document.addEventListener(
            "zeltainsLanguageChanged",
            function (event) {

                if (
                    event.detail &&
                    event.detail.language
                ) {

                    currentLanguage =
                        event.detail.language;

                    renderAll();

                }

            }
        );


        renderAll();

    }
);