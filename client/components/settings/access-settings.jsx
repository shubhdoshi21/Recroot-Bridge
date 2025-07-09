"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AccessLevels from "./access-levels";
import UserAssignments from "./user-assignments";
import PermissionManagement from "./permission-management";
import CustomRoles from "./custom-roles";
import { useSettings } from "@/contexts/settings-context";
import { KeyRound as KeyIcon } from "lucide-react";

export default function AccessSettings({
  searchQuery,
  setSearchQuery,
  setShowAddUserDialog,
  customRoles,
  handleEditRole,
  handleDeleteRole,
  setShowCreateRoleDialog,
  permissions,
  handlePermissionToggle,
  handleResetPermissions,
  handleSavePermissions,
  isSavingPermissions,
  isLoadingPermissions,
  // handleSaveAccessSettings,
  // isSavingAccessSettings,
  isRole,
}) {
  const {
    users,
    roleCounts,
    isLoadingUsers,
    isLoadingRoleCounts,
    updateUserRole,
  } = useSettings();

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      console.log(
        "[AccessSettings] Updating role for user:",
        userId,
        "to:",
        newRole
      );
      await updateUserRole(userId, newRole);
      console.log("[AccessSettings] Role updated successfully");
    } catch (error) {
      console.log("[AccessSettings] Error updating user role:", error);
      throw error;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <div className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <KeyIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Access Management</h2>
          <p className="text-gray-600 mt-1">Manage user access levels and permissions</p>
        </div>
      </div>
      <div className="p-6 space-y-8">
        <AccessLevels roleCounts={roleCounts} isLoading={isLoadingRoleCounts} />

        <UserAssignments
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleRoleUpdate={handleRoleUpdate}
          setShowAddUserDialog={setShowAddUserDialog}
          isRole={isRole}
          users={users}
          isLoading={isLoadingUsers}
        />

        <PermissionManagement
          permissions={permissions}
          handlePermissionToggle={handlePermissionToggle}
          handleResetPermissions={handleResetPermissions}
          handleSavePermissions={handleSavePermissions}
          isSavingPermissions={isSavingPermissions}
          isLoadingPermissions={isLoadingPermissions}
        />

        <CustomRoles
          customRoles={customRoles}
          handleEditRole={handleEditRole}
          handleDeleteRole={handleDeleteRole}
          setShowCreateRoleDialog={setShowCreateRoleDialog}
          isRole={isRole}
        />
      </div>
    </div>
  );
}
