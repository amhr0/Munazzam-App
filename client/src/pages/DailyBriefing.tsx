import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Sun, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  FileText,
  Users,
  Target,
  Loader2,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function DailyBriefing() {
  const { data: briefing, isLoading, refetch } = trpc.briefing.today.useQuery();
  const refreshBriefing = trpc.briefing.refresh.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملخص الصباحي");
      refetch();
    },
    onError: (error) => {
      toast.error("فشل تحديث الملخص: " + error.message);
    }
  });

  const handleRefresh = () => {
    refreshBriefing.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">جاري تحضير الملخص الصباحي...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!briefing) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="text-center py-12">
            <Sun className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">فشل تحميل الملخص الصباحي</p>
            <Button className="mt-4" onClick={handleRefresh}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const completionRate = briefing.stats.totalTasks > 0 
    ? Math.round((briefing.stats.completedTasks / briefing.stats.totalTasks) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">المساعد الصباحي</h1>
              <p className="text-muted-foreground">
                {new Date(briefing.date).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshBriefing.isPending}
          >
            {refreshBriefing.isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </>
            )}
          </Button>
        </div>

        {/* AI Summary */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              الملخص التنفيذي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{briefing.summary}</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {briefing.stats.completedTasks} من {briefing.stats.totalTasks} مهمة
              </p>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاجتماعات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{briefing.stats.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">
                {briefing.stats.completedMeetings} مكتمل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المقابلات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{briefing.stats.totalInterviews}</div>
              <p className="text-xs text-muted-foreground">
                {briefing.stats.completedInterviews} مكتمل
              </p>
            </CardContent>
          </Card>

          <Card className={briefing.stats.urgentTasks > 0 ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام العاجلة</CardTitle>
              <AlertCircle className={`h-4 w-4 ${briefing.stats.urgentTasks > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${briefing.stats.urgentTasks > 0 ? 'text-destructive' : ''}`}>
                {briefing.stats.urgentTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                تحتاج انتباه فوري
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks */}
        {briefing.urgentTasks.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                المهام العاجلة
              </CardTitle>
              <CardDescription>مهام تحتاج انتباه فوري اليوم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {briefing.urgentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.assignedTo && (
                        <p className="text-sm text-muted-foreground mt-1">
                          المسؤول: {task.assignedTo}
                        </p>
                      )}
                    </div>
                    <Badge variant="destructive">عاجل</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href="/tasks">عرض جميع المهام</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tasks */}
        {briefing.upcomingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                المهام القادمة
              </CardTitle>
              <CardDescription>مهام لها مواعيد نهائية قريبة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {briefing.upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {task.assignedTo && <span>المسؤول: {task.assignedTo}</span>}
                        {task.dueDate && (
                          <span>الموعد: {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              التوصيات اليومية
            </CardTitle>
            <CardDescription>توصيات ذكية لتحسين إنتاجيتك اليوم</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {briefing.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Meetings */}
          {briefing.recentMeetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الاجتماعات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {briefing.recentMeetings.map((meeting: any) => (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <span className="text-sm truncate">{meeting.title}</span>
                        <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {meeting.status === 'completed' ? 'مكتمل' : 'معلق'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Interviews */}
          {briefing.recentInterviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المقابلات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {briefing.recentInterviews.map((interview: any) => (
                    <Link key={interview.id} href={`/interviews/${interview.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{interview.candidateName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {interview.position || 'غير محدد'}
                          </p>
                        </div>
                        {interview.recommendation && (
                          <Badge 
                            variant={interview.recommendation === 'hire' ? 'default' : 'destructive'}
                            className="text-xs shrink-0"
                          >
                            {interview.recommendation === 'hire' ? 'يُنصح' : 'لا يُنصح'}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
