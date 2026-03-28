import { pathJoin, R } from "@w-xuefeng/bkit";
import { type Context, filterEmptyField, logger } from "./utils";

export interface IBUploadOptions {
  authCode?: string;
  serverCompress?: "true" | "false";
  uploadChannel?: "telegram" | "cfr2" | "s3" | "discord" | "huggingface";
  channelName?: string;
  autoRetry?: "true" | "false";
  uploadNameType?: "default" | "index" | "origin" | "short";
  returnFormat?: "default" | "full";
  uploadFolder?: string;
}

export interface IBRandomOptions {
  /**
   * @default "image"
   * 文件类型过滤，可选值有 [image, video]，多个使用 , 分隔
   */
  content?: "image" | "vidoe" | "image, video";
  /**
   * @default "path"
   * 返回内容类型，设为 img 时直接返回图片（此时 form 不生效），设为 url 时返回完整 url 链接
   */
  type?: "path" | "img";
  /**
   * @default "json"
   * 响应格式，设为 text 时直接返回文本
   */
  form?: "json" | "text";
  /**
   * 指定目录，使用相对路径，例如 img/test 会返回该目录以及所有子目录下的文件
   */
  dir?: string;
  /**
   * 图片方向筛选，可选值：landscape（横图）、portrait（竖图）、square（方图）、auto（自适应设备方向）
   */
  orientation?: "landscape" | "portrait" | "square" | "auto";
}

type IBUploadResponse = { src: string }[];

interface IBDeleteSingleFileResponse {
  success: true;
  fileId: string;
}

interface IBDeleteFolderResponse {
  success: true;
  deleted: string[];
  failed: string[];
}

interface IBDeleteFolderErrorResponse {
  success: false;
  error: string;
}

type IBDeleteResponse =
  | IBDeleteSingleFileResponse
  | IBDeleteFolderResponse
  | IBDeleteFolderErrorResponse;

export function upload(c: Context, file: File, options?: IBUploadOptions) {
  const traceId = c.headers.get("Trace-Id");
  const formData = new FormData();
  formData.append("file", file);
  const searchParams = new URLSearchParams(filterEmptyField({
    uploadChannel: "telegram",
    serverCompress: "true",
    uploadNameType: "default",
    returnFormat: "default",
    autoRetry: "false",
    ...options,
  }));
  const url = `${Bun.env.IB_ORIGIN}/upload?${searchParams.toString()}`;
  logger.info(
    `[trace-id: ${traceId}][image-bed upload params]: POST ${url} formData::[file:${file.name} ${file.size} ${file.type}]`,
  );
  return fetch(
    url,
    {
      method: "POST",
      body: formData,
      headers: {
        cookie: `authCode=${String(Bun.env.IB_UPLOAD_AUTH_CODE)}`,
        authCode: String(Bun.env.IB_UPLOAD_AUTH_CODE),
        referer: String(Bun.env.IB_ORIGIN),
        Authorization: `Bearer ${Bun.env.IB_UPLOAD_TOKEN}`,
      },
    },
  ).then((rs) => rs.json()).then((rs) => {
    logger.info(
      `[trace-id: ${traceId}][image-bed upload result]: ${JSON.stringify(rs)}`,
    );
    if (
      !rs || !(rs as IBUploadResponse).length ||
      !(rs as IBUploadResponse)[0]?.src
    ) {
      return R.unifail("FILE_UPLOAD_FAIL", rs, c.headers);
    }
    return R.unisuccess({
      src: (rs as IBUploadResponse)[0]!.src,
      url: pathJoin(
        String(Bun.env.IB_ORIGIN),
        (rs as IBUploadResponse)[0]!.src,
      ),
    }, c.headers);
  }, (error) => {
    logger.error(
      `[trace-id: ${traceId}][image-bed upload error]: ${
        JSON.stringify(error)
      }`,
    );
    return R.unifail("SERVER_ERROR", error, c.headers);
  });
}

export function remove(c: Context, path: string, folder: boolean = false) {
  const traceId = c.headers?.get("Trace-Id");
  if (path.startsWith(`${Bun.env.IB_ORIGIN}/`)) {
    path = path.replace(`${Bun.env.IB_ORIGIN}/`, "");
  }
  if (path.startsWith("file/")) {
    path = path.replace("file/", "");
  }
  if (path.startsWith("/file/")) {
    path = path.replace("/file/", "");
  }
  return fetch(
    `${Bun.env.IB_ORIGIN}/api/manage/delete/${path}${
      folder ? "?folder=true" : ""
    }`,
    {
      method: "DELETE",
      headers: {
        cookie: `authCode=${String(Bun.env.IB_UPLOAD_AUTH_CODE)}`,
        authCode: String(Bun.env.IB_UPLOAD_AUTH_CODE),
        referer: String(Bun.env.IB_ORIGIN),
        Authorization: `Bearer ${Bun.env.IB_DELETE_TOKEN}`,
      },
    },
  ).then((rs) => rs.json()).then((rs) => {
    logger.info(
      `[trace-id: ${traceId}][image-bed remove result]: ${JSON.stringify(rs)}`,
    );
    if (!rs || !(rs as IBDeleteResponse).success) {
      return R.unifail("REQ_EXCEPTION", rs, c.headers);
    }
    return R.unisuccess(rs as IBDeleteResponse, c.headers);
  }, (error) => {
    logger.error(
      `[trace-id: ${traceId}][image-bed remove error]: ${
        JSON.stringify(error)
      }`,
    );
    return R.unifail("SERVER_ERROR", error, c.headers);
  });
}

export function random(c: Context, options?: IBRandomOptions) {
  const traceId = c.headers.get("Trace-Id");
  const searchParams = new URLSearchParams(filterEmptyField({
    content: "image",
    type: "path",
    form: "json",
    ...options,
  }));
  const url = `${Bun.env.IB_ORIGIN}/random?${searchParams.toString()}`;
  logger.info(
    `[trace-id: ${traceId}][image-bed random params]: GET ${url}`,
  );
  return fetch(url, {
    method: "GET",
    headers: {
      referer: String(Bun.env.IB_ORIGIN),
    },
  }).then((rs) => {
    if (options?.type === "img") {
      return rs.blob();
    }
    if (options?.form === "text") {
      return rs.text();
    }
    return rs.json();
  }).catch((error) => {
    logger.error(
      `[trace-id: ${traceId}][image-bed random error]: ${
        JSON.stringify(error)
      }`,
    );
    return R.unifail("SERVER_ERROR", error, c.headers);
  });
}
