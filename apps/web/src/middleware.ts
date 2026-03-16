import NextAuth from "next-auth";
import { authConfig } from "@community/backend";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api/auth|api/inngest|_next/static|_next/image|favicon.ico).*)"],
};
