import { SignIn } from "@clerk/nextjs";
import { authTheme } from "@/lib/auth-theme";

export default function SignInPage() {
  return <SignIn appearance={authTheme} />;
}
