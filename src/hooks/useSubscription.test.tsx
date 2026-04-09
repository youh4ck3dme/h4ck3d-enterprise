
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription } from './useSubscription';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock supabase client so we can control auth.getSession()
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
      },
      from: mockFrom,
    },
  };
});

// Import the mocked module so we can configure per-test behaviour
import { supabase } from '@/integrations/supabase/client';

describe('useSubscription Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    // getSession never resolves – we only check the sync initial state
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) // pending forever
    );

    const { result } = renderHook(() => useSubscription());
    expect(result.current.loading).toBe(true);
    expect(result.current.isPro).toBe(false);
  });

  it('should return isPro true if user has active subscription', async () => {
    // Mock authenticated session
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user_test_123', email: 'test@example.com' },
          access_token: 'test_token',
        },
      },
    });

    // Mock the supabase query chain: .from().select().eq().order().limit().maybeSingle()
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'sub_test_123',
        plan_id: 'price_123',
        status: 'active',
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
      },
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.isPro).toBe(true);
    expect(result.current.subscription?.status).toBe('active');
  });

  it('should return isPro false if user has no subscription', async () => {
    // Mock authenticated session
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user_test_123', email: 'test@example.com' },
          access_token: 'test_token',
        },
      },
    });

    // Return null (no subscription found)
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isPro).toBe(false);
    expect(result.current.subscription).toBe(null);
  });

  it('should return isPro false when user is not authenticated', async () => {
    // Mock no session
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isPro).toBe(false);
    expect(result.current.subscription).toBe(null);
  });
});
