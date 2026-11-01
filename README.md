# Test Your Taste：测测你的科研品味

只看发表年份、标题和摘要，你能判断一项研究发表在哪里，又产生了多大的影响吗？

Test Your Taste 会抽取一篇真实论文，先藏起作者、期刊或会议名称和引用量。你需要回答两个问题：它发表在哪本期刊或哪个会议，引用量在哪个区间。

[在线玩](https://test-your-taste.zhujiangqiu.chatgpt.site/)

[了解游戏的初衷与本次更新](https://test-your-taste.zhujiangqiu.chatgpt.site/about)

## 我理解的“科研品味”

“科研品味”这个词被说得多了，听起来越来越玄乎。在我看来，它其实很朴素：**判断什么是好研究的能力。**

好的研究首先要回答一个重要问题。更有价值、更有影响力的研究，不只给出一个答案，还会创造出新的、有意思的问题，让后来者愿意沿着这条路继续探索。AI 越来越能接手执行层面的工作，但判断和选择仍然重要：我们的时间、精力和资源有限，必须决定把它们放在哪里。Uri Alon 把“选对问题”视为好科学家的关键；一篇发表于 *Nature Genetics* 的评论也强调，好奇心、冒险精神和对意外发现的开放态度，是突破性研究的重要动力。

这就是游戏的初衷：在不知道作者和发表来源的情况下，只根据年份、标题和摘要，你能否看出一个问题的重要性、叙事的力量和潜在影响？

期刊声誉和引用量只是研究质量的一些侧面，不能等同于研究质量本身。正如《莱顿宣言》强调的，定量指标应该辅助专家判断，不能替代对研究内容的评价。**这个游戏测试的是你对研究问题、叙事和潜在影响的直觉，不是在给论文质量盖棺定论。**

延伸阅读：

1. Alon, U. (2009). How to choose a good scientific problem. *Molecular Cell*, 35(6), 726–728. [DOI](https://doi.org/10.1016/j.molcel.2009.09.013)
2. Jagodic, M., et al. (2013). Nurture your scientific curiosity early in your research career. *Nature Genetics*, 45, 116–118. [DOI](https://doi.org/10.1038/ng.2527)
3. Hicks, D., et al. (2015). Bibliometrics: The Leiden Manifesto for research metrics. *Nature*, 520, 429–431. [DOI](https://doi.org/10.1038/520429a)

## 新版怎么玩

- 先选择预设学科，或输入自定义关键词。
- 看到论文后，先确认是否对它有印象；读过或不确定就自动换一篇，不计分。
- 从五个具体的期刊或会议名称中选择，并猜引用量区间，每题 1 分。
- 五个期刊或会议选项的顺序每轮都会重新打乱。
- 预设学科进入匿名基准统计，可以比较人类玩家和 AI 自测；自定义关键词只用于自由练习。

本次更新把第一题从“猜抽象档次”改成了“直接猜期刊或会议”，更接近真实的科研判断场景。更多说明见 [游戏设计](METHODOLOGY.md)。

## 一句话安装 Skill

把这句话发给 Codex：

```text
帮我从 PicaPica1024/test-your-taste 安装 testyourtaste 插件。
```

安装后，新建一个聊天并输入：

```text
@testyourtaste "生物多样性, 生态恢复"
```

让 AI 自己闭卷玩：

```text
@testyourtaste ai "生物多样性, 生态恢复"
```

输入 `@testyourtaste help` 查看帮助。Codex 若不支持 `@` 调用，可把它换成 `$testyourtaste`。

自动安装失败时，再使用终端命令：

```bash
codex plugin marketplace add PicaPica1024/test-your-taste --ref main && codex plugin add testyourtaste@test-your-taste-local
```

## 数据和隐私

- 论文与引用量来自 OpenAlex，只保留中文和英文论文。
- 正确答案保存在服务器，提交前不会公布。
- 服务只使用随机匿名编号记录答题；不收集姓名、邮箱或账号。
- 仅公开按预设学科汇总的人类与 AI 正确率，不公开个人记录。
- AI 可能在训练中见过某篇论文，因此 AI 自测结果只供参考，不是严格的“零先验”实验。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_open_aqueduct.sql
npm start
```

部署时把 `OPENALEX_API_KEY` 配置为 Secret 环境变量，不要写进代码或提交到 Git。
