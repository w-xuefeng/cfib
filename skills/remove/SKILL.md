---
description: Remove an image or folder from the Cloudflare Image Bed
---

# Remove Image or Folder Skill

This tool allows you to delete an existing file or directory from the Cloudflare Image Bed server.

## Usage

Use the `run_command` tool to execute the cfib script. If the package is installed globally, you can use `cfib`. Otherwise, use `bunx cfib` or `npx cfib`:

```bash
cfib remove <remote_path> [options]
# OR
bunx @w-xuefeng/cfib remove <remote_path> [options]
```

### Required Arguments:
- `<remote_path>`: The path on the server referencing the file or folder.

### Global Required Options:
- `--origin <url>`: The origin URL of the image bed server.
- `--upload-auth-code <code>`: The auth code cookie value.

### Global Optional Options:
- `--delete-token <token>`: The authorization token required for deletion.
- `--trace <id>`: Set an explicit Trace-Id.
- `--lang <language>`: Set an explicit Accept-Language.
- `--log <true|false>`: Enable or disable logging.

### Options (All Optional):
- `--folder`: Pass this flag if the `<remote_path>` is a folder and you want to delete the whole folder instead of a target file.

## Example

Delete a single file:
```bash
cfib remove "12345.png" --origin "https://my-image-bed.com" --upload-auth-code "my-auth-code" --delete-token "my-secret-token"
```

Delete a full folder:
```bash
cfib remove "my_folder_name" --folder --origin "https://my-image-bed.com" --upload-auth-code "my-auth-code"
```

## Success Criteria
The command outputs a JSON response with `success: true` when the file or folder is successfully deleted.
