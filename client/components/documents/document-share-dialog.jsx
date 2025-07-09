"use client"
import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check, Users, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { documentService } from "@/services/documentService"
import { useTeams } from "@/contexts/teams-context"
import { useSettings } from "@/contexts/settings-context"

export function DocumentShareDialog({ open, onOpenChange, document }) {
  const [emailRecipients, setEmailRecipients] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState("view")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { teams, isLoading: teamsLoading } = useTeams()
  const [selectedTeams, setSelectedTeams] = useState([])
  const { users, isLoadingUsers } = useSettings()
  const [peopleSearch, setPeopleSearch] = useState("")
  const [notes, setNotes] = useState("")

  const [selectedMembers, setSelectedMembers] = useState([])
  const [activeTab, setActiveTab] = useState("link")

  // Filter users by search
  const filteredUsers = users?.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(peopleSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(peopleSearch.toLowerCase())
  ) || [];

  const handleCopyLink = () => {
    // In a real app, this would generate a sharing link
    const shareLink = `https://example.com/share/document/${document?.id || "123"}`
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)

    toast({
      title: "Link Copied",
      description: "Document sharing link has been copied to clipboard",
    })

    setTimeout(() => {
      setLinkCopied(false)
    }, 3000)
  }

  const handleShareByEmail = async (event) => {
    event.preventDefault()
    if (
      !emailRecipients.trim() &&
      selectedMembers.length === 0 &&
      selectedTeams.length === 0 &&
      activeTab !== "link"
    ) {
      toast({
        title: "No Recipients",
        description: "Please enter at least one email address, select team members, or select teams",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      let recipients = []
      let shareType = "user"
      let teamIds = []
      if (activeTab === "email") {
        recipients = emailRecipients
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email)
        shareType = "user"
      } else if (activeTab === "people") {
        recipients = filteredUsers
          .filter((user) => selectedMembers.includes(user.id))
          .map((user) => user.id)
        shareType = "user"
      } else if (activeTab === "teams") {
        teamIds = selectedTeams
        shareType = "team"
      } else if (activeTab === "link") {
        recipients = []
        shareType = "link"
      }
      const payload = {
        recipients: shareType === "team" ? [] : recipients,
        teamIds: shareType === "team" ? teamIds : [],
        permission: selectedPermission,
        shareType,
        notes: notes,
      }
      await documentService.shareDocument(document.id, payload)
      toast({
        title: "Shared Successfully",
        description: `${document?.name || "Document"} has been shared${recipients.length ? ` with ${recipients.join(", ")}` : " via link"}`,
      })
      setEmailRecipients("")
      setSelectedMembers([])
      setSelectedTeams([])
      setNotes("")

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Share Failed",
        description: error?.message || "There was an error sharing the document.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Share Document</DialogTitle>
              <DialogDescription className="text-gray-600">
                Share "{document?.name || "Document"}" with others
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200">
            <TabsTrigger value="link" className="py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">Link</TabsTrigger>
            <TabsTrigger value="email" className="py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">Email</TabsTrigger>
            <TabsTrigger value="people" className="py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">People</TabsTrigger>
            <TabsTrigger value="teams" className="py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Anyone with this link can access the document</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`https://example.com/share/document/${document?.id || "123"}`}
                  readOnly
                  className="flex-1 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink} className="flex-shrink-0 hover:bg-blue-50 border-blue-200">
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view"
                    checked={selectedPermission === "view"}
                    onCheckedChange={() => setSelectedPermission("view")}
                  />
                  <Label htmlFor="view" className="cursor-pointer">
                    View only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit"
                    checked={selectedPermission === "edit"}
                    onCheckedChange={() => setSelectedPermission("edit")}
                  />
                  <Label htmlFor="edit" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Email Recipients</Label>
              <Input
                id="recipients"
                placeholder="Enter email addresses separated by commas"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-email"
                    checked={selectedPermission === "view"}
                    onCheckedChange={() => setSelectedPermission("view")}
                  />
                  <Label htmlFor="view-email" className="cursor-pointer">
                    View only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-email"
                    checked={selectedPermission === "edit"}
                    onCheckedChange={() => setSelectedPermission("edit")}
                  />
                  <Label htmlFor="edit-email" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes-email">Notes (Optional)</Label>
              <Input
                id="notes-email"
                placeholder="Add a message"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select People</Label>
              <Input
                placeholder="Search users by name or email"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                className="mb-2"
              />
              {isLoadingUsers ? (
                <div>Loading users...</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={() =>
                            setSelectedMembers((prev) =>
                              prev.includes(user.id)
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id]
                            )
                          }
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback>{user.fullName?.[0] || user.email?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.fullName || user.email}</span>
                        <span className="text-xs text-gray-500 ml-2">{user.email}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-500">No users found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-people"
                    checked={selectedPermission === "view"}
                    onCheckedChange={() => setSelectedPermission("view")}
                  />
                  <Label htmlFor="view-people" className="cursor-pointer">
                    View only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-people"
                    checked={selectedPermission === "edit"}
                    onCheckedChange={() => setSelectedPermission("edit")}
                  />
                  <Label htmlFor="edit-people" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes-people">Notes (Optional)</Label>
              <Input
                id="notes-people"
                placeholder="Add a message"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Teams</Label>
              {teamsLoading ? (
                <div>Loading teams...</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {teams && teams.length > 0 ? (
                    teams.map((team) => (
                      <div key={team.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={selectedTeams.includes(team.id)}
                          onCheckedChange={() =>
                            setSelectedTeams((prev) =>
                              prev.includes(team.id)
                                ? prev.filter((id) => id !== team.id)
                                : [...prev, team.id]
                            )
                          }
                        />
                        <span>{team.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({team.memberCount || team.members || 0} members)</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-500">No teams available.</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-teams"
                    checked={selectedPermission === "view"}
                    onCheckedChange={() => setSelectedPermission("view")}
                  />
                  <Label htmlFor="view-teams" className="cursor-pointer">
                    View only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-teams"
                    checked={selectedPermission === "edit"}
                    onCheckedChange={() => setSelectedPermission("edit")}
                  />
                  <Label htmlFor="edit-teams" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes-teams">Notes (Optional)</Label>
              <Input
                id="notes-teams"
                placeholder="Add a message"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleShareByEmail}
            disabled={isLoading}
          >
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
