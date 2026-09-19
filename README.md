# Test Your Taste：测测你的科研品味

只看标题和摘要，你能猜出论文发表在哪本期刊，有多大的影响力吗？

**Test Your Taste** 会找来一篇真实论文，把答案藏起来，让你猜期刊和引用量。规则很简单，但猜起来可能比想象中难。

[在线玩游戏](https://test-your-taste.zhujiangqiu.chatgpt.site/)

## 我理解的“科研品味”

“科研品味”这个词被人用得多了，听起来越来越玄乎。对我来说，它其实很朴素：**判断什么是好研究的能力。**

好的研究，首先要回答一个重要问题。更有价值、更有影响力的研究，不只给出一个答案，还会改变我们看问题的方式，并由此打开更多有意思的问题，让后来者愿意沿着这条路继续探索。Uri Alon 在 *Molecular Cell* 的文章中把“选对问题”视为成为好科学家的关键，并强调问题能否带来显著的知识增量；*Nature Genetics* 的一篇评论也指出，对未知的好奇心、冒险精神和对意外发现的开放态度，是突破性研究的重要动力。

所以我做了这个游戏：在不知道作者和期刊名称的情况下，只看发表年份、标题和摘要，你能判断这项研究可能发表在什么层级的期刊，又可能产生多大的影响吗？

当然，期刊和引用量只是线索，不是科研质量本身。*Nature* 发表的《莱顿宣言》提醒我们：定量指标应该辅助专家判断，而不能取代对研究内容本身的评价。**这个游戏测试的是你对研究问题、叙事和潜在影响力的直觉，不是在给论文盖棺定论。**

延伸阅读：

- Uri Alon. [How To Choose a Good Scientific Problem](https://doi.org/10.1016/j.molcel.2009.09.013). *Molecular Cell* 35, 726–728 (2009).
- Maja Jagodic et al. [Nurture your scientific curiosity early in your research career](https://doi.org/10.1038/ng.2527). *Nature Genetics* 45, 116–118 (2013).
- Diana Hicks et al. [Bibliometrics: The Leiden Manifesto for research metrics](https://doi.org/10.1038/520429a). *Nature* 520, 429–431 (2015).

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
