import { useEffect, useRef, useState } from 'react'
import isEmail from 'validator/lib/isEmail.js'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { InputField } from '@/components/form/InputField'
import { cn } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { getApiErrorMessage } from '@/utils/apiError'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'

type RequestError = {
  response?: {
    status?: number
    data?: { result?: { retryAfterSeconds?: unknown } }
  }
}

const forgotPasswordDefaultValues = {
  email: '',
} satisfies { email: string }

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { t } = useTranslation()
  const forgotPasswordMutation = useForgotPassword()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const inFlight = useRef(false)
  const [retryAfter, setRetryAfter] = useState(0)

  useEffect(() => {
    if (retryAfter <= 0) return
    const timer = window.setTimeout(
      () => setRetryAfter((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => window.clearTimeout(timer)
  }, [retryAfter])

  const emailError = (value: string) => {
    const email = value.trim()
    if (!email) return t('auth.validation.emailRequired')
    if (!isEmail(email)) return t('auth.validation.emailInvalid')
    return undefined
  }

  const form = useForm({
    defaultValues: forgotPasswordDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const error = emailError(value.email)
        return error ? { fields: { email: error } } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (inFlight.current || retryAfter > 0) return
      inFlight.current = true
      const email = value.email.trim().toLowerCase()

      try {
        await forgotPasswordMutation.mutateAsync({ email })
        setIsSubmitted(true)
      } catch (error) {
        const response =
          error && typeof error === 'object'
            ? (error as RequestError).response
            : undefined
        if (response?.status === 429) {
          const delay = response.data?.result?.retryAfterSeconds
          const seconds =
            typeof delay === 'number' && Number.isFinite(delay) && delay > 0
              ? Math.ceil(delay)
              : 60
          setRetryAfter(seconds)
        } else {
          toast.error(
            response?.status
              ? getApiErrorMessage(error, t('auth.forgotPasswordRequestFailed'))
              : t('auth.forgotPasswordRequestFailed'),
          )
        }
      } finally {
        inFlight.current = false
      }
    },
  })

  if (isSubmitted) {
    return (
      <div className="flex w-full flex-col gap-4 sm:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {t('auth.forgotPasswordSent')}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          {t('auth.forgotPasswordSentTo')}
        </div>

        <Button variant="primary" className="w-full font-semibold" asChild>
          <Link to="/login">
            <ArrowLeft className="h-5 w-5" />
            {t('auth.backToLogin')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      className={cn('flex w-full flex-col gap-4 sm:gap-6', className)}
      {...props}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t('auth.forgotPasswordTitle')}
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('auth.forgotPasswordDescription')}
        </p>
      </div>

      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => emailError(value),
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

        {retryAfter > 0 && (
          <p role="alert" className="text-sm text-red-600">
            {t('auth.forgotPasswordRateLimited', { seconds: retryAfter })}
          </p>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={
                !canSubmit ||
                isSubmitting ||
                forgotPasswordMutation.isPending ||
                retryAfter > 0
              }
            >
              <Send className="h-5 w-5" />
              {isSubmitting || forgotPasswordMutation.isPending
                ? t('auth.forgotPasswordSending')
                : retryAfter > 0
                  ? t('auth.forgotPasswordRetryIn', { seconds: retryAfter })
                  : t('auth.sendRequest')}
            </Button>
          )}
        </form.Subscribe>

        <div className="text-center text-sm text-gray-600">
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
