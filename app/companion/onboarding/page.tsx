import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// The real application lives at /become-companion; this old placeholder
// page saved nothing, so send people to the right place instead.
export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/become-companion')

  const { data: cp } = await supabase
    .from('companion_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  redirect(cp ? '/companion' : '/become-companion')
}
