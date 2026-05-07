import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { SignUpSchema } from "@tutribu/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/auth-context";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        await authClient.signInWithGoogle(tokenResponse.access_token);
        toast.success(t("signup.googleSuccess"));
        navigate("/");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("signup.googleSignInFailed"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error(t("signup.googleFailed"));
    },
  });

  const handleSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    try {
      setIsLoading(true);
      await authClient.signUp(data);
      toast.success(t("signup.accountCreated"));
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("signup.accountCreationFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <section
      className="h-screen object-fill"
      style={{
        backgroundImage: "url('/images/auth-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center justify-center h-full my-20 xl:my-0">
        <Card className="pt-5 md:pb-10 px-2 md:px-5 w-full md:w-150 bg-white md:rounded-4xl">
          <CardHeader>
            <CardTitle className="mb-5 md:mb-7 flex justify-center items-center">
              <Link to="/">
                <img
                  src="/images/logo.svg"
                  alt="Logo"
                  className="h-16 w-45.5"
                />
              </Link>
            </CardTitle>
            <CardDescription className="space-y-7">
              <h1 className="font-medium text-2xl text-primary text-center">
                {t("signup.title")}
              </h1>
              <Button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full h-12 shadow-sm border-2 hover:bg-brand hover:text-white hover:border-brand bg-[#F5F5F5] text-brand border-[#00000033] py-3.5 rounded-[10px] font-bold text-base leading-[120%]"
              >
                {t("signup.continueWithGoogle")}
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-px w-[25%] md:w-[32%] bg-[#00000033]"></div>
                <span className="text-sm text-[#00000033] w-[50%] md:w-[36%] text-center">
                  {t("signup.orSignUpWithEmail")}
                </span>
                <div className="h-px w-[25%] md:w-[32%] bg-[#00000033]"></div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4 w-full">
            <form id="signin-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup className="space-y-5">
                <div className="flex flex-col md:flex-row gap-5 mb-0">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="mb-0">
                        <FieldLabel
                          className="text-base leading-[120%] font-semibold"
                          htmlFor="first_name"
                        >
                          {t("signup.firstName")}
                        </FieldLabel>
                        <Input
                          id="first_name"
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder={t("signup.firstNamePlaceholder")}
                          autoComplete="off"
                          className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                          {...field}
                          value={field.value || ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="mb-0">
                        <FieldLabel
                          className="text-base leading-[120%] font-semibold"
                          htmlFor="last_name"
                        >
                          {t("signup.lastName")}
                        </FieldLabel>
                        <Input
                          id="last_name"
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder={t("signup.lastNamePlaceholder")}
                          autoComplete="off"
                          className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                          {...field}
                          value={field.value || ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="phoneNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="mb-0">
                      <FieldLabel
                        className="text-base leading-[120%] font-semibold"
                        htmlFor="phone_number"
                      >
                        {t("signup.phoneNumber")}
                      </FieldLabel>
                      <Input
                        id="phone_number"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder={t("signup.phoneNumberPlaceholder")}
                        autoComplete="off"
                        className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                        {...field}
                        value={field.value || ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="mb-0">
                      <FieldLabel
                        className="text-base leading-[120%] font-semibold"
                        htmlFor="email"
                      >
                        {t("signup.emailAddress")}
                      </FieldLabel>
                      <Input
                        id="email"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder={t("signup.emailAddressPlaceholder")}
                        autoComplete="off"
                        className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                        {...field}
                        value={field.value || ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="mb-0 w-full">
                        <div className="flex justify-between items-center">
                          <FieldLabel
                            htmlFor="password"
                            className="text-base leading-[120%] font-semibold"
                          >
                            {t("signup.password")}
                          </FieldLabel>
                        </div>

                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            aria-invalid={fieldState.invalid}
                            placeholder={t("signup.passwordPlaceholder")}
                            autoComplete="off"
                            className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                            {...field}
                            value={field.value || ""}
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
                      <Field className="mb-0 w-full">
                        <div className="flex justify-between items-center">
                          <FieldLabel
                            htmlFor="confirmPassword"
                            className="text-base leading-[120%] font-semibold"
                          >
                            {t("signup.confirmPassword")}
                          </FieldLabel>
                        </div>

                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            aria-invalid={fieldState.invalid}
                            placeholder="Password"
                            autoComplete="off"
                            className="border focus-visible:border-[#C1C1C1] rounded-[10px] border-[#C1C1C1] px-6 py-5 h-14 text-lg  placeholder:text-black/30 w-full placeholder:text-lg"
                            {...field}
                            value={field.value || ""}
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
                </div>

                <div className="flex items-center space-x-2 mb-0">
                  <Checkbox
                    className="size-6 rounded-sm data-checked:bg-brand data-checked:border-brand"
                    id="terms"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-[120%]"
                  >
                    <span>
                      {t("signup.agreeTerms")}{" "}
                      <Link
                        to="/terms"
                        className="text-brand font-normal text-base underline"
                      >
                        {t("signup.termsConditions")}
                      </Link>
                    </span>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-brand py-3.5 rounded-[10px] font-bold text-base leading-[120%]"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("signup.signInButton")}
                </Button>
              </FieldGroup>
            </form>
            <p className="text-center text-base font-normal leading-[120%] mt-5">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link
                to="/signin"
                className="text-brand font-bold text-base ml-2 hover:underline"
              >
                {t("signup.signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
