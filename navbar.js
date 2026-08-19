document.addEventListener("DOMContentLoaded", function () {

    document.body.insertAdjacentHTML("afterbegin", `
        <nav class="navbar">

            <div class="menu">
                <a href="piedzivojumi.html">Piedzīvojumi</a>
                <a href="dzivesstils.html">Dzīvesstils</a>
            </div>

            <a
                class="contacts"
                href="kontakti.html"
                aria-label="Kontakti"
            >
                <svg
                    class="svg-envelope"
                    viewBox="0 0 24 24"
                >
                    <path d="M22,4H2C0.9,4,0,4.9,0,6v12c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C24,4.9,23.1,4,22,4z M22,6l-10,7L2,6H22z M2,18V8l10,7l10-7v10H2z"/>
                </svg>
            </a>

            <a
                href="index.html"
                class="logo-title"
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

        </nav>
    `);


    const navbar = document.querySelector(".navbar");
    const letters = document.querySelectorAll(".logo-title span");


    /* =========================================================
       KUSTĪBAS MAINĪGIE
       ========================================================= */

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let active = false;

    let touchActive = false;


    /* =========================================================
       PALĪGFUNKCIJA
       ========================================================= */

    function setGlow(value) {

        letters.forEach(letter => {
            letter.style.setProperty(
                "--glow-opacity",
                value
            );
        });
    }


    function updatePosition(x, y) {

        targetX = x;
        targetY = y;

        if (!active) {

            currentX = x;
            currentY = y;

        }
    }


    /* =========================================================
       DESKTOP — PELE
       ========================================================= */

    navbar.addEventListener("mouseenter", function (event) {

        /*
         * Touch ierīcēs šo ignorējam.
         */
        if (event.pointerType === "touch") {
            return;
        }

        active = true;

        updatePosition(
            event.clientX,
            event.clientY
        );

        setGlow("1");
    });


    navbar.addEventListener("mousemove", function (event) {

        if (event.pointerType === "touch") {
            return;
        }

        updatePosition(
            event.clientX,
            event.clientY
        );
    });


    navbar.addEventListener("mouseleave", function (event) {

        if (event.pointerType === "touch") {
            return;
        }

        active = false;

        setGlow("0");
    });


    /* =========================================================
       MOBILAIS — PIESKĀRIENS
       ========================================================= */

    document.addEventListener(
        "touchstart",
        function (event) {

            if (!event.touches.length) {
                return;
            }

            const touch = event.touches[0];

            const rect = navbar.getBoundingClientRect();

            /*
             * Aktivizējam tikai tad,
             * ja pirksts sākas headerī.
             */
            if (
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ) {

                touchActive = true;
                active = true;

                updatePosition(
                    touch.clientX,
                    touch.clientY
                );

                setGlow("1");
            }
        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchmove",
        function (event) {

            if (!touchActive) {
                return;
            }

            if (!event.touches.length) {
                return;
            }

            const touch = event.touches[0];

            /*
             * Pirksts var pārvietoties pa visu headeri.
             */
            const rect = navbar.getBoundingClientRect();

            if (
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ) {

                updatePosition(
                    touch.clientX,
                    touch.clientY
                );

                active = true;
                setGlow("1");

            } else {

                /*
                 * Ja pirksts iziet no headera,
                 * aplis lēnām pazūd.
                 */
                active = false;
                setGlow("0");
            }
        },
        {
            passive: true
        }
    );


    document.addEventListener(
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


    document.addEventListener(
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

        /*
         * Inerce.
         * 0.12 = maiga kustība.
         */
        currentX +=
            (targetX - currentX) * 0.12;

        currentY +=
            (targetY - currentY) * 0.12;


        if (active) {

            letters.forEach(letter => {

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
            });
        }


        requestAnimationFrame(animate);
    }


    animate();

});