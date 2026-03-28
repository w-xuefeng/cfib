---
description: Get a random image from the Cloudflare Image Bed
---

# Random Image Skill

This tool fetches a random file or image from the Cloudflare Image Bed server. It can either return the JSON metadata or download the actual file.

## Usage

Use the `run_command` tool to execute the cfib script. If the package is installed globally, you can use `cfib`. Otherwise, use `bunx cfib` or `npx cfib`:

```bash
cfib random [options] [local_save_path]
# OR
bunx @w-xuefeng/cfib random [options] [local_save_path]
```

### Options (All Optional):
- `[local_save_path]`: If you specify `--type img`, you must provide a local filepath to save the binary image data (defaults to `random-image.jpg`).
- `--type <path|img>`: (default: path) If set to `img`, returns and saves the file directly. If set to `path`, returns JSON info.
- `--content <image|video>`: (default: image) The type of content to filter.
- `--form <json|text>`: (default: json) The response data format.
- `--dir <path>`: Filter random files only within a specific server directory.
- `--orientation <landscape|portrait|square|auto>`: Filter by image orientation.

### Global Required Options:
- `--origin <url>`: The origin URL of the image bed server.

### Global Optional Options:
- `--trace <id>`: Set an explicit Trace-Id.
- `--lang <language>`: Set an explicit Accept-Language.
- `--log <true|false>`: Enable or disable logging.

## Examples

Get JSON metadata of a random image:
```bash
cfib random --origin "https://my-image-bed.com"
```

Download a random image directly to `test.jpg`:
```bash
cfib random test.jpg --type img --origin "https://my-image-bed.com"
```

## Success Criteria
Normally outputs JSON metadata of the file. If `--type img` is used, the image is saved to the provided local path and outputs `Image saved to <path>`.
