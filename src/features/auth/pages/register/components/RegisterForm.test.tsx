import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import i18n from '@/config/i18n'
import { authService } from '@/features/auth/services/authService'
import RegisterForm from './RegisterForm'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
vi.mock('@/features/auth/services/authService', () => ({
  authService: { register: vi.fn() },
}))
vi.mock('@/utils/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <RegisterForm />
    </QueryClientProvider>,
  )
  const fields = {
    name: view.getByLabelText(/^Họ và tên/),
    email: view.getByLabelText(/^Email/),
    phone: view.getByLabelText(/^Số điện thoại/),
    password: view.getByLabelText(/^Mật khẩu/),
    confirmation: view.getByLabelText(/^Nhập lại mật khẩu/),
  }
  const values = {
    name: 'Nguyễn Văn An',
    email: 'registration@example.com',
    phone: '0912345678',
    password: 'Secret123!',
    confirmation: 'Secret123!',
  }
  for (const key of Object.keys(fields) as Array<keyof typeof fields>) {
    fireEvent.change(fields[key], { target: { value: values[key] } })
  }
  const submit = () => fireEvent.submit(view.container.querySelector('form')!)
  return { ...view, fields, submit }
}

describe('registration validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('vi')
    vi.mocked(authService.register).mockResolvedValue({
      id: 'new-user',
      email: 'registration@example.com',
      status: 'pending',
      createdAt: '2026-10-08T00:00:00Z',
    })
  })
  afterEach(cleanup)

  it.each([
    ['123456', 'fullNameNoNumbers'],
    ['Nguyễn Văn An123', 'fullNameNoNumbers'],
    ['Nguyễn@ Văn An', 'fullNameInvalid'],
    ['Nguyễn 😊', 'fullNameInvalid'],
  ])(
    'rejects invalid full name %s before calling the API',
    async (name, errorKey) => {
      const view = setup()
      fireEvent.change(view.fields.name, { target: { value: name } })
      view.submit()

      await waitFor(() =>
        expect(
          view.getByText(i18n.t(`auth.validation.${errorKey}`)),
        ).toBeTruthy(),
      )
      expect(view.fields.name.getAttribute('aria-invalid')).toBe('true')
      expect(authService.register).not.toHaveBeenCalled()
    },
  )

  it.each(['', '    ', '\t\u00a0'])(
    'keeps the required-name error for an empty normalized name (case %#)',
    async (name) => {
      const view = setup()
      fireEvent.change(view.fields.name, { target: { value: name } })
      view.submit()

      await waitFor(() =>
        expect(
          view.getByText(i18n.t('auth.validation.fullNameRequired')),
        ).toBeTruthy(),
      )
      expect(authService.register).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['A', 'fullNameMinLength'],
    [' \tA\u00a0', 'fullNameMinLength'],
    ['a\u0301', 'fullNameMinLength'],
    ['t\u0301', 'fullNameMinLength'],
    ['𐐀', 'fullNameMinLength'],
    ['A'.repeat(101), 'fullNameMaxLength'],
    ['A'.repeat(255), 'fullNameMaxLength'],
    ['A'.repeat(1000), 'fullNameMaxLength'],
  ])(
    'rejects names outside 2–100 characters (case %#)',
    async (name, errorKey) => {
      const view = setup()
      fireEvent.change(view.fields.name, { target: { value: name } })
      view.submit()

      await waitFor(() =>
        expect(
          view.getByText(
            i18n.t(`auth.validation.${errorKey}`, { min: 2, max: 100 }),
          ),
        ).toBeTruthy(),
      )
      expect(view.fields.name.getAttribute('aria-invalid')).toBe('true')
      expect(authService.register).not.toHaveBeenCalled()
    },
  )

  it.each([
    'An',
    'A'.repeat(99),
    'A'.repeat(100),
    'a\u0301'.repeat(100),
    't\u0301'.repeat(100),
    '𐐀'.repeat(100),
    '   An   ',
    `${'A'.repeat(98)}   B`,
  ])(
    'accepts names with 2–100 normalized visible characters (case %#)',
    async (name) => {
      const view = setup()
      fireEvent.change(view.fields.name, { target: { value: name } })
      view.submit()

      await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1))
      expect(view.fields.name.getAttribute('aria-invalid')).toBe('false')
    },
  )

  it.each(['+16501234567', '+8613812345678', '0123456789', '091234567'])(
    'rejects a foreign or malformed phone number %s',
    async (phone) => {
      const view = setup()
      fireEvent.change(view.fields.phone, { target: { value: phone } })
      view.submit()

      await waitFor(() =>
        expect(
          view.getByText(i18n.t('auth.validation.phoneInvalid')),
        ).toBeTruthy(),
      )
      expect(authService.register).not.toHaveBeenCalled()
    },
  )

  it.each(['0912 345 678', '+84912345678', '84912345678'])(
    'accepts accented names and normalizes Vietnamese phone %s',
    async (phone) => {
      const view = setup()
      fireEvent.change(view.fields.name, {
        target: { value: ' Nguyễn Văn An '.normalize('NFD') },
      })
      fireEvent.change(view.fields.phone, { target: { value: phone } })
      view.submit()

      await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1))
      expect(authService.register).toHaveBeenCalledWith({
        userLogin: 'registration@example.com',
        displayName: 'Nguyễn Văn An'.normalize('NFD'),
        userEmail: 'registration@example.com',
        userPhone: '+84912345678',
        userPass: 'Secret123!',
        confirm_password: 'Secret123!',
      })
      expect(navigate).toHaveBeenCalledWith({
        to: '/verify-email',
        search: { email: 'registration@example.com' },
        replace: true,
      })
    },
  )

  it.each([
    '  Nguyễn   Vũ  Minh   Toan  ',
    '\tNguyễn\u00a0 Vũ\t Minh Toan\u00a0',
  ])('normalizes name spacing after leaving the input: %s', async (name) => {
    const view = setup()
    fireEvent.change(view.fields.name, { target: { value: name } })
    expect((view.fields.name as HTMLInputElement).value).toBe(name)
    fireEvent.blur(view.fields.name)

    await waitFor(() =>
      expect((view.fields.name as HTMLInputElement).value).toBe(
        'Nguyễn Vũ Minh Toan',
      ),
    )
    expect(view.fields.name.getAttribute('aria-invalid')).toBe('false')
  })

  it('sends a normalized name even when submitting without blurring', async () => {
    const view = setup()
    fireEvent.change(view.fields.name, {
      target: { value: '  Nguyễn   Vũ  Minh   Toan  ' },
    })
    view.submit()

    await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1))
    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'Nguyễn Vũ Minh Toan' }),
    )
  })

  it('allows one space for the next word and blocks repeated spaces', () => {
    const view = setup()
    const input = view.fields.name as HTMLInputElement
    const name = 'Nguyễn Vũ Minh Toan'
    fireEvent.change(input, { target: { value: name } })
    input.setSelectionRange(name.length, name.length)
    expect(fireEvent.keyDown(input, { key: ' ' })).toBe(true)

    fireEvent.change(input, { target: { value: `${name} ` } })
    input.setSelectionRange(input.value.length, input.value.length)
    for (let index = 0; index < 5; index += 1) {
      expect(fireEvent.keyDown(input, { key: ' ' })).toBe(false)
    }

    fireEvent.change(input, { target: { value: `${name} Anh` } })
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.value).toBe('Nguyễn Vũ Minh Toan Anh')
  })

  it.each([0, 6, 7])(
    'blocks extra spaces at name caret position %s',
    (position) => {
      const view = setup()
      const input = view.fields.name as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Nguyễn Vũ' } })
      input.setSelectionRange(position, position)

      expect(fireEvent.keyDown(input, { key: ' ' })).toBe(false)
    },
  )

  it('allows Vietnamese input composition and keyboard shortcuts to handle Space', () => {
    const view = setup()
    const input = view.fields.name as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Nguyễn ' } })
    input.setSelectionRange(input.value.length, input.value.length)

    expect(fireEvent.keyDown(input, { key: ' ', isComposing: true })).toBe(true)
    expect(fireEvent.keyDown(input, { key: ' ', ctrlKey: true })).toBe(true)
  })

  it.each([
    ['Toan', 'Toan.', 'Toan'],
    ['Toan ', 'Toan. ', 'Toan '],
    ['Nguyễn Vũ Minh Toan ', 'Nguyễn Vũ Minh Toan. ', 'Nguyễn Vũ Minh Toan '],
  ])(
    'removes a keyboard period replacement without a Space keydown: %s',
    async (before, replacement, expected) => {
      const view = setup()
      const input = view.fields.name as HTMLInputElement
      fireEvent.change(input, { target: { value: before } })
      fireEvent.input(input, {
        target: { value: replacement },
        inputType: 'insertReplacementText',
        data: '. ',
      })

      expect(input.value).toBe(expected)
      expect(input.getAttribute('aria-invalid')).toBe('false')
      fireEvent.blur(input)
      view.submit()

      await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1))
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: expected.trim() }),
      )
    },
  )

  it('preserves Vietnamese composition before removing punctuation from committed text', () => {
    const view = setup()
    const input = view.fields.name as HTMLInputElement
    fireEvent.compositionStart(input)
    fireEvent.input(input, {
      target: { value: 'Toa.' },
      isComposing: true,
    })
    expect(input.value).toBe('Toa.')

    fireEvent.input(input, {
      target: { value: 'Toạ' },
      isComposing: true,
    })
    fireEvent.compositionEnd(input, { data: 'ạ' })
    expect(input.value).toBe('Toạ')
    expect(input.getAttribute('aria-invalid')).toBe('false')

    fireEvent.compositionStart(input)
    fireEvent.input(input, {
      target: { value: 'Toan.' },
      isComposing: true,
    })
    fireEvent.compositionEnd(input, { data: '.' })
    expect(input.value).toBe('Toan')
    expect(input.getAttribute('aria-invalid')).toBe('false')
  })

  it.each([' Secret123!', 'Secret 123!', 'Secret123! ', 'Secret\u00a0123!'])(
    'rejects whitespace in a password even if both password fields match: %s',
    async (password) => {
      const view = setup()
      fireEvent.change(view.fields.password, { target: { value: password } })
      fireEvent.change(view.fields.confirmation, {
        target: { value: password },
      })
      view.submit()

      await waitFor(() =>
        expect(
          view.getAllByText(i18n.t('auth.validation.passwordNoWhitespace')),
        ).toHaveLength(2),
      )
      expect(authService.register).not.toHaveBeenCalled()
    },
  )

  it.each(['password', 'confirmation'] as const)(
    'blocks pasting whitespace into %s and explains the error',
    async (fieldName) => {
      const view = setup()
      const accepted = fireEvent.paste(view.fields[fieldName], {
        clipboardData: { getData: () => 'Secret\n123!' },
      })

      expect(accepted).toBe(false)
      expect((view.fields[fieldName] as HTMLInputElement).value).toBe(
        'Secret123!',
      )
      await waitFor(() =>
        expect(
          view.getByText(i18n.t('auth.validation.passwordNoWhitespace')),
        ).toBeTruthy(),
      )
    },
  )

  it('revalidates confirmation when the password changes', async () => {
    const view = setup()
    fireEvent.change(view.fields.password, {
      target: { value: 'NewSecret123!' },
    })

    await waitFor(() =>
      expect(
        view.getByText(i18n.t('auth.validation.passwordMismatch')),
      ).toBeTruthy(),
    )
    view.submit()
    await waitFor(() =>
      expect(view.getByText(i18n.t('auth.registerInvalidForm'))).toBeTruthy(),
    )
    expect(authService.register).not.toHaveBeenCalled()
  })
})
