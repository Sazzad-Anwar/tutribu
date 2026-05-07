import { useNavigate, useSearchParams } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ResetPasswordSchema, type ResetPasswordInput } from '@tutribu/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (!token) {
      toast.error(t('resetPassword.invalidToken'))
      navigate('/signin')
    }
  }, [token, navigate])

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      await authClient.resetPassword(values)
      toast.success(t('resetPassword.successMessage'))
      navigate('/signin')
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : t('resetPassword.somethingWentWrong'),
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center py-20 px-4 bg-[#F9FAFB]">
        <div className="w-full max-w-[500px] space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#E0E0E0]">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#473D3E]">
              {t('resetPassword.title')}
            </h1>
            <p className="text-[#7A7A7A]">{t('resetPassword.subtitle')}</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-6">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-base font-normal leading-[120%]">
                      {t('resetPassword.newPassword')}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="border focus-visible:border-brand rounded-[10px] border-brand px-6 py-5 h-14 text-lg placeholder:text-black/30 w-full placeholder:text-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-base font-normal leading-[120%]">
                      {t('resetPassword.confirmNewPassword')}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="border focus-visible:border-brand rounded-[10px] border-brand px-6 py-5 h-14 text-lg placeholder:text-black/30 w-full placeholder:text-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-14 bg-brand hover:bg-brand/90 text-white rounded-[10px] text-lg font-bold transition-all"
              >
                {form.formState.isSubmitting
                  ? t('resetPassword.resetting')
                  : t('resetPassword.resetButton')}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
