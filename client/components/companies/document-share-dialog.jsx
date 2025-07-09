"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Mail, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import { useTeams } from "@/contexts/teams-context"

export function DocumentShareDialog({ open, onOpenChange, document, companyId }) {
  const [emailRecipients, setEmailRecipients] = useState("")
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedPermission, setSelectedPermission] = useState("view")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { teams, isLoading: teamsLoading } = useTeams()

  const handleShare = async () => {
    if (selectedTeams.length === 0 && !emailRecipients.trim()) {
      toast({
        title: "No Recipients",
        description: "Please select at least one team or enter at least one email address",
        variant: "destructive",
      })
      return
    }
    try {
      setIsLoading(true)
      const emails = emailRecipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email)
      await companyService.shareCompanyDocument(
        companyId,
        document.id,
        {
          recipients: emails,
          teamIds: selectedTeams,
          permission: selectedPermission,
        }
      )
      toast({
        title: "Document Shared",
        description: `Document has been shared successfully`,
      })
      setEmailRecipients("")
      setSelectedTeams([])
      onOpenChange(false)
    } catch (error) {
      console.log("Error sharing document:", error)
      toast({
        title: "Error",
        description: "Failed to share document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Copy className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Share Document</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">Share "{document?.name}" with users or teams</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-2">
          <Tabs defaultValue="users" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-lg mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input
                  id="recipients"
                  placeholder="Enter email addresses separated by commas"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Permission</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={selectedPermission === "view" ? "default" : "outline"}
                    onClick={() => setSelectedPermission("view")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    View only
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPermission === "edit" ? "default" : "outline"}
                    onClick={() => setSelectedPermission("edit")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Can edit
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="teams" className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Select Teams</Label>
                <div className="flex flex-wrap gap-2">
                  {teamsLoading ? (
                    <span>Loading teams...</span>
                  ) : teams.length === 0 ? (
                    <span>No teams available</span>
                  ) : (
                    teams.map(team => (
                      <Button
                        key={team.id}
                        variant={selectedTeams.includes(team.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTeams(prev =>
                            prev.includes(team.id)
                              ? prev.filter(id => id !== team.id)
                              : [...prev, team.id]
                          )
                        }}
                        disabled={isLoading}
                        className="rounded-full px-4"
                      >
                        {team.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permission</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={selectedPermission === "view" ? "default" : "outline"}
                    onClick={() => setSelectedPermission("view")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    View only
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPermission === "edit" ? "default" : "outline"}
                    onClick={() => setSelectedPermission("edit")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Can edit
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors">
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Share</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DocumentShareDialog } from "../documents/document-share-dialog";
