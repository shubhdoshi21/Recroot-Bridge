"use client";

import { useState, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AddClientDialog from "./add-client-dialog";
import { format } from "date-fns";
import { useAdmin } from "@/contexts/admin-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Power,
  Search,
  Filter,
  Building2,
  Users,
  Globe,
  Calendar,
  TrendingUp,
  Plus
} from "lucide-react";

function DeleteClientDialog({ open, onOpenChange, client, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Client
          </DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{client?.companyName}</span>? This action cannot be undone and will permanently remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientManagement({ initialFilter = "all" }) {
  const { toast } = useToast();
  const {
    clients: allClients,
    isLoading,
    error,
    fetchClients,
    updateClientStatus,
    deleteClient,
    updateClient,
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    status: initialFilter,
  });

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      await updateClientStatus(clientId, newStatus);
    } catch (error) {
      console.log("Error updating client status:", error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClient(clientId);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.log("Error deleting client:", error);
    }
  };

  const handleClientAdded = () => {
    setIsAddDialogOpen(false);
    setSelectedClient(null);
    fetchClients();
  };

  const handleEditClient = async (clientData) => {
    try {
      await updateClient(selectedClient.id, clientData);
      setIsAddDialogOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.log("Error updating client:", error);
    }
  };

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return allClients.filter((client) => {
      // Status filter
      if (filters.status !== "all" && client.status !== filters.status) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          client.companyName?.toLowerCase().includes(searchLower) ||
          client.companyEmail?.toLowerCase().includes(searchLower) ||
          client.industry?.toLowerCase().includes(searchLower) ||
          client.subscriptionModel?.subscriptionPlan
            ?.toLowerCase()
            .includes(searchLower)
        );
      }

      return true;
    });
  }, [allClients, filters.status, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalClients = allClients.length;
    const activeClients = allClients.filter(client => client.status === 'active').length;
    const inactiveClients = allClients.filter(client => client.status === 'inactive').length;
    const premiumClients = allClients.filter(client =>
      client.subscriptionModel?.subscriptionPlan === 'premium'
    ).length;

    return { totalClients, activeClients, inactiveClients, premiumClients };
  }, [allClients]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift shadow-modern border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern border-0 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Inactive Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveClients}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Power className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern border-0 bg-gradient-to-r from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Premium Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.premiumClients}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-modern-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Client Management</CardTitle>
              <CardDescription className="text-base">
                Manage client accounts, subscriptions, and billing information
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Enhanced Search and Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6 p-4 bg-gray-50/50 rounded-lg">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company name, email, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-gray-500">Loading clients...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium mb-2">Error loading clients</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={fetchClients} className="border-red-300 text-red-600 hover:bg-red-50">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Company</TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700">Industry</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subscription</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Location</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-gray-50/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {client.companyName?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{client.companyName}</span>
                              <span className="text-sm text-gray-500">
                                {client.companySize || "Size not specified"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-gray-700">{client.companyEmail}</span>
                            <span className="text-sm text-gray-500">
                              {client.companyPhone || "No phone"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{client.industry || "Not specified"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {client.subscriptionModel?.subscriptionPlan || "No subscription"}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 ml-6">
                              {client.subscriptionModel?.billingCycle || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : "destructive"
                            }
                            className={`${client.status === "active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                              }`}
                          >
                            {client.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <span className="text-gray-700">{client.city || client.location || "Not specified"}</span>
                              <span className="text-sm text-gray-500">
                                {client.country || ""}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(
                                  client.id,
                                  client.status === "active"
                                    ? "inactive"
                                    : "active"
                                )
                              }
                              title={
                                client.status === "active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              className={`${client.status === "active"
                                  ? "hover:bg-orange-50 hover:border-orange-200"
                                  : "hover:bg-green-50 hover:border-green-200"
                                }`}
                            >
                              <Power className={`h-4 w-4 ${client.status === "active" ? "text-orange-500" : "text-green-500"
                                }`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client);
                                setIsAddDialogOpen(true);
                              }}
                              title="Edit"
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Delete"
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filters.status !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first client"}
                </p>
                {!searchQuery && filters.status === "all" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setSelectedClient(null);
        }}
        onClientAdded={handleClientAdded}
        onClientUpdated={handleEditClient}
        initialData={selectedClient}
        mode={selectedClient ? "edit" : "add"}
      />

      <DeleteClientDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        client={selectedClient}
        onConfirm={() => handleDeleteClient(selectedClient?.id)}
      />
    </div>
  );
}