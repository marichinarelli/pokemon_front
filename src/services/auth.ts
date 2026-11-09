import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppUser } from '../types'

function toAppUser(user: User): AppUser {
  return { id: user.id, email: user.email ?? '' }
}

export async function signUp(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error || !data.user) {
    if (error?.message.toLowerCase().includes('already registered')) {
      throw new Error('Este email já está cadastrado')
    }
    throw new Error('Não foi possível criar a conta')
  }
  return toAppUser(data.user)
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) throw new Error('Email ou senha inválidos')
  return toAppUser(data.user)
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ? toAppUser(data.session.user) : null
}

export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAppUser(session.user) : null)
  })
  return () => data.subscription.unsubscribe()
}
