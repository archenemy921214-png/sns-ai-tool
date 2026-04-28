'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[loginAction] error:', error.status, error.message)
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signupAction(
  name: string,
  email: string,
  password: string
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { error: '' }
}
