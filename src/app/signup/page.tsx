import AuthForm from "@/components/AuthForm";\nimport { isSupabaseConfigured } from "@/lib/supabase/config";
import { signup } from "../login/actions";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} configured={isSupabaseConfigured()} />;
}
