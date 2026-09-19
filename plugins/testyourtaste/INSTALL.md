# 安装和使用 Test Your Taste

## 一行提示词安装

把下面这一整句话发给 Codex：

```text
帮我从 PicaPica1024/test-your-taste 安装 testyourtaste 插件。
```

执行过程中如果出现权限确认，点击允许。安装完成后新建一个任务。

如果自动安装没有成功，可以直接在终端运行：

```bash
codex plugin marketplace add PicaPica1024/test-your-taste --ref main && codex plugin add testyourtaste@test-your-taste-local
```

## 开始游戏

在 Codex 中输入：

```text
$testyourtaste "湖泊生态, 水生植物, 恢复"
```

查看完整帮助：

```text
$testyourtaste help
```

在支持插件 `@` 调用的 ChatGPT 界面中，使用：

```text
@testyourtaste "湖泊生态, 水生植物, 恢复"
```

这个技能会输出论文年代、标题、摘要、六个期刊选项和五个引用量区间；用户作答后才公布答案。

直接在聊天中游玩需要支持网站工具的内置浏览器。如果当前界面不支持，这个技能会提供公开游戏链接。
