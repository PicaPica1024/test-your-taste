# Test Your Taste：测测你的科研品味

只看标题和摘要，你能猜出论文发表在哪本期刊，有多大的影响力吗？

**Test Your Taste** 会找来一篇真实论文，把答案藏起来，让你猜期刊和引用量。规则很简单，但猜起来可能比想象中难。

[在线玩游戏](https://test-your-taste.zhujiangqiu.chatgpt.site/)

## 它能做什么

- 按学科或自定义关键词找论文。
- 只使用 OpenAlex 中的中文或英文论文。
- 让你猜期刊和引用量区间。
- 公布答案，并在浏览器里记录得分。

不需要注册账号，也不需要数据库。

## 一行提示词安装技能

把下面这一整句话复制给 Codex：

```text
帮我从 PicaPica1024/test-your-taste 安装 testyourtaste 插件。
```

Codex 会自动识别仓库中的插件；如果请求执行终端命令的权限，点击允许即可。安装后新建一个任务，然后输入：

```text
$testyourtaste "你感兴趣的关键词" 例如 $testyourtaste "biodiversity"
```

输入 `$testyourtaste help` 可以查看帮助。在支持插件 `@` 调用的 ChatGPT 界面中，改用 `@testyourtaste`。

如果自动安装没有成功，可以直接在终端运行这一行：

```bash
codex plugin marketplace add PicaPica1024/test-your-taste --ref main && codex plugin add testyourtaste@test-your-taste-local
```

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run dev
```

正式部署时，把 `OPENALEX_API_KEY` 配置为 Secret 环境变量，不要把密钥提交到 Git。

```bash
npm run build
npm start
```

## 补充说明

- 引用量来自 OpenAlex，之后可能会变化。
- 期刊干扰项是为了游戏体验人工整理的，不代表官方排名。
- 得分和已看过的论文只保存在当前浏览器。
- 这是一个轻量小游戏，不是严格的防作弊系统。
