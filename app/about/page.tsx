import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于 · Test Your Taste",
  description: "了解 Test Your Taste 的初衷、目的与本次更新。",
};

const updates = [
  ["更像真实判断", "第一题不再展示抽象档次，而是给出五个具体的期刊或会议名称。"],
  ["每轮重新排布", "五个备选名称的展示顺序每轮都会重新打乱，避免位置形成提示。"],
  ["保留影响力判断", "第二题继续竞猜论文目前的引用量区间，提交后同时公布真实来源和引用数据。"],
  ["说明更聚焦", "“关于”页不再罗列期刊分类，只解释游戏为什么存在、希望测试什么。"],
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-8 place-items-center border border-ink/25 font-serif">T²</span>
            <span className="font-serif text-lg font-semibold">Test Your Taste</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-accent-strong hover:underline">返回游戏</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[1080px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <section className="max-w-4xl border-b border-ink/15 pb-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-strong">About the game</p>
          <h1 className="mt-4 font-serif text-[clamp(3.2rem,8vw,7rem)] leading-[0.9] tracking-[-0.05em]">关于</h1>
          <p className="mt-8 max-w-3xl font-serif text-xl leading-9 text-ink/90 sm:text-2xl sm:leading-10">
            科研品味，说到底，是判断什么是好研究的能力。
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-ink-muted">
            有价值的研究会回答重要问题；有影响力的研究不仅给出答案，还会带来更多值得继续追问的问题，让后来者沿着新的方向探索。Test Your Taste 想把这种难以言明的判断，变成一次可以反复练习的小游戏。
          </p>
        </section>

        <section className="grid gap-8 border-b border-ink/15 py-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">01 · 游戏初衷</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight">先看研究本身，再揭晓它来自哪里</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-ink-muted">
            <p>游戏会暂时隐去作者和发表来源，只保留发表年份、标题与摘要。你需要先根据研究问题、论证方式和潜在影响作出判断，再查看真实答案。</p>
            <p>这样做不是为了给论文排座次，而是让玩家观察自己的判断依据：我们究竟能否从内容中识别重要问题、扎实工作和可能产生长远影响的研究？</p>
          </div>
        </section>

        <section className="border-b border-ink/15 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">02 · 本次更新</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">从猜抽象档次，改为直接猜期刊或会议</h2>
          <div className="mt-8 grid gap-px bg-ink/15 sm:grid-cols-2">
            {updates.map(([title, copy]) => (
              <div key={title} className="bg-surface p-5 sm:p-6">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-14 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">03 · 想测试什么</p>
            <h2 className="mt-3 font-serif text-3xl">研究内容的判断力</h2>
            <p className="mt-5 text-sm leading-7 text-ink-muted">题目希望测试你对研究问题的重要性、故事的完整性、方法与结论之间的匹配，以及工作可能打开哪些新问题的直觉。</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">04 · 不想替代什么</p>
            <h2 className="mt-3 font-serif text-3xl">同行评议与专业评价</h2>
            <p className="mt-5 text-sm leading-7 text-ink-muted">期刊声誉和引用量只是研究影响的部分侧面，不能等同于研究质量。游戏成绩适合用来反思自己的判断习惯，不适合用来评价某篇论文、某个研究者或某个学科。</p>
          </div>
        </section>

        <Link href="/" className="mb-14 inline-flex border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-accent-strong">开始游戏</Link>
      </article>
    </main>
  );
}
