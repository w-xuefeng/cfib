---
name: cfib-cli
description: Use the cfib CLI to interact with a Cloudflare Image Bed. Use when the user wants to upload a local file, remove a remote file or folder, or fetch a random image/path from the image bed via cfib.
metadata: {"openclaw":{"requires":{"bins":["cfib"]}}}
---

# CFIB CLI

This skill allows you to interact with a Cloudflare Image Bed instance via the `cfib` CLI.

## Working rules

- Prefer the native `cfib` binary when it exists on PATH. Otherwise, use `bunx @w-xuefeng/cfib` or `npx @w-xuefeng/cfib`.
- Use the `exec` tool to execute the cfib script.
- Treat `--origin`, tokens, auth codes, and similar credentials as secrets; do not echo them back unnecessarily.
- **Credential retrieval**: If you lack required parameters (like `--origin`, `--upload-auth-code`, or tokens), try fetching them using `local-diamond` (`lod`). Extract them by executing `bunx lod get cfib/origin`, `bunx lod get cfib/upload-auth-code`, `bunx lod get cfib/upload-token`, or `bunx lod get cfib/delete-token`.
- For destructive actions like `cfib remove`, confirm with the user unless they already clearly asked for deletion.
- When downloading with `random --type img`, save into a user-specified path when possible and report where the file was written.
- Return the important parts of the command result in plain language, and include paths/URLs when the command succeeds.
- To discover more options or verify usage at runtime, execute `cfib --help`.

## Commands

### 1. Upload a local file (`cfib upload`)

Upload a local generic file or image to a Cloudflare Image Bed instance.

```bash
cfib upload <local_filepath> [options]
```

**Required Arguments:**
- `<local_filepath>`: The absolute or relative path to the local file you wish to upload.

**Global Required Options:**
- `--origin <url>`: The origin URL of the image bed server.
- `--upload-auth-code <code>`: The auth code cookie value to bypass authentication.

**Global Optional Environment & Tracing Options:**
- `--upload-token <token>`: The authorization token for uploading.
- `--trace <id>`, `--lang <language>`, `--log <true|false>`

**Upload Specific Options (Optional):**
- `--server-compress <true|false>`: Whether the server should compress the image.
- `--upload-channel <channel>`: The channel to use (telegram, cfr2, s3, discord, huggingface).
- `--upload-folder <folder>`: A specific folder on the server to upload the file to.
- `--auth-code <code>`: Specific authCode for upload.

**Success Criteria:** Outputs a JSON response. A successful upload contains `success: true` and the `data.src` / `data.url`.

---

### 2. Remove an image or folder (`cfib remove`)

Delete an existing file or directory from the Cloudflare Image Bed server.

```bash
cfib remove <remote_path> [options]
```

**Required Arguments:**
- `<remote_path>`: The path on the server referencing the file or folder.

**Global Required Options:**
- `--origin <url>`: The origin URL of the image bed server.
- `--upload-auth-code <code>`: The auth code cookie value.

**Optional Options:**
- `--delete-token <token>`: The authorization token required for deletion.
- `--folder`: Pass this flag if `<remote_path>` is a folder and you want to delete the whole folder.
- `--trace <id>`, `--lang <language>`, `--log <true|false>`

**Success Criteria:** Outputs a JSON response with `success: true`.

---

### 3. Fetch a random image (`cfib random`)

Fetch a random file or image from the Cloudflare Image Bed server. It can either return the JSON metadata or download the actual file.

```bash
cfib random [options] [local_save_path]
```

**Options (All Optional):**
- `[local_save_path]`: If you specify `--type img`, provide a local filepath to save the binary data (defaults to `random-image.jpg`).
- `--type <path|img>`: (default: path) If `img`, returns and saves the file directly. If `path`, returns JSON info.
- `--content <image|video>`, `--form <json|text>`, `--dir <path>`, `--orientation <landscape|portrait|square|auto>`

**Global Required Options:**
- `--origin <url>`: The origin URL of the image bed server.

**Global Optional Options:**
- `--trace <id>`, `--lang <language>`, `--log <true|false>`

**Success Criteria:** Outputs JSON metadata of the file. If `--type img` is used, the image is saved to the given path.
