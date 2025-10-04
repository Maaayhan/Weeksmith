# PRD — Six-Month Transformer（英文首发 · Web/PWA）

# 0. 版本与状态

- 文档版本：v1.0（产品对齐版）
- 文档状态：**锁定**（作为设计与开发启动依据）
- 适用范围：MVP → v1.x（仅英文；Web/PWA；移动端稍后）
- 直接负责人：PM（你） / 设计 / 前端 / 后端 / QA / 法务

---

# 1. 背景与目标

## 1.1 为什么做

- 现有效率/习惯工具多停留在**任务清单、打卡或 OKR**层面，缺少**方法论级护栏**（“1+1 目标、输入优先、6/6 锁定、周复盘→85% 学习区间”）。
- Zach 高度结构化的三阶段流程，为**6 个月变革**提供清晰骨架：
    1. **清晰愿景**（理想的一天/一周→更长愿景）；
    2. **12 周执行**（仅 1 个个人 + 1 个职业目标；可控**输入型行动目标**；**前 6 周可调后 6 周锁定**；周度量化评分，目标 85%；WAM 监督）；
    3. **复盘/再规划**（12 周 3–4 小时大复盘→下一轮（中间建议休整两周））。
- **学习难度“甜蜜点”≈85% 完成率**有研究背书，可产品化为“周完成度表盘与加/减负建议”。
- 习惯形成中位数约 **66 天**，与 12 周节奏天然契合。

## 1.2 我们的定位

- 一款把**Zach 方法论**产品化的个人成长 App：**教练式流程**而非通用清单。
- **应用内 AI 周会（WAM）**：AI 给出“提案”，由用户**逐条批准/编辑**再执行；同时支持**一键导出 Markdown/CSV**到 ChatGPT 等进行外部复盘。
- **英文首发**，**Web/PWA** 优先，移动端后续再做（iOS Web Push 采用 iOS 16.4+ A2HS 路径）。

## 1.3 北极星与关键指标

- 北极星：完成一期 **12-week cycle** 后**进入下一轮**的比例。
- 关键指标：周复盘完成率、AI WAM 审批完成率、W7–W12 锁定合规率、**80–90% 目标带覆盖率**、R7/R30 留存。
- 激活：首 48 小时完成愿景草案 ≥ 70%。
- 执行：周复盘完成率 ≥ 60%；平均周得分 80–90% 覆盖率 ≥ 50%。
- 监督：WAM 出席率 ≥ 70%。
- 长期：6 个月留存 ≥ 35%；12 周后进行大复盘的比例 ≥ 60%。

---

# 2. 范围与非目标

## 2.1 MVP 范围（必须）

- **Vision**：愿景向导（每日/每周→年度/人生）；愿景—任务对齐提示。
- **Plan (12-week)**：**1 Personal + 1 Professional**、**输入型**约束；W1–W6 可调，W7–W12 锁定。
- **This Week**：两种工作流（二选一）：时间块（日历式）或优先队列（看板式）；周完成度表盘（**85% 区间**指引）。
- **AI WAM（Chatbox）**：应用内**对话式**周会，AI 扮演组员；在对话中生成**结构化提案卡**，用户审批后执行；一键导出 MD/CSV；（v1.x 可开启语音收听/播报）。
- **Retro（12周复盘）**：完成度分布、胜/败清单、输入 vs 输出洞察；生成下一轮草案。
- **通知与日历**：Web Push（A2HS/iOS 16.4+）；Google Calendar 事件创建与（v1.x）可选 **events.watch** 同步。
- **安全/合规**：RLS、最小化收集、导出/删号、ASVS/WCAG 验收。

## 2.2 非目标（MVP 不做）

- 群组式真人 WAM（后续再议）；
- 企业/团队 OKR 套件；
- 自动 AI 排程（Motion 类）；
- 原生 iOS/Android 客户端（后续 v1.x）。

---

# 3. 用户与场景

## 3.1 目标用户

- 面向所有人（英文市场优先）：创作者、独立开发者、自学者、健身/习惯建立者、职业转型者等。
- 希望系统化提升（职业/健康/创作/学习）的个体；重视可度量执行、需要外部监督与节奏感。

## 3.2 关键场景

1. 新用户 30–40 分钟完成**愿景**草案。
2. 24 小时内产出**12 周计划**（1+1 目标，输入项）。
3. **每周 30–45 分钟 AI WAM（Chat）**：AI 热身→你先说→AI 摘要事实→共同诊断→提案卡（Approve/Edit/Reject）→执行→导出纪要。
4. 12 周末**复盘** + 生成**下一轮**草案。

---

# 4. 详细功能需求（FRD）

## 4.1 Vision（愿景）

- **V-1** 愿景编辑：Daily / Weekly / Year / Life 四级；提供引导问题。模板化问题引导（“理想的一天/一周如何安排？”等），分四页填写与预览；支持逐年滚动修订。
- **V-2** 愿景板：把“每日/每周愿景”可视化成时间块（可视化）与标签（价值观/领域）。
- **V-3** 对齐检测：计划/任务若与愿景标签不一致，显示“未对齐”提示。

> 依据：Zach 强调先写理想的一天/一周，再回推行动。
> 

## 4.2 Plan（12-week 计划器）

- **P-1** 仅允许设置 **1 Personal + 1 Professional**。
- **P-2** **输入型**约束：目标被拆成**周级“输入项”**（完全可控的行动，如“写 6 个视频脚本/读 2 本书/预约旅行”等）；阻止“结果 KPI”（如粉丝/营收）；AI 提供**改写建议**（If-Then/实施意图），用户**手动确认**。支持周一键复制到“周视图”。
- **P-3** W1–W6 可调（动作频次/时长）；W7–W12 锁定（不可变更）。
- **P-4** AI 生成器：根据愿景生成**周配额草案**（12 周网格）；用户逐周确认或批量确认。

> 依据：Zach 的“输入优先、首次外不可改、6/6 锁定”。
> 

## 4.3 This Week（本周执行）

- **W-1** 工作流二选一（周初任选其一生成周计划）：
    
    A) **Time-blocking**（日历式时间块）；
    
    B) **Priority Queue**（看板式优先队列）。
    
