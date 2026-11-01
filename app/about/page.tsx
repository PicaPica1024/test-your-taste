import { disciplineGroups, disciplines } from "@/config/disciplines";
import { venueNamesForTier } from "@/config/venueTiers";
import { citationRanges, venueTiers, type VenueTierId } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于 · Test Your Taste",
  description: "了解 Test Your Taste 的游戏规则、抽样方法和逐学科期刊名录。",
};

const groupLabels: Record<(typeof disciplineGroups)[number], string> = {
  "Life Sciences": "生命科学",
  "Medicine & Health": "医学与健康",
  "Physical Sciences": "物理科学",
  "Engineering & Computer Science": "工程与计算机科学",
  "Social Sciences": "社会科学",
};

function catalogFor(poolKey: string, tier: VenueTierId) {
  return venueNamesForTier(poolKey, tier);
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-8 place-items-center border border-ink/25 font-serif">T²</span>
            <span className="font-serif text-lg font-semibold">Test Your Taste</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-accent-strong hover:underline">返回游戏</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[1160px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <section className="max-w-4xl border-b border-ink/15 pb-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-strong">About the game</p>
          <h1 className="mt-4 font-serif text-[clamp(3.2rem,8vw,7rem)] leading-[0.9] tracking-[-0.05em]">关于</h1>
          <p className="mt-8 max-w-3xl font-serif text-xl leading-9 text-ink/90 sm:text-2xl sm:leading-10">
            Test Your Taste 隐去作者和发表来源，只给出年份、标题和摘要，让玩家判断研究的发表档次与引用影响。
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-ink-muted">
            它测试的是你对研究问题、叙事和潜在影响的直觉，不是对单篇论文质量的最终裁决。期刊声誉与引用量只能提供部分线索，不能替代对研究内容本身的判断。
          </p>
        </section>

        <section className="grid gap-8 border-b border-ink/15 py-14 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">01 · 游戏流程</p>
            <h2 className="mt-3 font-serif text-3xl">一组五轮，五档各一次</h2>
          </div>
          <div className="grid gap-px bg-ink/15 sm:grid-cols-2">
            {[
              ["平衡抽样", "系统先随机打乱五个发表档次；每个有效回合消耗一档，完成五轮后重新洗牌。"],
              ["熟悉度排除", "如果玩家对论文有印象，可以换一篇同档论文；该次跳过不计分，也不消耗当前档次。"],
              ["两道问题", "每轮分别判断发表档次和引用量区间，每题 1 分。"],
              ["答案隔离", "正确来源、档次与引用量保存在服务器，提交前不会发送给浏览器或 Skill。"],
            ].map(([title, text]) => (
              <div key={title} className="bg-surface p-5 sm:p-6">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-ink/15 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">02 · 五个发表档次</p>
          <div className="mt-7 grid gap-px bg-ink/15 lg:grid-cols-5">
            {venueTiers.map((tier, index) => (
              <div key={tier.id} className="bg-surface p-5">
                <p className="font-serif text-2xl text-accent-strong">0{index + 1}</p>
                <h3 className="mt-5 font-semibold">{tier.label}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{tier.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-l-2 border-accent-strong pl-4 text-sm leading-6 text-ink-muted">
            第一档使用精确白名单；不会因为刊名包含 Nature、Science 或 Cell 就自动进入第一档。Scientific Reports 和 Cell Reports 不属于第一档，按项目维护的分区映射归类。
          </div>
        </section>

        <section className="grid gap-8 border-b border-ink/15 py-14 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">03 · 论文筛选</p>
            <h2 className="mt-3 font-serif text-3xl">只保留可判断的真实论文</h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-ink-muted">
              <li>中文或英文，有标题和足够长的摘要。</li>
              <li>研究论文或综述，发表于 1990 年以后，且至少距今十年。</li>
              <li>预设学科需匹配 OpenAlex 主题；自定义关键词需在标题或摘要中可见匹配。</li>
              <li>摘要若直接出现来源名称则排除，避免泄题。</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">04 · 引用量</p>
            <h2 className="mt-3 font-serif text-3xl">五个答案区间</h2>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-3">
              {citationRanges.map((range) => (
                <div key={range.id} className="border border-ink/15 bg-surface p-3 text-center font-semibold tabular-nums">{range.label}</div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-ink-muted">
              检索时对不同引用量设置抽样权重：0–25 占 25%，26–100 占 30%，101–1000 占 30%，大于 1000 占 15%。若首选区间没有合格论文，会尝试其他区间。
            </p>
          </div>
        </section>

        <section className="py-14" id="catalog">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">05 · 当前期刊与会议名录</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">每个学科、每个档次，实际会从哪里抽</h2>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-ink-muted">
            下列内容直接由游戏当前配置生成，因此与实际抽样保持一致。前四档展示固定候选名录；“其他”不是固定刊表，而是所有通过质量筛选、且未进入前四档的期刊来源。JCR 分区是项目维护的静态映射，会随版本更新，并非 Clarivate 的实时官方数据。
          </p>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="学科组导航">
            {disciplineGroups.map((group) => (
              <a key={group} href={`#${group.replace(/[^a-z]+/gi, "-").toLowerCase()}`} className="border border-ink/20 bg-surface px-3 py-2 text-sm font-semibold hover:border-accent-strong hover:text-accent-strong">
                {groupLabels[group]}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-14">
            {disciplineGroups.map((group) => {
              const groupDisciplines = disciplines.filter((discipline) => discipline.group === group);
              const groupId = group.replace(/[^a-z]+/gi, "-").toLowerCase();
              return (
                <section key={group} id={groupId} className="scroll-mt-24">
                  <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
                    <h3 className="font-serif text-3xl">{groupLabels[group]}</h3>
                    <span className="text-xs text-ink-muted">{groupDisciplines.length} 个预设学科</span>
                  </div>
                  <div className="space-y-3">
                    {groupDisciplines.map((discipline) => (
                      <details key={discipline.slug} className="group border border-ink/15 bg-surface open:border-ink/40">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-semibold sm:px-5">
                          <span>{discipline.name}</span>
                          <span className="text-xs font-normal text-ink-muted group-open:hidden">展开名录</span>
                          <span className="hidden text-xs font-normal text-ink-muted group-open:inline">收起</span>
                        </summary>
                        <div className="grid gap-px border-t border-ink/15 bg-ink/15 lg:grid-cols-5">
                          {venueTiers.map((tier) => {
                            const names = catalogFor(discipline.poolKey, tier.id);
                            return (
                              <div key={tier.id} className="bg-surface p-4">
                                <h4 className="text-sm font-bold text-accent-strong">{tier.label}</h4>
                                {names.length ? (
                                  <ul className="mt-3 space-y-2 text-xs leading-5 text-ink-muted">
                                    {names.map((name) => <li key={name}>{name}</li>)}
                                  </ul>
                                ) : tier.id === "other" ? (
                                  <p className="mt-3 text-xs leading-5 text-ink-muted">开放集合：未进入前四档的合格期刊来源。</p>
                                ) : (
                                  <p className="mt-3 text-xs leading-5 text-ink-muted">当前配置暂无固定候选。</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="border-t border-ink/15 py-12 text-sm leading-7 text-ink-muted">
          <h2 className="font-serif text-3xl text-ink">数据、隐私与限制</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <p>论文和引用量来自 OpenAlex，引用量会随时间变化。系统使用随机匿名编号记录作答，不收集姓名、邮箱或账号；公开结果只展示汇总正确率。</p>
            <p>分档含有人为判断，不能代表唯一学术共识。AI 也可能在训练中见过某些论文，因此人类与 AI 的比较是探索性的，不是严格的零先验实验。</p>
          </div>
          <Link href="/" className="mt-8 inline-flex border border-ink bg-ink px-5 py-3 font-semibold text-paper hover:bg-accent-strong">返回游戏</Link>
        </section>
      </article>
    </main>
  );
}
