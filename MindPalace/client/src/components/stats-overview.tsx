import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { StatsResponse } from "@shared/schema";

export default function StatsOverview() {
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
  });

  const statItems = [
    {
      label: "Total Links",
      value: stats?.totalLinks || 0,
      icon: "fas fa-link",
      color: "blue",
      testId: "stat-total-links"
    },
    {
      label: "This Week",
      value: stats?.thisWeek || 0,
      icon: "fas fa-calendar-week",
      color: "green",
      testId: "stat-this-week"
    },
    {
      label: "Categories",
      value: stats?.categories || 0,
      icon: "fas fa-tags",
      color: "purple",
      testId: "stat-categories"
    },
    {
      label: "Searches",
      value: stats?.searches || 0,
      icon: "fas fa-search",
      color: "yellow",
      testId: "stat-searches"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900" data-testid={item.testId}>
                  {item.value}
                </p>
              </div>
              <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                <i className={`${item.icon} text-${item.color}-600`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
