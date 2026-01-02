import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultRouteForRole } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Building2, Lock, Phone, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import heroImagePine from "@assets/stock_images/beautiful_himachal_p_50139e3f.jpg";
import hpsedcLogo from "@/assets/logos/hpsedc.svg";
import vCliqLogo from "@/assets/logos/v-cliq-logo.jpg";
import type { User as UserType } from "@shared/schema";

// --- Configuration & Types ---

const COLORS = {
  primary: "#10b981", // Toned down emerald-500
  primaryDark: "#059669", // emerald-600
  text: "#44475b",
  background: "#ffffff",
  blue: "#3b82f6", // Toned down blue-500
  blueDark: "#2563eb", // blue-600
};

type LoginAuthMode = "password" | "otp";
type OtpChannel = "sms" | "email";
type LoginAudience = "user" | "office";

const loginSchema = z
  .object({
    identifier: z.string().min(3, "Enter username, mobile number, or email"),
    password: z.string().optional(),
    captchaAnswer: z.string().optional(),
    authMode: z.enum(["password", "otp"]),
    otpChannel: z.enum(["sms", "email"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.authMode === "password" && (!data.password || data.password.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }
    if (data.authMode === "otp" && !data.otpChannel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otpChannel"],
        message: "Choose where to receive the OTP",
      });
    }
  });

type LoginForm = z.infer<typeof loginSchema>;

