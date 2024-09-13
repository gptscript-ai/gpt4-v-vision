import {fileTypeFromBuffer} from 'file-type';
import fs from 'fs';
import OpenAI from 'openai';

async function main() {
    let images = []
    if (process.env.IMAGES) {
        images = process.env.IMAGES.split(/(?<!\\),/) // this matches all unescaped commas
        for (let i = 0; i < images.length; i++) {
            images[i] = images[i].replace(/\\,/g, ',')
        }
    }

    if (images.length === 0) {
        console.log("No images provided. Please provide a list of images to send to the vision model.")
        process.exit(1)
    }

    const prompt = process.env.PROMPT ?? ""
    if (prompt === "") {
        console.log("No prompt provided. Please provide a prompt to send to the vision model.")
        process.exit(1)
    }

    const options = {}

    if (process.env.OPENAI_API_KEY) {
        options.openaiApiKey = process.env.OPENAI_API_KEY
    }
    if (process.env.OPENAI_BASE_URL) {
        options.baseUrl = process.env.OPENAI_BASE_URL
    }
    if (process.env.OPENAI_ORG_ID) {
        options.orgId = process.env.OPENAI_ORG_ID
    }

    if (process.env.MAX_TOKENS) {
        options.maxTokens = parseInt(process.env.MAX_TOKENS)
    } else {
        options.maxTokens = 2048
    }

    if (process.env.MODEL) {
        options.model = process.env.MODEL
    } else {
        console.log("No model provided. Please provide a model.")
        process.exit(1)
    }

    if (process.env.DETAIL) {
        if (process.env.DETAIL === 'low') {
            options.detail = 'low'
        } else if (process.env.DETAIL === 'high') {
            options.detail = 'high'
        } else if (process.env.DETAIL === 'auto') {
            options.detail = 'auto'
        } else {
            console.log("Invalid detail provided. Please provide a valid detail.")
            process.exit(1)
        }
    } else {
        options.detail = 'auto'
    }

    await run(prompt, images, options)
}

async function run(prompt, images, opts) {
    let content = []
    for (let image of images) {
        content.push({
            type: "image_url",
            image_url: {
                detail: opts.detail,
                url: await resolveImageURL(image)
            }
        })
    }

    const openai = new OpenAI(opts.openaiApiKey, opts.baseUrl, opts.orgId);
    const response = await openai.chat.completions.create({
        model: opts.model,
        max_tokens: opts.maxTokens,
        stream: true,
        messages: [
            {
                role: 'user',
                content: [
                    {type: "text", text: prompt},
                    ...content
                ]
            },
        ]
    });

    for await (const part of response) {
        const {choices} = part;
        const text = choices[0]?.delta?.content;
        if (text) {
            process.stdout.write(text);
        }
    }

}

async function resolveImageURL(image) {
    const uri = new URL(image)
    switch (uri.protocol) {
        case 'http:':
        case 'https:':
            return image;
        case 'file:':
            const filePath = image.slice(7)
            const data = fs.readFileSync(filePath)
            const mime = (await fileTypeFromBuffer(data)).mime
            if (mime !== 'image/jpeg' && mime !== 'image/png') {
                throw new Error('Unsupported mimetype')
            }

            const base64 = data.toString('base64')
            return `data:${mime};base64,${base64}`
        default:
            throw new Error('Unsupported protocol')
    }
}

await main();
