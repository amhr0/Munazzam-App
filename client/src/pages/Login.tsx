import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح!");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "فشل تسجيل الدخول");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحساب بنجاح!");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء الحساب");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {APP_LOGO && (
            <img src={APP_LOGO} alt="Logo" className="h-16 w-16 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
          <p className="text-gray-600">نظام الذكاء الاصطناعي للإدارة التنفيذية</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل الدخول</CardTitle>
                <CardDescription>
                  أدخل بريدك الإلكتروني وكلمة المرور للدخول
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">البريد الإلكتروني</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">كلمة المرور</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    تسجيل الدخول
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء حساب جديد</CardTitle>
                <CardDescription>
                  أدخل بياناتك لإنشاء حساب جديد
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">الاسم (اختياري)</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="أحمد محمد"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">البريد الإلكتروني</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">كلمة المرور</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={registerMutation.isPending}
                    />
                    <p className="text-sm text-muted-foreground">
                      يجب أن تكون 6 أحرف على الأقل
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    إنشاء حساب
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => setLocation("/")}
            className="text-gray-600"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
