export { default as sql } from "./db/client";
export { handlers, auth, signIn, signOut } from "./auth/auth";
export { authConfig } from "./auth/auth.config";

// Repositories
export { UserRepository } from "./repositories/userRepository";
export { ConversationRepository } from "./repositories/conversationRepository";
export { MessageRepository } from "./repositories/messageRepository";

// Services
export { UserService } from "./services/userService";
export { ConversationService } from "./services/conversationService";
export { ChatService } from "./services/chatService";

// Wired instances — ready to use in API routes
import sql from "./db/client";
import { UserRepository } from "./repositories/userRepository";
import { ConversationRepository } from "./repositories/conversationRepository";
import { MessageRepository } from "./repositories/messageRepository";
import { UserService } from "./services/userService";
import { ConversationService } from "./services/conversationService";
import { ChatService } from "./services/chatService";

const userRepository = new UserRepository(sql, "users");
const conversationRepository = new ConversationRepository(sql, "conversations");
const messageRepository = new MessageRepository(sql, "messages");

const userService = new UserService(userRepository);
const conversationService = new ConversationService(conversationRepository, messageRepository);
const chatService = new ChatService(messageRepository);

export {
  userRepository,
  conversationRepository,
  messageRepository,
  userService,
  conversationService,
  chatService,
};
