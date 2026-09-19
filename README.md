# Test Your Taste

[中文说明](README.zh-CN.md)

Think you can guess a paper's journal from its title and abstract? What about its citation range?

**Test Your Taste** gives you a real research paper, hides the answer, and asks you to make both guesses. It is quick, slightly nerdy, and surprisingly hard.

[Play the live game](https://test-your-taste.zhujiangqiu.chatgpt.site/)

## What it does

- Search by research field or your own keywords.
- Show a real Chinese- or English-language paper from OpenAlex.
- Ask you to guess the journal and citation range.
- Reveal the answer and keep score locally in your browser.

No account or database is required.

## Use it as a skill

Install the public marketplace:

```bash
codex plugin marketplace add PicaPica1024/test-your-taste --ref main
codex plugin add testyourtaste@test-your-taste-local
```

Start a new Codex task, then run:

```text
$testyourtaste "lake ecology, aquatic plants, restoration"
```

Use `$testyourtaste help` for instructions. In ChatGPT interfaces that support plugin mentions, use `@testyourtaste` instead.

## Run it locally

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

For production, add `OPENALEX_API_KEY` as a secret environment variable. Never commit the key.

```bash
npm run build
npm start
```

## A few notes

- Citation counts come from OpenAlex and may change.
- Journal alternatives are curated game choices, not official rankings.
- Scores and seen-paper history stay in the current browser.
- This is a lightweight guessing game, not an anti-cheat system.
