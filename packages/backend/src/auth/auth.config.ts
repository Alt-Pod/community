import type { NextAuthConfig } from "next-auth";
import { USER_ROLES } from "@community/shared";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = ["/login", "/register"].includes(nextUrl.pathname);

      if (isPublic) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      // Admin-only routes
      if (nextUrl.pathname.startsWith("/billing")) {
        const role = auth?.user?.role;
        if (role !== USER_ROLES.ADMIN) {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as string) ?? USER_ROLES.USER;
      return session;
    },
  },
};
