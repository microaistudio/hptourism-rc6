import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User, Phone, Mail, Lock, FileText, ArrowRight } from "lucide-react";
import heroImagePine from "@assets/stock_images/beautiful_himachal_p_50139e3f.jpg";
import vCliqLogo from "@/assets/logos/v-cliq-logo.jpg";

const COLORS = {
  primary: "#00d09c",
  primaryDark: "#00b386",
  text: "#44475b",
  background: "#ffffff",
};

// Input filter helpers - strip invalid characters in real-time
const filterNameInput = (value: string) => value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
const filterNumericInput = (value: string, maxLen: number) => value.replace(/[^0-9]/g, "").slice(0, maxLen);

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    lastName: z
      .string()
      .max(50, "Last name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")
      .optional()
      .or(z.literal("")),
    mobile: z
      .string()
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9"),
    email: z
      .string()
      .max(100, "Email cannot exceed 100 characters")
      .email("Enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(32, "Password cannot exceed 32 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters")
      .max(32, "Password cannot exceed 32 characters"),
    aadhaarNumber: z
      .string()
      .length(12, "Aadhaar must be exactly 12 digits")
      .regex(/^\d{12}$/, "Aadhaar can only contain digits"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      aadhaarNumber: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...formData } = data;
      const cleanData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        role: "property_owner", // Hardcoded: public registration only for property owners
        email: formData.email || undefined,
        aadhaarNumber: formData.aadhaarNumber,
      };
      const response = await apiRequest("POST", "/api/auth/register", cleanData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

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
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="max-w-[650px] w-full space-y-8 my-auto">

          <div className="lg:hidden flex items-center gap-2 mb-6 text-gray-500" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
            <p className="text-xl text-gray-500">
              Enter your details to register as a Property Owner
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Personal Info Group */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">First Name *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><User className="w-5 h-5" /></div>
                            <Input
                              placeholder="First Name"
                              {...field}
                              maxLength={50}
                              onChange={(e) => field.onChange(filterNameInput(e.target.value))}
                              className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><User className="w-5 h-5" /></div>
                            <Input
                              placeholder="Last Name"
                              {...field}
                              maxLength={50}
                              onChange={(e) => field.onChange(filterNameInput(e.target.value))}
                              className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">Mobile Number *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><Phone className="w-5 h-5" /></div>
                            <Input
                              placeholder="10-digit number"
                              {...field}
                              maxLength={10}
                              inputMode="numeric"
                              onChange={(e) => field.onChange(filterNumericInput(e.target.value, 10))}
                              className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">Aadhaar Number *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><FileText className="w-5 h-5" /></div>
                            <Input
                              placeholder="12-digit Aadhaar"
                              {...field}
                              maxLength={12}
                              inputMode="numeric"
                              onChange={(e) => field.onChange(filterNumericInput(e.target.value, 12))}
                              className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium text-lg">Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-gray-400"><Mail className="w-5 h-5" /></div>
                          <Input type="email" placeholder="your@email.com" {...field} maxLength={100} className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><Lock className="w-5 h-5" /></div>
                            <Input type="password" placeholder="Min 6 characters" {...field} maxLength={32} className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-lg">Confirm Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-gray-400"><Lock className="w-5 h-5" /></div>
                            <Input type="password" placeholder="Re-enter password" {...field} maxLength={32} className="pl-10 h-14 bg-gray-50 border-gray-200 focus:ring-green-500 rounded-lg text-lg" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all rounded-lg text-white mt-8"
                style={{ backgroundColor: COLORS.primary }}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>

              <div className="text-center pt-2">
                <span className="text-gray-500 text-lg">Already have an account? </span>
                <button
                  type="button"
                  className="font-bold text-lg hover:underline transition-colors"
                  style={{ color: COLORS.primary }}
                  onClick={() => setLocation("/login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
