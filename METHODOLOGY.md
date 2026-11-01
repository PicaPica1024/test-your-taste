# Test Your Taste 方法说明

这份文档说明游戏怎样分档、抽样和统计，方便复核规则。它不是期刊评价声明，也不应被用来评价单篇论文或研究者。

## 一、发表档次

### 第一档：综合顶刊 / 旗舰子刊

这一档使用**精确名称白名单**，不会因为期刊名里出现 `Nature`、`Science` 或 `Cell` 就自动进入第一档。

项目当前纳入：

- 正刊：Nature、Science、Cell。
- 通用旗舰：Nature Communications、Science Advances。
- 指定 Nature 子刊：Nature Medicine、Nature Genetics、Nature Biotechnology、Nature Methods、Nature Neuroscience、Nature Immunology、Nature Cell Biology、Nature Ecology & Evolution、Nature Climate Change、Nature Physics、Nature Chemistry、Nature Materials、Nature Machine Intelligence、Nature Plants、Nature Human Behaviour。
- 指定 Science 子刊：Science Translational Medicine、Science Robotics、Science Immunology。
- 指定 Cell 子刊：Cancer Cell、Cell Metabolism、Cell Stem Cell、Molecular Cell、Neuron、Immunity、Cell Host & Microbe。
- 医学综合顶刊：The New England Journal of Medicine、The Lancet、JAMA、The BMJ。
- 计算机顶会：NeurIPS、ICML、ICLR、CVPR、ICCV、ECCV、ACL、EMNLP、AAAI、IJCAI、SIGCOMM、SOSP、OSDI、NSDI、IEEE S&P、ACM CCS、KDD、SIGMOD、VLDB、STOC、FOCS、SIGGRAPH 等配置中列明的最高级别会议。

Nature Communications 和 Science Advances 明确属于第一档。Scientific Reports 和 Cell Reports 明确不属于第一档。

### 第二至第五档

- **领域顶刊**：按学科维护的专业顶刊名单。
- **普通 JCR 一区**：不属于第一、第二档的 Q1 期刊。
- **JCR 二区**：Q2 期刊。
- **其他**：Q3、Q4 或暂未进入项目映射的同行评议来源。

当前分区是项目维护的静态映射，用于游戏抽样，不是 Clarivate 的实时官方数据。JCR 分区可能随年份和类别改变；更新映射时应记录 JCR 年份、类别和来源。具体配置位于 `config/venueTiers.ts` 与 `config/journalPools.ts`。

## 二、论文筛选

论文通过 OpenAlex 获取，并满足以下条件：

- 语言为中文或英文；
- 有标题和足够长的摘要；
- 论文类型为研究论文或综述；
- 发表年份为 1990 年以后，且至少距今十年；
- 预设学科模式下与对应 OpenAlex 主题相关；
- 自定义关键词模式下，关键词必须在标题或摘要中得到可见匹配；
- 摘要中不能直接泄露发表来源名称；
- 同一浏览器近期看过的论文不会立即重复。

计算机会议论文只在计算机学科的第一档中接受。其他档次默认使用期刊来源。

## 三、五轮平衡抽样

每组包含五个有效回合，对应五个档次各一次。系统先把五档随机打乱，再依次抽取。只有提交答案的回合才会消耗当前档次；如果用户表示读过论文或不确定，系统记录为跳过，并从**同一档次**重新抽取，因此不会破坏五轮平衡。

引用量不是五等分抽样。当前检索权重为：0–25 次占 25%，26–100 次占 30%，101–1000 次占 30%，大于 1000 次占 15%。如果首选区间没有合格论文，会按随机顺序尝试其他区间。

## 四、计分与匿名基准

每轮两题，每题 1 分：

- 发表档次是否正确；
- 引用量区间是否正确。

预设学科的有效答案进入匿名汇总，自定义关键词不进入基准。网页直接作答和 Skill 代用户提交都标记为 `human`；只有显式使用 `@testyourtaste ai`，由模型自己根据论文内容判断时才标记为 `ai`。界面不提供“人类 / AI”选择，以免误选。

AI 自测被要求不搜索论文，但无法证明模型训练时从未见过该论文。因此，人类与 AI 的正确率比较属于探索性结果，不应被解释为严格受控的认知实验。

## 五、答案隔离和隐私

正确期刊、档次与引用量存放在服务器端数据库中。浏览器在提交答案前只收到随机回合编号、年份、标题和摘要；提交后服务器才返回答案。

系统记录随机匿名参与者编号、阶段分组、答题选项、正误、是否因熟悉而跳过，以及人类或 AI 标记。不收集姓名、邮箱或账号，不公开个人记录。公开统计只显示预设学科下人类与 AI 的汇总样本量和正确率。

## 六、已知限制

- 期刊和会议分档包含人为判断，不能代表唯一共识。
- 静态 JCR 映射可能滞后，也可能遇到同刊不同类别分区不一致。
- OpenAlex 的来源类型、摘要和引用量可能缺失或更新。
- 关键词练习的候选池比预设学科更松，不用于横向比较。
- 即使隐藏作者和期刊，熟悉某个研究方向的人仍可能从内容认出论文；熟悉度问题只能降低，不能完全消除这种影响。
