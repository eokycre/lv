const identity =
    window.netlifyIdentity;


const form =
    document.querySelector("#translation-form");


const targets =
    document.querySelector("#targets");


const results =
    document.querySelector("#results");


const status =
    document.querySelector("#status");


const translateButton =
    document.querySelector("#translate");


function setStatus(
    message,
    isError = false
) {

    status.textContent = message;
    status.classList.toggle(
        "error",
        isError
    );
}


async function getToken() {

    const user =
        identity &&
        identity.currentUser();


    if (!user) {
        return null;
    }

    if (typeof user.jwt === "function") {
        return user.jwt();
    }

    return user.token && user.token.access_token;
}


async function loadLanguages() {

    const token =
        await getToken();


    if (!token) {
        targets.innerHTML =
            "<p class=\"status\">Nepieciešama pieslēgšanās.</p>";
        return;
    }


    try {
        const response =
            await fetch(
                "/.netlify/functions/deepl",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error ||
                "Valodas neizdevās ielādēt."
            );
        }


        targets.innerHTML = "";


        data
            .filter(
                (language) =>
                    language.language !== "LV"
            )
            .forEach(
                (language) => {

                    const label =
                        document.createElement("label");

                    label.className =
                        "target";

                    const input =
                        document.createElement("input");

                    input.type = "checkbox";
                    input.name = "target";
                    input.value =
                        language.language;

                    const text =
                        document.createElement("span");

                    text.textContent =
                        `${language.name} (${language.language})`;

                    label.append(input, text);
                    targets.appendChild(label);
                }
            );

    } catch (error) {
        targets.innerHTML = "";
        setStatus(
            error.message,
            true
        );
    }
}


function renderResult(
    translation
) {

    const section =
        document.createElement("article");

    section.className = "result";


    const heading =
        document.createElement("h2");

    heading.textContent =
        `${translation.language.toUpperCase()}`;


    const title =
        document.createElement("input");

    title.value =
        translation.title;

    title.setAttribute(
        "aria-label",
        `${translation.language} virsraksts`
    );


    const excerpt =
        document.createElement("textarea");

    excerpt.value =
        translation.excerpt;

    excerpt.setAttribute(
        "aria-label",
        `${translation.language} apraksts`
    );


    const content =
        document.createElement("textarea");

    content.value =
        translation.content;

    content.setAttribute(
        "aria-label",
        `${translation.language} saturs`
    );


    section.append(
        heading,
        title,
        excerpt,
        content
    );

    results.appendChild(section);
}


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const token =
            await getToken();


        const selected =
            [...document.querySelectorAll(
                "input[name=target]:checked"
            )];


        if (!token) {
            setStatus(
                "Pieslēdzies admin sadaļā.",
                true
            );
            return;
        }


        if (!selected.length) {
            setStatus(
                "Izvēlies vismaz vienu valodu.",
                true
            );
            return;
        }


        translateButton.disabled = true;
        results.innerHTML = "";
        setStatus("Tulko...");


        const values =
            new FormData(form);

        const source = {
            title: values.get("title"),
            excerpt: values.get("excerpt"),
            content: values.get("content")
        };


        try {
            for (const target of selected) {

                const response =
                    await fetch(
                        "/.netlify/functions/deepl",
                        {
                            method: "POST",
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                source_lang: "LV",
                                target_lang:
                                    target.value,
                                ...source
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Tulkošana neizdevās."
                    );
                }


                renderResult(data);
            }


            setStatus(
                "Tulkojumi gatavi pārbaudei."
            );

        } catch (error) {
            setStatus(
                error.message,
                true
            );

        } finally {
            translateButton.disabled = false;
        }
    }
);


if (identity) {
    identity.on(
        "init",
        function () {

            if (!identity.currentUser()) {
                identity.open("login");
                return;
            }


            loadLanguages();
        }
    );

    identity.on(
        "login",
        loadLanguages
    );
}


document
    .querySelector("#clear")
    .addEventListener(
        "click",
        function () {
            form.reset();
            results.innerHTML = "";
            setStatus("");
        }
    );
