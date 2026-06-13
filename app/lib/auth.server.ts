import { getAuth, clerkClient } from "@clerk/react-router/server";
import { redirect } from "react-router";
import type { Actor, Role } from "./corpus/truth";
import { isPlatformAdmin } from "./rbac";

type AuthArgs = Parameters<typeof getAuth>[0];

export interface Session {
  userId: string;
  orgId: string;
  role: Role;
}

// Resolve the signed-in user and their active organization (the tenant).
// orgId and role come ONLY from server-side auth — never from client input.
// No user -> sign-in; no active org -> home with a prompt to pick/create one.
export async function requireSession(args: AuthArgs): Promise<Session> {
  const { userId, orgId, orgRole } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");
  if (!orgId) throw redirect("/?needs-org=1");
  const role: Role = orgRole === "org:admin" ? "admin" : "member";
  return { userId, orgId, role };
}

// Platform (super-admin) gate — operates ABOVE any org. Designated by a flag
// on the Clerk user, enforced server-side. No user -> sign-in; not a platform
// admin -> bounced home.
export async function requirePlatformAdmin(
  args: AuthArgs,
): Promise<{ userId: string }> {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");
  const user = await clerkClient(args).users.getUser(userId);
  if (!isPlatformAdmin(user.publicMetadata)) throw redirect("/");
  return { userId };
}

// The git commit author for the audit trail, resolved from the Clerk user.
export async function resolveActor(
  args: AuthArgs,
  userId: string,
): Promise<Actor> {
  const user = await clerkClient(args).users.getUser(userId);
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    userId;
  const email =
    user.primaryEmailAddress?.emailAddress ?? `${userId}@users.clerk`;
  return { name, email };
}
