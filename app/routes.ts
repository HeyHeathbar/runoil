import { type RouteConfig, index, route} from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("truths", "routes/truths._index.tsx"),
  route("truths/new", "routes/truths.new.tsx"),
  route("truths/:id", "routes/truths.$id.tsx"),
  route("cockpit", "routes/cockpit.tsx"),
  route("sessions", "routes/sessions._index.tsx"),
  route("sessions/new", "routes/sessions.new.tsx"),
  route("sessions/:id", "routes/sessions.$id.tsx"),
  route("settings/mcp", "routes/settings.mcp.tsx"),
  route("settings/ai", "routes/settings.ai.tsx"),
  route("admin", "routes/admin._index.tsx"),
  route("mcp", "routes/mcp.ts"),
] satisfies RouteConfig;
