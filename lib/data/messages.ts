'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function fetchOrCreateConversation(
  customerProfileId: string,
  companionProfileId: string
): Promise<string | null> {
  const supabase = await createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('customer_profile_id', customerProfileId)
    .eq('companion_profile_id', companionProfileId)
    .maybeSingle()

  if (existing) return existing.id

  // `conversations` has no booking_id column.
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      customer_profile_id: customerProfileId,
      companion_profile_id: companionProfileId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('fetchOrCreateConversation error:', error.message)
    return null
  }
  return data.id
}

export async function fetchMessages(conversationId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return []
  return data ?? []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const trimmed = content.trim()
  if (!trimmed) return null

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content: trimmed })
    .select()
    .single()

  if (error) {
    console.error('sendMessage error:', error.message)
    return null
  }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

export async function fetchUserConversations(profileId: string) {
  const supabase = await createServerSupabaseClient()

  // `conversations.companion_profile_id` references companion_profiles.id,
  // not profiles.id — resolve the companion row for this user (if any).
  const { data: cp } = await supabase
    .from('companion_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle()

  const filter = cp
    ? `customer_profile_id.eq.${profileId},companion_profile_id.eq.${cp.id}`
    : `customer_profile_id.eq.${profileId}`

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      customer_profile_id,
      companion_profile_id,
      last_message_at,
      messages(content, created_at, sender_id)
    `)
    .or(filter)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) return []
  return data ?? []
}
