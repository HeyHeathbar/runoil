// RunOil access layers (spec B12 / Appendix B):
//
// 1. Platform layer — the RunOil super admin (you), operating ABOVE any tenant.
//    Not a Clerk org role; designated by a flag on the Clerk user's
//    publicMetadata.platformAdmin. Enforced server-side.
// 2. Per-org layer — Clerk Organization roles (champion = org:admin, member =
//    org:member; custom roles for staff/partner/auditor come later).

export function isPlatformAdmin(publicMetadata: unknown): boolean {
  return (
    typeof publicMetadata === "object" &&
    publicMetadata !== null &&
    (publicMetadata as Record<string, unknown>).platformAdmin === true
  );
}
