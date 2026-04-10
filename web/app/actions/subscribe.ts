'use server'

type SubscribeResult = {
  success: boolean
  message: string
}

export async function subscribeEmail(
  _prevState: SubscribeResult,
  formData: FormData
): Promise<SubscribeResult> {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.includes('@')) {
    return { success: false, message: 'invalid email' }
  }

  // TODO: connect to email provider (Klaviyo, Mailchimp, etc.)
  return { success: true, message: 'subscribed' }
}
