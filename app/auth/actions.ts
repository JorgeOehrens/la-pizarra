'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const username = (formData.get('username') as string).toLowerCase().trim()
  const displayName = (formData.get('display_name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string | null)?.trim() || null

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: 'El usuario debe tener 3-20 caracteres (letras, números, _)' }
  }

  const internalEmail = `${username}@lapizarra.app`

  const { data, error } = await supabase.auth.signUp({
    email: internalEmail,
    password,
    options: {
      data: {
        username,
        display_name: displayName || username,
        real_email: email,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Ese nombre de usuario ya está en uso' }
    }
    return { error: error.message }
  }

  if (!data.session) {
    return { error: 'CONFIRM_EMAIL' }
  }

  // If coming from an invite link, go there; otherwise go to onboarding hub
  redirect(redirectTo || '/onboarding')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const username = (formData.get('username') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string | null)?.trim() || null

  const internalEmail = `${username}@lapizarra.app`

  const { error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password,
  })

  if (error) {
    return { error: 'Usuario o contraseña incorrectos' }
  }

  redirect(redirectTo || '/home')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
