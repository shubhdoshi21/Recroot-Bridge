import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function UserAssignments({
  searchQuery,
  setSearchQuery,
  handleRoleUpdate,
  setShowAddUserDialog,
  isRole,
}) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    console.log("[UserAssignments] Component mounted, fetching users...");
    fetchUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    console.log("[UserAssignments] Search query changed:", searchQuery);
    console.log("[UserAssignments] Current users:", users);

    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("[UserAssignments] Filtered users:", filtered);
      setFilteredUsers(filtered);
    } else {
      console.log("[UserAssignments] No search query, showing all users");
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      console.log("[UserAssignments] Fetching users from API...");
      setIsLoading(true);
      setError(null);
      const response = await userService.getUsers();
      console.log("[UserAssignments] API Response:", response);

      if (response.error) {
        throw new Error(response.error);
      }

      const userData = response.users || [];
      console.log("[UserAssignments] Setting users data:", userData);
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.log("[UserAssignments] Error fetching users:", error);
      setError(error.message || "Failed to fetch users");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log("[UserAssignments] Updating user role:", { userId, newRole });
      await handleRoleUpdate(userId, newRole);
      // Refresh users after role update
      console.log("[UserAssignments] Role updated, refreshing users...");
      await fetchUsers();
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.log("[UserAssignments] Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = (user, newRole) => {
    if (user.role === newRole) return; // Don't show dialog if role hasn't changed

    setPendingRoleChange({
      userId: user.id,
      currentRole: user.role,
      newRole: newRole,
      userName: user.fullName || user.email,
    });
    setShowRoleChangeDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    await handleRoleChange(pendingRoleChange.userId, pendingRoleChange.newRole);
    setShowRoleChangeDialog(false);
    setPendingRoleChange(null);
  };

  if (error) {
    console.log("[UserAssignments] Rendering error state:", error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                console.log("[UserAssignments] Retrying fetch users...");
                fetchUsers();
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card border-none shadow-xl">
        <div className="rounded-t-xl p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">User Assignments</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Manage user access levels</CardDescription>
          </div>
        </div>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="user-search" className="font-semibold">Search Users</Label>
            <div className="relative">
              <Input
                id="user-search"
                className="rounded-full pl-10 pr-4 py-2 shadow glass-tile border border-white/20 focus:ring-2 focus:ring-blue-400"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground">No users found.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl glass-tile shadow border border-white/10 backdrop-blur-md hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />
                        <AvatarFallback>{user.fullName?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base text-gray-900 dark:text-white">{user.fullName || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge className="mt-1 capitalize" variant="outline">{user.role}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={user.role} onValueChange={(val) => handleRoleSelect(user, val)}>
                        <SelectTrigger className="w-32 glass-tile border border-white/20">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showRoleChangeDialog}
        onOpenChange={setShowRoleChangeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {pendingRoleChange?.userName}'s
              role from{" "}
              <span className="font-semibold">
                {pendingRoleChange?.currentRole.charAt(0).toUpperCase() +
                  pendingRoleChange?.currentRole.slice(1).toLowerCase()}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {pendingRoleChange?.newRole.charAt(0).toUpperCase() +
                  pendingRoleChange?.newRole.slice(1).toLowerCase()}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
