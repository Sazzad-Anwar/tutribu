import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { SignInSchema } from '@tutribu/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../components/ui/field'
import { useAuth } from '../context/auth-context'

export default function SignInPage() {
  const navigate = useNavigate()
  const { isAuthenticated, checkAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setIsLoading(true)

    try {
      await authClient.signIn(data)
      toast.success('Signed in successfully')
      await checkAuth()
      navigate('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  return (
    <section
      className="h-screen object-fill"
      style={{
        backgroundImage: "url('/images/auth-bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <Card className="pt-5 md:pb-32 px-2 md:px-20 w-full md:w-[600px] bg-white md:rounded-[20px]">
          <CardHeader>
            <CardTitle className="mb-5 md:mb-10 flex justify-center items-center">
              <Link to="/">
                <img
                  src="/images/logo.svg"
                  alt="Logo"
                  className="h-16 w-[182px]"
                />
              </Link>
            </CardTitle>
            <CardDescription className="font-medium text-2xl text-primary text-center">
              Sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4 md:py-8 w-full">
            <form
              id="signin-form"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FieldGroup className="space-y-5">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="mb-0">
                      <FieldLabel
                        className="text-base font-normal leading-[120%]"
                        htmlFor="email"
                      >
                        Email
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your email address"
                        autoComplete="off"
                        className="border focus-visible:border-brand rounded-[10px] border-brand px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="mb-0 w-full">
                      <FieldLabel
                        htmlFor="password"
                        className="text-base font-normal leading-[120%]"
                      >
                        Password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          aria-invalid={fieldState.invalid}
                          placeholder="Password"
                          autoComplete="off"
                          className="border focus-visible:border-brand rounded-[10px] border-brand px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
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
                      <div className="flex justify-end">
                        <Link
                          to="/forgot-password"
                          className="hover:underline text-[#9A9AB0] font-medium text-base leading-[120%]"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </Field>
                  )}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-brand py-3.5 rounded-[10px] font-bold text-base leading-[120%]"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                  <span className="text-xs text-center text-[#9A9AB0]">Or</span>
                  <Button
                    type="button"
                    className="w-full h-12 border-2 hover:bg-brand hover:text-white bg-transparent text-brand border-brand py-3.5 rounded-[10px] font-bold text-base leading-[120%]"
                  >
                    Continue with Google
                  </Button>
                </div>
              </FieldGroup>
            </form>
            <p className="text-center text-base font-normal text-[#9A9AB0] leading-[120%] mt-10">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-brand font-bold text-base ml-2 hover:underline"
              >
                Sign up now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
