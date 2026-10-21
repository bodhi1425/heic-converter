# HEIC 转 JPG / PNG

[English](README.md) · **简体中文**

在浏览器里把 iPhone 的 HEIC/HEIF 照片批量转成 JPG 或 PNG，全程不上传。适合 HEIC 文件在安卓、Windows、网站或报名表上打不开的情况。

**在线使用：** https://heic.bodhi.tools/

![HEIC 转换截图](docs/screenshot.png)

## 功能

- 支持 `.heic` 和 `.heif`，可一次选多张
- 输出 JPG（质量 0.92）方便分享，或输出无损 PNG
- 可逐张下载，也可打包成一个 ZIP 下载
- 点击"转换"时才加载解码器，页面打开更快
- 无水印、无需注册、不限次数
- 中英文界面

## 实现原理

[heic-to](https://github.com/hoppergee/heic-to) 封装了编译成 WebAssembly 的 [libheif](https://github.com/strukturag/libheif)。浏览器解码每张 HEIC 图片后重新编码为 JPG 或 PNG，多个结果由 [JSZip](https://stuk.github.io/jszip/) 打包成 ZIP。

## 隐私说明

- 照片只在你的浏览器里读取和转换，应用没有任何上传接口。
- 解码器随应用一起打包，页面只从 Google Fonts 和 Fontshare 加载字体。
- heic.bodhi.tools 上的线上版本接入了 Cloudflare Web Analytics，只统计页面访问量，不使用 Cookie。自行部署时如不需要，删除 `index.html` 和 `en/index.html` 中的 `cloudflareinsights` 脚本标签即可。

## 本地运行

需要 Node.js 20.19+（或 22.12+）和 [pnpm](https://pnpm.io)。

```bash
git clone https://github.com/bodhi1425/heic-converter.git
cd heic-converter
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # 静态文件输出到 dist/
```

`dist/` 里只有静态文件，可以部署到 Cloudflare Pages、Netlify、GitHub Pages 或任何 Web 服务器。

## 目录结构

```
index.html       中文页 (/)
en/index.html    英文页 (/en/)
src/main.ts      界面与转换逻辑
src/style.css    样式
public/          favicon、robots.txt、sitemap.xml
```

## 依赖

| 包 | 用途 | 许可证 |
|---|---|---|
| [heic-to](https://github.com/hoppergee/heic-to)（libheif） | HEIC 解码 | LGPL-3.0 |
| [JSZip](https://stuk.github.io/jszip/) | 打包下载 | MIT（MIT / GPL-3.0 双许可） |
| [Vite](https://vite.dev)、[TypeScript](https://www.typescriptlang.org) | 构建 | MIT、Apache-2.0 |

heic-to 作为未经修改的 npm 依赖、按 LGPL-3.0 使用。修改 `package.json` 后重新构建，即可替换为其他版本。

## 更多本地处理工具

以下工具都完全在浏览器中运行：

- [local-pdf-toolbox](https://github.com/bodhi1425/local-pdf-toolbox)：PDF 合并、拆分、压缩与格式转换
- [image-compressor](https://github.com/bodhi1425/image-compressor)：把图片压缩到指定 KB
- [qrcode](https://github.com/bodhi1425/qrcode)：带 logo、渐变、Wi-Fi 和名片的二维码生成器
- [ocr](https://github.com/bodhi1425/ocr)：图片转文字
- [cutout](https://github.com/bodhi1425/cutout)：用本地 AI 模型抠图去背景

## 参与贡献

欢迎提交问题反馈和 Pull Request。较大的改动请先开 issue 讨论。

## 许可证

[MIT](LICENSE) © 2026 bodhi1425
