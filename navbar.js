document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       NEĢENERĒT HEADERI OTRREIZ
       ========================================================= */

    if (document.querySelector(".navbar")) {
        return;
    }


    /* =========================================================
       HEADER
       ========================================================= */

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
                    aria-hidden="true"
                >
                    <path d="M22,4H2C0.9,4,0,4.9,0,6v12c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C24,4.9,23.1,4,22,4z M22,6l-10,7L2,6H22z M2,18V8l10,7l10-7v10H2z"/>
                </svg>
            </a>

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
       ZELTA SPĪDUMS
       ========================================================= */

    function setGlow(value) {

        letters.forEach(function (letter) {

            letter.style.setProperty(
                "--glow-opacity",
                value
            );

        });
    }


    /* =========================================================
       POZĪCIJA
       ========================================================= */

    function updatePosition(x, y) {

        targetX = x;
        targetY = y;

        if (!active) {

            currentX = x;
            currentY = y;

        }
    }


    /* =========================================================
       PELE
       ========================================================= */

    navbar.addEventListener("pointerenter", function (event) {

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


    navbar.addEventListener("pointermove", function (event) {

        if (event.pointerType === "touch") {
            return;
        }

        updatePosition(
            event.clientX,
            event.clientY
        );
    });


    navbar.addEventListener("pointerleave", function (event) {

        if (event.pointerType === "touch") {
            return;
        }

        active = false;

        setGlow("0");
    });


    /* =========================================================
       TOUCH / PIESKĀRIENS
       ========================================================= */

    navbar.addEventListener(
        "touchstart",
        function (event) {

            if (!event.touches.length) {
                return;
            }

            const touch = event.touches[0];

            touchActive = true;
            active = true;

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
        "touchmove",
        function (event) {

            if (!touchActive) {
                return;
            }

            if (!event.touches.length) {
                return;
            }

            const touch = event.touches[0];

            updatePosition(
                touch.clientX,
                touch.clientY
            );

            active = true;

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

        currentX +=
            (targetX - currentX) * 0.12;

        currentY +=
            (targetY - currentY) * 0.12;


        if (active) {

            letters.forEach(function (letter) {

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