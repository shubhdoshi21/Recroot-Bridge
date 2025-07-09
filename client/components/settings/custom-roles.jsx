import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomRoles({
  customRoles,
  handleEditRole,
  handleDeleteRole,
  setShowCreateRoleDialog,
  isRole,
}) {
  return (
    <Card className="glass-card border-none shadow-xl">
      <div className="rounded-t-xl p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
        </div>
        <div>
          <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Custom Roles</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">Create and manage custom access roles</CardDescription>
        </div>
      </div>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          {customRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 rounded-xl glass-tile shadow border border-white/10 backdrop-blur-md hover:shadow-lg transition-all"
            >
              <div>
                <p className="font-semibold text-base text-gray-900 dark:text-white">{role.name}</p>
                <p className="text-sm text-muted-foreground">Based on: {role.basedOn}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{role.users} users</span>
                <button
                  className="rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                  onClick={() => {
                    if (isRole(role.basedOn)) {
                      handleEditRole({ ...role, basedOn: role.basedOn });
                    }
                  }}
                  aria-label="Edit Role"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil text-blue-500"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </button>
                <button
                  className="rounded-full p-2 hover:bg-red-100 dark:hover:bg-red-900 transition"
                  onClick={() => handleDeleteRole(role.id)}
                  aria-label="Delete Role"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 text-red-500"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:shadow-lg transition-all"
          onClick={() => setShowCreateRoleDialog(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Create Custom Role
        </button>
      </CardContent>
    </Card>
  );
}
