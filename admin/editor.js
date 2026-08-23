const identity = window.netlifyIdentity;
const status = document.querySelector("#status");
const form = document.querySelector("#article-form");
const selector = document.querySelector("#article-select");
const languages = document.querySelector("#language-list");
const translations = document.querySelector("#translations");
const saveButton = document.querySelector("#save");
const deleteButton = document.querySelector("#delete");

let articles = [];
let deeplLanguages = [];
let activeArticle = null;
let deletedArticleId = null;

function setStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle("error", error);
}

function token() {
    const user = identity.currentUser();
    return user && user.token && user.token.access_token;
}

function field(id) {
    return document.querySelector(`#${id}`);
}

function articleContent(language, article) {
    const value = article && article[language] || {};
    return {
        title: value.title || "",
        excerpt: value.excerpt || "",
        content: value.content || ""
    };
}

function fillForm(article) {
    const value = article || {
        id: Math.max(0, ...articles.map((item) => item.id)) + 1,
        category: "piedzivojumi",
        date: new Date().toISOString().slice(0, 10),
        image: ""
    };

    activeArticle = article;
    deletedArticleId = null;

    field("id").value = value.id;
    field("category").value = value.category || "piedzivojumi";
    field("date").value = value.date || "";
    field("image").value = value.image || "";

    const lv = articleContent("lv", value);
    field("lv-title").value = lv.title;
    field("lv-excerpt").value = lv.excerpt;
    field("lv-content").value = lv.content;

    renderTranslations(value);
}

function updateSelector() {
    selector.innerHTML = "<option value=\"new\">+ Jauns raksts</option>";

    [...articles]
        .sort((a, b) => a.id - b.id)
        .forEach((article) => {
            const option = document.createElement("option");
            option.value = article.id;
            option.textContent = `${article.id} - ${article.lv && article.lv.title || "Bez virsraksta"}`;
            selector.appendChild(option);
        });
}

function renderLanguageOptions() {
    languages.innerHTML = "";

    deeplLanguages
        .filter((item) => item.language !== "LV")
        .forEach((item) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = item.language.toLowerCase();
            input.checked = Boolean(
                activeArticle &&
                activeArticle[input.value]
            );
            input.addEventListener("change", () => renderTranslations());
            label.append(input, document.createTextNode(`${item.name} (${item.language})`));
            languages.appendChild(label);
        });
}

function renderTranslations(article = null) {
    translations.innerHTML = "";

    const selected = [...languages.querySelectorAll("input:checked")]
        .map((input) => input.value);

    selected.forEach((language) => {
        const value = articleContent(language, article);
        const section = document.createElement("fieldset");
        section.className = "translation";
        section.dataset.language = language;
        section.innerHTML = `<legend>${language.toUpperCase()}</legend>`;

        [
            ["title", "Virsraksts", "input"],
            ["excerpt", "Īsais apraksts", "textarea"],
            ["content", "Pilnais saturs", "textarea"]
        ].forEach(([name, labelText, tag]) => {
            const label = document.createElement("label");
            label.textContent = labelText;
            const input = document.createElement(tag);
            input.dataset.field = name;
            input.value = value[name];
            label.appendChild(input);
            section.appendChild(label);
        });

        translations.appendChild(section);
    });
}

async function loadArticles() {
    const response = await fetch("../data/raksti.json", { cache: "no-store" });
    const data = await response.json();
    articles = Array.isArray(data) ? data : data.articles;
    updateSelector();
    fillForm(null);
}

async function loadDeepLLanguages() {
    const response = await fetch("/.netlify/functions/deepl", {
        headers: { Authorization: `Bearer ${token()}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "DeepL valodas nav pieejamas.");
    deeplLanguages = data;
    renderLanguageOptions();
    renderTranslations();
}

selector.addEventListener("change", () => {
    if (selector.value === "new") {
        fillForm(null);
        return;
    }

    fillForm(articles.find((article) => String(article.id) === selector.value));
    renderLanguageOptions();
});

document.querySelector("#translate").addEventListener("click", async () => {
    const selected = [...languages.querySelectorAll("input:checked")];
    if (!selected.length) {
        setStatus("Izvēlies vismaz vienu tulkošanas valodu.", true);
        return;
    }

    const source = {
        title: field("lv-title").value,
        excerpt: field("lv-excerpt").value,
        content: field("lv-content").value
    };

    setStatus("Tulko...");
    document.querySelector("#translate").disabled = true;

    try {
        for (const input of selected) {
            const response = await fetch("/.netlify/functions/deepl", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ source_lang: "LV", target_lang: input.value, ...source })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Tulkošana neizdevās.");

            const section = translations.querySelector(`[data-language="${input.value}"]`);
            if (section) {
                section.querySelector('[data-field="title"]').value = data.title;
                section.querySelector('[data-field="excerpt"]').value = data.excerpt;
                section.querySelector('[data-field="content"]').value = data.content;
            }
        }
        setStatus("Tulkojumi aizpildīti. Pārbaudi tos pirms publicēšanas.");
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        document.querySelector("#translate").disabled = false;
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = Number(field("id").value);
    const existing = articles.find((article) => article.id === id);
    const article = existing || { id };

    article.category = field("category").value;
    article.date = field("date").value;
    article.image = field("image").value;
    article.lv = {
        title: field("lv-title").value,
        excerpt: field("lv-excerpt").value,
        content: field("lv-content").value
    };

    translations.querySelectorAll(".translation").forEach((section) => {
        const language = section.dataset.language;
        article[language] = {};
        section.querySelectorAll("[data-field]").forEach((input) => {
            article[language][input.dataset.field] = input.value;
        });
    });

    const next = deletedArticleId === id
        ? articles.filter((item) => item.id !== id)
        : existing
            ? articles
            : [...articles, article];

    saveButton.disabled = true;
    setStatus("Publicē...");

    try {
        const response = await fetch("/.netlify/functions/save-articles", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ articles: next })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Publicēšana neizdevās.");
        articles = next;
        updateSelector();
        selector.value =
            deletedArticleId === id
                ? "new"
                : String(id);
        setStatus("Raksts publicēts.");
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
});

deleteButton.addEventListener("click", async () => {
    if (selector.value === "new" || !confirm("Dzēst šo rakstu?")) return;
    articles = articles.filter((article) => String(article.id) !== selector.value);
    const removedId =
        Number(selector.value);
    selector.value = "new";
    fillForm(null);
    field("id").value = removedId;
    deletedArticleId = removedId;
    setStatus("Spied Saglabāt un publicēt, lai apstiprinātu dzēšanu.");
});

document.querySelector("#logout").addEventListener("click", () => identity.logout());

identity.on("init", async () => {
    if (!identity.currentUser()) {
        identity.open("login");
        return;
    }

    try {
        await loadArticles();
        await loadDeepLLanguages();
    } catch (error) {
        setStatus(error.message, true);
    }
});
