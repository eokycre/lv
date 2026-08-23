async function getUser(event) {
    const authorization =
        event.headers.authorization ||
        event.headers.Authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }

    const response = await fetch(
        `https://${event.headers.host}/.netlify/identity/user`,
        { headers: { Authorization: authorization } }
    );

    return response.ok ? response.json() : null;
}

function reply(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "https://zeltains-admin.netlify.app",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}

function validateArticles(articles) {
    if (!Array.isArray(articles) || articles.length > 10000) {
        throw new Error("Rakstu dati nav derīgi.");
    }

    const ids = new Set();

    for (const article of articles) {
        if (!Number.isInteger(article.id) || article.id < 1 || ids.has(article.id)) {
            throw new Error("Rakstu ID nav derīgi vai atkārtojas.");
        }

        ids.add(article.id);

        if (typeof article.category !== "string" ||
            typeof article.date !== "string" ||
            typeof article.image !== "string") {
            throw new Error("Raksta pamatdati nav derīgi.");
        }

        for (const language of Object.values(article)) {
            if (language && typeof language === "object") {
                for (const value of Object.values(language)) {
                    if (typeof value === "string" && value.length > 20000) {
                        throw new Error("Raksta teksts ir pārāk garš.");
                    }
                }
            }
        }
    }
}

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return reply(204, {});
    }

    if (event.httpMethod !== "POST") {
        return reply(405, { error: "Metode nav atbalstīta." });
    }

    const user = await getUser(event);
    if (!user || !user.email) {
        return reply(401, { error: "Nepieciešama admin autorizācija." });
    }

    if (!process.env.GITHUB_TOKEN) {
        return reply(503, { error: "GitHub publicēšanas atslēga nav konfigurēta." });
    }

    try {
        const body = JSON.parse(event.body || "{}");
        validateArticles(body.articles);

        const owner = process.env.GITHUB_OWNER || "eokycre";
        const repository = process.env.GITHUB_REPOSITORY || "lv";
        const branch = process.env.GITHUB_BRANCH || "main";
        const path = "data/raksti.json";
        const api = `https://api.github.com/repos/${owner}/${repository}/contents/${path}`;
        const headers = {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28"
        };

        const current = await fetch(`${api}?ref=${branch}`, { headers });
        const currentData = await current.json();
        if (!current.ok || !currentData.sha) {
            throw new Error("GitHub fails nav pieejams.");
        }

        const content = Buffer.from(
            JSON.stringify({ articles: body.articles }, null, 4) + "\n"
        ).toString("base64");

        const update = await fetch(api, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Update articles by ${user.email}`,
                content,
                sha: currentData.sha,
                branch
            })
        });

        if (!update.ok) {
            throw new Error("GitHub fails netika atjaunināts.");
        }

        return reply(200, { ok: true });
    } catch (error) {
        console.error(error);
        return reply(400, { error: error.message || "Publicēšana neizdevās." });
    }
};
