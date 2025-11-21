/**
 * Emotion Analysis Component
 * عرض تحليل تعابير الوجه والمشاعر
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingUp, AlertTriangle, Smile, Frown, Angry, Zap, Eye, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EmotionAnalysisProps {
  entityType: "meeting" | "interview";
  entityId: number;
}

export function EmotionAnalysis({ entityType, entityId }: EmotionAnalysisProps) {
  const { data: summary, isLoading, refetch } = trpc.emotions.getSummary.useQuery({
    entityType,
    entityId,
  });

  const startAnalysis = trpc.emotions.startAnalysis.useMutation({
    onSuccess: () => {
      // Poll for results
      const interval = setInterval(() => {
        refetch();
      }, 5000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            تحليل المشاعر والانتباه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            تحليل المشاعر والانتباه
          </CardTitle>
          <CardDescription>
            تحليل تعابير الوجه والمشاعر باستخدام الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              لم يتم تحليل الفيديو بعد
            </p>
            <Button
              onClick={() => startAnalysis.mutate({ entityType, entityId })}
              disabled={startAnalysis.isPending}
            >
              {startAnalysis.isPending ? "جاري التحليل..." : "بدء التحليل"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const emotions = [
    { name: "سعادة", value: summary.averageEmotions.happy, icon: Smile, color: "text-green-500" },
    { name: "حزن", value: summary.averageEmotions.sad, icon: Frown, color: "text-blue-500" },
    { name: "غضب", value: summary.averageEmotions.angry, icon: Angry, color: "text-red-500" },
    { name: "مفاجأة", value: summary.averageEmotions.surprised, icon: Zap, color: "text-yellow-500" },
    { name: "خوف", value: summary.averageEmotions.fearful, icon: AlertTriangle, color: "text-orange-500" },
    { name: "اشمئزاز", value: summary.averageEmotions.disgusted, icon: Frown, color: "text-purple-500" },
    { name: "حياد", value: summary.averageEmotions.neutral, icon: Eye, color: "text-gray-500" },
  ];

  const metrics = [
    { name: "الانتباه", value: summary.averageAttention, icon: Eye, color: "bg-blue-500" },
    { name: "التفاعل", value: summary.averageEngagement, icon: TrendingUp, color: "bg-green-500" },
    { name: "الثقة", value: summary.averageConfidence, icon: Target, color: "bg-purple-500" },
    { name: "التوتر", value: summary.averageStress, icon: AlertTriangle, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metric.value}%</div>
                <Progress value={metric.value} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emotions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المشاعر</CardTitle>
          <CardDescription>متوسط المشاعر المكتشفة طوال الفيديو</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotions.map((emotion) => {
              const Icon = emotion.icon;
              return (
                <div key={emotion.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${emotion.color}`} />
                      <span className="text-sm font-medium">{emotion.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{emotion.value}%</span>
                  </div>
                  <Progress value={emotion.value} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Red Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Red Flags */}
        {summary.averageStress > 70 || summary.averageAttention < 50 ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                علامات تحذيرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-red-700">
                {summary.averageStress > 70 && (
                  <li>• مستوى توتر عالٍ ({summary.averageStress}%)</li>
                )}
                {summary.averageAttention < 50 && (
                  <li>• مستوى انتباه منخفض ({summary.averageAttention}%)</li>
                )}
                {summary.averageEmotions.angry > 20 && (
                  <li>• مستوى غضب ملحوظ ({summary.averageEmotions.angry}%)</li>
                )}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {/* Positive Insights */}
        {(summary.averageEngagement > 70 || summary.averageConfidence > 70) && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ملاحظات إيجابية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                {summary.averageEngagement > 70 && (
                  <li>• مستوى تفاعل ممتاز ({summary.averageEngagement}%)</li>
                )}
                {summary.averageConfidence > 70 && (
                  <li>• ثقة عالية بالنفس ({summary.averageConfidence}%)</li>
                )}
                {summary.averageEmotions.happy > 50 && (
                  <li>• مشاعر إيجابية واضحة ({summary.averageEmotions.happy}%)</li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
