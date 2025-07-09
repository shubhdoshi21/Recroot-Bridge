"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DocumentPreview } from "@/components/documents/document-preview"
import { EditSharedDocumentDialog } from "@/components/documents/edit-shared-document-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  MoreHorizontal,
  FileText,
  FilePdf,
  FileSpreadsheet,
  Eye,
  Clock,
  Users,
  User,
  Globe,
  Lock,
  Pencil,
  BarChart,
  Shield,
  Copy,
  File,
} from "lucide-react"
import { DocumentShareDialog } from "@/components/documents/document-share-dialog"
import { useDocuments } from "@/contexts/documents-context"
import { useTeams } from "@/contexts/teams-context"
import { useSettings } from "@/contexts/settings-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const iconMap = {
  "file": FileText,
  "pdf": FilePdf,
  "xls": FileSpreadsheet,
  "bar-chart": BarChart,
  "shield": Shield,
  "copy": Copy,
  // add more mappings as needed
};

export function DocumentSharing() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("shared-with-me")
  const { toast } = useToast()
  const { sharedDocuments, updateDocument, loading, loadSharedDocuments } = useDocuments()
  const { teams } = useTeams()
  const { users } = useSettings()

  useEffect(() => {
    console.log("activeTab:", activeTab);
    if (activeTab === "shared-with-me") {
      loadSharedDocuments({ type: "shared-with-me" });
    } else if (activeTab === "shared-by-me") {
      loadSharedDocuments({ type: "shared-by-me" });
    }
  }, [activeTab, loadSharedDocuments]);

  // Separate shared documents by type
  const sharedWithMe = sharedDocuments.filter(doc => doc.sharedWith && doc.sharedWith.length > 0)
  const sharedByMe = sharedDocuments.filter(doc => doc.sharedBy && doc.sharedBy.length > 0)

  const handlePreview = (document) => {
    setSelectedDocument(document)
    setIsPreviewOpen(true)
  }

  const handleManageAccess = (document) => {
    setSelectedDocument(document)
    setIsShareDialogOpen(true)
  }

  const handleEdit = (document) => {
    setSelectedDocument(document)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDocument = (updatedDocument) => {
    updateDocument(updatedDocument.id, updatedDocument)
    toast({
      title: "Document Updated",
      description: `${updatedDocument.name} has been updated successfully.`,
    })
  }

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "Specific people":
        return <User className="h-4 w-4 text-gray-500" />
      case "Team":
        return <Users className="h-4 w-4 text-gray-500" />
      case "Anyone with link":
        return <Globe className="h-4 w-4 text-gray-500" />
      default:
        return <Lock className="h-4 w-4 text-gray-500" />
    }
  }

  // Filter documents based on search query
  const filteredSharedWithMe = sharedWithMe.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.sharedBy && doc.sharedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.sharedAt && doc.sharedAt.includes(searchQuery)) ||
      (doc.fileType && doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredSharedByMe = sharedByMe.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(doc.sharedWith)
        ? doc.sharedWith.some((person) => person.toLowerCase().includes(searchQuery.toLowerCase()))
        : String(doc.sharedWith).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.sharedAt && doc.sharedAt.includes(searchQuery)) ||
      (doc.fileType && doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Group team-shared documents by documentId and teamId
  function groupTeamShares(docs, tabPrefix = "") {
    const grouped = {};
    
    // Process all documents, creating a unique entry for each document ID
    docs.forEach((doc) => {
      const key = doc.id;
      if (!grouped[key]) {
        grouped[key] = {
          ...doc,
          teamShares: {}, // To hold shares by teamId
          userShares: [], // To hold individual user shares
        };
      }

      if (doc.shareType === "team" && doc.teamId) {
        if (!grouped[key].teamShares[doc.teamId]) {
          grouped[key].teamShares[doc.teamId] = {
            teamId: doc.teamId,
            teamName: doc.teamName,
            permission: doc.permission,
            sharedWithIds: [],
          };
        }
        if (doc.sharedWithId) {
          grouped[key].teamShares[doc.teamId].sharedWithIds.push(doc.sharedWithId);
        }
      } else if (doc.shareType === 'user' && doc.sharedWithId) {
          grouped[key].userShares.push({
              sharedWithId: doc.sharedWithId,
              sharedWith: doc.sharedWith,
              permission: doc.permission,
          });
      }
    });

    // Flatten the grouped shares into a renderable list
    const flatList = [];
    Object.values(grouped).forEach(doc => {
        // Add team shares as separate entries
        Object.values(doc.teamShares).forEach(teamShare => {
            flatList.push({
                ...doc,
                shareType: 'team',
                teamId: teamShare.teamId,
                teamName: teamShare.teamName,
                permission: teamShare.permission,
                sharedWithIds: teamShare.sharedWithIds,
                key: `${tabPrefix}${doc.id}-team-${teamShare.teamId}`
            });
        });

        // Add user shares as separate entries
        doc.userShares.forEach(userShare => {
            flatList.push({
                ...doc,
                shareType: 'user',
                permission: userShare.permission,
                sharedWith: userShare.sharedWith,
                sharedWithId: userShare.sharedWithId,
                key: `${tabPrefix}${doc.id}-user-${userShare.sharedWithId}`
            });
        });
    });

    return flatList;
  }

  // Helper to render a descriptive access badge
  const renderAccessBadge = (permission) => {
    const access = permission || 'view';
    const isEdit = access === 'edit';

    return (
      <Badge
        variant="outline"
        className={`inline-flex items-center text-xs whitespace-nowrap font-medium ${
          isEdit
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-blue-100 text-blue-800 border-blue-200'
        }`}
      >
        {isEdit ? <Pencil className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
        {isEdit ? 'Can Edit' : 'Can View'}
      </Badge>
    );
  };

  // Use grouping for filteredSharedByMe and filteredSharedWithMe
  const groupedSharedByMe = groupTeamShares(filteredSharedByMe, "shared-by-me-");
  const groupedSharedWithMe = groupTeamShares(filteredSharedWithMe, "shared-with-me-");

  // Helper to get user info from ID
  function getUserInfo(userId) {
    return users.find((u) => u.id === userId);
  }

  // Helper to get multiple users' info
  function getTeamMembersFromIds(memberIds) {
    if (!Array.isArray(memberIds)) return [];
    return users.filter((u) => memberIds.includes(u.id));
  }

  // Enhanced card rendering for Google Drive-like style
  const renderDocumentCard = (document, index) => {
    const IconComponent = iconMap[document.category?.icon] || FileText;
    const isTeam = document.shareType === "team" && document.teamId;
    const teamMembers = isTeam ? getTeamMembersFromIds(document.sharedWithIds) : [];
    const isUser = document.shareType === "user";
    const userInfo = isUser ? getUserInfo(document.sharedWithId) : null;

    return (
      <div
        key={document.key}
        className="border border-gray-200 rounded-lg bg-white px-4 py-3 mb-3 flex flex-col hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <IconComponent className="h-7 w-7 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-base truncate" title={document.name}>
                    {document.name}
            </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
            {renderAccessBadge(document.permission)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem onClick={() => handlePreview(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(document)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 min-w-0 flex-wrap">
          {isTeam ? (
            <>
              Shared with team: <span className="font-medium text-blue-700">{document.teamName || 'Unnamed Team'}</span>
              {teamMembers.length > 0 && (
                <span className="flex items-center gap-1 ml-2">
                  {teamMembers.slice(0, 5).map((member) => (
                    <span key={member.id} className="flex items-center gap-1">
                      <Avatar className="h-6 w-6 border border-gray-200">
                        <AvatarImage src={member.avatar} alt={member.fullName} />
                        <AvatarFallback>{member.fullName?.[0] || member.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-700">{member.fullName?.split(' ')[0] || member.email}</span>
                    </span>
                  ))}
                  {teamMembers.length > 5 && (
                    <span className="text-xs text-gray-400 ml-1">+{teamMembers.length - 5} more</span>
                  )}
                </span>
              )}
            </>
          ) : (
            <>
              Shared with <span className="font-medium text-blue-700">{userInfo?.fullName || document.sharedWith}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="light-mode-card shadow-xl border-none">
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search shared documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Tabs defaultValue="shared-with-me" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-gradient-to-r from-blue-100 via-blue-50 to-white rounded-lg mb-4">
              <TabsTrigger value="shared-with-me">Shared with me</TabsTrigger>
              <TabsTrigger value="shared-by-me">Shared by me</TabsTrigger>
            </TabsList>
            <TabsContent value="shared-with-me" className="space-y-4">
              {groupedSharedWithMe.length > 0 ? (
                groupedSharedWithMe.map((document, index) => renderDocumentCard(document, index))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No documents match your search.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared-by-me" className="space-y-4">
              {groupedSharedByMe.length > 0 ? (
                groupedSharedByMe.map((document, index) => renderDocumentCard(document, index))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No documents match your search.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {selectedDocument && (
        <>
          <DocumentPreview document={selectedDocument} open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
          <DocumentShareDialog
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
            document={selectedDocument}
          />
          {console.log('Selected document for edit:', selectedDocument)}
          <EditSharedDocumentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            document={selectedDocument}
            isSharedByMe={activeTab === "shared-by-me"}
            onUpdate={handleUpdateDocument}
          />
        </>
      )}
    </div>
  )
}
