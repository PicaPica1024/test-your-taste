import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于 · Test Your Taste",
  description: "了解 Test Your Taste 的初衷、目的与本次更新。",
};

const updates = [
  "相比第一版，第一题由猜抽象档次改为从五个具体的期刊或会议名称中选择。",
  "新版按照期刊的综合质量均匀分配论文抽取机会，再从对应范围内寻找论文。",
  "降低期刊发表数量差异带来的影响，避免游戏过度偏向高发文量期刊。",
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
          <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">相比第一版，让不同期刊获得更均衡的出现机会</h2>
          <ol className="mt-8 border-y border-ink/15">
            {updates.map((copy, index) => (
              <li key={copy} className="grid gap-3 border-b border-ink/15 py-6 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:items-start">
                <span className="font-serif text-3xl text-accent-strong">{index + 1}</span>
                <p className="text-base leading-8 text-ink-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <Link href="/" className="my-14 inline-flex border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-accent-strong">开始游戏</Link>
      </article>
    </main>
  );
}
