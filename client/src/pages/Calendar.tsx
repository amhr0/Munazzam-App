import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar as CalendarIcon, MapPin, Users, Video, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Calendar() {
  const { data: events, isLoading } = trpc.calendar.list.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'tentative': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'tentative': return 'مبدئي';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`;
    }
    return `${minutes} دقيقة`;
  };

  // Group events by date
  const groupedEvents = events?.reduce((acc: any, event: any) => {
    const date = new Date(event.startTime).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">التقويم</h1>
            <p className="text-muted-foreground mt-2">
              الاجتماعات والأحداث المزامنة من Google Calendar و Outlook
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
        ) : !events || events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد أحداث مزامنة</p>
              <p className="text-sm text-muted-foreground mt-2">
                قم بربط حسابك مع Google أو Microsoft من صفحة التكاملات
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents || {}).map(([date, dateEvents]: [string, any]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {date}
                </h2>
                <div className="space-y-3">
                  {dateEvents.map((event: any) => (
                    <Card key={event.id} className={event.status === 'cancelled' ? 'opacity-60' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription className="mt-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                {formatDateTime(event.startTime)}
                                <span className="text-muted-foreground">
                                  ({formatDuration(event.startTime, event.endTime)})
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusColor(event.status)}>
                            {getStatusText(event.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.attendees && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{JSON.parse(event.attendees).length} مشارك</span>
                          </div>
                        )}

                        {event.meetingUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={event.meetingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              رابط الاجتماع
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
