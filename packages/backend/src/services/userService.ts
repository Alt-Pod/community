import bcrypt from "bcryptjs";
import type { UserRepository } from "../repositories/userRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getProfile(userId: string) {
    return this.userRepository.findProfileById(userId);
  }

  async register(email: string, password: string, name?: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) return { alreadyExists: true };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create({ email, passwordHash, name });
    return { alreadyExists: false, user };
  }
}
