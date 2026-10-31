import AuthForm from "@/components/AuthForm";
import { signup } from "../login/actions";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
