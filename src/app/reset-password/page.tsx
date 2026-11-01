import { updatePassword } from "./actions";
import ResetPasswordScreen from "@/components/ResetPasswordScreen";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export default function ResetPasswordPage(){
 return <ResetPasswordScreen action={updatePassword} configured={isSupabaseConfigured()}/>;
}
