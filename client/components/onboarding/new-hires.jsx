"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  UserPlus,
  Calendar,
  Building2,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { NewHireDetails } from "@/components/onboarding/new-hire-details"
import { useOnboarding } from "@/contexts/onboarding-context"
import { AddNewHire } from "@/components/onboarding/add-new-hire"
import { deleteNewHire, updateNewHire } from "@/services/onboardingService"

export function NewHires() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNewHire, setSelectedNewHire] = useState(null)
  const [selectedNewHireIndex, setSelectedNewHireIndex] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [hireToDelete, setHireToDelete] = useState(null)
  const [open, setOpen] = useState(false)
  const [isFinalStageDialogOpen, setIsFinalStageDialogOpen] = useState(false);
  const [finalStageCandidates, setFinalStageCandidates] = useState([]);
  const [loadingFinalStage, setLoadingFinalStage] = useState(false);
  const [finalStageError, setFinalStageError] = useState("");

  const { newHires, newHiresLoading, newHiresError, setNewHires, refreshNewHires } = useOnboarding();

  const filteredNewHires = newHires.filter((newHire) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const name = newHire.name?.toLowerCase() || ""
    const position = newHire.position?.toLowerCase() || ""
    const department = newHire.department?.toLowerCase() || ""
    const email = newHire.email?.toLowerCase() || ""
    return name.includes(query) || position.includes(query) || department.includes(query) || email.includes(query)
  })

  const handleViewDetails = (newHire) => {
    const index = newHires.findIndex((hire) => hire.id === newHire.id)
    setSelectedNewHire(newHire)
    setSelectedNewHireIndex(index)
    setIsDetailsOpen(true)
  }

  const handleDeleteClick = (newHire) => {
    setHireToDelete(newHire)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (hireToDelete) {
      try {
        await deleteNewHire(hireToDelete.id);
        setNewHires(newHires.filter((hire) => hire.id !== hireToDelete.id))
        setIsDeleteConfirmOpen(false)
        setHireToDelete(null)
        refreshNewHires();
      } catch (err) {
        alert(err.message || "Failed to delete new hire");
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 whitespace-nowrap">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 whitespace-nowrap">In Progress</Badge>
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 whitespace-nowrap">Not Started</Badge>
      case "delayed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 whitespace-nowrap">Delayed</Badge>
      default:
        return <Badge variant="outline" className="whitespace-nowrap">Unknown</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "not-started":
        return <Clock className="h-5 w-5 text-gray-500" />
      case "delayed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const handleAddNewHire = (newHireData) => {
    if (!newHireData) {
      setOpen(false)
      return
    }

    // Create a new hire object with an ID and avatar
    const newHire = {
      id: Date.now(),
      ...newHireData,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    // Add the new hire to the beginning of the list
    setNewHires([newHire, ...newHires])
    refreshNewHires();

    // Close the dialog
    setOpen(false)
  }

  const handleUpdateNewHire = async (updatedHire) => {
    if (selectedNewHireIndex !== null) {
      const hireId = newHires[selectedNewHireIndex].id;
      try {
        await updateNewHire(hireId, updatedHire);
        // Optimistically update local state
        const updatedNewHires = [...newHires];
        updatedNewHires[selectedNewHireIndex] = {
          ...updatedNewHires[selectedNewHireIndex],
          ...updatedHire,
        };
        setNewHires(updatedNewHires);
        setSelectedNewHire(updatedNewHires[selectedNewHireIndex]);
        // Do NOT call refreshNewHires here to avoid overwriting with stale backend data
      } catch (err) {
        alert(err.message || "Failed to update new hire");
        refreshNewHires(); // fallback to backend state if error
      }
    }
  }

  const normalizeStatus = (status) => (status || "").replace(/_/g, "-").toLowerCase();
  const prettyStatus = (status) => {
    switch (normalizeStatus(status)) {
      case "completed": return "Completed";
      case "in-progress": return "In Progress";
      case "not-started": return "Not Started";
      case "delayed": return "Delayed";
      default: return status;
    }
  }

  const getStatusVariant = (status) => {
    switch (normalizeStatus(status)) {
      case "completed":
        return "secondary"
      case "in-progress":
        return "outline"
      case "not-started":
        return "destructive"
      case "delayed":
        return "destructive"
      default:
        return "default"
    }
  }

  const NewHireCard = ({ newHire }) => (
    <div key={newHire.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={newHire.avatar} alt={newHire.firstName || "New Hire"} />
            <AvatarFallback>{newHire.firstName.charAt(0) || "NH"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{newHire.firstName} {newHire.lastName || "New Hire"}</h3>
            <p className="text-sm text-gray-500">{newHire.position || "Position not specified"}</p>
          </div>
        </div>
        <div>{getStatusBadge(newHire.status || "not-started")}</div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          <span>{newHire.department || "Department not specified"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Start Date: {newHire.startDate ? new Date(newHire.startDate).toLocaleDateString('en-GB') : "Not set"}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Status:{" "}
          <span className="ml-2">
            <Badge variant={getStatusVariant(newHire.status)} className="text-xs whitespace-nowrap">
              {prettyStatus(newHire.status)}
            </Badge>
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Onboarding Progress</span>
          <span>{newHire.progress || 0}%</span>
        </div>
        <Progress value={newHire.progress || 0} className="h-2" />
      </div>

      <div className="mt-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(newHire)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(newHire)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (newHiresLoading) return <div className="p-8 text-center text-lg">Loading new hires...</div>
  if (newHiresError) return <div className="p-8 text-center text-red-500">{newHiresError}</div>

  return (
    <div className="space-y-6">
      <Card className="light-mode-card">
        <CardContent>
          <div className="flex items-center justify-between px-2 py-4 border-b border-gray-200 bg-white rounded-t-lg">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">New Hires</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsFinalStageDialogOpen(true)}
                variant="default"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Onboard Final-Stage Candidate
              </Button>
              <Button
                onClick={refreshNewHires}
                variant="outline"
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 shadow-sm transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5A9 9 0 1112 21v-3m0 0l-2.25 2.25M12 18l2.25 2.25"
                  />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search new hires..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNewHires.map((newHire) => (
                  <NewHireCard key={newHire.id} newHire={newHire} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="not-started">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNewHires
                  .filter((newHire) => newHire.status === "not-started")
                  .map((newHire) => (
                    <NewHireCard key={newHire.id} newHire={newHire} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="in-progress">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNewHires
                  .filter((newHire) => newHire.status === "in-progress")
                  .map((newHire) => (
                    <NewHireCard key={newHire.id} newHire={newHire} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNewHires
                  .filter((newHire) => newHire.status === "completed")
                  .map((newHire) => (
                    <NewHireCard key={newHire.id} newHire={newHire} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Hire Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>New Hire Details</DialogTitle>
            <DialogDescription>View and manage new hire information.</DialogDescription>
          </DialogHeader>
          {selectedNewHire && <NewHireDetails newHire={selectedNewHire} onUpdate={handleUpdateNewHire} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {hireToDelete?.name || "this new hire"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Stage Candidates Dialog (now uses AddNewHire) */}
      <Dialog open={isFinalStageDialogOpen} onOpenChange={setIsFinalStageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboard Final-Stage Candidate</DialogTitle>
            <DialogDescription>
              Select a candidate in the final stage to initiate onboarding.
            </DialogDescription>
          </DialogHeader>
          <AddNewHire mode="final-stage" onSuccess={() => setIsFinalStageDialogOpen(false)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFinalStageDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
