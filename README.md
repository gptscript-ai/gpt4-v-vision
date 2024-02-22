# vision

`vision` is a simple OpenAI CLI and GPTScript Tool for interacting with vision models.

## Prerequisites

- NodeJS 
- OpenAI API key

## Installation

1. Clone this repository or download the source code:

    ```bash
    git clone git@github.com:gptscript-ai/vision.git
    cd vision 
    ```

2. Install the `npm` dependencies

    ```bash
    npm install 
    ```

## Usage

### Command help

```console
$ node index.js --help
Usage: index [options] <prompt> <images...>

Utility for processing images with the OpenAI API

Arguments:
  prompt                      Prompt to send to the vision model
  images                      List of image URIs to process. Supports file:// and https:// protocols. Images must be jpeg or png.

Options:
  --openai-api-key <key>      OpenAI API Key (env: OPENAI_API_KEY)
  --openai-base-url <string>  OpenAI base URL (env: OPENAI_BASE_URL)
  --openai-org-id <string>    OpenAI Org ID to use (env: OPENAI_ORG_ID)
  --max-tokens <number>       Max tokens to use (default: 2048, env: MAX_TOKENS)
  --model <model>             Model to process images with (choices: "gpt-4-vision-preview", default: "gpt-4-vision-preview", env: MODEL)
  --detail <detail>           Fidelity to use when processing images (choices: "low", "high", "auto", default: "auto", env: DETAIL)
  -h, --help                  display help for command
```

### Ask a question about an image in a local file 

```bash
node index.js 'Describe the picture' 'file://examples/eiffel-tower.png'
```

### Ask a question about an image at a remote URL 
```bash
node index.js 'Describe the picture' 'https://github.com/gptscript-ai/vision/blob/main/examples/eiffel-tower.png?raw=true'
```

### Ask a question related to multiple images 
```bash
node index.js 'Do you think these two portraits are by the same artist?' 'https://github.com/gptscript-ai/vision/blob/main/examples/eiffel-tower.png?raw=true' 'file://examples/eiffel-tower.png'
```