type OtpChallengeState = {
  id: string;
  expiresAt: string;
  channel: OtpChannel;
  maskedMobile?: string;
  maskedEmail?: string;
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State
  const [audience, setAudience] = useState<LoginAudience>("user");
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(false);
  const [captchaEnabled, setCaptchaEnabled] = useState<boolean>(true);
  const [otpChallenge, setOtpChallenge] = useState<OtpChallengeState | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpOptionEnabled, setOtpOptionEnabled] = useState(false);
  const [otpChannels, setOtpChannels] = useState<{ sms: boolean; email: boolean }>({ sms: true, email: true });
  const [loginOptionsLoaded, setLoginOptionsLoaded] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      captchaAnswer: "",
      authMode: "password",
      otpChannel: "sms",
    },
  });

  const authMode = form.watch("authMode");

  // --- Helpers ---

  const getRedirectRoute = (user: UserType): string => {
    return getDefaultRouteForRole(user.role);
  };

  const ensureValidOtpChannel = (preferred?: OtpChannel) => {
    const current = preferred ?? form.getValues("otpChannel");
    if (current && otpChannels[current]) {
      form.setValue("otpChannel", current, { shouldValidate: false });
      return;
    }
    if (otpChannels.sms) {
      form.setValue("otpChannel", "sms", { shouldValidate: false });
      return;
    }
    if (otpChannels.email) {
      form.setValue("otpChannel", "email", { shouldValidate: false });
      return;
    }
    form.setValue("otpChannel", undefined as unknown as OtpChannel, { shouldValidate: false });
  };

  const handleAuthModeChange = (mode: LoginAuthMode) => {
    if (authMode === mode) return;
    setOtpChallenge(null);
    setOtpValue("");
    setOtpError(null);
    form.setValue("authMode", mode, { shouldValidate: false });
    if (mode === "otp") {
      form.setValue("password", "");
      form.clearErrors("password");
      ensureValidOtpChannel();
    }
  };

  const refreshCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      const response = await apiRequest("GET", "/api/auth/captcha");
      const data = await response.json();
      if (data.enabled === false) {
        setCaptchaEnabled(false);
        setCaptchaQuestion("");
        form.setValue("captchaAnswer", "");
        return;
      }
      setCaptchaEnabled(true);
      setCaptchaQuestion(data.question);
      form.setValue("captchaAnswer", "");
    } catch (error) {
      toast({
        title: "Captcha unavailable",
        description: (error as Error)?.message || "Unable to load captcha. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCaptchaLoading(false);
    }
  }, [form, toast]);

  // --- Effects ---

  useEffect(() => {
    void refreshCaptcha();
  }, [refreshCaptcha]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawParam = params.get("audience") || params.get("role");
    if (rawParam === "user" || rawParam === "owner") {
      setAudience("user");
    }
    if (rawParam === "office" || rawParam === "officer") {
      setAudience("office");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/login/options");
        const data = await response.json();
        if (!cancelled) {
          const smsEnabled = Boolean(data?.smsOtpEnabled);
          const emailEnabled = Boolean(data?.emailOtpEnabled);
          const anyOtpChannel = smsEnabled || emailEnabled;
          setOtpChannels({ sms: smsEnabled, email: emailEnabled });
          setOtpOptionEnabled(anyOtpChannel);
          const isOtpRequired = Boolean(data?.otpRequired);
          setOtpRequired(isOtpRequired);
          ensureValidOtpChannel(smsEnabled ? "sms" : emailEnabled ? "email" : undefined);
          setLoginOptionsLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[auth] Failed to load login options", error);
          setOtpOptionEnabled(false);
          setLoginOptionsLoaded(true);
        }
      }
    };
    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    ensureValidOtpChannel();
  }, [otpChannels.sms, otpChannels.email]);

  // --- Mutations ---

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data: { user?: UserType; otpRequired?: boolean; challengeId?: string; expiresAt?: string; maskedMobile?: string; maskedEmail?: string; channel?: OtpChannel }) => {
      if (data?.otpRequired && data.challengeId && data.expiresAt) {
        setOtpChallenge({
          id: data.challengeId,
          expiresAt: data.expiresAt,
          channel: data.channel ?? "sms",
          maskedMobile: data.maskedMobile,
          maskedEmail: data.maskedEmail,
        });
        setOtpValue("");
        setOtpError(null);
        toast({
          title: "OTP sent",
          description: `Enter the code sent to ${data.maskedMobile ?? data.maskedEmail ?? "your registered contact"}.`,
        });
        return;
      }
      if (!data?.user) {
        toast({
          title: "Login failed",
          description: "Unexpected response from server.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // CRITICAL: Clear all cached queries to prevent stale session data from affecting redirect
      queryClient.clear();
      setLocation(getRedirectRoute(data.user));
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      const response = await apiRequest("POST", "/api/auth/login/verify-otp", {
        challengeId: otpChallenge?.id,
        otp,
      });
      return response.json();
    },
    onSuccess: (data: { user: UserType }) => {
      toast({
        title: "Welcome back!",
        description: "OTP verified successfully.",
      });
      // CRITICAL: Clear all cached queries to prevent stale session data from affecting redirect
      queryClient.clear();
      setLocation(getRedirectRoute(data.user));
    },
    onError: (error: any) => {
      setOtpError(error?.message || "OTP verification failed");
    },
  });

  // --- Handlers ---

  const onSubmit = (data: LoginForm) => {
    if (otpChallenge) return;
    if (captchaEnabled && !data.captchaAnswer?.trim()) {
      form.setError("captchaAnswer", { message: "Please solve the security check" });
      return;
    }
    loginMutation.mutate(data, {
      onSettled: () => {
        if (captchaEnabled) {
          void refreshCaptcha();
        }
      },
    });
  };

  const handleOtpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otpChallenge) return;
    if (otpValue.trim().length !== 6) {
      setOtpError("Enter the 6-digit code sent to your phone.");
      return;
    }
    setOtpError(null);
    verifyOtpMutation.mutate({ otp: otpValue });
  };

  const handleOtpReset = () => {
    setOtpChallenge(null);
    setOtpValue("");
    setOtpError(null);
    void refreshCaptcha();
  };

  const otpExpiresAt = otpChallenge ? new Date(otpChallenge.expiresAt) : null;

  // --- Visuals ---

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-800">

      {/* 1. LEFT COLUMN: Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: `url(${heroImagePine})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
          {/* V CLIQ Campaign Logo - Removed */}

          <div className="flex items-center gap-3" onClick={() => setLocation("/")}>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg cursor-pointer hover:bg-white/20 transition">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <span className="font-semibold tracking-wide cursor-pointer">Back to Home</span>
          </div>

          <div className="space-y-6 max-w-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <h1 className="text-5xl font-bold leading-tight">
              <span style={{ color: COLORS.primary }}>Home Stay</span> <br />
              Registration
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed opacity-90">
              Register under HP Homestay Rules 2025 and avail exclusive discounts:
            </p>

            <div className="space-y-2 text-base text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>10% Discount</strong> on 3-year registration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>5% Additional Discount</strong> for women owners</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>50% Discount</strong> for Pangi Sub-Division</span>
              </div>
            </div>




          </div>

          <div className="text-xs text-white/40">
            © 2025 HP Tourism. Beautiful Himachal.
          </div>
        </div>
      </div>

      {/* 2. RIGHT COLUMN: Content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="max-w-[550px] w-full space-y-8">

          <div className="lg:hidden flex items-center gap-2 mb-6 text-gray-500" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              {otpChallenge ? "Verify OTP" : "Welcome back"}
            </h2>
            <p className="text-xl text-gray-500">
              {otpChallenge
                ? "Please enter the verification code sent to your registered contact."
                : "Please enter your details to access your dashboard."
              }
            </p>
          </div>

          {/* Logic Branch: OTP Challenge vs Login Form */}
          {otpChallenge ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => {
                    setOtpValue(value.replace(/\D/g, ""));
                    setOtpError(null);
                  }}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((slot) => (
                      <InputOTPSlot key={`otp-slot-${slot}`} index={slot} className="h-12 w-12 border-gray-300 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {otpExpiresAt && (
                <p className="text-xs text-center text-muted-foreground">
                  Code expires at {otpExpiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}

              {otpError && <p className="text-sm text-center text-red-600 font-medium bg-red-50 p-2 rounded">{otpError}</p>}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg text-white"
                style={{ backgroundColor: COLORS.primary }}
                disabled={verifyOtpMutation.isPending || otpValue.length !== 6}
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : "Verify & Sign In"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all font-semibold"
                onClick={handleOtpReset}
              >
                Use a different account
              </Button>
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <Tabs
              value={audience}
              onValueChange={(v) => {
                setAudience(v as LoginAudience);
                setLocation(`/login?audience=${v}`);
                handleAuthModeChange("password");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-14 rounded-xl mb-8">
                <TabsTrigger
                  value="user"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:border data-[state=active]:border-emerald-500 data-[state=active]:shadow-sm text-gray-600 font-medium transition-all"
                >
                  <User className="w-4 h-4 mr-2" />
                  Citizen / Owner
                </TabsTrigger>
                <TabsTrigger
                  value="office"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:border data-[state=active]:border-blue-400 data-[state=active]:shadow-sm text-gray-600 font-medium transition-all"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Department
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                  {/* Identifier Field */}
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">
                          {audience === 'user' ? "Mobile Number or Email" : "Username"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400">
                              {audience === 'user' ? <Phone className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <Input
                              {...field}
                              className="pl-10 h-14 bg-gray-50 border-gray-200 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all rounded-lg text-lg"
                              placeholder={audience === 'user' ? "e.g. 9876543210" : "Enter official username"}
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Auth Mode Switcher */}
                  <input type="hidden" {...form.register("authMode")} />

                  {/* Password Mode */}
                  {authMode === "password" && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-gray-700 font-medium text-lg">Password</FormLabel>
                            {audience === 'user' && otpOptionEnabled && (
                              <button
                                type="button"
                                onClick={() => handleAuthModeChange("otp")}
                                className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline"
                              >
                                Login via OTP
                              </button>
                            )}
                          </div>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3.5 text-gray-400">
                                <Lock className="w-5 h-5" />
                              </div>
                              <Input
                                type="password"
                                {...field}
                                className="pl-10 h-14 bg-gray-50 border-gray-200 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all rounded-lg text-lg"
                                placeholder="••••••••"
                                autoComplete="off"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* OTP Mode - Channel Selection */}
                  {authMode === "otp" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-700 font-medium">Authentication Method</FormLabel>
                        <button
                          type="button"
                          onClick={() => handleAuthModeChange("password")}
                          className="text-xs font-bold text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          Back to Password
                        </button>
                      </div>

                      <FormField
                        control={form.control}
                        name="otpChannel"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-2 gap-3">
                              {(["sms", "email"] as const).map((option) => (
                                <Button
                                  type="button"
                                  key={option}
                                  variant="outline"
                                  className={`h-10 ${field.value === option ? 'border-green-500 bg-green-50 text-green-700' : 'text-gray-600'}`}
                                  onClick={() => otpChannels[option] && field.onChange(option)}
                                  disabled={!otpChannels[option]}
                                >
                                  {option === "sms" ? "Send SMS" : "Send Email"}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="text-xs text-gray-500">
                        We will send a one-time password to your selected contact method.
                      </div>
                    </div>
                  )}

                  {/* CAPTCHA Section */}
                  {captchaEnabled ? (
                    <FormField
                      control={form.control}
                      name="captchaAnswer"
                      render={({ field }) => (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                          <div className="h-10 px-3 min-w-[100px] bg-white border border-gray-200 rounded flex items-center justify-center relative overflow-hidden select-none">
                            <span className="font-mono text-lg font-bold tracking-widest text-gray-600">
                              {captchaQuestion || "..."}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute right-0 top-0.5 text-gray-400 hover:text-gray-600"
                              onClick={() => void refreshCaptcha()}
                              disabled={captchaLoading}
                            >
                              <RefreshCw className={`h-3 w-3 ${captchaLoading ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                          <Input
                            {...field}
                            className="h-10 border-gray-300 focus-visible:ring-green-500 bg-white"
                            placeholder="Solve Captcha"
                            inputMode="numeric"
                          />
                        </div>
                      )}
                    />
                  ) : (
                    <div className="text-xs text-center text-gray-400 border border-dashed border-gray-200 p-2 rounded">
                      Captcha disabled for this environment
                    </div>
                  )}

                  <Button
                    type="submit"
                    className={`w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg text-white ${audience === 'office' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-100' :
                      'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
                      }`}
                    disabled={loginMutation.isPending || (captchaEnabled && !captchaQuestion)}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {authMode === 'otp' ? 'Sending...' : 'Signing In...'}
                      </>
                    ) : authMode === 'otp' ? (
                      'Get Verification Code'
                    ) : (
                      <>Sign In <ArrowRight className="w-5 h-5 ml-2 opacity-90" /></>
                    )}
                  </Button>

                  <div className="block text-center">
                    {authMode === 'password' && (
                      <a href="/password-reset" className="text-xs text-gray-400 hover:text-gray-600">Forgot Password?</a>
                    )}
                  </div>

                </form>
              </Form>
            </Tabs>
          )}

          {/* Registration Footer */}
          {!otpChallenge && audience === 'user' && (
            <div className="pt-4 text-center border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all font-semibold"
                onClick={() => setLocation("/register")}
              >
                Don't have an account? <span className="underline ml-1">Create one</span>
              </Button>
            </div>
          )}

          <div className="flex justify-center pt-8 opacity-60">
            <img src={hpsedcLogo} alt="HPSEDC" className="h-8 grayscale" />
          </div>

        </div>
      </div>
    </div>
  );
}
