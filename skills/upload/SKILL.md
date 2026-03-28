---
description: Upload a local image to the Cloudflare Image Bed
---

# Upload Image Skill

This tool allows you to upload a local generic file or image to a Cloudflare Image Bed instance.

## Usage

Use the `run_command` tool to execute the cfib script. If the package is installed globally, you can use `cfib`. Otherwise, use `bunx cfib` or `npx cfib`:

```bash
cfib upload <local_filepath> [options]
# OR
bunx @w-xuefeng/cfib upload <local_filepath> [options]
```

### Required Arguments:
- `<local_filepath>`: The absolute or relative path to the local file you wish to upload.

### Global Required Options:
- `--origin <url>`: The origin URL of the image bed server.
- `--upload-auth-code <code>`: The auth code cookie value to bypass authentication.

### Global Optional Environment & Tracing Options:
- `--upload-token <token>`: The authorization token for uploading.
- `--trace <id>`: Set an explicit Trace-Id.
- `--lang <language>`: Set an explicit Accept-Language.
- `--log <true|false>`: Enable or disable logging.

### Upload Specific Options (All Optional):
- `--server-compress <true|false>`: Whether the server should compress the image.
- `--upload-channel <channel>`: The channel to use (telegram, cfr2, s3, discord, huggingface).
- `--upload-folder <folder>`: A specific folder on the server to upload the file to.
- `--auth-code <code>`: Specific authCode for upload.

## Example

```bash
cfib upload /path/to/my/image.png --origin "https://my-image-bed.com" --upload-auth-code "my-auth-code" --upload-token "my-token"
```

## Success Criteria
The command outputs a JSON response. A successful upload will contain a `success: true` and the `data.src` / `data.url` pointing to the uploaded file.
