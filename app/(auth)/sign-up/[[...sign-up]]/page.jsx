import { SignUp } from "@clerk/nextjs";
import { authTheme } from "@/lib/auth-theme";

export default function SignUpPage() {
  return <SignUp appearance={authTheme} />;
}
