"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import {
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Edit,
  Save,
  Laptop,
  Users,
  BookOpen,
  X,
} from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useCandidates } from "@/contexts/candidates-context"
import { useSettings } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"
import { useCompanies } from "@/contexts/companies-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/documents/document-upload"
import { useDocuments } from "@/contexts/documents-context"

// Category badge styles and helper (copied from onboarding-tasks.jsx for consistency)
const categoryStyles = {
  administrative: {
    color: "bg-blue-100 text-blue-800",
    icon: <Briefcase className="inline-block w-3 h-3 mr-1" />,
    label: "Administrative"
  },
  technical: {
    color: "bg-purple-100 text-purple-800",
    icon: <Laptop className="inline-block w-3 h-3 mr-1" />,
    label: "Technical"
  },
  orientation: {
    color: "bg-green-100 text-green-800",
    icon: <Users className="inline-block w-3 h-3 mr-1" />,
    label: "Orientation"
  },
  training: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <BookOpen className="inline-block w-3 h-3 mr-1" />,
    label: "Training"
  }
};
function getCategoryBadge(category) {
  if (!category) return null;
  const key = category.toLowerCase();
  const style = categoryStyles[key];
  if (!style) return (
    <span className="inline-block rounded bg-gray-100 text-gray-800 text-xs px-2 py-0.5 ml-2 font-semibold align-middle">
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
  return (
    <span className={`inline-flex items-center rounded ${style.color} text-xs px-2 py-0.5 ml-2 font-semibold align-middle shadow-sm`}>
      {style.icon}{style.label}
    </span>
  );
}

export function NewHireDetails({ newHire, onUpdate }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    name: newHire.firstName + " " + newHire.lastName,
    email: newHire.email,
    position: newHire.position,
    department: newHire.department,
    startDate: newHire.startDate,
  })

  const { onboardingTasksMap, onboardingTasksLoadingMap, fetchOnboardingTasks, notesMap, notesLoadingMap, notesErrorMap, fetchNotesForNewHire, addNoteToNewHire, updateNote, deleteNote, documentsMap, documentsLoadingMap, documentsErrorMap, fetchDocumentsForNewHire, removeDocumentFromNewHire, addDocumentToNewHire } = useOnboarding()
  const { candidates } = useCandidates()
  const { users } = useSettings()
  const { companies = [] } = useCompanies()
  const { user } = useAuth()

  // Find candidate and manager from context
  const candidate = candidates.find(c => c.id === newHire.candidateId)
  const manager = users.find(u => u.id === newHire.managerId)

  // Notes state
  const [newNote, setNewNote] = useState("")
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingTitle, setEditingTitle] = useState("")

  // Find company from context
  const company = companies.find(c => c.id === newHire.companyId)

  useEffect(() => {
    if (newHire?.id) fetchOnboardingTasks(newHire.id)
    if (newHire?.id) fetchNotesForNewHire(newHire.id)
    if (newHire?.id) fetchDocumentsForNewHire(newHire.id)
  }, [newHire?.id])

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleSaveClick = () => {
    onUpdate({
      startDate: editForm.startDate,
    })
    setIsEditMode(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Started</Badge>
      case "delayed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Delayed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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

  // Use tasks and loading state for this new hire
  const tasks = onboardingTasksMap[newHire.id] || []
  const tasksLoading = onboardingTasksLoadingMap[newHire.id]

  // Notes state
  const notes = notesMap[newHire.id] || []
  const notesLoading = notesLoadingMap[newHire.id]
  const notesError = notesErrorMap[newHire.id]

  // Documents state
  const documents = documentsMap[newHire.id] || []
  const documentsLoading = documentsLoadingMap[newHire.id]
  const documentsError = documentsErrorMap[newHire.id]

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() && !newNote.trim()) return
    await addNoteToNewHire({ newHireId: newHire.id, title: newNoteTitle, content: newNote, userId: user?.user?.id })
    setNewNote("")
    setNewNoteTitle("")
  }

  const handleEditNote = (note) => {
    setEditingNoteId(note.Note.id)
    setEditingContent(note.Note.content)
    setEditingTitle(note.Note.title)
  }

  const handleSaveEdit = async (note) => {
    await updateNote(note.Note.id, { title: editingTitle, content: editingContent, userId: user?.user?.id }, newHire.id)
    setEditingNoteId(null)
    setEditingContent("")
    setEditingTitle("")
  }

  const handleDeleteNote = async (note) => {
    await deleteNote(note.Note.id, user?.user?.id, newHire.id)
  }

  const handleRemoveDocument = async (doc) => {
    await removeDocumentFromNewHire({ newHireId: newHire.id, documentId: doc.Document.id });
  };

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { uploadDocument, allDocuments = [], categories = [] } = useDocuments();

  console.log('allDocuments for Link Existing:', allDocuments);

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => String(c.id) === String(categoryId));
    return cat ? cat.name : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={newHire.avatar} alt={newHire.firstName || newHire.name || "New Hire"} />
            <AvatarFallback className="text-2xl">{(newHire.firstName || newHire.name || "NH").charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              {isEditMode ? (
                <h2 className="text-2xl font-bold">{newHire.firstName} {newHire.lastName}</h2>
              ) : (
                <h2 className="text-2xl font-bold">{newHire.firstName} {newHire.lastName}</h2>
              )}
              <p className="text-gray-500">{newHire.position}</p>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Company:</span> {company ? company.name : `ID: ${newHire.companyId}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(newHire.status)}
              {isEditMode && (
                <Button variant="default" size="sm" className="gap-1" onClick={handleSaveClick}>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              )}
              {!isEditMode && (
                <Button variant="outline" size="sm" className="gap-1" onClick={handleEditClick}>
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{newHire.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{candidate?.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>Department: {newHire.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{newHire.workLocation || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              {isEditMode ? (
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="h-8"
                />
              ) : (
                <span>Start Date: {new Date(newHire.startDate).toLocaleDateString('en-GB')}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span>{manager?.fullName || manager?.name || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{newHire.progress}%</span>
            </div>
            <Progress value={newHire.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksLoading ? (
                  <div>Loading tasks...</div>
                ) : (
                  tasks && tasks.length > 0 ? (
                      <div className="space-y-3">
                      {tasks.map((task) => {
                        const isCompleted = task.status === "completed";
                        let borderColor = "border-l-4 border-blue-400";
                        if (isCompleted) borderColor = "border-l-4 border-green-500";
                        if (task.status === "delayed") borderColor = "border-l-4 border-red-500";
                        if (task.status === "in-progress") borderColor = "border-l-4 border-yellow-400";
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-4 bg-white rounded-lg shadow-sm p-4 transition hover:shadow-md ${borderColor}`}
                          >
                            <Checkbox
                              id={`task-${task.id}`}
                              className="mt-0.5 h-5 w-5"
                              checked={isCompleted}
                              readOnly
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-semibold text-base ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</h3>
                                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
                                </div>
                                {getCategoryBadge(task.category)}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : '-'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>No onboarding tasks found.</div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle>Documents</CardTitle>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default">Upload Document</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                    <DocumentUpload
                      onUpload={async ({ file, ...docData }) => {
                        // Upload the document, then link to new hire
                        const uploaded = await uploadDocument(file, docData);
                        await addDocumentToNewHire({ newHireId: newHire.id, documentId: uploaded.id, addedBy: user?.user?.id });
                        setUploadDialogOpen(false);
                        fetchDocumentsForNewHire(newHire.id);
                      }}
                      onClose={() => setUploadDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Link Existing</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Link Existing Document</DialogTitle></DialogHeader>
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {allDocuments
                        .filter(doc =>
                          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (getCategoryName(doc.categoryId) || "").toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-gray-500">{getCategoryName(doc.categoryId)}</div>
                            </div>
                            <Button size="sm" onClick={async () => {
                              await addDocumentToNewHire({ newHireId: newHire.id, documentId: doc.id, addedBy: user?.user?.id });
                              setLinkDialogOpen(false);
                              fetchDocumentsForNewHire(newHire.id);
                            }}>Link</Button>
                          </div>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentsLoading ? (
                  <div>Loading documents...</div>
                ) : documentsError ? (
                  <div className="text-red-500">{documentsError}</div>
                ) : documents.length === 0 ? (
                  <div>No documents found for this new hire.</div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.Document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{doc.Document.name}</h3>
                          <p className="text-xs text-gray-500">{doc.Document.type}</p>
                          <p className="text-xs text-gray-400 mt-1">Category: {getCategoryName(doc.Document.categoryId)}</p>
                          <p className="text-xs text-gray-400 mt-1">Uploaded by: {doc.addedByUser?.fullName || doc.addedByUser?.email || doc.addedByUser?.id}</p>
                          <p className="text-xs text-gray-400 mt-1">Added: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="hover:bg-red-50 focus:bg-red-100 group" onClick={() => handleRemoveDocument(doc)} aria-label="Remove document">
                        <span className="sr-only">Remove</span>
                        <svg className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notesLoading ? (
                  <div>Loading notes...</div>
                ) : notesError ? (
                  <div className="text-red-500">{notesError}</div>
                ) : (
                  <>
                    {notes.length === 0 && <div>No notes yet.</div>}
                    {notes.map((note) => (
                      <div key={note.Note.id} className="p-4 border rounded-lg relative group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{note.Note?.title || "Note"}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{note.Note?.createdAt ? new Date(note.Note.createdAt).toLocaleDateString() : ""}</span>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="hover:bg-gray-100 focus:bg-gray-200"
                                onClick={() => handleEditNote(note)}
                                aria-label="Edit note"
                              >
                                <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="hover:bg-red-50 focus:bg-red-100 group"
                                onClick={() => handleDeleteNote(note)}
                                aria-label="Delete note"
                              >
                                <span className="sr-only">Delete</span>
                                <svg className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {editingNoteId === note.Note.id ? (
                          <>
                            <Input
                              className="mb-2"
                              placeholder="Note title"
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                            />
                            <textarea
                              className="w-full border rounded p-2 text-sm"
                              value={editingContent}
                              onChange={e => setEditingContent(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleSaveEdit(note)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-line">{note.Note?.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Added by {(() => {
                                const authorId = note.Note?.author;
                                const authorUser = users.find(u => String(u.id) === String(authorId));
                                return authorUser ? (authorUser.fullName || authorUser.name || authorUser.email) : authorId;
                              })()}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="mt-4">
                      <Input
                        className="mb-2"
                        placeholder="Note title"
                        value={newNoteTitle}
                        onChange={e => setNewNoteTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full border rounded p-2 text-sm"
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() && !newNoteTitle.trim()}>Add Note</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
