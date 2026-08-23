async function getUser(event, context) {
    if (context && context.clientContext && context.clientContext.user) {
        return context.clientContext.user;
    }

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

function safeFileName(name) {
    return name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
}

exports.handler = async function (event, context) {
    if (event.httpMethod === "OPTIONS") {
        return reply(204, {});
    }

    if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
        return reply(405, { error: "Metode nav atbalstīta." });
    }

    const user = await getUser(event, context);
    if (!user || !user.email) {
        return reply(401, { error: "Nepieciešama admin autorizācija." });
    }

    if (!process.env.GITHUB_TOKEN) {
        return reply(503, { error: "GitHub augšupielādes atslēga nav konfigurēta." });
    }

    try {
        const owner = process.env.GITHUB_OWNER || "eokycre";
        const repository = process.env.GITHUB_REPOSITORY || "lv";
        const branch = process.env.GITHUB_BRANCH || "main";
        const headers = {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28"
        };

        if (event.httpMethod === "GET") {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repository}/contents/images?ref=${branch}`,
                { headers }
            );
            const files = response.ok ? await response.json() : [];

            return reply(200, {
                files: files
                    .filter((file) => file.type === "file")
                    .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file.name))
                    .map((file) => ({ name: file.name, path: `images/${file.name}` }))
            });
        }

        const input = JSON.parse(event.body || "{}");
        const fileName = safeFileName(String(input.name || ""));
        const content = String(input.content || "");
        const type = String(input.type || "");

        if (!/^[a-z0-9][a-z0-9._-]{1,100}$/i.test(fileName) ||
            !/^image\/(jpeg|png|webp|gif)$/.test(type) ||
            !content || content.length > 7_000_000) {
            return reply(400, { error: "Attēla dati nav derīgi." });
        }

        const path = `images/${fileName}`;
        const api = `https://api.github.com/repos/${owner}/${repository}/contents/${path}`;
        const current = await fetch(`${api}?ref=${branch}`, { headers });
        const currentData = current.ok ? await current.json() : null;
        const update = await fetch(api, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Upload image by ${user.email}`,
                content,
                ...(currentData && currentData.sha ? { sha: currentData.sha } : {}),
                branch
            })
        });

        if (!update.ok) {
            throw new Error("GitHub attēla augšupielāde neizdevās.");
        }

        return reply(200, { path });
    } catch (error) {
        console.error(error);
        return reply(400, { error: error.message || "Attēla augšupielāde neizdevās." });
    }
};
