import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import i18n from '@/config/i18n'
import { authService } from '@/features/auth/services/authService'
import { toast } from '@/utils/toast'
import ForgotPasswordForm from './ForgotPasswordForm'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
vi.mock('@/features/auth/services/authService', () => ({
  authService: { forgotPassword: vi.fn() },
}))
vi.mock('@/utils/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

function setup(email = 'notregistered@example.com') {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <ForgotPasswordForm />
    </QueryClientProvider>,
  )
  const input = view.getByLabelText(/^Email/)
  fireEvent.change(input, { target: { value: email } })
  const submit = () => fireEvent.submit(view.container.querySelector('form')!)
  return { ...view, input, submit }
}

describe('forgot password requests', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    await i18n.changeLanguage('vi')
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message:
        'If this email is registered, you will receive a password reset link',
    })
  })
  afterEach(cleanup)

  it.each(['vi', 'en'])(
    'WA-05: shows a neutral localized confirmation for an unregistered email (%s)',
    async (language) => {
      await i18n.changeLanguage(language)
      const view = setup('  NotRegistered@Example.com  ')
      view.submit()

      await waitFor(() =>
        expect(
          view.getByText(
            i18n.t('auth.forgotPasswordSentTo', {
              email: 'notregistered@example.com',
            }),
          ),
        ).toBeTruthy(),
      )
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: 'notregistered@example.com',
      })
      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(
        view.queryByText(
          /Chúng tôi đã gửi liên kết|We sent a password reset link/,
        ),
      ).toBeNull()
      expect(view.container.querySelector('form')).toBeNull()
    },
  )

  it('keeps the form and reports an API error without claiming the email was sent', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue({
      response: {
        status: 503,
        data: { message: 'Password reset service unavailable' },
      },
    })
    const view = setup()
    view.submit()

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Password reset service unavailable',
      ),
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(view.container.querySelector('form')).not.toBeNull()
    expect((view.input as HTMLInputElement).value).toBe(
      'notregistered@example.com',
    )
  })

  it('uses an error fallback and allows retrying after an unexpected rejection', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValueOnce(undefined)
    const view = setup()
    view.submit()

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        i18n.t('auth.forgotPasswordRequestFailed'),
      ),
    )
    expect(toast.success).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(
        (
          view.getByRole('button', {
            name: i18n.t('auth.sendRequest'),
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    )
    view.submit()
    await waitFor(() =>
      expect(view.getByText(i18n.t('auth.forgotPasswordSentTo'))).toBeTruthy(),
    )
    expect(authService.forgotPassword).toHaveBeenCalledTimes(2)
  })

  it.each([
    '',
    '   ',
    'invalid',
    'a..b@example.com',
    'a@localhost',
    '@example.com',
    `${'a'.repeat(65)}@example.com`,
  ])(
    'rejects an empty or malformed email before calling the API (case %#)',
    async (email) => {
      const view = setup(email)
      view.submit()
      await waitFor(() =>
        expect(
          view.getByText(
            i18n.t(
              email.trim()
                ? 'auth.validation.emailInvalid'
                : 'auth.validation.emailRequired',
            ),
          ),
        ).toBeTruthy(),
      )
      expect(authService.forgotPassword).not.toHaveBeenCalled()
    },
  )

  it('blocks repeated submissions and shows loading while the request is pending', async () => {
    let complete!: (value: { message: string }) => void
    vi.mocked(authService.forgotPassword).mockReturnValue(
      new Promise((resolve) => {
        complete = resolve
      }),
    )
    const view = setup()
    view.submit()
    await waitFor(() =>
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1),
    )
    const sending = view.getByRole('button', {
      name: i18n.t('auth.forgotPasswordSending'),
    }) as HTMLButtonElement
    expect(sending.disabled).toBe(true)
    view.submit()
    view.submit()
    expect(authService.forgotPassword).toHaveBeenCalledTimes(1)
    await act(async () => {
      complete({ message: 'Request received' })
    })
    await waitFor(() =>
      expect(view.getByText(i18n.t('auth.forgotPasswordSentTo'))).toBeTruthy(),
    )
  })

  it('shows a localized network error and keeps the form available for retry', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(
      new Error('Network Error'),
    )
    const view = setup()
    view.submit()
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        i18n.t('auth.forgotPasswordRequestFailed'),
      ),
    )
    expect(view.container.querySelector('form')).not.toBeNull()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('honors the backend cooldown after rate limiting and allows retrying afterwards', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValueOnce({
      response: { status: 429, data: { result: { retryAfterSeconds: 1 } } },
    })
    const view = setup()
    view.submit()
    await waitFor(() =>
      expect(view.getByRole('alert').textContent).toBe(
        i18n.t('auth.forgotPasswordRateLimited', { seconds: 1 }),
      ),
    )
    expect(toast.error).not.toHaveBeenCalled()
    expect(
      (
        view.getByRole('button', {
          name: i18n.t('auth.forgotPasswordRetryIn', { seconds: 1 }),
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    view.submit()
    expect(authService.forgotPassword).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(view.queryByRole('alert')).toBeNull(), {
      timeout: 2000,
    })
    view.submit()
    await waitFor(() =>
      expect(view.getByText(i18n.t('auth.forgotPasswordSentTo'))).toBeTruthy(),
    )
    expect(authService.forgotPassword).toHaveBeenCalledTimes(2)
  })

  it.each([
    'USER@EXAMPLE.COM',
    'user+tag@example.com',
    'user!tag@example.com',
    'user%tag@example.com',
    'tên@example.com',
    '"user name"@example.com',
  ])('accepts a valid email supported by the backend: %s', async (email) => {
    const view = setup(email)
    view.submit()
    await waitFor(() =>
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: email.trim().toLowerCase(),
      }),
    )
    await waitFor(() =>
      expect(view.getByText(i18n.t('auth.forgotPasswordSentTo'))).toBeTruthy(),
    )
  })
})
