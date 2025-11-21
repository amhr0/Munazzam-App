import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Plus, Users, CheckCircle, X, Loader2, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Interviews() {
  const [open, setOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [position, setPosition] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: interviews, isLoading, refetch } = trpc.interviews.list.useQuery();
  const createInterview = trpc.interviews.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المقابلة بنجاح");
      setOpen(false);
      setCandidateName("");
      setPosition("");
      setFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error("فشل إضافة المقابلة: " + error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim()) {
      toast.error("يرجى إدخال اسم المرشح");
      return;
    }

    let fileData: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 16 ميجابايت");
        return;
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      fileData = await base64Promise;
      fileName = file.name;
      fileType = file.type;
    }

    createInterview.mutate({
      candidateName,
      position: position || undefined,
      fileData,
      fileName,
      fileType
    });
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> يُنصح بالتعيين</span>;
      case 'no_hire':
        return <span className="inline-flex items-center gap-1 text-red-600"><X className="h-4 w-4" /> لا يُنصح بالتعيين</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-gray-600"><Clock className="h-4 w-4" /> قيد التقييم</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> مكتمل</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 text-blue-600"><Loader2 className="h-4 w-4 animate-spin" /> جاري المعالجة</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-red-600">✗ فشل</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-gray-600"><Clock className="h-4 w-4" /> في الانتظار</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">المقابلات</h1>
            <p className="text-muted-foreground mt-2">
              تقييم المرشحين بالذكاء الاصطناعي
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مقابلة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>إضافة مقابلة جديدة</DialogTitle>
                  <DialogDescription>
                    أضف معلومات المرشح وارفع تسجيل المقابلة للتقييم
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">اسم المرشح *</Label>
                    <Input
                      id="candidateName"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="مثال: أحمد محمد"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">المنصب</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="مثال: مدير تسويق"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">تسجيل المقابلة (اختياري)</Label>
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      الصيغ المدعومة: MP3, MP4, WAV, M4A, WebM (حد أقصى 16MB)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createInterview.isPending}>
                    {createInterview.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      "إضافة"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        ) : interviews && interviews.length > 0 ? (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Link key={interview.id} href={`/interviews/${interview.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {interview.candidateName}
                        </CardTitle>
                        {interview.position && (
                          <CardDescription className="mt-2">{interview.position}</CardDescription>
                        )}
                      </div>
                      <div className="text-sm space-y-2">
                        {getStatusBadge(interview.status)}
                        {interview.status === 'completed' && (
                          <div>{getRecommendationBadge(interview.recommendation || 'pending')}</div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {interview.transcription && (
                          <span>✓ تم التفريغ</span>
                        )}
                        {interview.analysis && (
                          <span>✓ تم التقييم</span>
                        )}
                      </div>
                      <span>
                        {new Date(interview.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد مقابلات بعد</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإضافة مقابلتك الأولى للحصول على تقييم ذكي
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مقابلة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
