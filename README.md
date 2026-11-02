# 法语通关 · TCF Canada

网站：[公开介绍页与登录入口](https://tcf-canada-french-dulaclyon.dulaclyon07.chatgpt.site) · [GitHub私有仓库](https://github.com/Dulaclyon/tcf-canada-french)。介绍页公开，学习空间通过真实ChatGPT登录进入，允许其他用户登录使用。GitHub Pages因当前套餐不支持私有仓库而未启用。

面向中文母语学习者的响应式法语学习 Web App。基础语法 → 原创文章 → 即时练习 → 错题复习 → 口语与写作迁移。重点建设基础、口语和写作；TCF Canada 还包括听力与阅读，本产品不覆盖全部考试。

## 启动与构建

需要 Python 3（预览）与 Node.js 20+（校验与打包），无需 npm install。

```sh
npm test
npm run build
python3 -m http.server 4173 --directory dist --bind 127.0.0.1
```

打开 http://127.0.0.1:4173 。开发时 `npm run dev`。不能直接双击 HTML，因为内容通过 fetch 加载。

## 使用

首页进入下一课程。语法页关联文章与练习；提交答案后查看解释，错误作答进入复习。口语按任务选题、计时并保存自评；写作按任务编辑、统计字数、自动保存并保留历史。数据页导出 JSON 备份；导入仅接受本应用版本化格式。

学习记录只保存在当前浏览器与站点，不会跨设备自动同步。清除浏览器数据、换浏览器或换域名不会保留记录，请先导出备份。ChatGPT登录只用于访问，不提供账号云同步；没有实时 AI、发音分析或官方自动评分。开放表达应参考范例自评；本地检查不能判断所有合理法语表达。

## 部署

`.github/workflows/pages.yml` 在 main 推送时校验、构建与部署。仓库 Settings → Pages → Source 选择 GitHub Actions，并在 Actions repository variables 添加 `PAGES_ENABLED=true`。默认仅自动校验与构建，部署步骤按套餐限制跳过，避免已知必然失败的发布。私有仓库 Pages 需要符合 GitHub 套餐条件；不会自动将仓库改公开。网址与仓库权限不同，Pages 可能公开访问。

全部资源使用相对 URL，hash 路由支持仓库子路径与刷新，manifest scope/start_url 使用 `./`。PWA 需要 HTTPS 或 localhost；浏览器安装能力不同。未发布 App Store 或 Google Play。服务工作线程版本变化触发新缓存，内容更新后刷新应用。

Sites 使用公开Hero入口与服务端验证ChatGPT身份的学习空间；Sites 内部源仓库不等于用户 GitHub 仓库。不得混淆二者交付状态。

## 内容与隐私

`src/data/courses.json` 是课程、文章与习题的共同数据源；`src/data/exam.json` 保存核实要求、来源与原创考试练习。原始 PDF、图片、音视频均不在代码库或 dist。仅记录文件名、页码、概念节点以供本机追溯，不提供下载。

内容由模型整理与原创，未经过独立法语教师人工审核。自动检查不是语言质量认证。考试要求以 France Éducation international 的最新说明为准。

详细资料审计、来源、架构和测试报告见 docs。


## Hero 与真实登录

Hosted构建：`npm run build:hosted`。根路径公开展示Hero，`/app.html`由Worker检查平台注入的已验证用户ID，匿名访问重定向到平台`/signin-with-chatgpt`；不自建密码数据库，不处理OAuth回调，不在客户端伪造登录状态。`/signout-with-chatgpt`由平台处理。

`worker/handler.mjs`是源处理器，构建把静态学习资源嵌入单个Worker ESM；`.openai/hosting.json`保留Site ID且不再声明static。身份相关HTML不走共享缓存。学习数据仍为浏览器本地档案，退出登录不会删除该浏览器中的记录；共用设备请导出备份并清除网站数据。

GitHub Pages仅能托管静态文件，不提供服务端身份检查。需要真正登录入口时使用已部署Sites网址，不能把静态HTML访问等同于已认证。
