import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  OrganizationSwitcher,
} from "@clerk/react-router";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/logo";

// App shell header. Everything in RunOil is org-scoped (a tenant = a Clerk
// Organization), so signed-in users always act within an org.
export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link to="/" aria-label="RunOil home">
        <Logo />
      </Link>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Sign up</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            to="/sessions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Guide
          </Link>
          <Link
            to="/truths"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Corpus
          </Link>
          <Link
            to="/settings/ai"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            AI
          </Link>
          <Link
            to="/settings/mcp"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Connect
          </Link>
          <OrganizationSwitcher hidePersonal />
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
