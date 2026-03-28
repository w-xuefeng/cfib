# CFIB - Cloudflare Image Bed CLI & Agent Skills

> 💡 **特别说明与致敬**
> 
> 本项目是对优秀的开源图床解决方案 **[CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed)** 的生态扩展。十分感谢作者为大家提供如此出色的服务级支持！在此对原项目致以最诚挚的敬意。

**CFIB** 是原项目 **[CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed)** 的一个由 [Bun](https://bun.sh/) 驱动的高效命令行工具实现，并且提供了 AI Agent Skills 集合，用于管理和操作搭建在 Cloudflare 上的图床资源。

通过此项目，你可以在终端中快速实现图片的上传、远程文件的删除、随机图片的获取，同时它还在 `skills/` 目录下提供了标准化的 Agent Skills 描述文件，方便外部 AI Agent 直接学习并接入这些能力。

## 📦 安装与使用

确保您的环境中已安装 [Bun](https://bun.sh/) 运行时。

你可以通过以下两种方式之一来使用本项目：

### 选项 A：全局安装 (推荐)

一键全局安装，方便你在系统的任意位置直接使用 `cfib` 唤起命令：

```bash
bun install @w-xuefeng/cfib -g
```

安装成功后即可通过 `cfib -h` 查看帮助菜单。

### 选项 B：免安装立即调用 (bunx)

如果你不想进行全局安装，也可以利用 `bunx` 直接动态执行：

```bash
bunx @w-xuefeng/cfib -h
```

### 3. 环境配置

所有底层服务调用均需绑定目标图床地址和对应的凭证密钥。你可以通过创建 `.env` 文件或在每次使用命令时直接通过长参数（配合环境变量）覆盖。

**支持的全局参数（同时支持对应的环境变量）：**
- `--origin` | `IB_ORIGIN` **(必配)**：图床服务的根 URL。
- `--upload-auth-code` | `IB_UPLOAD_AUTH_CODE` **(上传/删除 必配)**：访问及调用特权的身份验证 Cookie / Header 码。
- `--upload-token` | `IB_UPLOAD_TOKEN`：上传文件专用的 Token。
- `--delete-token` | `IB_DELETE_TOKEN`：删除远端资源的 Token。
- `--trace`：自定义日志与跨服务追踪的 `Trace-Id`。
- `--lang`：请求支持的 `Accept-Language`。
- `--log` / `--runtime-path` / `--log-root`：本地日志存储的路径设定。

## 🛠 功能介绍

获取详细介绍，通过执行：
```bash
cfib -h
```

### 1. 图片上传 (`upload`)

将本地文件流式上传至服务并直接从云端返回可用地址。支持定义高级上传设置如服务器压缩状态、存储频道（例如 telegram, S3 等）。

**用法：**
```bash
cfib upload <file> [options]
```
**示例：**
```bash
cfib upload ./my-picture.png --origin "https://example.com" --upload-auth-code "xxxxxxxx"
```

### 2. 资源删除 (`remove`)

移除图床中已保存的文件，或者配合 `--folder` 直接移除指定的文件夹。

**用法：**
```bash
cfib remove <path> [options]
```
**示例：**
```bash
cfib remove "images/delete_this.png" --origin "https://example.com" --upload-auth-code "xxxxxxxx"
```

### 3. 获取随机图 (`random`)

自图床中抽取一张随机媒体。既可以返回其对应的元数据（JSON），也可以通过 `--type img` 开启流响应将二进制内容直接落盘成你指定的本地实体图片：

**用法：**
```bash
cfib random [dest] [options]
```
**示例（直接下载）：**
```bash
cfib random output.jpg --type img --origin "https://example.com"
```

## 🤖 关于 AI Agent Skills

在项目的 `skills/` 文件夹下包含了可以直接被 AI Agent（例如 Cline, OpenClaw 等工具链）解析吸收的能力配置清单（`SKILL.md`）。

该说明文档（`skills/cfib-cli/SKILL.md`）内置了完整的指令和规则说明。AI 助手在读取这些配置后便能安全、无障碍地为你执行上述所列的所有图床业务（文件上传、移除和随机获取）。

除此之外对于 AI 智能体系的自身优化，还加入了：
- **动态帮助查询**：要求 Agent 主动执行 `cfib --help` 获取最即时的各类参数说明与最新用法规范。
- **凭据集成提取**：内置提取启发，引导 AI 在缺失必须参数时，可以主动调用同生态的 `local-diamond` 配置中心（例如 `bunx lod get cfib/origin`）一键提取对应环境变量组，从而达成更高程度的自治运行。

只需让你的 Agent 引入或者加载以下核心 Skill 解析说明，即可解锁 CFIB 图床管理的全部功能：
- `skills/cfib-cli/SKILL.md`
