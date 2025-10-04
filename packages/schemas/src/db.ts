import { z } from "zod";

export const GoalTypeEnum = z.enum(["personal", "professional"]);
export type GoalType = z.infer<typeof GoalTypeEnum>;

export const PlanModeEnum = z.enum(["time_block", "priority_queue"]);
export type PlanMode = z.infer<typeof PlanModeEnum>;

export const PlanItemStatusEnum = z.enum([
  "planned",
  "in_progress",
  "completed",
  "skipped",
]);
export type PlanItemStatus = z.infer<typeof PlanItemStatusEnum>;

export const ActorTypeEnum = z.enum(["user", "system", "ai"]);
export type ActorType = z.infer<typeof ActorTypeEnum>;

export const ChatRoleEnum = z.enum(["user", "ai", "system"]);
export type ChatRole = z.infer<typeof ChatRoleEnum>;

const uuid = () => z.string().uuid();
const timestamp = () => z.string().datetime({ offset: true });

export const VisionSchema = z.object({
  id: uuid(),
  userId: uuid(),
  daily: z.string(),
  weekly: z.string(),
  year: z.string(),
  life: z.string(),
  tags: z.array(z.string()),
  updatedAt: timestamp(),
});
export type Vision = z.infer<typeof VisionSchema>;

export const VisionUpsertSchema = VisionSchema.pick({
  daily: true,
  weekly: true,
  year: true,
  life: true,
  tags: true,
});

export const CycleSchema = z.object({
  id: uuid(),
  userId: uuid(),
  startDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  endDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  currentWeek: z.number().int().min(1).max(12),
  createdAt: timestamp(),
});
export type Cycle = z.infer<typeof CycleSchema>;

export const CycleInsertSchema = CycleSchema.pick({
  userId: true,
  startDate: true,
  endDate: true,
}).extend({
  currentWeek: z.number().int().min(1).max(12).default(1),
});

export const GoalSchema = z.object({
  id: uuid(),
  userId: uuid(),
  cycleId: uuid(),
  type: GoalTypeEnum,
  description: z.string().min(1),
  startWeek: z.number().int().min(1).max(12),
  endWeek: z.number().int().min(1).max(12),
  createdAt: timestamp(),
});
export type Goal = z.infer<typeof GoalSchema>;

export const GoalInsertSchema = GoalSchema.pick({
  userId: true,
  cycleId: true,
  type: true,
  description: true,
  startWeek: true,
  endWeek: true,
});

export const WeeklyPlanSchema = z.object({
  id: uuid(),
  userId: uuid(),
  cycleId: uuid(),
  weekNo: z.number().int().min(1).max(12),
  mode: PlanModeEnum,
  lockedAfterWeek: z.number().int().min(1).max(12),
  createdAt: timestamp(),
});
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;

export const WeeklyPlanInsertSchema = WeeklyPlanSchema.pick({
  userId: true,
  cycleId: true,
  weekNo: true,
  mode: true,
}).extend({
  lockedAfterWeek: z.number().int().min(1).max(12).default(6),
});

export const TaskSchema = z.object({
  id: uuid(),
  userId: uuid(),
  title: z.string().min(1),
  unit: z.string().min(1),
  defaultQty: z.number().nonnegative(),
  tags: z.array(z.string()),
  createdAt: timestamp(),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskInsertSchema = TaskSchema.pick({
  userId: true,
  title: true,
  unit: true,
  defaultQty: true,
  tags: true,
});

export const PlanItemSchema = z.object({
  id: uuid(),
  planId: uuid(),
  goalId: uuid().nullable(),
  taskId: uuid().nullable(),
  unit: z.string().min(1),
  qty: z.number().nonnegative(),
  completedQty: z.number().nonnegative(),
  status: PlanItemStatusEnum,
  notes: z.string().optional().nullable(),
  updatedAt: timestamp(),
  createdAt: timestamp(),
});
export type PlanItem = z.infer<typeof PlanItemSchema>;

export const PlanItemInsertSchema = PlanItemSchema.pick({
  planId: true,
  goalId: true,
  taskId: true,
  unit: true,
  qty: true,
  notes: true,
}).extend({
  completedQty: z.number().nonnegative().default(0),
  status: PlanItemStatusEnum.default("planned"),
});

export const AuditLogSchema = z.object({
  id: uuid(),
  actorUserId: uuid().nullable(),
  actorType: ActorTypeEnum,
  subjectUserId: uuid(),
  action: z.string().min(1),
  beforeState: z.record(z.any()).nullable(),
  afterState: z.record(z.any()).nullable(),
  rationale: z.string().nullable(),
  correlationId: uuid().nullable(),
  sourceIp: z.string().ip({ version: "v4v6" }).nullable(),
  userAgent: z.string().nullable(),
  createdAt: timestamp(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditLogInsertSchema = AuditLogSchema.pick({
  actorUserId: true,
  actorType: true,
  subjectUserId: true,
  action: true,
  beforeState: true,
  afterState: true,
  rationale: true,
  correlationId: true,
  sourceIp: true,
  userAgent: true,
});

export const ChatSessionSchema = z.object({
  id: uuid(),
  userId: uuid(),
  cycleId: uuid().nullable(),
  startedAt: timestamp(),
  endedAt: timestamp().nullable(),
  summaryMd: z.string().nullable(),
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;

export const ChatSessionInsertSchema = ChatSessionSchema.pick({
  userId: true,
  cycleId: true,
  summaryMd: true,
}).extend({
  startedAt: timestamp().optional(),
  endedAt: timestamp().optional(),
});

export const ChatMessageSchema = z.object({
  id: uuid(),
  sessionId: uuid(),
  role: ChatRoleEnum,
  content: z.string().min(1),
  proposalJson: z.record(z.any()).nullable(),
  createdAt: timestamp(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatMessageInsertSchema = ChatMessageSchema.pick({
  sessionId: true,
  role: true,
  content: true,
  proposalJson: true,
});

export const DatabaseSchema = {
  vision: VisionSchema,
  cycle: CycleSchema,
  goal: GoalSchema,
  weekly_plan: WeeklyPlanSchema,
  task: TaskSchema,
  plan_item: PlanItemSchema,
  audit_log: AuditLogSchema,
  chat_session: ChatSessionSchema,
  chat_message: ChatMessageSchema,
};

export type DatabaseSchema = typeof DatabaseSchema;
