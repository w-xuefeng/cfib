#!/usr/bin/env bun

import { parseArgs } from "node:util";
import { Context, initEvn, logger } from "./utils";
import {
  type IBRandomOptions,
  type IBUploadOptions,
  random,
  remove,
  upload,
} from "./image-bed";

async function main() {
  const args = process.argv.slice(2);
  const { values, positionals } = parseArgs({
    args,
    options: {
      origin: { type: "string" },
      log: { type: "string" },
      "runtime-path": { type: "string" },
      "log-root": { type: "string" },
      "upload-token": { type: "string" },
      "delete-token": { type: "string" },
      "upload-auth-code": { type: "string" },
      trace: { type: "string" },
      lang: { type: "string" },

      // Upload Options
      "auth-code": { type: "string" },
      "server-compress": { type: "string" },
      "upload-channel": { type: "string" },
      "channel-name": { type: "string" },
      "auto-retry": { type: "string" },
      "upload-name-type": { type: "string" },
      "return-format": { type: "string" },
      "upload-folder": { type: "string" },

      // Remove Options
      folder: { type: "boolean" },

      // Random Options
      content: { type: "string" },
      type: { type: "string" },
      form: { type: "string" },
      dir: { type: "string" },
      orientation: { type: "string" },

      help: { type: "boolean", short: "h" },
    },
    strict: false,
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(`
Usage: cfib <command> [args] [options...]

Commands:
  upload <file>     (Required <file>) Upload a local file
  remove <path>     (Required <path>) Remove a remote file or folder
  random [dest]     (Optional [dest]) Get a random image and save it to [dest] if --type is img

Global Options:
  --origin <url>             (Required) Set IB_ORIGIN
  --log <true|false>         Set IB_LOG
  --runtime-path <path>      Set IB_RUNTIME_PATH
  --log-root <path>          Set IB_LOG_ROOT
  --upload-token <token>     Set IB_UPLOAD_TOKEN
  --delete-token <token>     Set IB_DELETE_TOKEN
  --upload-auth-code <code>  (Required for upload/remove) Set IB_UPLOAD_AUTH_CODE
  --trace <id>               Set Trace-Id
  --lang <language>          Set Accept-Language

Upload Options (All Optional):
  --auth-code <code>                 Provide authCode for upload
  --server-compress <true|false>     Whether to compress image on server
  --upload-channel <channel>         Upload channel (telegram|cfr2|s3|discord|huggingface)
  --channel-name <name>              Channel target name
  --auto-retry <true|false>          Whether to auto-retry
  --upload-name-type <type>          Name type (default|index|origin|short)
  --return-format <format>           Return format (default|full)
  --upload-folder <folder>           Target upload folder

Remove Options (All Optional):
  --folder                           Remove a folder instead of a single file

Random Options (All Optional):
  --content <image|video>            Filter content type
  --type <path|img>                  Return type, use 'img' to return raw binary and save to local
  --form <json|text>                 Response format
  --dir <path>                       Filter by specific directory
  --orientation <direction>          Orientation (landscape|portrait|square|auto)
    `.trim());
    process.exit(0);
  }

  // Initialize env
  initEvn({
    IB_ORIGIN: values.origin as string | undefined,
    IB_LOG: values.log as "true" | "false" | undefined,
    IB_RUNTIME_PATH: values["runtime-path"] as string | undefined,
    IB_LOG_ROOT: values["log-root"] as string | undefined,
    IB_UPLOAD_TOKEN: values["upload-token"] as string | undefined,
    IB_DELETE_TOKEN: values["delete-token"] as string | undefined,
    IB_UPLOAD_AUTH_CODE: values["upload-auth-code"] as string | undefined,
  });

  if (!Bun.env.IB_ORIGIN) {
    console.error(
      "Error: Missing required global configuration: --origin. Please provide it via CLI or environment variables.",
    );
    process.exit(1);
  }

  const command = positionals[0];
  if (
    (command === "upload" || command === "remove") &&
    !Bun.env.IB_UPLOAD_AUTH_CODE
  ) {
    console.error(
      `Error: Missing required configuration: --upload-auth-code for the '${command}' command.`,
    );
    process.exit(1);
  }
  const c = new Context(
    values.trace as string | undefined,
    values.lang as string | undefined,
  );

  try {
    if (command === "upload") {
      const filepath = positionals[1];
      if (!filepath) {
        console.error("Error: Please provide a filepath to upload.");
        process.exit(1);
      }
      const bunFile = Bun.file(filepath);
      if (!(await bunFile.exists())) {
        console.error(`Error: File not found at ${filepath}`);
        process.exit(1);
      }

      const options: IBUploadOptions = {
        authCode: values["auth-code"] as string | undefined,
        serverCompress:
          values["server-compress"] as IBUploadOptions["serverCompress"],
        uploadChannel:
          values["upload-channel"] as IBUploadOptions["uploadChannel"],
        channelName: values["channel-name"] as string | undefined,
        autoRetry: values["auto-retry"] as IBUploadOptions["autoRetry"],
        uploadNameType:
          values["upload-name-type"] as IBUploadOptions["uploadNameType"],
        returnFormat:
          values["return-format"] as IBUploadOptions["returnFormat"],
        uploadFolder: values["upload-folder"] as string | undefined,
      };

      const result = await upload(c, bunFile as unknown as File, options);
      if (result.success === false) {
        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "remove") {
      const pathToRemove = positionals[1];
      if (!pathToRemove) {
        console.error("Error: Please provide a path to remove.");
        process.exit(1);
      }

      const isFolder = Boolean(values.folder);
      const result = await remove(c, pathToRemove, isFolder);
      if (result.success === false) {
        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "random") {
      const options: IBRandomOptions = {
        content: values.content as IBRandomOptions["content"],
        type: values.type as IBRandomOptions["type"],
        form: values.form as IBRandomOptions["form"],
        dir: values.dir as string | undefined,
        orientation: values.orientation as IBRandomOptions["orientation"],
      };

      const result = await random(c, options);
      if (options.type === "img") {
        const dest = positionals[1] || "random-image.jpg";
        if (result instanceof Blob) {
          await Bun.write(dest, result);
          console.log(`Image saved to ${dest}`);
        } else {
          console.error("Error: Expected Blob, got", result);
          process.exit(1);
        }
      } else if (options.form === "text") {
        console.log(result);
      } else {
        if (result && (result as any).success === false) {
          console.error(JSON.stringify(result, null, 2));
          process.exit(1);
        }
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.error(`Error: Unknown command "${command}"`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Execution error:", err.message || err);
    process.exit(1);
  }
}

main();
