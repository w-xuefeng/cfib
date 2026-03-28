import { Logger, pathJoin } from "@w-xuefeng/bkit";
import os from "os";

interface IBEnv {
  IB_ORIGIN: string;
  IB_LOG: "true" | "false";
  IB_RUNTIME_PATH: string;
  IB_LOG_ROOT: string;
  IB_UPLOAD_TOKEN: string;
  IB_DELETE_TOKEN: string;
  IB_UPLOAD_AUTH_CODE: string;
}

const getLogConfig = () => {
  const IB_RUNTIME_PATH = Bun.env.IB_RUNTIME_PATH ||
    pathJoin(os.homedir(), ".cfib");
  const IB_LOG_ROOT = Bun.env.IB_LOG_ROOT || "logs";
  return {
    enabled: Bun.env.IB_LOG === "true",
    type: "both" as const,
    root: pathJoin(IB_RUNTIME_PATH, IB_LOG_ROOT),
  };
};

export const logger = new Logger(getLogConfig());
const initLogger = () => {
  const loggerConfig = getLogConfig();
  logger.enabled = loggerConfig.enabled;
  logger.root = loggerConfig.root;
};

export function initEvn(env?: Partial<IBEnv>) {
  Bun.env.IB_ORIGIN = Bun.env.IB_ORIGIN || env?.IB_ORIGIN;
  Bun.env.IB_LOG = Bun.env.IB_LOG || env?.IB_LOG;
  Bun.env.IB_RUNTIME_PATH = Bun.env.IB_RUNTIME_PATH || env?.IB_RUNTIME_PATH;
  Bun.env.IB_LOG_ROOT = Bun.env.IB_LOG_ROOT || env?.IB_LOG_ROOT;
  Bun.env.IB_UPLOAD_TOKEN = Bun.env.IB_UPLOAD_TOKEN || env?.IB_UPLOAD_TOKEN;
  Bun.env.IB_DELETE_TOKEN = Bun.env.IB_DELETE_TOKEN || env?.IB_DELETE_TOKEN;
  Bun.env.IB_UPLOAD_AUTH_CODE = Bun.env.IB_UPLOAD_AUTH_CODE ||
    env?.IB_UPLOAD_AUTH_CODE;
  initLogger();
}

export class Context {
  headers: Headers;
  constructor(traceId?: string, acceptLanguage = "en") {
    this.headers = new Headers();
    this.headers.set("Trace-Id", traceId || Bun.randomUUIDv7());
    this.headers.set("Accept-Language", acceptLanguage);
  }
  setLanguage(lang: string) {
    this.headers.set("Accept-Language", lang);
    return this;
  }
  setTraceId(traceId?: string) {
    this.headers.set("Trace-Id", traceId || Bun.randomUUIDv7());
    return this;
  }
  setHeaders(headers: Headers) {
    this.headers = headers;
    return this;
  }
}

export function filterEmptyField<T extends Record<string, any>>(
  data?: Record<string, any>,
  deep = false,
  emptyArray = ["", void 0, null],
) {
  if (!data) {
    return {} as T;
  }
  return Object.keys(data).reduce((res, key) => {
    if (
      data[key] && typeof data[key] === "object" && !Array.isArray(data[key]) &&
      deep
    ) {
      res[key as keyof T] = filterEmptyField(data[key]);
    } else if (!emptyArray.includes(data[key])) {
      res[key as keyof T] = data[key];
    }
    return res;
  }, {} as T);
}
