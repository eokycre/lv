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
                <span>Z</span><span>E</span><span>L</span><span>T</span>
                <span>A</span><span>I</span><span>N</span><span>S</span>
            </a>

        </nav>
    `);
});