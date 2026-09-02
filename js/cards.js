document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const containers =
            document.querySelectorAll(
                ".raksti-container"
            );

        const articlePage =
            document.querySelector(
                ".raksts-page"
            );


        if (!containers.length && !articlePage) {
            return;
        }


        let raksti;


        try {
            const response =
                await fetch(
                    "data/raksti.json",
                    {
                        cache: "default"
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `Rakstu dati nav pieejami: ${response.status}`
                );
            }


            const data =
                await response.json();


            raksti =
                Array.isArray(data)
                    ? data
                    : data.articles;


            if (!Array.isArray(raksti)) {
                throw new Error(
                    "Rakstu datiem jābūt masīvam."
                );
            }

        } catch (error) {

            console.error(
                "Rakstu dati nav ielādēti.",
                error
            );


            if (articlePage) {
                articlePage.innerHTML = `
                    <p class="raksts-page-status">
                        Rakstu neizdevās ielādēt.
                    </p>
                `;
            }

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

                    const effectiveLimit =
                        limit === 24 &&
                        container.dataset.view === "5"
                            ? 25
                            : limit;

                    visible =
                        visible.slice(
                            0,
                            effectiveLimit
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
           SKATA PĀRSLĒGŠANA
           ===================================================== */

        function isHorizontalView(value) {
            return value === "horizontal" ||
                String(value).startsWith("horizontal-");
        }


        function isEditorial24View(value) {
            return String(value) === "editorial-24";
        }


        function isEditorial24AltView(value) {
            return String(value) === "editorial-24-alt";
        }


        function getEditorialMaxColumnsForViewport() {
            const viewportWidth =
                window.innerWidth;

            if (viewportWidth <= 420) {
                return {
                    vertical: 2,
                    horizontal: 1
                };
            }

            if (viewportWidth <= 700) {
                return {
                    vertical: 4,
                    horizontal: 2
                };
            }

            return {
                vertical: 6,
                horizontal: 3
            };
        }


        function splitPatternStep(step, maxVertical, maxHorizontal) {
            const maxCount =
                step.type === "vertical"
                    ? maxVertical
                    : maxHorizontal;

            const segments = [];
            let remaining = step.count;

            while (remaining > 0) {
                const nextCount =
                    Math.min(maxCount, remaining);

                segments.push({
                    ...step,
                    count: nextCount
                });

                remaining -= nextCount;
            }

            return segments;
        }


        function getEditorial24Pattern() {
            const { vertical, horizontal } =
                getEditorialMaxColumnsForViewport();
            const basePattern = [
                { type: "vertical", count: 3 },
                { type: "vertical", count: 4 },
                { type: "vertical", count: 4 },
                { type: "horizontal", count: 2 },
                { type: "horizontal", count: 2 },
                { type: "vertical", count: 5 },
                { type: "horizontal", count: 1 },
                { type: "horizontal", count: 3 }
            ];

            const segments = [];

            basePattern.forEach(
                function (step) {
                    splitPatternStep(step, vertical, horizontal).forEach(
                        function (segment) {
                            segments.push(segment);
                        }
                    );
                }
            );

            return segments;
        }


        function getEditorial24AltPattern() {
            const { vertical, horizontal } =
                getEditorialMaxColumnsForViewport();
            const basePattern = [
                { type: "horizontal", count: 1, featured: true },
                { type: "vertical", count: 4 },
                { type: "horizontal", count: 2 },
                { type: "vertical", count: 5 },
                { type: "horizontal", count: 2 },
                { type: "vertical", count: 4 },
                { type: "horizontal", count: 3 },
                { type: "vertical", count: 3 }
            ];

            const segments = [];

            basePattern.forEach(
                function (step) {
                    splitPatternStep(step, vertical, horizontal).forEach(
                        function (segment) {
                            segments.push(segment);
                        }
                    );
                }
            );

            return segments;
        }


        function getEditorialPatternForView(value) {
            return isEditorial24AltView(value)
                ? getEditorial24AltPattern()
                : getEditorial24Pattern();
        }


        function getHorizontalColumns(value) {
            if (value === "horizontal") {
                return 1;
            }

            const match = String(value).match(/horizontal-(\d+)/);
            return match ? Number(match[1]) : 1;
        }


        function getPreviousMaxStandardView() {
            const storageKey =
                `zeltainsCardViewVertical:${window.location.pathname}`;

            const storedValue =
                localStorage.getItem(storageKey);

            if (storedValue) {
                const numericValue =
                    Number.parseInt(storedValue, 10);

                if (
                    Number.isFinite(numericValue) &&
                    numericValue >= 1 &&
                    numericValue <= 6
                ) {
                    return numericValue;
                }
            }

            const legacyValue =
                Number.parseInt(
                    localStorage.getItem(
                        `zeltainsCardView:${window.location.pathname}`
                    ),
                    10
                );

            if (
                Number.isFinite(legacyValue) &&
                legacyValue >= 1 &&
                legacyValue <= 6
            ) {
                return legacyValue;
            }

            return null;
        }


        function getPreviousMaxHorizontalView() {
            const storageKey =
                `zeltainsCardViewHorizontal:${window.location.pathname}`;

            const storedValue =
                localStorage.getItem(storageKey);

            if (storedValue) {
                if (storedValue === "horizontal") {
                    return 1;
                }

                const match = String(storedValue).match(/horizontal-(\d+)/);
                if (match) {
                    return Math.max(1, Math.min(3, Number(match[1])));
                }

                const numericValue =
                    Number.parseInt(storedValue, 10);

                if (
                    Number.isFinite(numericValue) &&
                    numericValue >= 1 &&
                    numericValue <= 3
                ) {
                    return numericValue;
                }
            }

            const legacyValue =
                localStorage.getItem(
                    `zeltainsCardView:${window.location.pathname}`
                );

            if (legacyValue === "horizontal") {
                return 1;
            }

            const match = String(legacyValue || "").match(/horizontal-(\d+)/);
            if (match) {
                return Math.max(1, Math.min(3, Number(match[1])));
            }

            return null;
        }


        function getViewportRules() {
            const viewportWidth =
                window.innerWidth;

            if (viewportWidth <= 420) {
                return {
                    verticalRange: [1, 2],
                    horizontalRange: [1, 1]
                };
            }

            if (viewportWidth < 700) {
                return {
                    verticalRange: [2, 3],
                    horizontalRange: [1, 2]
                };
            }

            if (viewportWidth < 900) {
                return {
                    verticalRange: [2, 4],
                    horizontalRange: [1, 2]
                };
            }

            if (viewportWidth < 1100) {
                return {
                    verticalRange: [2, 5],
                    horizontalRange: [1, 3]
                };
            }

            return {
                verticalRange: [3, 6],
                horizontalRange: [1, 3]
            };
        }

        function getViewOptionsWithSpecialCase() {
            const viewportRules =
                getViewportRules();
            const [verticalStart, verticalEnd] =
                viewportRules.verticalRange;

            const views = [];

            for (
                let view = verticalStart;
                view <= verticalEnd;
                view += 1
            ) {
                views.push(String(view));
            }

            if (verticalEnd >= 5) {
                views.push("5");
            }

            views.push("editorial-24");
            views.push("editorial-24-alt");

            const [, horizontalEnd] =
                viewportRules.horizontalRange;

            for (
                let index = 1;
                index <= horizontalEnd;
                index += 1
            ) {
                views.push(`horizontal-${index}`);
            }

            return Array.from(new Set(views));
        }


        function getAvailableViews() {
            return getViewOptionsWithSpecialCase();
        }


        function fillViewRange(minView, maxView) {
            const views = [];

            for (
                let view = minView;
                view <= maxView;
                view += 1
            ) {
                views.push(String(view));
            }

            return views;
        }


        function getSelectedView(container) {

            const allowedViews =
                getAvailableViews();

            const storageKey =
                `zeltainsCardView:${window.location.pathname}`;

            const storedValue =
                localStorage.getItem(storageKey);

            const currentValue =
                String(container.dataset.view || "");

            let selectedView =
                currentValue;

            const isAllowedView =
                allowedViews.includes(selectedView) ||
                (selectedView === "horizontal" && allowedViews.some(isHorizontalView));

            if (
                !isAllowedView
            ) {
                if (
                    storedValue &&
                    (allowedViews.includes(storedValue) ||
                        (storedValue === "horizontal" && allowedViews.some(isHorizontalView)))
                ) {
                    selectedView = storedValue;
                } else {
                    const fallbackValue =
                        allowedViews.includes("editorial-24")
                            ? "editorial-24"
                            : allowedViews.find(
                                function (value) {
                                    return !isHorizontalView(value);
                                }
                            ) || allowedViews[allowedViews.length - 1];

                    selectedView = String(fallbackValue);
                }
            }

            container.dataset.view =
                String(selectedView);

            localStorage.setItem(
                storageKey,
                String(selectedView)
            );

            return selectedView;
        }


        function renderViewSelector(container) {

            const parent =
                container.parentElement;

            if (!parent) {
                return;
            }

            const existingSelector =
                parent.querySelector(
                    ".raksti-view-switcher"
                );

            if (existingSelector) {
                existingSelector.remove();
            }

            const allowedViews =
                getAvailableViews();

            const selectedView =
                getSelectedView(container);

            const selector =
                document.createElement("div");

            selector.className =
                "raksti-view-switcher";
            selector.style.border = "none";
            selector.style.background = "transparent";
            selector.style.boxShadow = "none";
            selector.style.padding = "0";
            selector.style.borderRadius = "0";

            selector.setAttribute(
                "aria-label",
                "Rakstu skata izvēle"
            );

            allowedViews.forEach(
                function (viewOption) {

                    const button =
                        document.createElement("button");

                    const isHorizontal =
                        isHorizontalView(viewOption);
                    const isEditorialAlt =
                        isEditorial24AltView(viewOption);
                    const isEditorial =
                        isEditorial24View(viewOption) || isEditorialAlt;
                    const viewCount =
                        isHorizontal
                            ? getHorizontalColumns(viewOption)
                            : isEditorial
                                ? 24
                                : Number(viewOption);

                    button.type = "button";
                    button.className =
                        "raksti-view-button";
                    button.style.border = "none";
                    button.style.background = "transparent";
                    button.style.borderRadius = "0";
                    button.dataset.view =
                        String(viewOption);

                    const preview =
                        document.createElement("span");

                    if (isEditorial) {
                        preview.className =
                            isEditorialAlt
                                ? "raksti-view-preview raksti-view-preview-editorial-alt"
                                : "raksti-view-preview raksti-view-preview-editorial";
                        preview.innerHTML = `
                            <span class="raksti-view-circle-symbol ${isEditorialAlt ? "raksti-view-circle-symbol-alt" : ""}"></span>
                        `;
                    } else {
                        preview.className =
                            "raksti-view-preview";
                        preview.style.setProperty(
                            "--preview-columns",
                            String(viewCount)
                        );

                        const tileCount =
                            isHorizontal
                                ? viewCount
                                : viewCount;

                        for (
                            let index = 0;
                            index < tileCount;
                            index += 1
                        ) {
                            const tile =
                                document.createElement("span");
                            tile.className =
                                "raksti-view-tile";
                            preview.appendChild(tile);
                        }
                    }

                    if (isEditorialAlt) {
                        button.title = "Editorial 24 II";
                        button.setAttribute(
                            "aria-label",
                            "Editorial 24 II"
                        );
                    } else if (isEditorial) {
                        button.title = "Editorial 24";
                        button.setAttribute(
                            "aria-label",
                            "Editorial 24"
                        );
                    } else if (isHorizontal) {
                        button.title = `Horizontāls skats ${viewCount}`;
                        button.setAttribute(
                            "aria-label",
                            `Horizontāls skats ${viewCount}`
                        );
                    } else {
                        button.title =
                            `${viewCount} kartītes rindā`;

                        button.setAttribute(
                            "aria-label",
                            `${viewCount} kartītes rindā`
                        );
                    }

                    button.appendChild(
                        preview
                    );

                    if (String(viewOption) === String(selectedView)) {
                        button.classList.add("active");
                        button.setAttribute(
                            "aria-pressed",
                            "true"
                        );
                    }

                    button.addEventListener(
                        "click",
                        function () {

                            const storageKey =
                                `zeltainsCardView:${window.location.pathname}`;
                            const verticalStorageKey =
                                `zeltainsCardViewVertical:${window.location.pathname}`;
                            const horizontalStorageKey =
                                `zeltainsCardViewHorizontal:${window.location.pathname}`;

                            container.dataset.view =
                                String(viewOption);

                            localStorage.setItem(
                                storageKey,
                                String(viewOption)
                            );

                            if (isHorizontalView(viewOption)) {
                                const horizontalValue =
                                    viewOption === "horizontal"
                                        ? "horizontal"
                                        : String(viewOption);

                                localStorage.setItem(
                                    horizontalStorageKey,
                                    horizontalValue
                                );
                            } else if (!isEditorial24View(viewOption) && !isEditorial24AltView(viewOption)) {
                                localStorage.setItem(
                                    verticalStorageKey,
                                    String(viewOption)
                                );
                            }

                            renderViewSelector(container);
                            renderCards();
                        }
                    );

                    selector.appendChild(
                        button
                    );
                }
            );

            parent.insertBefore(
                selector,
                container
            );
        }


        /* =====================================================
           KARTĪŠU IZVEIDE
           ===================================================== */

        function renderPagination(
            container,
            totalPages,
            currentPage,
            enabled
        ) {

            const oldPagination =
                container.nextElementSibling;


            if (
                oldPagination &&
                oldPagination.classList.contains(
                    "raksti-pagination"
                )
            ) {
                oldPagination.remove();
            }


            if (!enabled) {
                return;
            }


            const pagination =
                document.createElement("nav");


            pagination.className =
                "raksti-pagination";

            pagination.setAttribute(
                "aria-label",
                "Rakstu lapas"
            );


            function addLink(
                label,
                page,
                ariaLabel,
                disabled
            ) {

                const link =
                    document.createElement("a");


                link.href =
                    page === 1
                        ? window.location.pathname
                        : `${window.location.pathname}?lapa=${page}`;

                link.textContent = label;
                link.title = ariaLabel;
                link.setAttribute(
                    "aria-label",
                    ariaLabel
                );


                if (disabled) {
                    link.classList.add("disabled");
                    link.setAttribute(
                        "aria-disabled",
                        "true"
                    );
                    link.removeAttribute("href");
                }


                if (page === currentPage) {
                    link.classList.add("active");
                    link.setAttribute(
                        "aria-current",
                        "page"
                    );
                }


                pagination.appendChild(link);
            }


            addLink(
                "«",
                1,
                "Pirmā lapa",
                currentPage === 1
            );


            addLink(
                "‹",
                Math.max(
                    1,
                    currentPage - 1
                ),
                "Iepriekšējā lapa",
                currentPage === 1
            );


            for (
                let page = 1;
                page <= totalPages;
                page += 1
            ) {
                addLink(
                    String(page),
                    page,
                    `Lapa ${page}`,
                    false
                );
            }


            addLink(
                "›",
                Math.min(
                    totalPages,
                    currentPage + 1
                ),
                "Nākamā lapa",
                currentPage === totalPages
            );


            addLink(
                "»",
                totalPages,
                "Pēdējā lapa",
                currentPage === totalPages
            );


            const pageForm =
                document.createElement("form");

            pageForm.className =
                "raksti-page-form";

            pageForm.setAttribute(
                "aria-label",
                "Atvērt konkrētu rakstu lapu"
            );


            const pageInput =
                document.createElement("input");

            pageInput.type = "number";
            pageInput.min = "1";
            pageInput.max =
                String(totalPages);
            pageInput.value =
                String(currentPage);
            pageInput.required = true;
            pageInput.setAttribute(
                "aria-label",
                `Lapas numurs no 1 līdz ${totalPages}`
            );


            const pageSubmit =
                document.createElement("button");

            pageSubmit.type = "submit";
            pageSubmit.textContent = "↵";
            pageSubmit.title = "Atvērt lapu";
            pageSubmit.setAttribute(
                "aria-label",
                "Atvērt lapu"
            );


            pageInput.addEventListener(
                "input",
                function () {

                    const value =
                        Number.parseInt(
                            pageInput.value,
                            10
                        );


                    if (value > totalPages) {
                        pageInput.value =
                            String(totalPages);
                    }


                    if (value < 1) {
                        pageInput.value = "1";
                    }
                }
            );


            pageForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    const value =
                        Number.parseInt(
                            pageInput.value,
                            10
                        );


                    const page =
                        Number.isFinite(value)
                            ? Math.min(
                                Math.max(value, 1),
                                totalPages
                            )
                            : currentPage;


                    const url =
                        new URL(
                            window.location.href
                        );


                    if (page === 1) {
                        url.searchParams.delete(
                            "lapa"
                        );

                    } else {
                        url.searchParams.set(
                            "lapa",
                            String(page)
                        );
                    }


                    window.location.href =
                        url.toString();
                }
            );


            pageForm.append(
                pageInput,
                pageSubmit
            );

            pagination.appendChild(
                pageForm
            );


            container.insertAdjacentElement(
                "afterend",
                pagination
            );
        }


        let resizeFrame = null;


        function refreshLayoutAfterResize() {
            if (resizeFrame !== null) {
                cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(
                function () {
                    containers.forEach(
                        function (container) {
                            renderViewSelector(container);
                        }
                    );

                    renderCards();
                }
            );
        }


        window.addEventListener(
            "resize",
            refreshLayoutAfterResize
        );


        function renderCards() {

            containers.forEach(
                function (container) {

                    const selectedView =
                        getSelectedView(container);

                    if (isEditorial24View(selectedView) || isEditorial24AltView(selectedView)) {
                        container.style.setProperty(
                            "--raksti-columns",
                            "1"
                        );
                    } else if (isHorizontalView(selectedView)) {
                        container.style.setProperty(
                            "--raksti-columns",
                            String(getHorizontalColumns(selectedView))
                        );
                    } else {
                        container.style.setProperty(
                            "--raksti-columns",
                            String(selectedView)
                        );
                    }

                    renderViewSelector(container);

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


                    let currentPage = 1;
                    let totalPages = 1;


                    if (
                        limit !== null &&
                        Number.isFinite(limit) &&
                        limit > 0
                    ) {

                        totalPages =
                            Math.max(
                                1,
                                Math.ceil(
                                    visible.length /
                                    limit
                                )
                            );


                        const requestedPage =
                            Number.parseInt(
                                new URLSearchParams(
                                    window.location.search
                                ).get("lapa"),
                                10
                            );


                        if (
                            Number.isFinite(
                                requestedPage
                            ) &&
                            requestedPage > 0
                        ) {
                            currentPage =
                                Math.min(
                                    requestedPage,
                                    totalPages
                                );
                        }


                        const start =
                            (currentPage - 1) *
                            limit;


                        visible =
                            visible.slice(
                                start,
                                start + limit
                            );

                    }


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


                    if (isEditorial24View(selectedView) || isEditorial24AltView(selectedView)) {
                        const editorialPattern =
                            getEditorialPatternForView(selectedView);

                        const layoutRoot =
                            document.createElement("div");

                        layoutRoot.className =
                            "raksti-editorial-layout";

                        let visibleIndex = 0;
                        const layoutArticles =
                            visible.slice(0, editorialPattern.reduce(function (sum, step) {
                                return sum + step.count;
                            }, 0));

                        editorialPattern.forEach(
                            function (rowSpec) {
                                const row =
                                    document.createElement("div");

                                row.className =
                                    `raksti-editorial-row raksti-editorial-row--${rowSpec.type}`;
                                row.style.setProperty(
                                    "--row-count",
                                    String(rowSpec.count)
                                );

                                const rowItems =
                                    layoutArticles.slice(
                                        visibleIndex,
                                        visibleIndex + rowSpec.count
                                    );

                                visibleIndex += rowSpec.count;

                                rowItems.forEach(
                                    function (article, itemIndex) {
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

                                        if (rowSpec.type === "horizontal") {
                                            card.classList.add(
                                                "raksts-card-horizontal"
                                            );
                                        }

                                        if (
                                            rowSpec.featured &&
                                            itemIndex === 0
                                        ) {
                                            card.classList.add(
                                                "raksts-card-featured"
                                            );
                                        }

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
                                                loading="${(visibleIndex - rowItems.length + itemIndex) < 3 ? "eager" : "lazy"}"
                                                fetchpriority="${(visibleIndex - rowItems.length + itemIndex) < 3 ? "high" : "low"}"
                                                decoding="async"
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
                                            window.location.href =
                                                `raksts.html?raksts=${article.id}`;
                                        }

                                        card.addEventListener(
                                            "click",
                                            activate
                                        );

                                        card.addEventListener(
                                            "keydown",
                                            function (event) {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    event.preventDefault();
                                                    activate();
                                                }
                                            }
                                        );

                                        row.appendChild(card);
                                    }
                                );

                                if (row.childElementCount > 0) {
                                    layoutRoot.appendChild(row);
                                }
                            }
                        );

                        container.appendChild(layoutRoot);
                    } else {
                        visible.forEach(
                            function (article, articleIndex) {

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

                                if (isHorizontalView(selectedView)) {
                                    card.classList.add(
                                        "raksts-card-horizontal"
                                    );
                                }


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
                                                loading="${articleIndex < 3 ? "eager" : "lazy"}"
                                                fetchpriority="${articleIndex < 3 ? "high" : "low"}"
                                        decoding="async"
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

                                    window.location.href =
                                        `raksts.html?raksts=${article.id}`;

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


                    renderPagination(
                        container,
                        totalPages,
                        currentPage,
                        limit !== null &&
                        Number.isFinite(limit) &&
                        limit > 0
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
                    ${safeArticleContent(
                        content.content
                    )}
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


        function safeArticleContent(
            value
        ) {

            const markdown =
                window.marked &&
                typeof window.marked.parse ===
                    "function"
                    ? window.marked.parse(
                        String(value || "")
                    )
                    : safeText(value);


            if (
                window.DOMPurify &&
                typeof window.DOMPurify.sanitize ===
                    "function"
            ) {
                return window.DOMPurify.sanitize(
                    markdown
                );
            }


            return safeText(value);
        }


        /* =====================================================
           RAKSTA LAPA
           ===================================================== */

        function renderArticlePage(
            article
        ) {

            if (!articlePage) {
                return;
            }


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


            articlePage.innerHTML = `

                <img
                    class="raksts-page-image"
                    src="${safeImage(article.image)}"
                    alt="${safeText(content.title)}"
                >

                <div class="raksts-page-body">

                    <div class="raksts-page-category">
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
                                    Šis raksts pašlaik nav pieejams
                                    ${safeText(
                                        getLanguageName(
                                            currentLanguage
                                        )
                                    )} valodā.
                                </div>
                            `
                            : ""
                    }

                    <h1 class="raksts-page-title">
                        ${safeText(content.title)}
                    </h1>

                    <div class="raksts-page-text">
                        ${safeArticleContent(
                            content.content
                        )}
                    </div>

                </div>

            `;


            document.title =
                `${content.title} — ZELTAINS`;
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

                if (articlePage) {
                    articlePage.innerHTML = `
                        <p class="raksts-page-status">
                            Izvēlies rakstu.
                        </p>
                    `;
                }

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

                if (articlePage) {
                    articlePage.innerHTML = `
                        <p class="raksts-page-status">
                            Raksts nav atrasts.
                        </p>
                    `;
                }

                return;
            }


            if (articlePage) {
                renderArticlePage(
                    article
                );

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

                        if (articlePage) {
                            renderArticlePage(
                                article
                            );

                        } else {
                            openArticle(
                                article,
                                false
                            );
                        }

                    }

                }

            }
        );


        /* =====================================================
           SĀKUMS
           ===================================================== */

        window.addEventListener(
            "resize",
            function () {

                containers.forEach(
                    function (container) {
                        const selectedView =
                            getSelectedView(container);

                        container.style.setProperty(
                            "--raksti-columns",
                            String(selectedView)
                        );

                        renderViewSelector(container);
                    }
                );

                renderCards();
            }
        );

        renderCards();

        openArticleFromUrl();

    }
);