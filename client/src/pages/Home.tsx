import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Brain, FileText, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link href="/login">ابدأ الآن</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-6">
            <Zap className="h-4 w-4 ml-2 text-primary" />
            <span>نظام الذكاء الاصطناعي للإدارة التنفيذية</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            حوّل اجتماعاتك ومقابلاتك إلى
            <span className="text-primary"> قرارات ذكية</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            منظم يستخدم الذكاء الاصطناعي لتحليل اجتماعاتك ومقابلاتك، استخراج المهام، وتقديم توصيات مبنية على أفضل الممارسات الإدارية
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                ابدأ مجاناً
                <ArrowRight className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">تعرف على المزايا</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 bg-muted/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">المزايا الرئيسية</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            نظام متكامل لإدارة اجتماعاتك ومقابلاتك بذكاء اصطناعي متقدم
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>تحليل الاجتماعات</CardTitle>
              <CardDescription>
                تحليل ذكي للاجتماعات مع استخراج القرارات والمهام والمخاطر تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">ملخص تنفيذي فوري</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">استخراج القرارات والمسؤولين</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">كشف الكلام الفارغ</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>تحليل المقابلات</CardTitle>
              <CardDescription>
                تقييم المرشحين بناءً على منهجيات Topgrading و Who
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">تحليل الإشارات السلوكية</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">كشف التناقضات</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">توصية نهائية مبررة</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>إدارة المهام</CardTitle>
              <CardDescription>
                استخراج وتتبع المهام تلقائياً من الاجتماعات والإيميلات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">استخراج تلقائي للمهام</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">تحديد الأولويات</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">تتبع الإنجاز</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز للبدء؟
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            ابدأ الآن في استخدام منظم وحوّل طريقة إدارتك للاجتماعات والمقابلات
          </p>
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>
              ابدأ مجاناً
              <ArrowRight className="mr-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 {APP_TITLE}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
