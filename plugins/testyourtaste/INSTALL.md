# Install and use Test Your Taste

## Try it from this repository

1. Open this repository in the ChatGPT desktop app or Codex.
2. Restart the app so it discovers `.agents/plugins/marketplace.json`.
3. Open **Plugins**, select **Test Your Taste Local**, open **Test Your Taste**, and choose **Install**.
4. Start a new chat.
5. In ChatGPT or Work, enter one line such as:

   `@testyourtaste "湖泊生态, 水生植物, 恢复"`

   The skill returns the paper's year, title, abstract, six journal choices, and five citation-range choices. It does not reveal the answers until the user guesses.

   To display the complete usage guide:

   `@testyourtaste help`

   In Codex, use `$` if `@` mentions are unavailable:

   `$testyourtaste "湖泊生态, 水生植物, 恢复"`

The direct-play workflow requires the ChatGPT desktop built-in browser and website tools. If those are unavailable, the skill links to the public game for manual play.

## Share it from GitHub

Another Codex user can add the public marketplace and install the plugin with:

```bash
codex plugin marketplace add PicaPica1024/test-your-taste --ref main
codex plugin add testyourtaste@test-your-taste-local
```

They then start a new session and invoke:

```text
$testyourtaste "keyword a, keyword b"
```

ChatGPT desktop users can select **Test Your Taste Local** in the Plugins Directory, install **Test Your Taste**, start a new chat, and invoke `@testyourtaste "keyword a, keyword b"`.
