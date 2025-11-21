import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { EmotionAnalysis } from "@/components/EmotionAnalysis";
import { ArrowRight, CheckCircle, Clock, AlertTriangle, FileText, Loader2, ChevronRight } from "lucide-react";
import { useRoute } from "wouter";
import { Link } from "wouter";

export default function MeetingDetail() {
  const [, params] = useRoute("/meetings/:id");
  const meetingId = params?.id ? parseInt(params.id) : 0;

  const { data: meeting, isLoading } = trpc.meetings.get.useQuery({ id: meetingId });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!meeting) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">الاجتماع غير موجود</p>
            <Button className="mt-4" asChild>
              <Link href="/meetings">العودة للاجتماعات</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const analysis = meeting.analysis ? JSON.parse(meeting.analysis) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/meetings" className="hover:text-foreground">الاجتماعات</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{meeting.title}</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
          {meeting.description && (
            <p className="text-muted-foreground mt-2">{meeting.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={
              meeting.status === 'completed' ? 'default' :
              meeting.status === 'processing' ? 'secondary' :
              meeting.status === 'failed' ? 'destructive' : 'outline'
            }>
              {meeting.status === 'completed' ? '✓ مكتمل' :
               meeting.status === 'processing' ? '⏳ جاري المعالجة' :
               meeting.status === 'failed' ? '✗ فشل' : '⏸ في الانتظار'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(meeting.createdAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Processing Status */}
        {meeting.status === 'processing' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">جاري معالجة الاجتماع</p>
                  <p className="text-sm text-blue-700">يتم الآن تحليل الاجتماع باستخدام الذكاء الاصطناعي. قد يستغرق هذا بضع دقائق.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription */}
        {meeting.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>نص الاجتماع</CardTitle>
              <CardDescription>التفريغ النصي الكامل للاجتماع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{meeting.transcription}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis */}
        {analysis && (
          <>
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>الملخص التنفيذي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Decisions */}
            {analysis.decisions && analysis.decisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    القرارات المتخذة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.decisions.map((decision: any, index: number) => (
                      <div key={index} className="border-r-4 border-green-500 pr-4">
                        <p className="font-medium">{decision.decision}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>المسؤول: {decision.responsible}</span>
                          {decision.deadline && <span>الموعد: {decision.deadline}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks */}
            {analysis.tasks && analysis.tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    المهام المستخرجة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.tasks.map((task: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{task.task}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span>المكلف: {task.assignedTo}</span>
                            <Badge variant={
                              task.priority === 'urgent' ? 'destructive' :
                              task.priority === 'high' ? 'default' :
                              task.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {task.priority === 'urgent' ? 'عاجل' :
                               task.priority === 'high' ? 'مرتفع' :
                               task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    المخاطر المحتملة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.risks.map((risk: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                          risk.severity === 'high' ? 'text-red-600' :
                          risk.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{risk.risk}</p>
                          <Badge className="mt-2" variant={
                            risk.severity === 'high' ? 'destructive' :
                            risk.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {risk.severity === 'high' ? 'خطورة عالية' :
                             risk.severity === 'medium' ? 'خطورة متوسطة' : 'خطورة منخفضة'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fluff */}
            {analysis.fluff && analysis.fluff.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الكلام الفارغ</CardTitle>
                  <CardDescription>نقاشات غير منتجة تم رصدها</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.fluff.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{item.topic}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>التوصيات</CardTitle>
                  <CardDescription>توصيات مبنية على أفضل الممارسات</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Emotion Analysis */}
        {meeting.status === 'completed' && (
          <EmotionAnalysis entityType="meeting" entityId={meeting.id} />
        )}

        {/* No Analysis Yet */}
        {!analysis && meeting.status === 'pending' && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {meeting.fileUrl ? 
                  "في انتظار بدء المعالجة..." :
                  "لم يتم رفع ملف للتحليل"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
