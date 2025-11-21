import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CheckSquare, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Tasks() {
  const { data: tasks, isLoading, refetch } = trpc.tasks.list.useQuery();
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المهمة");
      refetch();
    },
    onError: (error) => {
      toast.error("فشل تحديث المهمة: " + error.message);
    }
  });

  const handleStatusChange = (taskId: number, status: string) => {
    updateTask.mutate({
      id: taskId,
      status: status as any
    });
  };

  const handlePriorityChange = (taskId: number, priority: string) => {
    updateTask.mutate({
      id: taskId,
      priority: priority as any
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">عاجل</Badge>;
      case 'high':
        return <Badge variant="default">مرتفع</Badge>;
      case 'medium':
        return <Badge variant="secondary">متوسط</Badge>;
      default:
        return <Badge variant="outline">منخفض</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">مكتمل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">قيد التنفيذ</Badge>;
      case 'cancelled':
        return <Badge variant="outline">ملغي</Badge>;
      default:
        return <Badge variant="outline">قيد الانتظار</Badge>;
    }
  };

  const todoTasks = tasks?.filter(t => t.status === 'todo') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">المهام</h1>
          <p className="text-muted-foreground mt-2">
            المهام المستخرجة من الاجتماعات والإيميلات
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* To Do Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                  قيد الانتظار
                </CardTitle>
                <CardDescription>{todoTasks.length} مهمة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todoTasks.map((task) => (
                  <Card key={task.id} className="border-2">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm flex-1">{task.title}</p>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                      
                      {task.assignedTo && (
                        <p className="text-xs text-muted-foreground">
                          المسؤول: {task.assignedTo}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">قيد الانتظار</SelectItem>
                            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={task.priority}
                          onValueChange={(value) => handlePriorityChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">منخفض</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="high">مرتفع</SelectItem>
                            <SelectItem value="urgent">عاجل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {todoTasks.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    لا توجد مهام
                  </p>
                )}
              </CardContent>
            </Card>

            {/* In Progress Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  قيد التنفيذ
                </CardTitle>
                <CardDescription>{inProgressTasks.length} مهمة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {inProgressTasks.map((task) => (
                  <Card key={task.id} className="border-2 border-blue-200">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm flex-1">{task.title}</p>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                      
                      {task.assignedTo && (
                        <p className="text-xs text-muted-foreground">
                          المسؤول: {task.assignedTo}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">قيد الانتظار</SelectItem>
                            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={task.priority}
                          onValueChange={(value) => handlePriorityChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">منخفض</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="high">مرتفع</SelectItem>
                            <SelectItem value="urgent">عاجل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {inProgressTasks.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    لا توجد مهام
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Completed Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  مكتمل
                </CardTitle>
                <CardDescription>{completedTasks.length} مهمة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm flex-1 line-through text-muted-foreground">
                          {task.title}
                        </p>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.assignedTo && (
                        <p className="text-xs text-muted-foreground">
                          المسؤول: {task.assignedTo}
                        </p>
                      )}

                      {task.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          اكتمل في: {new Date(task.completedAt).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    لا توجد مهام
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CheckSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد مهام بعد</h3>
              <p className="text-muted-foreground">
                سيتم استخراج المهام تلقائياً من الاجتماعات والإيميلات
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
