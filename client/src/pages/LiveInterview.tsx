import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  AlertTriangle, 
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { useLiveCopilot } from '@/hooks/useLiveCopilot';
import { toast } from 'sonner';

export default function LiveInterview() {
  const { user } = useAuth();
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'interviewer' | 'candidate'>('candidate');

  const {
    isConnected,
    sessionId,
    transcript,
    suggestions,
    redFlags,
    isRecording,
    sessionSummary,
    startSession,
    startRecording,
    stopRecording,
    endSession
  } = useLiveCopilot();

  const handleStartSession = async () => {
    if (!user || !candidateName || !position) {
      toast.error('يرجى إدخال اسم المرشح والمنصب');
      return;
    }

    await startSession(user.id, candidateName, position);
    setSessionStarted(true);
    toast.success('تم بدء جلسة المقابلة');
  };

  const handleStartRecording = async () => {
    try {
      await startRecording(currentSpeaker);
      toast.success(`بدأ التسجيل - ${currentSpeaker === 'interviewer' ? 'المُقابِل' : 'المرشح'}`);
    } catch (error) {
      toast.error('فشل بدء التسجيل. تحقق من أذونات الميكروفون');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast.info('تم إيقاف التسجيل');
  };

  const handleEndSession = () => {
    endSession();
    setSessionStarted(false);
    toast.success('تم إنهاء الجلسة');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageSquare className="h-4 w-4" />;
      case 'concern': return <AlertTriangle className="h-4 w-4" />;
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            جاري الاتصال بخادم المساعد الخفي...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (sessionSummary) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              تم إنهاء الجلسة
            </CardTitle>
            <CardDescription>
              المدة: {Math.round(sessionSummary.duration / 60000)} دقيقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {sessionSummary.summary}
              </pre>
            </div>
            <div className="mt-6">
              <Button onClick={() => window.location.reload()}>
                بدء جلسة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>المساعد الخفي للمقابلات</CardTitle>
            <CardDescription>
              مساعد ذكي يقدم اقتراحات فورية أثناء إجراء المقابلة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="candidateName">اسم المرشح</Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="أدخل اسم المرشح"
              />
            </div>
            <div>
              <Label htmlFor="position">المنصب</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="أدخل المنصب الوظيفي"
              />
            </div>
            <Button 
              onClick={handleStartSession}
              disabled={!candidateName || !position}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              بدء المقابلة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel - Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المقابلة المباشرة</CardTitle>
                  <CardDescription>
                    {candidateName} - {position}
                  </CardDescription>
                </div>
                <Badge variant={sessionId ? 'default' : 'secondary'}>
                  {sessionId ? 'نشط' : 'غير متصل'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recording Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>المتحدث:</Label>
                  <Button
                    variant={currentSpeaker === 'interviewer' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentSpeaker('interviewer')}
                    disabled={isRecording}
                  >
                    المُقابِل
                  </Button>
                  <Button
                    variant={currentSpeaker === 'candidate' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentSpeaker('candidate')}
                    disabled={isRecording}
                  >
                    المرشح
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-8" />
                {!isRecording ? (
                  <Button onClick={handleStartRecording} variant="default">
                    <Mic className="mr-2 h-4 w-4" />
                    بدء التسجيل
                  </Button>
                ) : (
                  <Button onClick={handleStopRecording} variant="destructive">
                    <MicOff className="mr-2 h-4 w-4 animate-pulse" />
                    إيقاف التسجيل
                  </Button>
                )}
                <Button onClick={handleEndSession} variant="outline">
                  <Square className="mr-2 h-4 w-4" />
                  إنهاء الجلسة
                </Button>
              </div>

              <Separator />

              {/* Transcript */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {transcript.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    ابدأ التسجيل لرؤية النص المباشر
                  </div>
                ) : (
                  transcript.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        item.speaker === 'interviewer'
                          ? 'bg-blue-50 dark:bg-blue-950'
                          : 'bg-green-50 dark:bg-green-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.speaker === 'interviewer' ? 'المُقابِل' : 'المرشح'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString('ar')}
                        </span>
                      </div>
                      <p className="text-sm">{item.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Suggestions & Red Flags */}
        <div className="space-y-4">
          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الاقتراحات الفورية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد اقتراحات بعد
                  </p>
                ) : (
                  suggestions.slice().reverse().map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs mb-1">
                            {suggestion.type === 'question' && 'سؤال مقترح'}
                            {suggestion.type === 'concern' && 'مخاوف'}
                            {suggestion.type === 'insight' && 'رؤية'}
                          </Badge>
                          <p className="text-sm">{suggestion.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                العلامات الحمراء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {redFlags.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>لا توجد علامات حمراء</span>
                  </div>
                ) : (
                  redFlags.map((flag, index) => (
                    <Alert key={index} variant={flag.severity === 'high' ? 'destructive' : 'default'}>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <Badge variant={getSeverityColor(flag.severity)} className="mb-1">
                          {flag.severity === 'high' && 'عالي'}
                          {flag.severity === 'medium' && 'متوسط'}
                          {flag.severity === 'low' && 'منخفض'}
                        </Badge>
                        <p className="text-sm mt-1">{flag.flag}</p>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
