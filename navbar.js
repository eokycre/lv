document.addEventListener("DOMContentLoaded", function () {

    document.body.insertAdjacentHTML("afterbegin", `
        <nav class="navbar">

            <div class="menu">
                <a href="piedzivojumi.html">Piedzīvojumi</a>
                <a href="dzivesstils.html">Dzīvesstils</a>
            </div>

            <a class="contacts" href="kontakti.html" aria-label="Kontakti">
                <svg class="svg-envelope" viewBox="0 0 24 24">
                    <path d="M22,4H2C0.9,4,0,4.9,0,6v12c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C24,4.9,23.1,4,22,4z M22,6l-10,7L2,6H22z M2,18V8l10,7l10-7v10H2z"/>
                </svg>
            </a>

            <a href="index.html" class="logo-title">
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

    document.addEventListener("mousemove", function (event) {

        const navRect = navbar.getBoundingClientRect();

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Pārbaudām, vai kursors atrodas baltajā navbar zonā
        const insideNavbar =
            mouseX >= navRect.left &&
            mouseX <= navRect.right &&
            mouseY >= navRect.top &&
            mouseY <= navRect.bottom;

        letters.forEach(letter => {

            const rect = letter.getBoundingClientRect();

            // Kursora koordinātas attiecībā pret konkrēto burtu
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;

            letter.style.setProperty("--mouse-x", `${x}px`);
            letter.style.setProperty("--mouse-y", `${y}px`);

            if (insideNavbar) {
                // Rādiuss = 60px
                letter.style.setProperty("--glow-size", "60px");
            } else {
                // Kad kursors iziet no navbar, zelta efekts pazūd
                letter.style.setProperty("--glow-size", "0px");
            }
        });
    });

});