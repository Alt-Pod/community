export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  timezone: string;
  lang: string;
  created_at: string;
}
