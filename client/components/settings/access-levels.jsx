import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AccessLevels({ roleCounts }) {
  const accessLevels = [
    {
      role: "Admin",
      description: "Full system access with all permissions",
      color: "bg-red-100 dark:bg-red-900",
      textColor: "text-red-600 dark:text-red-400",
      count: roleCounts.admin || 0,
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l4 7h7l-5.5 4.5L19 21l-7-4-7 4 1.5-7.5L1 9h7z" /></svg>
      ),
    },
    {
      role: "Manager",
      description: "Can manage teams and view sensitive data",
      color: "bg-orange-100 dark:bg-orange-900",
      textColor: "text-orange-600 dark:text-orange-400",
      count: roleCounts.manager || 0,
      icon: (
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
      ),
    },
    {
      role: "Recruiter",
      description: "Can manage candidates and interviews",
      color: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-600 dark:text-blue-400",
      count: roleCounts.recruiter || 0,
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" /></svg>
      ),
    },
    {
      role: "User",
      description: "Basic access to non-sensitive features",
      color: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-400",
      count: roleCounts.user || 0,
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
      ),
    },
  ];

  return (
    <Card className="glass-card border-none shadow-xl">
      <div className="rounded-t-xl p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l4 7h7l-5.5 4.5L19 21l-7-4-7 4 1.5-7.5L1 9h7z" /></svg>
        </div>
        <div>
          <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Access Levels</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">Overview of available access levels</CardDescription>
        </div>
      </div>
      <CardContent className="space-y-4 p-6">
        {accessLevels.map((level, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl glass-tile shadow border border-white/10 backdrop-blur-md",
              "hover:shadow-lg transition-all"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 shadow-inner mr-2">
                {level.icon}
              </div>
              <div>
                <p className="font-semibold text-base text-gray-900 dark:text-white">{level.role}</p>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            </div>
            <div className={`text-sm font-medium ${level.textColor}`}>{level.count} users</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
