const allowedOrigin =
    "https://zeltains-admin.netlify.app";


function response(
    statusCode,
    body
) {

    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization",
            "Access-Control-Allow-Methods":
                "GET, POST, OPTIONS",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}


async function getIdentityUser(
    event
) {

    const authorization =
        event.headers.authorization ||
        event.headers.Authorization;


    if (!authorization ||
        !authorization.startsWith("Bearer ")) {
        return null;
    }


    const siteOrigin =
        `https://${event.headers.host}`;


    const userResponse =
        await fetch(
            `${siteOrigin}/.netlify/identity/user`,
            {
                headers: {
                    Authorization: authorization
                }
            }
        );


    if (!userResponse.ok) {
        return null;
    }


    return userResponse.json();
}


async function getDeepLLanguages() {

    const apiResponse =
        await fetch(
            "https://api-free.deepl.com/v2/languages?type=target",
            {
                headers: {
                    Authorization:
                        `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
                }
            }
        );


    if (!apiResponse.ok) {
        throw new Error(
            `DeepL valodu saraksts: ${apiResponse.status}`
        );
    }


    return apiResponse.json();
}


function validateText(
    value,
    name
) {

    if (typeof value !== "string") {
        throw new Error(
            `${name} jābūt tekstam.`
        );
    }


    if (value.length > 20000) {
        throw new Error(
            `${name} ir pārāk garš.`
        );
    }


    return value;
}


exports.handler = async function (
    event
) {

    if (event.httpMethod === "OPTIONS") {
        return response(204, {});
    }


    if (!process.env.DEEPL_API_KEY) {
        return response(
            503,
            {
                error: "DeepL API atslēga nav konfigurēta."
            }
        );
    }


    try {
        const user =
            await getIdentityUser(event);


        if (!user || !user.email) {
            return response(401, {
                error: "Nepieciešama admin autorizācija."
            });
        }


        if (event.httpMethod === "GET") {

            const languages =
                await getDeepLLanguages();


            return response(200, languages);
        }


        if (event.httpMethod !== "POST") {
            return response(405, {
                error: "Metode nav atbalstīta."
            });
        }


        const input =
            JSON.parse(event.body || "{}");


        const sourceLang =
            String(input.source_lang || "LV")
                .toUpperCase();


        const targetLang =
            String(input.target_lang || "")
                .toUpperCase();


        const texts = [
            validateText(input.title, "Virsraksts"),
            validateText(input.excerpt, "Apraksts"),
            validateText(input.content, "Saturs")
        ];


        const languages =
            await getDeepLLanguages();


        const supported =
            languages.some(
                function (language) {
                    return language.language === targetLang;
                }
            );


        if (!supported || targetLang === sourceLang) {
            return response(400, {
                error: "DeepL neatbalsta norādīto mērķa valodu."
            });
        }


        const apiResponse =
            await fetch(
                "https://api-free.deepl.com/v2/translate",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        text: texts,
                        source_lang: sourceLang,
                        target_lang: targetLang,
                        tag_handling: "html",
                        preserve_formatting: true
                    })
                }
            );


        if (!apiResponse.ok) {
            return response(
                502,
                {
                    error:
                        "DeepL tulkošana neizdevās."
                }
            );
        }


        const result =
            await apiResponse.json();


        return response(200, {
            language: targetLang.toLowerCase(),
            title: result.translations[0].text,
            excerpt: result.translations[1].text,
            content: result.translations[2].text,
            reviewed: false
        });

    } catch (error) {

        console.error(error);

        return response(400, {
            error: "Tulkošanas pieprasījums nav derīgs."
        });
    }
};
