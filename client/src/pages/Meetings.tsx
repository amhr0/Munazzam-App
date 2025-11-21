import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Meetings() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: meetings, isLoading, refetch } = trpc.meetings.list.useQuery();
  const createMeeting = trpc.meetings.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الاجتماع بنجاح");
      setOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error("فشل إضافة الاجتماع: " + error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الاجتماع");
      return;
    }

    let fileData: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (file) {
      // Check file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 16 ميجابايت");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:*/*;base64, prefix
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      fileData = await base64Promise;
      fileName = file.name;
      fileType = file.type;
    }

    createMeeting.mutate({
      title,
      description: description || undefined,
      fileData,
      fileName,
      fileType
    });
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الاجتماعات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة وتحليل اجتماعاتك بالذكاء الاصطناعي
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة اجتماع
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>إضافة اجتماع جديد</DialogTitle>
                  <DialogDescription>
                    أضف تفاصيل الاجتماع وارفع ملف التسجيل للتحليل
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الاجتماع *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: اجتماع مجلس الإدارة"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="وصف مختصر للاجتماع..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">ملف التسجيل (اختياري)</Label>
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
                  <Button type="submit" disabled={createMeeting.isPending}>
                    {createMeeting.isPending ? (
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

        {/* Meetings List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        ) : meetings && meetings.length > 0 ? (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{meeting.title}</CardTitle>
                        {meeting.description && (
                          <CardDescription className="mt-2">{meeting.description}</CardDescription>
                        )}
                      </div>
                      <div className="text-sm">
                        {getStatusBadge(meeting.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {meeting.fileUrl && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            ملف مرفق
                          </span>
                        )}
                        {meeting.transcription && (
                          <span>✓ تم التفريغ</span>
                        )}
                        {meeting.analysis && (
                          <span>✓ تم التحليل</span>
                        )}
                      </div>
                      <span>
                        {new Date(meeting.createdAt).toLocaleDateString('ar-SA', {
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
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد اجتماعات بعد</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإضافة اجتماعك الأول للحصول على تحليل ذكي
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة اجتماع
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
