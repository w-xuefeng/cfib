import { beforeAll, describe, expect, it } from "bun:test";
import { random, remove, upload } from "../src/image-bed";
import { Context, initEvn } from "../src/utils";

/**
 * 在执行本测试脚本之前，
 * 请确保您本地安装了 local-diamond，并且使用下列命令配置好了环境变量
 * lod set cfib/origin <origin>
 * lod set cfib/upload-auth-code <upload-auth-code>
 * lod set cfib/upload-token <upload-token>
 * lod set cfib/delete-token <delete-token>
 */

function getLodConfig(key: string): string {
  const proc = Bun.spawnSync(["bunx", "lod", "get", key]);
  if (!proc.success) {
    throw new Error(
      `Failed to fetch ${key} from lod. Make sure local-diamond is configured properly.`,
    );
  }
  return proc.stdout.toString().trim();
}

describe("Cloudflare Image Bed API Tests", () => {
  let c: Context;
  let testImagePath = "";

  beforeAll(() => {
    const origin = getLodConfig("cfib/origin");
    const uploadAuthCode = getLodConfig("cfib/upload-auth-code");
    const uploadToken = getLodConfig("cfib/upload-token");
    const deleteToken = getLodConfig("cfib/delete-token");

    initEvn({
      IB_ORIGIN: origin,
      IB_UPLOAD_AUTH_CODE: uploadAuthCode,
      IB_UPLOAD_TOKEN: uploadToken,
      IB_DELETE_TOKEN: deleteToken,
      IB_LOG: "true",
    });

    c = new Context();
  });

  it("should upload a local image", async () => {
    const file = Bun.file(`${import.meta.dir}/banner.png`);
    expect(await file.exists()).toBe(true);
    const buffer = await file.arrayBuffer();
    const webFile = new File([buffer], "banner.png", { type: file.type });
    const result = await upload(c, webFile, { uploadFolder: "wallpaper/test" });

    if (!result.success) {
      console.error(
        "Upload failed with result:",
        JSON.stringify(result, null, 2),
      );
    }

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.src).toBeDefined();
    expect(result.data?.url).toBeDefined();
    expect(typeof result.data?.src).toBe("string");
    expect(typeof result.data?.url).toBe("string");

    testImagePath = result.data!.url;
  });

  it("should remove the uploaded image", async () => {
    expect(testImagePath).not.toBe("");
    const result = await remove(c, testImagePath, false);
    expect(result.success).toBe(true);
  });

  it("should get a random image", async () => {
    const result = await random(c, { type: "path", dir: "wallpaper" });
    expect(result).toBeDefined();
    if ((result as any).success !== undefined) {
      expect((result as any).success).toBe(true);
    }
  });
});
