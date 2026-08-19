```javascript
document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       PAMATA PĀRBAUDES
       ========================================================= */

    const containers =
        document.querySelectorAll(".raksti-container");

    if (!containers.length) {
        return;
    }

    if (typeof raksti === "undefined") {

        console.error(
            "raksti.js nav ielādēts."
        );

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


    /* =========================================================
       PALĪGFUNKCIJA — PIEEJAMĀ VALODA
       ========================================================= */

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
         * Ja izvēlētās valodas nav,
         * mēģinām latviešu valodu.
         */

        if (raksts.lv) {

            return "lv";
        }


        /*
         * Ja arī LV nav,
         * atrodam pirmo pieejamo.
         */

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


    /* =========================================================
       KATEGORIJAS NOSAUKUMS
       ========================================================= */

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


    /* =========================================================
       DATUMA SALĪDZINĀŠANA
       ========================================================= */

    function sortNewestFirst(
        a,
        b
    ) {

        return (
            new Date(b.date) -
            new Date(a.date)
        );
    }


    /* =========================================================
       HTML DROŠĪBA
       ========================================================= */

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


    /* =========================================================
       ATTĒLA DROŠĪBA
       ========================================================= */

    function getImage(
       
```
