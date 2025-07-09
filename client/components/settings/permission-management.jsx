import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PermissionManagement({
  permissions,
  handlePermissionToggle,
  handleResetPermissions,
  handleSavePermissions,
  isSavingPermissions,
  isLoadingPermissions,
}) {
  if (isLoadingPermissions) {
    return (
      <Card className="glass-card border-none shadow-xl">
        <div className="rounded-t-xl p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l4 7h7l-5.5 4.5L19 21l-7-4-7 4 1.5-7.5L1 9h7z" /></svg>
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Permission Management</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Configure permissions for each access level</CardDescription>
          </div>
        </div>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-11" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoadingPermissions) {
    // Log all permissions received for debugging
    console.log("[PermissionManagement] Permissions received:", permissions);
  }

  return (
    <Card className="glass-card border-none shadow-xl">
      <div className="rounded-t-xl p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l4 7h7l-5.5 4.5L19 21l-7-4-7 4 1.5-7.5L1 9h7z" /></svg>
        </div>
        <div>
          <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Permission Management</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">Configure permissions for each access level</CardDescription>
        </div>
      </div>
      <CardContent>
        <Tabs defaultValue="admin" className="mt-4">
          <TabsList className="grid w-full grid-cols-5 glass-tile rounded-full p-1 bg-white/30 backdrop-blur-md border border-white/10">
            <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Admin</TabsTrigger>
            <TabsTrigger value="manager" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500 data-[state=active]:text-white">Manager</TabsTrigger>
            <TabsTrigger value="recruiter" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-green-400 data-[state=active]:text-white">Recruiter</TabsTrigger>
            <TabsTrigger value="user" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-blue-400 data-[state=active]:text-white">User</TabsTrigger>
            <TabsTrigger value="guest" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-400 data-[state=active]:to-blue-200 data-[state=active]:text-white">Guest</TabsTrigger>
          </TabsList>

          {["admin", "manager", "recruiter", "user", "guest"].map(
            (role) => (
              <TabsContent key={role} value={role} className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(permissions[role] || {}).map(
                    ([category, categoryPermissions], idx) => {
                      const typedCategory = category;
                      const typedPermissions = categoryPermissions;
                      return (
                        <div key={idx} className="space-y-2 glass-tile rounded-xl p-4 border border-white/10 shadow">
                          <h3 className="font-medium text-base mb-2 text-gray-900 dark:text-white">{category}</h3>
                          <div className="space-y-2">
                            {typedPermissions.map((permission, permIdx) => (
                              <div
                                key={permIdx}
                                className="flex items-center justify-between"
                              >
                                <Label
                                  htmlFor={`${role}-${category}-${permIdx}`}
                                  className="flex-1"
                                >
                                  {permission.name}
                                </Label>
                                <Switch
                                  id={`${role}-${category}-${permIdx}`}
                                  checked={permission.enabled}
                                  onCheckedChange={(checked) =>
                                    handlePermissionToggle(
                                      role,
                                      typedCategory,
                                      permIdx,
                                      checked === true
                                    )
                                  }
                                  disabled={
                                    role === "admin" &&
                                    category === "Settings"
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {role === "admin" && (
                  <div className="text-sm text-muted-foreground italic">
                    Admin permissions cannot be modified as they have
                    full system access by default.
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleResetPermissions(role)}
                    disabled={isSavingPermissions}
                    className="glass-tile border border-white/20"
                  >
                    Reset to Default
                  </Button>
                  <Button
                    onClick={() => handleSavePermissions(role)}
                    disabled={isSavingPermissions}
                    className="glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  >
                    {isSavingPermissions ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Permissions"
                    )}
                  </Button>
                </div>
              </TabsContent>
            )
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
