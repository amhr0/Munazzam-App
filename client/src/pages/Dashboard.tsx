import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Users, CheckSquare, TrendingUp, Clock, AlertCircle, Sun, Calendar as CalendarIcon, Mail, Settings, Headphones } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: meetings, isLoading: loadingMeetings } = trpc.meetings.list.useQuery();
  const { data: interviews, isLoading: loadingInterviews } = trpc.interviews.list.useQuery();
  const { data: tasks, isLoading: loadingTasks } = trpc.tasks.list.useQuery();

  const pendingMeetings = meetings?.filter(m => m.status === 'pending' || m.status === 'processing') || [];
  const completedMeetings = meetings?.filter(m => m.status === 'completed') || [];
  
  const pendingInterviews = interviews?.filter(i => i.status === 'pending' || i.status === 'processing') || [];
  const completedInterviews = interviews?.filter(i => i.status === 'completed') || [];
  
  const pendingTasks = tasks?.filter(t => t.status === 'todo' || t.status === 'in_progress') || [];
  const urgentTasks = tasks?.filter(t => t.priority === 'urgent' && t.status !== 'completed') || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً بك في منظم - نظام الذكاء الاصطناعي للإدارة التنفيذية
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاجتماعات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pendingMeetings.length} قيد المعالجة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المقابلات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pendingInterviews.length} قيد المعالجة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTasks.length} قيد التنفيذ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام العاجلة</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{urgentTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج انتباه فوري
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>الاجتماعات الأخيرة</CardTitle>
              <CardDescription>آخر الاجتماعات المضافة</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMeetings ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : meetings && meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                      <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{meeting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.status === 'completed' ? '✓ مكتمل' : 
                             meeting.status === 'processing' ? '⏳ جاري المعالجة' : 
                             '⏸ في الانتظار'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(meeting.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/meetings">عرض الكل</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">لا توجد اجتماعات بعد</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/meetings">إضافة اجتماع</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Interviews */}
          <Card>
            <CardHeader>
              <CardTitle>المقابلات الأخيرة</CardTitle>
              <CardDescription>آخر المقابلات المضافة</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInterviews ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : interviews && interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.slice(0, 5).map((interview) => (
                    <Link key={interview.id} href={`/interviews/${interview.id}`}>
                      <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{interview.candidateName}</p>
                          <p className="text-sm text-muted-foreground">
                            {interview.position || 'غير محدد'} • 
                            {interview.recommendation === 'hire' ? ' ✓ يُنصح بالتعيين' :
                             interview.recommendation === 'no_hire' ? ' ✗ لا يُنصح بالتعيين' :
                             ' ⏳ قيد التقييم'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(interview.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/interviews">عرض الكل</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">لا توجد مقابلات بعد</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/interviews">إضافة مقابلة</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Integration Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  التقويم
                </CardTitle>
                <CardDescription>الأحداث المزامنة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  عرض الاجتماعات من Google و Outlook
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/emails">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  الإيميلات
                </CardTitle>
                <CardDescription>المهام المستخرجة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  تحليل الإيميلات واستخراج المهام
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/integrations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  التكاملات
                </CardTitle>
                <CardDescription>ربط الحسابات</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  إعداد Google و Microsoft
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily Briefing Card */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-orange-600" />
                المساعد الصباحي
              </CardTitle>
              <CardDescription>ملخص يومي ذكي لمهامك واجتماعاتك</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                احصل على ملخص تنفيذي يومي مع توصيات ذكية لتحسين إنتاجيتك
              </p>
              <Button className="w-full" variant="default" asChild>
                <Link href="/briefing">
                  عرض الملخص الصباحي
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Live Interview Copilot Card */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-purple-600" />
                المساعد الخفي
              </CardTitle>
              <CardDescription>مساعد ذكي للمقابلات المباشرة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                احصل على اقتراحات فورية أثناء إجراء المقابلة مع كشف العلامات الحمراء
              </p>
              <Button className="w-full" variant="default" asChild>
                <Link href="/live-interview">
                  بدء مقابلة مباشرة
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                مهام عاجلة تحتاج انتباه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.assignedTo && (
                        <p className="text-sm text-muted-foreground">المسؤول: {task.assignedTo}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
