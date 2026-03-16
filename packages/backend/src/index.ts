export { default as sql } from "./db/client";
export { handlers, auth, signIn, signOut } from "./auth/auth";
export { authConfig } from "./auth/auth.config";

// Repositories
export { UserRepository } from "./repositories/userRepository";
export { ConversationRepository } from "./repositories/conversationRepository";
export { MessageRepository } from "./repositories/messageRepository";
export { AgentRepository } from "./repositories/agentRepository";
export { ToolRepository } from "./repositories/toolRepository";
export { KnowledgeRepository } from "./repositories/knowledgeRepository";
export { JobRepository } from "./repositories/jobRepository";
export type { JobStatus } from "./repositories/jobRepository";
export { ScheduledActivityRepository } from "./repositories/scheduledActivityRepository";
export type { ScheduledActivityStatus } from "./repositories/scheduledActivityRepository";
export { UsageRepository } from "./repositories/usageRepository";

// Services
export { UserService } from "./services/userService";
export { ConversationService } from "./services/conversationService";
export { ChatService } from "./services/chatService";
export { AgentService } from "./services/agentService";
export { ToolService } from "./services/toolService";
export { KnowledgeService } from "./services/knowledgeService";
export { JobService } from "./services/jobService";
export { ScheduledActivityService } from "./services/scheduledActivityService";
export { UsageService } from "./services/usageService";

// Helpers
export { buildPartsFromSteps } from "./helpers/partsHelper";

// Inngest
export { inngest } from "./inngest/client";
export type { Events } from "./inngest/client";

// Wired instances — ready to use in API routes
import sql from "./db/client";
import { UserRepository } from "./repositories/userRepository";
import { ConversationRepository } from "./repositories/conversationRepository";
import { MessageRepository } from "./repositories/messageRepository";
import { AgentRepository } from "./repositories/agentRepository";
import { UserService } from "./services/userService";
import { ConversationService } from "./services/conversationService";
import { ChatService } from "./services/chatService";
import { AgentService } from "./services/agentService";
import { ToolRepository } from "./repositories/toolRepository";
import { ToolService } from "./services/toolService";
import { KnowledgeRepository } from "./repositories/knowledgeRepository";
import { KnowledgeService } from "./services/knowledgeService";
import { JobRepository } from "./repositories/jobRepository";
import { JobService } from "./services/jobService";
import { ScheduledActivityRepository } from "./repositories/scheduledActivityRepository";
import { ScheduledActivityService } from "./services/scheduledActivityService";
import { UsageRepository } from "./repositories/usageRepository";
import { UsageService } from "./services/usageService";

const userRepository = new UserRepository(sql, "users");
const conversationRepository = new ConversationRepository(sql, "conversations");
const messageRepository = new MessageRepository(sql, "messages");
const agentRepository = new AgentRepository(sql, "agents");

const userService = new UserService(userRepository);
const conversationService = new ConversationService(conversationRepository, messageRepository);
const chatService = new ChatService(messageRepository);
const agentService = new AgentService(agentRepository);
const toolRepository = new ToolRepository(sql);
const toolService = new ToolService(toolRepository);
const knowledgeRepository = new KnowledgeRepository(sql, "knowledge_entries");
const knowledgeService = new KnowledgeService(knowledgeRepository);
const jobRepository = new JobRepository(sql, "jobs");
const jobService = new JobService(jobRepository);
const scheduledActivityRepository = new ScheduledActivityRepository(sql, "scheduled_activities");
const scheduledActivityService = new ScheduledActivityService(scheduledActivityRepository, jobService);
const usageRepository = new UsageRepository(sql, "usage_logs");
const usageService = new UsageService(usageRepository);

export {
  userRepository,
  conversationRepository,
  messageRepository,
  agentRepository,
  toolRepository,
  userService,
  conversationService,
  chatService,
  agentService,
  toolService,
  knowledgeRepository,
  knowledgeService,
  jobRepository,
  jobService,
  scheduledActivityRepository,
  scheduledActivityService,
  usageRepository,
  usageService,
};
