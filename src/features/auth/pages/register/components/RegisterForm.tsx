import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { InputField } from '@/components/form/InputField'
import { InputFieldPassword } from '@/components/form/InputFieldPassword'
import { useCreateRegister } from '@/features/auth/hooks/useAuth'
import type { RegisterRequest } from '@/features/auth/types/auth'
import { preventSpaceInput } from '@/utils/format'
import { isValidPhoneNumberVN, normalizePhoneForVN } from '@/utils/phone'
import { cn } from '@/utils/utils'
import { getApiErrorMessage } from '@/utils/apiError'
import { toast } from '@/utils/toast'
import { Loader2, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react'

const registerDefaultValues = {
  displayName: '',
  userEmail: '',
  userLogin: '',
  userPhone: '',
  userPass: '',
  confirm_password: '',
} satisfies RegisterRequest

const fullNameLimits = { min: 2, max: 100 }
const fullNameSegmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' })

function sanitizeFullNameInput(value: string) {
  return value.replace(/\./gu, '')
}

function normalizeFullName(value: string) {
  return sanitizeFullNameInput(value).trim().replace(/\s+/gu, ' ')
}

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const registerMutation = useCreateRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const isNameComposing = useRef(false)

  const validateFullName = (value: string) => {
    const name = normalizeFullName(value).normalize('NFC')
    if (!name) return t('auth.validation.fullNameRequired')
    if (/\p{N}/u.test(name)) return t('auth.validation.fullNameNoNumbers')
    if (!/^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u.test(name))
      return t('auth.validation.fullNameInvalid')
    const length = Array.from(fullNameSegmenter.segment(name)).length
    if (length < fullNameLimits.min)
      return t('auth.validation.fullNameMinLength', { min: fullNameLimits.min })
    if (length > fullNameLimits.max)
      return t('auth.validation.fullNameMaxLength', { max: fullNameLimits.max })
    return undefined
  }

  const validateEmail = (value: string) => {
    if (!value.trim()) return t('auth.validation.emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return t('auth.validation.emailInvalid')
    return undefined
  }

  const validatePhone = (value: string) => {
    if (!value.trim()) return t('auth.validation.phoneRequired')
    if (!isValidPhoneNumberVN(value)) return t('auth.validation.phoneInvalid')
    return undefined
  }

  const validatePassword = (value: string) => {
    if (!value) return t('auth.validation.passwordRequired')
    if (/\s/u.test(value)) return t('auth.validation.passwordNoWhitespace')
    if (value.length < 6) return t('auth.validation.passwordMinLength')
    return undefined
  }

  const validateConfirmation = (value: string, password: string) => {
    if (!value) return t('auth.validation.confirmPasswordRequired')
    if (/\s/u.test(value)) return t('auth.validation.passwordNoWhitespace')
    if (value !== password) return t('auth.validation.passwordMismatch')
    return undefined
  }

  const form = useForm({
    defaultValues: registerDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const fields = {
          displayName: validateFullName(value.displayName),
          userEmail: validateEmail(value.userEmail),
          userPhone: validatePhone(value.userPhone),
          userPass: validatePassword(value.userPass),
          confirm_password: validateConfirmation(
            value.confirm_password,
            value.userPass,
          ),
        }
        return Object.values(fields).some(Boolean) ? { fields } : undefined
      },
    },
    onSubmitInvalid: () => {
      setSubmitError(t('auth.registerInvalidForm'))
      toast.error(t('auth.registerInvalidForm'))
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError('')
        const user = await registerMutation.mutateAsync({
          userLogin: value.userEmail.trim(),
          displayName: normalizeFullName(value.displayName),
          userEmail: value.userEmail.trim(),
          userPhone: normalizePhoneForVN(value.userPhone.trim()),
          userPass: value.userPass,
          confirm_password: value.confirm_password,
        })

        toast.success(t('auth.registerSuccess'))
        navigate({
          to: '/verify-email',
          search: {
            email: user.email,
          },
          replace: true,
        })
      } catch (error) {
        const message = getApiErrorMessage(error, t('auth.registerInvalidForm'))
        setSubmitError(message)
        toast.error(message)
      }
    },
  })

  return (
    <form
      className={cn('flex w-full flex-col gap-4 sm:gap-6', className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t('auth.registerTitle')}
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('auth.registerDescription')}
        </p>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
        >
          {submitError}
        </div>
      ) : null}

      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field
          name="displayName"
          validators={{
            onChange: ({ value }) => validateFullName(value),
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.fullName')}
              required
              id={field.name}
              type="text"
              variant="default"
              value={field.state.value}
              onChange={(event) => {
                field.handleChange(
                  isNameComposing.current
                    ? event.target.value
                    : sanitizeFullNameInput(event.target.value),
                )
              }}
              onCompositionStart={() => {
                isNameComposing.current = true
              }}
              onCompositionEnd={(event) => {
                isNameComposing.current = false
                field.handleChange(
                  sanitizeFullNameInput(event.currentTarget.value),
                )
              }}
              onKeyDown={(event) => {
                if (
                  event.key !== ' ' ||
                  event.nativeEvent.isComposing ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.altKey
                )
                  return

                const { value, selectionStart, selectionEnd } =
                  event.currentTarget
                if (selectionStart === null || selectionEnd === null) return
                if (
                  selectionStart === 0 ||
                  /\s/u.test(value.charAt(selectionStart - 1)) ||
                  /\s/u.test(value.charAt(selectionEnd))
                )
                  event.preventDefault()
              }}
              onBlur={() => {
                isNameComposing.current = false
                field.handleChange(normalizeFullName(field.state.value))
                field.handleBlur()
              }}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.fullName')}
              autoComplete="name"
              autoCorrect="off"
              spellCheck={false}
              startIcon={<User className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userEmail"
          validators={{
            onChange: ({ value }) => validateEmail(value),
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.email')}
              required
              id={field.name}
              type="email"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.enterEmail')}
              autoComplete="email"
              startIcon={<Mail className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userPhone"
          validators={{
            onChange: ({ value }) => validatePhone(value),
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.phoneNumber')}
              required
              id={field.name}
              type="tel"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.phoneNumber')}
              autoComplete="tel"
              startIcon={<Phone className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userPass"
          validators={{
            onChange: ({ value }) => validatePassword(value),
          }}
        >
          {(field) => (
            <InputFieldPassword
              label={t('auth.password')}
              required
              id={field.name}
              type={showPassword ? 'text' : 'password'}
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.enterPassword')}
              autoComplete="new-password"
              onKeyDown={preventSpaceInput}
              onPaste={(event) => {
                if (/\s/u.test(event.clipboardData.getData('text'))) {
                  event.preventDefault()
                  field.setErrorMap({
                    onChange: t('auth.validation.passwordNoWhitespace'),
                  })
                }
              }}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              startIcon={<Lock className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="confirm_password"
          validators={{
            onChangeListenTo: ['userPass'],
            onChange: ({ value, fieldApi }) =>
              validateConfirmation(
                value,
                fieldApi.form.getFieldValue('userPass'),
              ),
          }}
        >
          {(field) => (
            <InputFieldPassword
              label={t('auth.confirmPasswordLabel')}
              required
              id={field.name}
              type={showConfirmPassword ? 'text' : 'password'}
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              onKeyDown={preventSpaceInput}
              onPaste={(event) => {
                if (/\s/u.test(event.clipboardData.getData('text'))) {
                  event.preventDefault()
                  field.setErrorMap({
                    onChange: t('auth.validation.passwordNoWhitespace'),
                  })
                }
              }}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              startIcon={<Lock className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([, isSubmitting]) => {
            const isLoading = isSubmitting || registerMutation.isPending
            return (
              <Button
                type="submit"
                variant="primary"
                className="w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('auth.registerSigningUp')}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    {t('auth.signUp')}
                  </>
                )}
              </Button>
            )
          }}
        </form.Subscribe>

        <div className="pt-0.5 text-center text-xs text-slate-500 sm:pt-2 sm:text-sm">
          {t('auth.registerPrompt')}{' '}
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/login">{t('auth.login')}</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
