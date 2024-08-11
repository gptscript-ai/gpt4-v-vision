import { Command, Option } from 'commander';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import OpenAI from 'openai';


async function main() {
  const program = new Command();

  program.description('Utility for processing images with the GPTScript Gateway API');

  program.addOption(new Option('--gptscript-gateway-api-key <key>', 'Gateway API Key')
    .env('GPTSCRIPT_GATEWAY_API_KEY')
    .makeOptionMandatory()
  );

  program.addOption(new Option('--gptscript-gateway-url <string>', 'Gateway URL')
    .env('GPTSCRIPT_GATEWAY_URL')
    .default("https://gateway-api.gptscript.ai")
  );

  program.addOption(new Option('--max-tokens <number>', 'Max tokens to use')
    .default(2048)
    .env('MAX_TOKENS')
  );

  program.addOption(new Option('--model <model>', 'Model to process images with')
    .env('MODEL')
    .choices([
      'gpt-4o'
    ])
    .default('gpt-4o')
  );

  program.addOption(new Option('--detail <detail>', 'Fidelity to use when processing images')
    .env('DETAIL')
    .choices(['low', 'high', 'auto'])
    .default('auto')
  );

  program.argument('<prompt>', 'Prompt to send to the vision model');

  program.argument('<images...>', 'List of image URIs to process. Supports file:// and https:// protocols. Images must be jpeg or png.');

  program.action(run);
  await program.parseAsync();
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

  const openai = new OpenAI({apiKey: opts.gptscriptGatewayApiKey, baseURL: opts.gptscriptGatewayUrl + "/llm"});
  const response = await openai.chat.completions.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    messages: [
      {
        role: 'user',
        content: [
          { type: "text", text: prompt },
          ...content
        ]
      },
    ]
  });

  console.log(JSON.stringify(response, null, 4));
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
      if (mime != 'image/jpeg' && mime != 'image/png') {
        throw new Error('Unsupported mimetype')
      }

      const base64 = data.toString('base64')
      return `data:${mime};base64,${base64}`
    default:
      throw new Error('Unsupported protocol')
  }
}

main();



