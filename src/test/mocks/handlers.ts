
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase subscription fetch
  http.get('*/rest/v1/subscriptions*', () => {
    return HttpResponse.json([
      {
        id: 'sub_test_123',
        plan_id: 'price_123', // Free or Pro ID
        status: 'active',
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
      }
    ])
  }),

  // Mock Stripe create-checkout
  http.post('*/functions/v1/payments/subscription/create', () => {
    return HttpResponse.json({
      url: 'https://checkout.stripe.com/test_url'
    })
  }),

  // Mock Supabase Auth
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'user_test_123',
      email: 'test@example.com',
    })
  }),
]
