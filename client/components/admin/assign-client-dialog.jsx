"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Building2, Users, Link } from "lucide-react";

export default function AssignClientDialog({
  open,
  onOpenChange,
  onAssign,
  user,
  clients,
}) {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState(
    user?.clientId ? user.clientId.toString() : "none"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("[AssignClientDialog] User data:", {
      id: user?.id,
      role: user?.role,
      clientId: user?.clientId,
      fullName: user?.fullName,
    });
    console.log("[AssignClientDialog] Clients data:", clients);
    setSelectedClientId(user?.clientId ? user.clientId.toString() : "none");
  }, [user, clients]);

  const handleAssign = async () => {
    if (!user?.id) {
      console.log(
        "[AssignClientDialog] Cannot assign client: No user ID available"
      );
      toast({
        title: "Error",
        description: "Cannot assign client: User information is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const clientId =
        selectedClientId === "none" ? null : Number(selectedClientId);
      await onAssign(user.id, clientId);
      onOpenChange(false);
    } catch (error) {
      console.log("Error assigning client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-blue-500" />
            Assign Client
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a client to assign to <span className="font-semibold text-gray-900">{user?.fullName || "this user"}</span>.
            Clients that are already assigned to other admins will be marked.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role} • {user?.email}</p>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-3">
            <Label htmlFor="client" className="text-sm font-medium">
              Select Client
            </Label>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Choose a client to assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>No client (Unassigned)</span>
                  </div>
                </SelectItem>
                {clients.map((client) => {
                  const isAssignedToOtherAdmin =
                    client.assignedToAdmin &&
                    client.assignedAdminId !== user?.id;
                  const isAdmin = user?.role === "admin";
                  const shouldDisable = isAdmin && isAssignedToOtherAdmin;

                  console.log("[AssignClientDialog] Client item:", {
                    clientId: client.id,
                    companyName: client.companyName,
                    assignedToAdmin: client.assignedToAdmin,
                    assignedAdminName: client.assignedAdminName,
                    isAssignedToOtherAdmin,
                    isAdmin,
                    shouldDisable,
                    userRole: user?.role,
                    userClientId: user?.clientId,
                    userAdminId: user?.id,
                  });

                  return (
                    <SelectItem
                      key={client.id}
                      value={client.id.toString()}
                      disabled={shouldDisable}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {client.companyName?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={
                                shouldDisable ? "text-muted-foreground" : "font-medium"
                              }
                            >
                              {client.companyName}
                            </span>
                            {shouldDisable && (
                              <span className="text-xs text-muted-foreground">
                                Assigned to {client.assignedAdminName}
                              </span>
                            )}
                            {!shouldDisable && (
                              <span className="text-xs text-gray-500">
                                {client.subscriptionModel?.subscriptionPlan || "No subscription"}
                              </span>
                            )}
                          </div>
                        </div>
                        {client.id === user?.clientId && (
                          <Badge variant="outline" className="ml-2 border-blue-200 text-blue-700 bg-blue-50">
                            Current
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Assignment Rules</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Only one admin can be assigned to a client at a time</li>
                  <li>• Recruiters can be assigned to multiple clients</li>
                  <li>• Removing assignment will unlink the user from the client</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Assign Client
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
