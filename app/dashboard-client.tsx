"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DashboardClientProps {
  activeTasksCount: number;
  overdueTasksCount: number;
  completedTodayCount: number;
  upcomingDeadlinesCount: number;
  recentTasks: Array<{
    id: string;
    title: string;
    assigneeId: string | null;
    assigneeName: string | null;
    completedAt: string;
  }>;
  areasWithProgress: Array<{
    name: string;
    eventName: string;
    progress: number;
    completed: number;
    total: number;
  }>;
}

export function DashboardClient({
  activeTasksCount,
  overdueTasksCount,
  completedTodayCount,
  upcomingDeadlinesCount,
  recentTasks,
  areasWithProgress,
}: DashboardClientProps) {
  const { t } = useTranslation();

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("time.lessThanMinute");
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t("time.minutesAgo", { count: minutes });
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t("time.hoursAgo", { count: hours });
    }
    const days = Math.floor(diffInSeconds / 86400);
    return t("time.daysAgo", { count: days });
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("dashboard.welcome")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.myTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasksCount}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.activeTasks")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.overdue")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasksCount}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.overdueTasks")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.completedToday")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodayCount}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.completedTodayDesc")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.upcomingDeadlines")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlinesCount}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.upcomingDeadlinesDesc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("dashboard.recentActivityDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => {
                const timeAgo = task.completedAt
                  ? getTimeAgo(new Date(task.completedAt))
                  : "";

                return (
                  <div key={task.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium">{t("dashboard.taskCompleted")}</p>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;{task.title}&rdquo; {t("dashboard.taskCompletedBy")}{" "}
                        {task.assigneeName || t("dashboard.unknownUser")}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.myAreas")}</CardTitle>
            <CardDescription>{t("dashboard.myAreasDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {areasWithProgress.slice(0, 5).map((area, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium">{area.name}</p>
                  <p className="text-xs text-muted-foreground">{area.eventName}</p>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${area.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