- **W-2** 完成度表盘：自动计算完成率（完成项/计划项×100%），**85%±5%** 区域高亮；提示“太低→拆小/降频；太高→加码”。([Nature](https://www.nature.com/articles/s41467-019-12552-4.pdf?utm_source=chatgpt.com))
- **W-3** 快速备注与障碍分类（时间/精力/环境/技能）。
- **W-4** 锁定提示：W7–W12 对配额编辑控件置灰并说明原因。

## 4.4 AI WAM（应用内 AI 周会 · 可执行）

**A-1 触发与入口**

- 自动：周末固定时段；手动：随时点击 **Start WAM** 或命令 **/wam**。
- 进入后展示**会前摘要卡**（完成率、与 85% 区间的偏差、上周例外、锁定状态）。Zach 的 12 周 + 锁定规则同时展示。

**A-2 角色与语气（AI 伙伴 Persona）**

- 同辈、支持型、温和挑战；遵循**动机式访谈**要素（开放提问、反映、总结），避免权威口吻。
- 解释型透明：声明“我是 AI 伙伴（非医疗/心理诊断）”。
- **社会线索**：称呼你名字、复述上周承诺、下周追问，增强“被看见感”（符合 CASA：人会对带社交线索的技术做社交反应）。

**A-3 会话编排（轮次）**

1. 热身 2–3 轮（情绪/能量条）。
2. 你先说（开放问句）→ AI 再呈现事实卡（本周完成率、趋势、85% 偏差）。
3. 共同诊断：把数字与描述合并为**问题列表**（如“粒度过大/过多上下文切换”）。
4. 生成**提案卡**：仅“输入型”动作（增/减频次、拆分/合并、carry-over、优先级），**锁定期**仅允许执行层安排，禁止改配额。
5. **Approve/Edit/Reject**：在消息内完成审批；编辑时进行 Schema 校验与锁定检查。
6. **执行**：通过的变更由后端工具执行（幂等+审计）；失败项可重试或回滚。

> 轮次/“不抢话”规则参考多方对话 turn-taking 的最新研究：AI 仅在关键节点发言，优先倾听与请求确认。
> 

**A-4 结构化提案卡（消息内嵌）**

```json
{
  "type": "adjust_quota|split_task|merge_tasks|carry_over|prioritize",
  "week": 5,
  "item_id": "uuid",
  "op": "increase|decrease|replace",
  "payload": {"unit":"sessions","from":4,"to":3},
  "rationale": "string",
  "constraints": {"locked": false, "input_only": true}
}

```

- 若模型提出**输出/KPI**类内容（如“+500 followers”），UI 直接**标红并引导改写为输入型**（If-Then 实施意图），用户确认后方可提交。
- **锁定期（W7–W12）**：后端强校验，出现“配额修改”即被拒并在对话中解释。

**A-5 执行与审计（HITL）**

- 后端仅暴露**受控工具函数**：`update_weekly_quota(W1–W6) / carry_over / create_next_week / prioritize / patch_calendar_event(v1.x)`；写库/改日历前均需**用户已批准**的令牌。
- 全链路**审计日志**：提案→审批→执行（谁/何时/前后值/理由），满足可回溯与合规。

**A-6 导出与延伸**

- 一键导出 **Markdown/CSV**（对话纪要 + 承诺清单 + 改动 diff），方便粘到 ChatGPT 等继续复盘。
- 后续可开启**多代理座谈**（鼓励者/质询者/记录员）试验，但 MVP 先单 AI 组员；研究表明单智能体在强提示下可与多代理持平或接近，避免复杂度过早上升。

**A-7 目标带与引导**

- 完成率目标区间 **≈85%**（最佳学习区）可视化；<80% 建议减负拆小，>90% 建议适度加码。

**A-8 合规与体验提示**

- 语气友好、无评判；避免医疗/心理暗示；出现危机表述时给出寻求专业帮助的提示（非诊断）。
- 尊重隐私与最小化：仅使用当周必要数据参与会话。

> 依据：Zach 的 WAM/mastermind 强调“每周责任伙伴”；iOS Web Push（A2HS）用于到点提醒；Web Speech API 为语音扩展提供标准化浏览器支持；CASA 与 CA 系统综述支持“对话式/社交型”路径在行为改变中的可行性；多方对话 turn-taking 研究指导 AI 何时说话更稳。(Zach Highley)
> 

## 4.5 Retro（12 周复盘）

- **R-1** 图表：12 周完成度分布、85% 命中率、失败模式、胜利清单。
- 启动一个**3–4 小时**会议模板（可选户外/自然主题背景），引导：回顾 12 周百分比分布、失败类目、胜利清单、输入 vs 输出反思
- **R-2** 输入 vs 输出洞察（输出仅作回顾，不作为配额）。
- **R-3** 一键生成下一轮草案（复制 + 调参），并推荐**2 周休整模式**。
- **休整模式：**“轻量跟踪 + 无配额”的休整视图，支持“阅读/散步/旅行”等低强度建议。
- **R-4** 复盘纪要导出（MD/CSV）。

## 4.6 通知与日历

- **N-1** Web Push（PWA/iOS 16.4+ A2HS）：周日“生成下周计划”、WAM 前提醒、周末评分提醒；可在设置中调整频率/静默时段。
- **N-2** 日历：创建周期性“WAM（AI）/周回顾”事件；v1.x 接入 Google Calendar **push/watch** 同步更改。

---

# 5. 非功能需求（NFR）

## 5.1 性能

**SLO（面向用户体验）**

- **聊天首响应（首 token）** ≤ **2.5s**；
- **完整提案生成** ≤ **8s**（**命中缓存** ≤ **3s**）；
- **提案提交后落库回执** ≤ **1.0s**（不含第三方日历）。

> 采用结构化输出 + 函数调用以稳定响应结构，便于前端并行渲染“对话/事实卡/提案卡”。
> 

**失败与降级策略（逐级回退）**

1. **超时 > 8s**：展示**“摘要先行”**（只读洞察 + 上周事实卡），并提示“提案稍后补齐”；后台继续生成并以消息补发。
2. **模型 4xx/5xx 或 429 限流**：指数退避**最多重试 2 次**；仍失败 → 将该轮标记为**“待提案”**，下次进入 WAM 自动续跑。
3. **工具执行失败**：单项**幂等重试 2 次**；若失败 → 打上“需人工处理”标签并保留可回滚参数。
4. **Calendar 同步失败**：不阻断本地落库；在会后纪要中标注“外部同步未完成”。

> 降级以**“对话不中断、数据不丢失”为原则；结构化输出/函数调用天然支持失败后局部重试**。
> 

**成本守护（配额与缓存）**

- **每次 WAM**最多触发**2 次完整生成**；之后仅允**增量生成（diff-only）**。
- 对“会前摘要卡/事实栏”启用**请求级缓存（5–15 分钟）**；对静态系统提示启用**提示缓存**。
- 限制“消息上下文注入体积”≤ **8k tokens**（只注入本周必要字段 + 3–4 周滚动统计）。

> 通过结构化输出与最小化上下文减少 token 成本并降低延迟。
> 

**后台队列与重试（MVP 可选，建议启用）**

- 使用 **Upstash QStash** 触发异步重算/补发（如 WAM “摘要先行”后的提案补齐、导出失败重试），HTTP 语义、签名校验、按任务去重/延迟执行；替代自建队列，便于 Vercel/边缘环境部署。

## 5.2 可用性与可访问性

- **WCAG 2.2 AA**：键盘可达、焦点环、对比度合规、`prefers-reduced-motion` 降级。
- 组件基于 Radix/shadcn（ARIA/焦点管理）。

## 5.3 安全与合规

- **RLS**：所有暴露表默认启用，按 `user_id`/`team_id` 授权。
- **ASVS v4.0.3 Level 2** 作为验收清单（认证、会话、访问控制、审计日志、加密等）。
- **隐私**：澳大利亚 **APPs**、GDPR/UK-GDPR 原则（目的限定、数据最小化、存储限制、可移植/删除）。
- **导出/删除**：设置页提供自助数据导出（JSON/CSV）与删除账户。

## **5.4 可观测性（OpenTelemetry）**

- **Trace & Metrics**：按 Next.js 指南新增 `instrumentation.ts`，对 Server Actions、Route Handlers、外部调用（OpenAI、Supabase、Calendar）打 **span**；聚合到 OpenTelemetry Collector 或托管后端。
- **日志关联**：把 `correlation_id` 注入 span attributes，并与 `audit_log.correlation_id` 关联，方便跨层排错。
- **采样策略**：开发 100%，预发 20%，生产 5% 基线（错误强制采样）。

## **5.5 AI 结构化输出与安全**

- **结构化输出**：WAM 只接受模型的 **结构化 JSON**（Insights/Proposals Schema），由后端做 **JSON Schema/Zod** 双重校验再入库/执行；遵循官方“Function/Tool Calling + Structured Outputs”模式。
- **最小上下文**：注入“当周必要字段 + 3–4 周滚动统计”，控制上下文 < 8k tokens（已在 5.1 约束）。
- **失败策略**：模型错误/超时走“摘要先行”并落队列补偿（见 5.1、Upstash QStash）。

---

# 6. 信息架构与导航

- 顶栏/侧栏：**Vision · Plan (12-week) · This Week · AI WAM · Retro · Settings**
- **AI WAM（Chat）**：左侧消息流；右侧**事实栏**（完成率/趋势/例外/锁定状态），下方显示**提案卡执行结果**与**导出**。
- 移动自适应：底部 4–5 Tabs（Web 响应式）

---

# 7. 关键页面——交互细节与验收标准

## 7.1 Vision

- 引导问题（Daily/Weekly）→ 用户回答 → 实时预览愿景板。
- 验收：保存/撤销、标签多选、对齐检测在 Plan/This Week 顶部以“chip”提示。

## 7.2 Plan (12-week)

- 左侧选择 **Personal/Professional**；右侧 12×周网格（周配额：unit + qty）。
- **输入约束**：一旦检测到结果型陈述（如“+500 followers”）→ 弹窗引导“改写为输入动作（If-Then）”，附示例。
- **锁定**：到 W7 自动置灰并显示“Locked by design（Zach）”。
- 验收：
    - 若设置超过 2 个目标→ 阻止提交（给出“仅 1+1”说明与 Zach 依据）。
    - W7–W12 任何修改请求 → 后端 403 + 解释。

## 7.3 This Week

- 首次进入选择工作流（时间块/优先队列），本周内可切换**视图**但不改变**周配额**。
- 表盘高亮 80–90%；低于 80%/高于 90% 显示“减负/加码”卡片（仅建议，非强制）。
- 验收：完成记录（勾选/数值录入），备注分类（阻碍类型）。

## 7.4 AI WAM

- **上部**：完成率、趋势、风险标签；
- **中部**：AI Insights（只读）+ Proposals（带 Diff）
- **底部**：批量批准按钮 + 导出（MD/CSV）
- 审批后弹出执行结果（成功/失败/部分失败+重试）。
- 验收：
    - 锁定期提案一律不包含“配额修改”；若包含 → 红色警示并不可提交。
    - 每条提案都能 **Approve/Edit/Reject**；编辑时需再次 Schema 校验。

## 7.5 Retro（12-week）

- 图表（条形/折线/词云）+ 总结问答。
- “生成下一轮” → 复制结构 + 轻量调参（仍遵守“1+1 / 输入型 / 6/6 锁定”）。
- 默认弹出“2 周休整模式”开关（轻跟踪）。

## 7.6 UX 启发式验收（Nielsen–Molich 10 条 · 验收清单）

> 目标：在每个关键页面（Vision / Plan / This Week / AI WAM / Retro）上线前，完成启发式走查并过“必过项”；以 通过/改进/阻塞 三态记录到 QA 用例库。依据 NN/g 的 10 条可用性启发式。(media.nngroup.com)
> 

**H-1 系统状态可见**

- 页面 / 操作均有**可感知的反馈**：保存、生成提案、执行、导出、失败重试均出现在页面可视区域（含进度/剩余时间/失败原因）。

**H-2 符合现实与领域语言**

- 采用用户语言与 Zach 语义（“输入型”“锁定”等）；日历/周的起止与用户时区一致。

**H-3 用户控制与自由**

- 所有不可逆动作（清空、删除、执行变更）有**撤销/取消**或**回滚**路径；AI 提案仅在**批准后**执行。

**H-4 一致性与标准**

- 组件（按钮、开关、模态）交互一致；键盘与 ARIA 行为符合 Web 约定与 WCAG。

**H-5 错误预防**

- 锁定期（W7–W12）对配额修改入口**置灰**并解释原因；输出类目标被**即时拦截并给出改写建议**。

**H-6 识别而非回忆**

- 表单有**占位示例**与**已保存值**回显；对“输入型”给出可选模板（If–Then）。

**H-7 灵活与高效**

- 高阶用户可使用 `/wam` 快捷命令与键盘操作；常用动作支持批量（批量批准/导出）。

**H-8 美观与极简**

- 去除与任务无关的信息；事实栏只显示**本周必要字段**与 3–4 周滚动统计。

**H-9 识别、诊断并从错误恢复**

- 错误消息**用自然语言**说明问题与解决建议（别曝出技术细节/代码）。

**H-10 帮助与文档**

- 在 Plan / WAM 内嵌“**为何输入优先/为何锁定**”的小贴士；文档集中于**完成任务的最短路径**。

> 通过标准：每页 H-1~H-10 至少 8/10 通过，且 H-1/H-3/H-5/H-9 必过；问题按严重度进入修复队列。
> 

---

# 8. AI 设计（对话式 WAM：提示工程与工具调用）

## 8.0 目标与原则

- **目标**：让 AI 作为“**同辈伙伴**”参与每周 WAM，对话中完成**回顾 → 诊断 → 提案 → 人批 → 执行 → 纪要**的闭环，同时**严格遵守 Zach 护栏**（1+1 目标、**仅输入型**、**W1–W6 可调 / W7–W12 锁定**、≈85% 完成区间）。
- **社会临场感**：通过称呼、复述、追问等社交线索增强“被看见感”，符合 **CASA** 范式的人机社交反应。
- **人-在-回路**：AI **只提案**，**用户批准**后才调用后端工具执行（工具/函数调用 + 结构化输出）。

---

## 8.1 Persona 与语气（对话教练）

- **Persona**：同辈/伙伴式，友好、具体、可验证；不装专家、不做诊断；出现敏感内容时提供寻求专业帮助的通用提示。
- **话术框架**：采用 **MI/OARS**（开放式问题、肯定/赞赏、反映式倾听、总结）驱动的对话骨架，先听后评，再合写承诺。
- **社交线索**：记住姓名与上周承诺；在关键节点请求确认与许可（“要不要看下本周的数字？”）。

---

## 8.2 提示结构（Prompt Skeleton）

**System（不可变）**

- 角色：同辈 AI 伙伴（非医疗/心理咨询）。
- 硬规则：仅 **1 Personal + 1 Professional**；只允许**输入型**行动；**W1–W6 可调/W7–W12 锁定**；目标完成度瞄准 **≈85%**；**禁止**直接写库，所有变更走**提案→人批→工具**。

**Developer（业务准则）**

- 对话顺序：**你先说 → 我再给事实卡 → 共同诊断 → 提案卡 → 人批执行 → 纪要**。
- OARS 提示词库；避免评判语；必要时重述与“双向确认”。

**Tools（受控能力）**

- 只读：`propose_changes(context)` 产出**结构化提案 JSON**；
- 执行：`apply_change(change)` **仅在用户批准后**由后端触发；参数走 JSON Schema 严格校验与幂等执行。

**User Context（最小化注入）**

- 本周计划/完成、过去 3–4 周完成率与趋势、锁定标志、愿景标签、例外说明（请假/出差）。

---

## 8.3 轮次与打断控制（Turn-taking）

- **回合制策略**：遵循“**先请你说 → 再反馈事实 → 征求同意 → 给提案**”的固定节拍，避免长段独白与抢话。
- **多方/多代理扩展**（v1.x 可选）：引入“下一发言人选择”“邻接对”等会话学规则，显著降低对话崩溃、提升信息共享与推理质量。
- **语音端点**（v1.x）：若开启语音，使用 Web Speech 的端点事件控制开始/结束与打断；浏览器不支持则自动回落文本。

---

## 8.4 结构化输出（Insights & Proposals Schema）

```json
{
  "insights": [
    {"type": "trend|risk|win", "message": "string"}
  ],
  "proposals": [
    {
      "type": "adjust_quota|split_task|merge_tasks|carry_over|prioritize",
      "week": 5,
      "item_id": "uuid",
      "op": "increase|decrease|replace",
      "payload": {"unit":"sessions","from":4,"to":3},
      "rationale": "string",
      "constraints": {"locked": false, "input_only": true}
    }
  ]
}

```

- **前端守卫**：若检测到**输出/KPI**类提案（如“+500 followers”），直接标红并引导改写为**输入型**（If–Then 实施意图），用户确认后再提交。
- **锁定守卫**：W7–W12 自动把 `constraints.locked=true`，禁止配额修改，仅允许执行层安排（如 prioritize/carry_over）。
- **实现注记**：使用 **OpenAI Structured Outputs / Function Calling**，后端以 **Zod**/JSON Schema 校验模型返回结构再渲染提案卡与执行工具。

> 结构化输出与工具调用严格遵循官方“Function/Tool Calling + Structured Outputs”模式，保证模型输出与 Schema 对齐，防越权写库。(OpenAI Platform)
> 

---

## 8.5 执行流（HITL 审批 → 工具调用 → 审计）

1. 对话中渲染**提案卡**（Approve / Edit / Reject）。
2. 批准后签发**一次性令牌**给后端；按类型调用受控工具（幂等）。
3. 写入**审计日志**（谁/何时/前后值/理由）；对话结束生成**Markdown/CSV 纪要**。
4. 任何失败项进入“可重试/回滚队列”。

> 工具/结构化输出+人批是 OpenAI 官方推荐的安全对接模式。
> 

---

## 8.6 语音能力（v1.x 勾子）

- **识别/合成**：优先 **Web Speech API**（`SpeechRecognition`/`SpeechSynthesis`），可用则用，不可用自动降级；显式权限提示与静音/嘈杂环境回退策略。

---

## 8.7 质量与评估（对话而非“冷报告”）

- **过程指标**：平均轮次、AI 发言占比、打断率、用户批准率、锁定违规拦截率。
- **结果指标**：周完成度落在 **80–90% 区间**的比例、连续 4 周留存、进入下一轮比例。
- **人机社交验证**：抽样评估“被看见感/被支持感”，呼应 **CASA** 的社交反应假设。

---

## 8.8 安全与最小化

- **最小化上下文**：只注入本周必要字段；避免无关历史泄露。
- **拒绝权**：任何自动提案均需人工批准；随时可“静音/暂停”AI 组员。
- **透明性**：对话开头声明 AI 身份与边界；所有变更可导出与回溯（审计日志）。

> 注：以上设计把“AI 伙伴”的社交临场感（CASA）、OARS 对话骨架、工具/结构化输出的安全可执行链路，以及多方对话的 turn-taking 控制融为一体，既符合 Zach 的硬护栏，也让周会像“和队友聊天”而非被动看报告。(ResearchGate)
> 

---

## 8.9 危机与合规模板（对话触发与处理流程）

**适用范围**：当用户在 WAM 对话中出现**自伤/他伤/严重危机**、**急性医学问题**、或需要**紧急帮助**的表述时。

**触发方式**

- 关键词/语义规则命中 → 进入**“危机应对模式”**（只读、非诊断、停止任何行动提案）。

**对话模板（只读提示，非医疗建议）**

- *“我注意到你分享的内容可能涉及紧急风险。我不是医疗或心理专业人员，无法提供诊断或治疗建议。如果你处在紧急危险中，请立即拨打当地的紧急服务电话（如 000/112）或联系可信赖的人获得现场帮助。若你愿意，我可以继续提供一般性的资源链接与支持性对话。”*
- 提供**本地化求助渠道**占位（由运营在发布地配置）：
    - **紧急电话**：`000/112`（示例，按地区替换）
    - **危机热线**：`<本地热线>`
    - **在线文本支持**：`<本地服务>`

**系统行为**

- 立即**停止**生成任何“计划/提案/建议”；
- 仅记录**触发类型 + 时间戳 + 是否给出求助模板**至 `audit_log`（**不写入**敏感原文，遵循**最小化日志**要求）；
- 用户选择“继续聊天”时，系统仅提供**情绪支持式**的**OARS**对话，不进入提案或改动流程；用户选择“结束会话”则归档会话。

> 日志与最小化原则参照 OWASP ASVS 4.0.3（V7 Logging）；对话姿态保持“非诊断、非医疗建议”。
> 

---

# 9. 数据模型（核心表）

## 9.1 主表

- `vision`：`{id, user_id, daily, weekly, year, life, tags[], updated_at}`
- `cycle`：`{id, user_id, start_date, end_date, current_week, created_at}` // 绑定 12 周周期
- `goal`：`{id, user_id, cycle_id, type:personal|professional, desc, start_week, end_week, created_at}`
    - **唯一**：`UNIQUE(user_id, cycle_id, type)`（严格 1+1）
- `weekly_plan`：`{id, user_id, cycle_id, week_no, mode, locked_after_week=6, created_at}`
- `task`：`{id, user_id, title, unit, default_qty, tags[], created_at}` // 任务主表（可复用）
- `plan_item`：`{id, plan_id, task_id, unit, qty, completed_qty, status, updated_at}`
- `audit_log`：`{id, actor_user_id, actor_type:user|system|ai, action, before:jsonb, after:jsonb, rationale, correlation_id, source_ip, user_agent, created_at}` // 日志受保护，遵循 ASVS V7
- `chat_session`：`{id, user_id, cycle_id, started_at, ended_at, summary_md}`
- `chat_message`：`{id, session_id, role:user|ai|system, content, proposal_json:jsonb?, created_at}` // 提案结构化存储，便于审计与回放

## 9.2 约束

- **1+1 目标**：`goal` 表按 `UNIQUE(user_id, cycle_id, type)` 保证仅个人/职业各 1 条。
- **锁定保护**：W7–W12 禁止修改 `plan_item.qty`（触发器/服务端校验双保险）。
- **外键**：`goal.cycle_id → cycle.id`；`weekly_plan.cycle_id → cycle.id`；`plan_item.task_id → task.id`；`chat_message.session_id → chat_session.id`。
- **JSONB 校验**：`proposal_json` 使用 `jsonb`，并约束为对象类型（CHECK）。
- **RLS（行级安全）**：所有“用户域”表默认开启 RLS，策略示例 `USING (user_id = auth.uid())`。

---

# 10. API / Server Actions（示例）

- `POST /vision` / `PUT /vision`
- `POST /plan/init-12w`（校验 1+1 & 输入约束）
- `POST /plan/:week/propose`（AI 只读）
- `POST /plan/:week/approve`（HITL 批准 → 工具执行）
- `GET /export/week/:week.(md|csv)`
- `POST /calendar/create`（v1.x 增 events.watch 订阅）
- `POST /wam/start`（新建 chat_session，返回会前摘要卡）
- `POST /wam/message`（模型生成 + 可选提案卡）
- `POST /wam/approve`（生成一次性令牌 → 执行工具函数 → 写审计）
- `GET /wam/export.(md|csv)`（导出纪要/承诺/改动）

## **10.0 API 统一约定（TypeScript + Zod + Server Actions）**

- **入参/出参**：所有 `/api/*` 与 Server Actions **必须**通过 `zod` 模式校验；模式放在 `packages/schemas` 并导出类型给前端复用。
- **错误协议**：统一 `HTTP 4xx/5xx + {code,message,details?}`；前端对 **ZodError** 转译为字段级错误。
- **幂等与审计**：会改库的动作走 **Server Actions**（携带会话态）→ 写入 `audit_log`；对外 API（含 WAM 审批）要求 **一次性令牌**。
- **扩展位（可选 v1.x）**：提供 `trpc/` 入口镜像核心能力，便于将前端直接以类型安全 RPC 调用（后续开启）。

> 说明：保持 REST + Server Actions 为主，未来视需要开启 tRPC 以获得端到端类型推断。(Elastic)
> 

---

# 11. 技术架构与选型（MVP）

- **前端**：Next.js 14（App Router/Server Actions）
- **UI**：Radix Primitives + shadcn/ui + Tailwind（无障碍/定制）
- **后端**：Next.js API/Server Actions（Node）
- **数据库**：PostgreSQL（Supabase 托管，**RLS 默认开启**）
- **托管**：Vercel（Edge + 预览环境）
- **通知**：Web Push；iOS 16.4+ 需 A2HS + 权限授权（内置引导）
- **日历**：Google Calendar（v1.x：push/watch）
- **分析**：PostHog（事件/漏斗/Flags）

## 11.1 单语言（TypeScript）策略与约束

- **单语言目标**：端到端统一 **TypeScript**（前端、Server Actions、API Route Handlers、AI 适配层、脚本），减少接口歧义与上下文切换成本。
- **共享类型/Schema**：在 `packages/schemas` 存放 **Zod** 模式与类型导出（`zod`→`z.infer`），前后端共用：表单校验、后端入参校验、AI 提案 Schema 校验、导出模板校验。
- **接口形态（MVP）**：内部优先 **Next.js Route Handlers + Server Actions**，统一以 **Zod** 校验请求/响应；保留 `api/` 路由对外（RESTful，便于未来 App/集成）。
- **类型安全通信（可选 v1.x）**：如需 RPC 体验再引入 **tRPC**（保留与 REST 并行能力，先不强绑定）。
- **观测与追踪**：按 Next.js 指南添加 `instrumentation.ts`，启用 **OpenTelemetry**（HTTP 请求、Server Action、自定义 span），支持在 Vercel/自建 Collector 输出。

> 依据：Next.js Server Actions/Route Handlers 官方文档；Zod 官方文档；tRPC 官方文档；Next.js instrumentation.ts + OpenTelemetry 指南。
> 

---

# 12. 安全、隐私与合规

## 12.1 安全基线

- **OWASP ASVS v4.0.3 L2**：认证/会话/访问控制/加密/日志/错误处理/业务逻辑滥用等验收条目通过。
- **日志**：审计日志只对特定角色可读，防篡改、带时间与来源、敏感数据脱敏。

## 12.2 隐私与合规

- **数据最小化**：仅收集邮箱、时区、推送 token、（可选）日历令牌。
- **法律**：澳大利亚 **APPs** 与 GDPR/UK-GDPR 原则（透明、权利、最小化、存储限制）。
- **权利**：导出（JSON/CSV）、删号自助；政策页清晰说明处理目的与保留期。
- **最小化数据暴露**：会话仅注入必要字段（本周计划/完成/趋势/锁定），不注入无关历史。
- **ASVS**：审计日志不可被普通用户篡改；导出/删除按隐私权利提供自助。
- **语音（v1.x）**：启用时明确麦克风权限说明；浏览器不支持则自动回退文本。

---

# 13. Git 约定与提交规范（Conventional Commits）

为便于 Agent 自动生成变更日志、触发 CI、做语义化版本，采用 **Conventional Commits**：

`feat: …`、`fix: …`、`docs: …`、`refactor: …`、`test: …`、`chore: …`；破坏性变更加 `!`；正文含“原因/影响/回归风险”。

- **分支策略**：`main`（受保护） / `feat/*` / `fix/*`。
- **PR 模板**（要点）：动机、变更点、运行方式、影响面、回归风险、关联任务卡（`/kanban/issues/*.md`）。
- **Tag/Release**：按 `feat/fix` 自动生成 Release Notes 与变更日志（CI）。
- **参考**：Atlassian 的 Git 提交流程与 Kanban 实践指南。

---

# 14. 通知策略（频控）

- 默认每周 3 条：周日下周计划、周末评分、WAM 摘要；可调为“仅周末/仅重大”。
- iOS Web Push：检测是否 A2HS 且已授权；提供一步步引导（状态指示）。

---

# 15. 边界与异常（最佳实践）

- **错过一周**：不补记；在 Retro 标注“空周”，AI 给出“环境/节律”对策。
- **时区变更**：周界定默认随账户时区；切换在下周生效。
- **锁定期（W7–W12）**：禁止配额变更；仅允许执行层建议；提供一次性“紧急解锁”流程（需填写原因，进审计）。
- **导出失败**：异步任务，失败重试 3 次与邮件/站内信通知。
- **AI 偏差**：任何提案均需用户确认；编辑时进行 Schema 校验与锁定检查。

---

# 16. 指标与实验

- 事件：`created_plan`, `week_scored`, `ai_wam_opened`, `proposal_approved`, `lock_violation_blocked`, `export_md`, `retro_completed`, `cycle_rolled`.
- 漏斗：愿景完成→12 周计划创建→首周评分→首次 AI WAM 审批→第 6 周→第 12 周 Retro→进入下一轮。
- A/B：建议卡片文案、提案列表排序、表盘阈值提示样式。

## 16.1 测试计划（Test Plan — ISTQB）

> 定义：测试计划是描述拟进行测试活动的范围、方法、资源与进度的文件，明确测试对象、要测功能、测试任务、职责、环境、采用的测试设计技术，以及进入/退出准则与风险及其应对。(ISTQB Glossary)
> 

**A. 目标与范围**

- 覆盖 MVP 全功能（Vision/Plan/This Week/AI WAM/Retro/通知与日历/导出），以及 NFR（性能、可达性、安全与隐私）。

**B. 测试项与不测项**

- **测试项**：页面与 API；受控工具调用；PWA 安装与 Web Push；Google Calendar 创建。
- **不测项（MVP）**：企业级 SSO、群组真人 WAM、原生移动端。

**C. 测试级别与方法**

- **单元**：数据模型、工具函数、提示解析/Schema 校验。
- **集成**：Server Actions、提案卡→审批→执行→审计链路。
- **E2E**：关键流程 6 条（新手引导、建 12 周计划、周执行、AI WAM、导出、Retro）。
- **可达性**：WCAG 2.2 AA 关键路径（键盘、焦点、对比度、动效降级）。
- **安全**：RLS 策略、权限越权、日志最小化、紧急解锁审计。
- **性能**：SLO 验证（首响应 ≤2.5s；提案 ≤8s；回执 ≤1s）。
- **方法**：风险驱动 + 分析法（等价类/边界值）+ 回归集。

**D. 测试环境与数据**

- **环境**：预发（与生产同构）；移动需覆盖 iOS Safari（A2HS）、Android Chrome、桌面 Chrome/Edge/Firefox。
- **数据**：合成账户（含不同时区）、典型愿景模板、12 周计划样例、锁定期样例。

**E. 进入/退出准则**

- **进入**：需求冻结、可用构建、环境就绪、阻塞缺陷=0、测试数据准备完成。
- **退出**：P0/P1 缺陷=0；P2 修复率≥95%（剩余有绕行或不影响核心路径）；用例覆盖≥90%；关键 KPI 达成。

**F. 进度与里程碑**

- 与第 17 章计划对齐：
    - 周 3–6：单元/集成持续；周 6 开始首轮 E2E 回归；
    - 周 7–8：E2E 全量 + 性能 + 可达性 + 安全专项；灰度与修复。

**G. 角色与职责**

- QA 拥有测试计划与报告；前后端配合缺陷修复；PM 负责优先级与风险评审；法务审查隐私与条款。

**H. 交付物**

- 测试用例库、每日/周报、缺陷列表、E2E 报告、性能/可达性/安全专项报告、测试总结。

## 16.2 UX 研究活动挂历（MVP 阶段 · 8 周节奏）

> 参考 **NN/g 的“产品与服务设计周期中的 UX 活动”**方法图与 ISO 9241-210 的以人为本设计流程，制定 MVP 期的最小研究节奏与产物。
> 

**样本与频率**

- 快速可用性测试每轮 **5–7 人**（远程优先）；每周至少 1 场形成“发现–修复”闭环；所有研究遵循伦理与告知。

**周度挂历（与第 17 章并行）**

- **周 1（Discover）**：目标用户访谈 6–8 人；竞品走查（Sunsama/Motion/Todoist/Focusmate）；输出：人物卡、任务分析、关键痛点。
- **周 2（Explore）**：线框可用性测试（5 人，A/B 两版导航）；启发式走查（第 7.6 节）；输出：问题单 + 优先级。
- **周 3（Test）**：原型可用性测试（Plan & This Week）；首次**学习区间（85%）**理解度探查；输出：术语与提示改写建议。
- **周 4（Listen + Explore）**：日记研究（7–10 天，轻量）记录周执行；WAM 话术小测（2 轮模拟）。
- **周 5（Test）**：AI WAM 高保真可用性测试（5–7 人），重点卡点：Approve/Edit/Reject、失败重试与可见反馈。
- **周 6（Test + Measure）**：Beta 候选：树测导航/关键任务成功率基线；Retro 可发现性与理解度。
- **周 7（Measure）**：灰度上线：漏斗与事件校验；远程定量问卷（SUS/UMUX-Lite + 开放题）。
- **周 8（Synthesize）**：研究总结：Top Findings × 10 + 影响评审 + 改动清单，进入 v1.1 计划。

**每轮产物**

- 研究计划（目标/样本/脚本/同意书）→ 观察记录/截屏 → 摘要（发现/严重度/建议）→ 设计/工程确认的**PRD 影响条目**（附负责人与时间）。

**方法库（按阶段选择）**

- Discover：访谈、任务分析、竞品分析；
- Explore：线框试用、概念评估；
- Test：可用性测试、树测/卡片分类；
- Listen：日记研究、反馈收集。

---

# 17. 定价与包装（英文首发）

- **Free**（验证层）：1 个 12-week 周期；AI 生成器每周限 N 次；AI WAM 摘要；导出；无 Push。
- **Pro**（$8–$12/mo，$80–$99/yr）：无限周期；完整 AI WAM（提案/审批/执行/审计）；Web Push；愿景对齐提示；85% 自适应建议；导出。
- **Pro+**（$15–$18/mo，$150–$169/yr）：高级图表；（v1.x）Calendar 同步与 watch；自动周报邮件。

> 价位对标：Sunsama ~$16–20/mo；Motion（个人）~$19–29/mo；Todoist ~$5–10；Focusmate ~$6.99–9.99。我们的主打在“方法论护栏 + AI 周会”，因此定位介于清单与 AI 排程之间，定价低于 Sunsama/Motion。
> 

---

# 18. 项目计划（建议）

- **周 1–2**：线框与视觉基线；数据模型/接口草案；隐私与条款草案。
- **周 3–6**：前后端并行开发；AI 提示与 Schema；PWA/Push；导出；事件埋点。
- **周 7–8**：E2E/安全/可达性测试；封测/灰度；指标看板。
- **Beta 发布**：收集反馈→v1.1 打磨（Calendar watch、更多统计与报表）。

## 18.1 工程协作与看板（Agent-friendly）

**目的**：统一开发流程，让人类与 Agent/Codex 都能用**同一套看板/模板**推进任务（Docs-as-Code）。看板记录在仓库内，走 PR/Review。

### 18.1.1 看板列（项目级，统一）

- **Backlog**（需求池）
- **To Do**（当前周期待办 / Sprint）
- **In Progress**（开发中）
- **In Review**（代码审查）
- **Testing / QA**（测试中）
- **Blocked**（阻塞）
- **Done**（验收通过）

> 说明：列命名与语义对齐主流 Kanban 做法，便于新人与 Agent 理解。
> 

### 18.1.2 任务状态定义（严格）

- **In Progress**：除功能实现外，**包含单元测试（若适用）**。
- **In Review**：PR 必写**修改点 / 运行方式 / 影响面 / 回归风险**；≥1 名审查者通过。
- **Testing / QA**：按**测试用例**执行，记录缺陷并分级（P0/P1/P2）；P0 必须修复，P1 需评估。
- **Done**：按**验收标准（Acceptance Criteria）**验收通过后迁入。
- **Blocked**：注明阻塞原因与依赖卡片（链接）。

### 18.1.3 仓库结构（Docs-as-Code）

```
/kanban/
  board.md                  # 看板现状（各列任务 ID 列表）
  /issues/
    A-1-initialize-repo.md  # 单个任务卡（Markdown）
    A-2-setup-auth.md

```

- **board.md** 模板（示例）：
    
    ```markdown
    # Kanban Board (YYYY-MM-DD)
    ## Backlog
    - A-3-vision-wizard-copy
    
    ## To Do
    - A-1-initialize-repo
    
    ## In Progress
    - A-2-setup-auth
    
    ## In Review
    ## Testing / QA
    ## Blocked
    ## Done
    
    ```
    
- **任务卡模板**（`/kanban/issues/A-1-initialize-repo.md`）：
    
    ```markdown
    # A-1 Initialize Repo
    ## Goal
    Bootstrap Next.js + Supabase with RLS on.
    ## Subtasks
    - [ ] Create Next.js app (App Router)
    - [ ] Setup Supabase & RLS baseline
    - [ ] PostHog init
    ## Owner
    @alice
    ## Estimate
    S | M | L
    ## Acceptance Criteria
    - RLS enabled; anonymous access blocked.
    - App boots on Vercel preview.
    ## Test Cases
    - RLS: non-owner cannot query other user rows.
    ## Related
    PR: (link)  Design: (link)
    ## Risks
    RLS policy conflict with Service Role
    ## Notes / Review
    - YYYY-MM-DD: code review notes …
    
    ```
    

> 任务卡必须含：目标、子任务、Owner、复杂度（S/M/L）、验收标准、测试用例、相关链接、依赖。
> 

### 18.1.4 给 AI/Agent 的拆分提示（直接用）

- 在任务卡底部追加区块：
    
    ```markdown
    ## AI Decomposition Prompt
    - Context: {{link to PRD section}}
    - Output: Update this file with concrete subtasks, add missing test cases, propose risks.
    - Constraints: Follow input-only & 6/6 lock rules from PRD; keep changes within this card.
    
    ```
    
- 执行方式：把**此卡链接 + PRD片段**发给 Agent，请其**更新该卡 Markdown**（PR/评论），而不直接改数据库或业务逻辑（与本项目“AI 只提案→人批→执行”的原则一致）。

### 18.1.5 完成的判据（看板层）

- **进入 In Review**：有 PR 且通过 lint/build；PR 说明完整。
- **进入 Testing / QA**：有**测试用例**与**可运行环境**；QA 能复现。
- **进入 Done**：验收标准逐条打勾，**PR 合并**且**看板/用例已更新**。

# 19. 里程碑验收（MVP “Definition of Done”）

- 功能：Vision、Plan（1+1 输入/6-lock）、This Week（两工作流 + 85% 表盘）、**AI WAM（提案/审批/执行/审计/导出）**、Retro（生成下一轮）。
- 集成：PWA 可安装；Web Push（含 iOS 16.4+ 引导）；（v1.x）Google Calendar 创建/（可选）watch。
- 安全/合规：**RLS 开启并有策略**；**ASVS L2** 检查通过；**WCAG 2.2 AA** 关键路径通过；导出/删号有效。
- 工程：`packages/schemas` 已落地（Zod 模式前后端共用）；`instrumentation.ts` 生效（可见 trace）；异步任务走 Upstash QStash（或同等规范队列）并可重放；`trpc/` 入口关闭但有脚手架（v1.x 可开）。

---

# 20. 附：导出模板（Markdown · 可直接贴到 ChatGPT）

```
# Weekly AI-WAM Summary — Week {{W}}
- Completion: {{pct}}%
- 85% Zone: {{in_zone? yes/no}}
- Wins:
  - {{...}}
- Frictions (tagged):
  - {{time/energy/env/skill}} — {{note}}
- Trends:
  - {{...}}

## AI Proposals (for human approval)
{{#each proposals}}
- [{{status}}] {{type}} — {{task}} (from {{from}} to {{to}}). Rationale: {{r}}
{{/each}}

## Next-Week Draft (Input-based)
- {{task}} — {{qty}} {{unit}} × {{sessions}}

## Commitments
- {{...}}

> Notes: Input-only; Week {{W>=7 ? "Locked (no quota changes)" : "Adjustable"}}; Aim for ~85% completion next week (optimal learning zone).

```

---

# 21. 参考资料（关键条目）

- Zach Highley：**How to Transform Your Life in 6 Months**（文章/视频）([Zach Highley](https://zhighley.com/article/how-to-transform-your-life-in-6-months/?utm_source=chatgpt.com))
- 学习难度 85%“甜蜜点”：Nature Communications 2019（论文 + 科普）([Nature](https://www.nature.com/articles/s41467-019-12552-4.pdf?utm_source=chatgpt.com))
- 习惯形成：Lally 等（UCL，66 天中位数）([CentreSpring MD](https://centrespringmd.com/docs/How%20Habits%20are%20Formed.pdf?utm_source=chatgpt.com))
- iOS 16.4+ Web Push（A2HS）([Apple Developer](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers?utm_source=chatgpt.com))
- Google Calendar Push / `events.watch` ([Google for Developers](https://developers.google.com/workspace/calendar/api/guides/push?utm_source=chatgpt.com))
- Supabase Row Level Security（RLS）([Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com))
- OWASP ASVS 4.0.3（英文版 PDF）/ 项目页、WCAG 2.2 ([GitHub](https://raw.githubusercontent.com/OWASP/ASVS/v4.0.3/4.0/OWASP%20Application%20Security%20Verification%20Standard%204.0.3-en.pdf?utm_source=chatgpt.com))
- Web Speech API（语音扩展可行）：MDN。([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API?utm_source=chatgpt.com))
- Conversational Agents 综述/元分析：对话式干预在健康/行为改变领域的证据。([Nature](https://www.nature.com/articles/s41746-023-00979-5.pdf?utm_source=chatgpt.com))
- 多方对话 turn-taking 设计：控制“谁先发言/何时插话”，减少崩溃、提升协作。([arXiv](https://arxiv.org/html/2412.04937v1?utm_source=chatgpt.com))
- **CASA（人机会话的社会反应）**：Clifford Nass & Youngme Moon, *Machines and Mindlessness: Social Responses to Computers*, *Journal of Social Issues* (2000). PDF。([coli.uni-saarland.de](https://www.coli.uni-saarland.de/courses/agentinteraction/contents/papers/Nass00.pdf?utm_source=chatgpt.com))
- **对话式代理的系统综述（健康/福祉）**：Han Li et al., *Systematic review and meta-analysis of AI-based conversational agents for promoting mental health and well-being*, *npj Digital Medicine* (2023). PDF。([Nature](https://www.nature.com/articles/s41746-023-00979-5.pdf?utm_source=chatgpt.com))
- **结构化输出/函数调用（官方）**：OpenAI *Structured Outputs/Function Calling* 指南；（等价）Azure OpenAI 的结构化输出说明。([OpenAI Platform](https://platform.openai.com/docs/guides/structured-outputs?utm_source=chatgpt.com))
- **WCAG 2.2**：W3C 正式版（AA 合规的判定标准）。([W3C](https://www.w3.org/TR/WCAG22/?utm_source=chatgpt.com))