import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, Calendar, RefreshCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Integrations() {
  const { data: integrations, isLoading, refetch } = trpc.integrations.list.useQuery();
  const syncCalendarMutation = trpc.integrations.syncCalendar.useMutation();
  const syncEmailMutation = trpc.integrations.syncEmail.useMutation();
  const analyzeEmailsMutation = trpc.integrations.analyzeEmails.useMutation();
  const disconnectMutation = trpc.integrations.disconnect.useMutation();

  const handleConnectGoogle = () => {
    window.location.href = '/api/oauth/google';
  };

  const handleConnectMicrosoft = () => {
    window.location.href = '/api/oauth/microsoft';
  };

  const handleSyncCalendar = async (integrationId: number, provider: string) => {
    try {
      const result = await syncCalendarMutation.mutateAsync({ integrationId });
      toast.success(`تم مزامنة ${result.syncedCount} حدث من ${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}`);
      refetch();
    } catch (error) {
      toast.error('فشلت عملية المزامنة');
    }
  };

  const handleSyncEmail = async (integrationId: number, provider: string) => {
    try {
      const result = await syncEmailMutation.mutateAsync({ integrationId });
      toast.success(`تم مزامنة ${result.syncedCount} إيميل من ${provider === 'google' ? 'Gmail' : 'Outlook'}`);
      refetch();
    } catch (error) {
      toast.error('فشلت عملية المزامنة');
    }
  };

  const handleAnalyzeEmails = async () => {
    try {
      const result = await analyzeEmailsMutation.mutateAsync();
      toast.success(`تم تحليل ${result.analyzedCount} إيميل واستخراج المهام`);
    } catch (error) {
      toast.error('فشلت عملية التحليل');
    }
  };

  const handleDisconnect = async (id: number, provider: string) => {
    if (!confirm(`هل أنت متأكد من فصل الاتصال مع ${provider === 'google' ? 'Google' : 'Microsoft'}؟`)) {
      return;
    }

    try {
      await disconnectMutation.mutateAsync({ id });
      toast.success('تم فصل الاتصال بنجاح');
      refetch();
    } catch (error) {
      toast.error('فشلت عملية فصل الاتصال');
    }
  };

  const googleIntegration = integrations?.find(i => i.provider === 'google');
  const microsoftIntegration = integrations?.find(i => i.provider === 'microsoft');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">التكاملات</h1>
          <p className="text-muted-foreground mt-2">
            ربط حساباتك مع Google و Microsoft لمزامنة التقويم وتحليل الإيميلات
          </p>
        </div>

        {/* Google Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                G
              </div>
              Google
            </CardTitle>
            <CardDescription>
              مزامنة Google Calendar و Gmail لعرض الاجتماعات وتحليل الإيميلات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {googleIntegration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>متصل: {googleIntegration.email}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSyncCalendar(googleIntegration.id, 'google')}
                    disabled={syncCalendarMutation.isPending}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    مزامنة التقويم
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSyncEmail(googleIntegration.id, 'google')}
                    disabled={syncEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    مزامنة Gmail
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAnalyzeEmails}
                    disabled={analyzeEmailsMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    تحليل الإيميلات
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDisconnect(googleIntegration.id, 'google')}
                    disabled={disconnectMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    فصل الاتصال
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>غير متصل</span>
                </div>
                <Button onClick={handleConnectGoogle}>
                  ربط حساب Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Microsoft Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                M
              </div>
              Microsoft
            </CardTitle>
            <CardDescription>
              مزامنة Outlook Calendar و Outlook Email لعرض الاجتماعات وتحليل الإيميلات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {microsoftIntegration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>متصل: {microsoftIntegration.email}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSyncCalendar(microsoftIntegration.id, 'microsoft')}
                    disabled={syncCalendarMutation.isPending}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    مزامنة التقويم
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSyncEmail(microsoftIntegration.id, 'microsoft')}
                    disabled={syncEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    مزامنة Outlook
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAnalyzeEmails}
                    disabled={analyzeEmailsMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    تحليل الإيميلات
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDisconnect(microsoftIntegration.id, 'microsoft')}
                    disabled={disconnectMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    فصل الاتصال
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>غير متصل</span>
                </div>
                <Button onClick={handleConnectMicrosoft}>
                  ربط حساب Microsoft
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">كيفية الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>ربط الحساب:</strong> اضغط على "ربط حساب" واتبع خطوات المصادقة</p>
            <p>• <strong>مزامنة التقويم:</strong> يتم جلب الاجتماعات من آخر 30 يوم والـ 90 يوم القادمة</p>
            <p>• <strong>مزامنة الإيميلات:</strong> يتم جلب الإيميلات من آخر 7 أيام</p>
            <p>• <strong>تحليل الإيميلات:</strong> يستخدم الذكاء الاصطناعي لاستخراج المهام والإجراءات المطلوبة من الإيميلات</p>
            <p>• <strong>فصل الاتصال:</strong> يتم حذف جميع البيانات المزامنة عند فصل الاتصال</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
