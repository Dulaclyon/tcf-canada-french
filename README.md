# 法语通关 · TCF Canada

[公开网站](https://tcf-canada-french-dulaclyon.dulaclyon07.chatgpt.site) · [私有代码仓库](https://github.com/Dulaclyon/tcf-canada-french)

当前无需登录，首页点击「开始学习」即可进入。进度、错题和写作草稿保存在各自浏览器，不自动跨设备同步。原始PDF、音视频和课堂私人资料不在网站或代码库发布。

## 启动与构建

需要Node20+、pnpm11及Python3。

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
python3 -m http.server 4173 --directory dist --bind 127.0.0.1
```

开发预览为 `pnpm run dev`。不能直接双击HTML，因为课程通过fetch加载。托管Worker构建为 `pnpm run build:hosted`。`.openai/hosting.json`保留本项目ID；Secrets只设置在Sites运行时。

## 访问方式

默认 `AUTH_PROVIDER=none`。根路径为公开介绍页，`/app.html#home`为学习空间；无Cookie、无Google账号或ChatGPT账号均可进入。`/session`只报告公开模式，不代表已登录。Google准备代码保留但未启用，Cloud OAuth项目保留Testing状态，不对所有Google账号发布。

Google模式仅是以后可配置的可选功能，详见 `docs/google-signin.md`；当前不需要Google配置即可启动或使用。不把登录等同于云同步。

## 产品与内容

20个基础语法单元、20篇原创文章、200道基础练习、90道原创口语题、60道原创写作题。语法、文章、练习共享稳定ID并关联本机PDF文件/页码/节点。学习页支持错题、收藏、单题练习、口语计时和自评、写作编辑/计词/自动保存/历史、版本化备份导入导出。

重点覆盖基础、口语、写作；TCF Canada还包含听力和阅读，本应用不覆盖完整考试。教学内容全部待真实教师人工复核，教师审核数为0。没有AI批改、实时智能对话、语音识别或官方评分预测。

## 部署

GitHub Actions自动校验构建。私有仓库Pages受当前套餐限制，`PAGES_ENABLED=true`且套餐支持时才运行Pages发布；仓库保持私有。生产站点由Sites托管，网站访问权限与仓库权限独立。

hash路由与相对静态资源支持子路径。PWA并不代表已在应用商店发布；真机安装、完整离线升级尚未全部验证。清理浏览器数据前，请在学习档案导出备份。

## 文档

- `docs/architecture.md`：架构和模型
- `docs/material-audit.md`：原资料审计、重复、缺失与纠错
- `docs/content-review.md`：内容复查
- `docs/sources.md`：官方要求与FreeTCF研究限制
- `docs/verification.md`：三轮测试及已知限制
- `docs/design-density.md`：页面简化与交互回归
- `docs/google-signin.md`：暂未启用的Google接入准备
- `docs/public-access.md`：当前免登录模式验证
