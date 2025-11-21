import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Mail, CheckCircle2, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function EmailInbox() {
  const { data: emails, isLoading } = trpc.emails.list.useQuery({ limit: 100 });
  const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set());

  const toggleEmail = (id: number) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEmails(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">صندوق الوارد</h1>
            <p className="text-muted-foreground mt-2">
              الإيميلات المزامنة من Gmail و Outlook مع المهام المستخرجة
            </p>
          </div>
          <Link href="/integrations">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              إعدادات التكامل
            </Badge>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        ) : !emails || emails.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد إيميلات مزامنة</p>
              <p className="text-sm text-muted-foreground mt-2">
                قم بربط حسابك مع Google أو Microsoft من صفحة التكاملات
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {emails.map((email: any) => {
              const isExpanded = expandedEmails.has(email.id);
              const extractedTasks = email.extractedTasks ? JSON.parse(email.extractedTasks) : [];
              const hasExtractedTasks = extractedTasks.length > 0;

              return (
                <Card key={email.id} className={hasExtractedTasks ? 'border-l-4 border-l-green-500' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <CardTitle className="text-base truncate">{email.subject}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {email.from}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(email.receivedAt)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {email.analyzed === 1 && (
                          <Badge variant={hasExtractedTasks ? "default" : "secondary"} className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {hasExtractedTasks ? `${extractedTasks.length} مهمة` : 'محلل'}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleEmail(email.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4 border-t pt-4">
                      {/* Email Body */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">محتوى الرسالة:</h4>
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {email.body?.substring(0, 1000)}
                          {email.body && email.body.length > 1000 && '...'}
                        </div>
                      </div>

                      {/* Extracted Tasks */}
                      {hasExtractedTasks && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            المهام المستخرجة:
                          </h4>
                          <div className="space-y-2">
                            {extractedTasks.map((task: any, index: number) => (
                              <Card key={index} className="bg-muted/30">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{task.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                      {task.dueDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          الموعد النهائي: {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                        </p>
                                      )}
                                    </div>
                                    <Badge 
                                      variant={
                                        task.priority === 'urgent' ? 'destructive' :
                                        task.priority === 'high' ? 'default' :
                                        task.priority === 'medium' ? 'secondary' :
                                        'outline'
                                      }
                                      className="text-xs shrink-0"
                                    >
                                      {task.priority === 'urgent' ? 'عاجل' :
                                       task.priority === 'high' ? 'عالي' :
                                       task.priority === 'medium' ? 'متوسط' :
                                       'منخفض'}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {email.analyzed === 0 && (
                        <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
                          ⏳ لم يتم تحليل هذا الإيميل بعد. اذهب إلى صفحة التكاملات لتحليل الإيميلات.
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
