---
name: testyourtaste
description: Turn comma-separated research keywords into a Test Your Taste round using a real Chinese- or English-language paper. Use when the user invokes @testyourtaste or $testyourtaste with quoted keywords, asks to play Test Your Taste by keyword, or wants a paper guessing game that shows the year, title, abstract, journal choices, and citation-range choices. Requires the public Test Your Taste website in a browser that supports website tools; do not use it for ordinary literature searches or paper recommendations.
---

# Test Your Taste

Run the published game at:

https://test-your-taste.zhujiangqiu.chatgpt.site/

The website is the source of truth for the paper, choices, answers, citation count, and score. Never invent, complete, translate, or replace game data.

## Show help

Check for help before parsing keywords or opening the website. If the trimmed text after `@testyourtaste` or `$testyourtaste` is `help`, `--help`, or `帮助`, return the following guide and stop:

```text
Test Your Taste 使用方法

开始一局：
@testyourtaste "关键词A, 关键词B, 关键词C"

示例：
@testyourtaste "湖泊生态, 水生植物, 恢复"
@testyourtaste "machine learning, protein structure"

游戏会输出：
1. 论文年代、标题和摘要
2. 六个期刊选项
3. 五个引用量区间选项

答题格式：
回复两个选项字母，例如：B, D
第一个字母回答期刊，第二个字母回答引用量。

检索范围：
只使用中文或英文论文。关键词可用中文逗号、英文逗号或分号分隔。

Codex 兼容写法：
$testyourtaste "关键词A, 关键词B, 关键词C"
```

Do not access the game website, retrieve a paper, or start a round for a help request.

## Parse the invocation

1. Read the text after `@testyourtaste` or `$testyourtaste`. Remove one matching pair of surrounding straight or curly quotation marks.
2. Split on commas, Chinese commas, semicolons, or Chinese semicolons. Trim each term, discard empty terms, and remove case-insensitive duplicates while keeping the original order.
3. Join the remaining terms with one space. This is the single keyword query sent to the game. Keep the query between 2 and 120 characters; if it is longer, keep complete terms from the left that fit and tell the user which terms are being used.
4. If no usable keyword remains, ask for one or more comma-separated keywords and stop.

Example: `@testyourtaste "湖泊生态, macrophyte, restoration"` becomes the query `湖泊生态 macrophyte restoration`.

## Start a round

1. Open or reuse the top-level public site in the built-in browser. Keep it open because its website tools are available only while the page remains open.
2. Call `start_research_taste_game` with `keyword` set to the normalized query. Do not pass `disciplineSlug` when a keyword was supplied.
3. Wait for the visible page to show one paper, its abstract, six journal choices, and five citation ranges.
4. Read the year, title, abstract, and journal choices exactly from the visible page. The game already excludes languages other than Chinese and English.
5. Present the round in the exact structure below. Preserve the journal order shown by the site. Do not reveal, imply, or highlight either correct answer.

```text
年代：<year>
标题：<title>
摘要：<abstract>

问题 1：这篇论文发表在哪本期刊？
A. <journal 1>
B. <journal 2>
C. <journal 3>
D. <journal 4>
E. <journal 5>
F. <journal 6>

问题 2：这篇论文被引用了多少次？
A. 0–25
B. 26–100
C. 101–300
D. 301–1000
E. >1000

请按“期刊字母 + 引用量字母”作答，例如：B, D。
```

## Accept and submit a guess

Accept letters or displayed values. Map journal letters to the current page's six choices and citation letters as follows:

- A → `0-25`
- B → `26-100`
- C → `101-300`
- D → `301-1000`
- E → `1001+`

Normalize harmless typography differences such as an en dash, but never substitute a different choice. If either answer is missing or ambiguous, ask only for the missing choice.

Call `submit_taste_guess` with:

- `journal`: the selected journal name exactly as displayed;
- `citationRange`: one of `0-25`, `26-100`, `101-300`, `301-1000`, or `1001+`.

Report the website's verified correct journal, exact citation count, result for each question, and updated score. Do not calculate correctness independently.

## Continue or stop

After revealing the result, ask whether the user wants another paper with the same keywords, new keywords, or to stop. Preserve the visible session score while continuing.

## Recovery

- If website tools are unavailable, open the public game link and explain that direct in-chat play needs a supported built-in browser with website tools. Do not claim that a tool call succeeded when it did not.
- If retrieval returns no suitable paper, retry once with the same normalized query. If it still fails, ask the user to broaden or reduce the keyword list; do not add a failed round to the score.
- If the current interface cannot use website tools, provide the public game link so the user can play manually.

## Invocation examples

- `@testyourtaste help`
- `@testyourtaste "湖泊生态, 水生植物, 恢复"`
- `@testyourtaste "machine learning, protein structure"`
- In Codex, use `$testyourtaste "climate change, biodiversity"` if `@` mentions are unavailable.
