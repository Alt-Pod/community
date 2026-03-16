import bcrypt from "bcryptjs";
import type { UserRepository } from "../repositories/userRepository";
import {
  uploadToStorage,
  deleteFromStorage,
  getSignedUrl,
} from "../helpers/storageHelper";

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()! : "bin";
}

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB

async function enrichWithAvatarUrl(
  profile: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (profile.avatar_url) {
    const avatarSignedUrl = await getSignedUrl(profile.avatar_url as string);
    return { ...profile, avatar_signed_url: avatarSignedUrl };
  }
  return { ...profile, avatar_signed_url: null };
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getProfile(userId: string) {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) return null;
    return enrichWithAvatarUrl(profile);
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ) {
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new Error("EMAIL_TAKEN");
      }
    }
    const profile = await this.userRepository.updateProfile(userId, data);
    if (!profile) return null;
    return enrichWithAvatarUrl(profile);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const hash = await this.userRepository.findPasswordHashById(userId);
    if (!hash) throw new Error("USER_NOT_FOUND");

    const valid = await bcrypt.compare(currentPassword, hash);
    if (!valid) throw new Error("WRONG_PASSWORD");

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.updatePasswordHash(userId, newHash);
  }

  async uploadAvatar(
    userId: string,
    buffer: Buffer,
    mimeType: string,
    filename: string
  ) {
    if (!ALLOWED_AVATAR_TYPES.includes(mimeType)) {
      throw new Error("INVALID_FILE_TYPE");
    }
    if (buffer.byteLength > MAX_AVATAR_SIZE) {
      throw new Error("FILE_TOO_LARGE");
    }

    // Delete old avatar if exists
    const currentProfile = await this.userRepository.findProfileById(userId);
    if (currentProfile?.avatar_url) {
      await deleteFromStorage(currentProfile.avatar_url);
    }

    const ext = getExtension(filename);
    const storageKey = `users/${userId}/avatar/${crypto.randomUUID()}.${ext}`;
    await uploadToStorage(storageKey, buffer, mimeType);

    const profile = await this.userRepository.updateAvatarUrl(
      userId,
      storageKey
    );
    if (!profile) return null;
    return enrichWithAvatarUrl(profile);
  }

  async deleteAvatar(userId: string) {
    const currentProfile = await this.userRepository.findProfileById(userId);
    if (currentProfile?.avatar_url) {
      await deleteFromStorage(currentProfile.avatar_url);
    }
    await this.userRepository.updateAvatarUrl(userId, null);
  }

  async updateRole(userId: string, role: string) {
    const validRoles = ["admin", "user"];
    if (!validRoles.includes(role)) throw new Error("INVALID_ROLE");

    const updated = await this.userRepository.updateRole(userId, role);
    if (!updated) throw new Error("USER_NOT_FOUND");
    return updated;
  }

  async listUsers() {
    return this.userRepository.findAll();
  }

  async adminResetPassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const hash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.updatePasswordHash(userId, hash);
  }

  async deleteUser(userId: string) {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) throw new Error("USER_NOT_FOUND");

    if (profile.avatar_url) {
      await deleteFromStorage(profile.avatar_url);
    }

    const deleted = await this.userRepository.deleteById(userId);
    if (!deleted) throw new Error("USER_NOT_FOUND");
  }

  async register(email: string, password: string, name?: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) return { alreadyExists: true };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create({ email, passwordHash, name });
    return { alreadyExists: false, user };
  }
}
