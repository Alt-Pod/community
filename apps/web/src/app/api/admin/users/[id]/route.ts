import { auth, userService } from "@community/backend";
import { USER_ROLES } from "@community/shared";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== USER_ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    password?: string;
    role?: string;
    timezone?: string;
    lang?: string;
  };

  // Update preferences (timezone / lang)
  if (body.timezone !== undefined || body.lang !== undefined) {
    try {
      const updated = await userService.updateProfile(id, {
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.lang !== undefined && { lang: body.lang }),
      });
      if (!updated) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
      return Response.json(updated);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_TIMEZONE") {
        return Response.json({ error: "Invalid timezone" }, { status: 400 });
      }
      if (err instanceof Error && err.message === "INVALID_LANG") {
        return Response.json({ error: "Invalid language" }, { status: 400 });
      }
      throw err;
    }
  }

  // Update role
  if (body.role) {
    if (id === session.user.id) {
      return Response.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }
    try {
      const updated = await userService.updateRole(id, body.role);
      return Response.json(updated);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_ROLE") {
        return Response.json({ error: "Invalid role" }, { status: 400 });
      }
      if (err instanceof Error && err.message === "USER_NOT_FOUND") {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
      throw err;
    }
  }

  // Reset password
  if (!body.password || body.password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    await userService.adminResetPassword(id, body.password);
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== USER_ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return Response.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    await userService.deleteUser(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    throw err;
  }
}
