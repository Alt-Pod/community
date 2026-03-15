export { default as sql } from "./db/client";
export { handlers, auth, signIn, signOut } from "./auth/auth";
export { authConfig } from "./auth/auth.config";

// Repositories
export { UserRepository } from "./repositories/userRepository";
export { ConversationRepository } from "./repositories/conversationRepository";
export { MessageRepository } from "./repositories/messageRepository";
export { AgentRepository } from "./repositories/agentRepository";
export { ToolRepository } from "./repositories/toolRepository";

// Services
export { UserService } from "./services/userService";
export { ConversationService } from "./services/conversationService";
export { ChatService } from "./services/chatService";
export { AgentService } from "./services/agentService";
export { ToolService } from "./services/toolService";

// Helpers
export { buildPartsFromSteps } from "./helpers/partsHelper";

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
};
