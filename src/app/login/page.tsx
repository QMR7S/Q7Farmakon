import AuthForm from "@/components/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { login } from "./actions";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} configured={isSupabaseConfigured()} />;
}
