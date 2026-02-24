import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@tutribu/types'
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

export default function ForgotPassword() {
  const navigate = useNavigate()
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      await authClient.forgotPassword(values)
      toast.success('Reset link sent to your email!')
      navigate('/signin')
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong',
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
              Forgot Password
            </h1>
            <p className="text-[#7A7A7A]">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-base font-normal leading-[120%]">
                      Email Address
                    </FieldLabel>
                    <Input
                      placeholder="john@example.com"
                      className="border focus-visible:border-brand rounded-[10px] border-brand px-6 py-5 h-14 text-lg placeholder:text-black/30 w-full placeholder:text-lg"
                      {...field}
                    />
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
                {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="text-brand text-lg font-medium"
                >
                  Back to Login
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
