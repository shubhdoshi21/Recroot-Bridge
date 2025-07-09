"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getTemplates, getAllNewHires, getOnboardingTasksForNewHire, getAllOnboardingTasks, getNotesForNewHire, addNoteToNewHire, updateNote, deleteNote, getDocumentsForNewHire, addDocumentToNewHire as addDocToNewHire, removeDocumentFromNewHire as removeDocFromNewHire, getAllOnboardingDocuments, addOnboardingDocument, removeOnboardingDocument, getTaskTemplates } from "@/services/onboardingService";

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Task templates state
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [taskTemplatesLoading, setTaskTemplatesLoading] = useState(false);

  const [newHires, setNewHires] = useState([]);
  const [newHiresLoading, setNewHiresLoading] = useState(true);
  const [newHiresError, setNewHiresError] = useState(null);

  const [onboardingTasksMap, setOnboardingTasksMap] = useState({});
  const [onboardingTasksLoadingMap, setOnboardingTasksLoadingMap] = useState({});
  const [onboardingTasksErrorMap, setOnboardingTasksErrorMap] = useState({});

  const [onboardingAllTasks, setOnboardingAllTasks] = useState([]);
  const [onboardingAllTasksLoading, setOnboardingAllTasksLoading] = useState(false);
  const [onboardingAllTasksError, setOnboardingAllTasksError] = useState(null);

  // Notes state
  const [notesMap, setNotesMap] = useState({});
  const [notesLoadingMap, setNotesLoadingMap] = useState({});
  const [notesErrorMap, setNotesErrorMap] = useState({});

  // Documents state
  const [documentsMap, setDocumentsMap] = useState({});
  const [documentsLoadingMap, setDocumentsLoadingMap] = useState({});
  const [documentsErrorMap, setDocumentsErrorMap] = useState({});

  // Onboarding documents state
  const [onboardingDocs, setOnboardingDocs] = useState([]);
  const [onboardingDocsLoading, setOnboardingDocsLoading] = useState(false);

  const refreshNewHires = () => {
    setNewHiresLoading(true);
    getAllNewHires()
      .then(data => setNewHires(data))
      .catch(err => setNewHiresError(err.message || "Failed to fetch new hires"))
      .finally(() => setNewHiresLoading(false));
  };

  const fetchOnboardingTasks = (newHireId) => {
    setOnboardingTasksLoadingMap(prev => ({ ...prev, [newHireId]: true }));
    setOnboardingTasksErrorMap(prev => ({ ...prev, [newHireId]: null }));
    getOnboardingTasksForNewHire(newHireId)
      .then(data => setOnboardingTasksMap(prev => ({ ...prev, [newHireId]: data })))
      .catch(err => setOnboardingTasksErrorMap(prev => ({ ...prev, [newHireId]: err.message || "Failed to fetch onboarding tasks" })))
      .finally(() => setOnboardingTasksLoadingMap(prev => ({ ...prev, [newHireId]: false })));
  };

  const fetchAllOnboardingTasks = useCallback((newHireId = null) => {
    setOnboardingAllTasksLoading(true);
    setOnboardingAllTasksError(null);
    getAllOnboardingTasks(newHireId)
      .then(data => setOnboardingAllTasks(data))
      .catch(err => setOnboardingAllTasksError(err.message || "Failed to fetch onboarding tasks"))
      .finally(() => setOnboardingAllTasksLoading(false));
  }, []);

  // Fetch notes for a new hire
  const fetchNotesForNewHire = useCallback((newHireId) => {
    setNotesLoadingMap(prev => ({ ...prev, [newHireId]: true }));
    setNotesErrorMap(prev => ({ ...prev, [newHireId]: null }));
    getNotesForNewHire(newHireId)
      .then(data => setNotesMap(prev => ({ ...prev, [newHireId]: data })))
      .catch(err => setNotesErrorMap(prev => ({ ...prev, [newHireId]: err.message || "Failed to fetch notes" })))
      .finally(() => setNotesLoadingMap(prev => ({ ...prev, [newHireId]: false })));
  }, []);

  // Add note
  const handleAddNoteToNewHire = async ({ newHireId, content, userId, title }) => {
    await addNoteToNewHire({ newHireId, content, userId, title });
    fetchNotesForNewHire(newHireId);
  };

  // Update note
  const handleUpdateNote = async (noteId, { content, userId, title }, newHireId) => {
    await updateNote(noteId, { content, userId, title });
    fetchNotesForNewHire(newHireId);
  };

  // Delete note
  const handleDeleteNote = async (noteId, userId, newHireId) => {
    await deleteNote(noteId, userId);
    fetchNotesForNewHire(newHireId);
  };

  const fetchDocumentsForNewHire = useCallback((newHireId) => {
    setDocumentsLoadingMap(prev => ({ ...prev, [newHireId]: true }));
    setDocumentsErrorMap(prev => ({ ...prev, [newHireId]: null }));
    getDocumentsForNewHire(newHireId)
      .then(data => setDocumentsMap(prev => ({ ...prev, [newHireId]: data })))
      .catch(err => setDocumentsErrorMap(prev => ({ ...prev, [newHireId]: err.message || "Failed to fetch documents" })))
      .finally(() => setDocumentsLoadingMap(prev => ({ ...prev, [newHireId]: false })));
  }, []);

  const handleAddDocumentToNewHire = async ({ newHireId, documentId, addedBy }) => {
    await addDocToNewHire({ newHireId, documentId, addedBy });
    fetchDocumentsForNewHire(newHireId);
  };

  const handleRemoveDocumentFromNewHire = async ({ newHireId, documentId }) => {
    await removeDocFromNewHire({ newHireId, documentId });
    fetchDocumentsForNewHire(newHireId);
  };

  const fetchOnboardingDocs = useCallback(async () => {
    setOnboardingDocsLoading(true);
    try {
      const docs = await getAllOnboardingDocuments();
      setOnboardingDocs(docs);
    } finally {
      setOnboardingDocsLoading(false);
    }
  }, []);

  const addOnboardingDoc = async (doc) => {
    // Optimistically add to state
    setOnboardingDocs(prev => [...prev, { ...doc, optimistic: true }]);
    try {
      await addOnboardingDocument(doc);
      await fetchOnboardingDocs(); // Sync with backend
    } catch (e) {
      await fetchOnboardingDocs(); // Revert if error
    }
  };

  const deleteOnboardingDoc = async (id) => {
    // Optimistically remove from state
    setOnboardingDocs(prev => prev.filter(d => d.documentId !== id));
    try {
      await removeOnboardingDocument(id);
      await fetchOnboardingDocs(); // Sync with backend
    } catch (e) {
      await fetchOnboardingDocs(); // Revert if error
    }
  };

  const refreshTemplates = useCallback(() => {
    setTemplatesLoading(true);
    getTemplates()
      .then(data => setTemplates(data))
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false));
  }, []);

  // Fetch and refresh onboarding task templates
  const refreshTaskTemplates = useCallback(() => {
    setTaskTemplatesLoading(true);
    getTaskTemplates()
      .then(data => setTaskTemplates(data))
      .catch(() => setTaskTemplates([]))
      .finally(() => setTaskTemplatesLoading(false));
  }, []);

  useEffect(() => {
    refreshNewHires();
  }, []);

  return (
    <OnboardingContext.Provider value={{
      templates, templatesLoading,
      setTemplates,
      refreshTemplates,
      taskTemplates, taskTemplatesLoading, refreshTaskTemplates,
      newHires, newHiresLoading, newHiresError,
      setNewHires,
      refreshNewHires,
      onboardingTasksMap, onboardingTasksLoadingMap, onboardingTasksErrorMap, fetchOnboardingTasks,
      onboardingAllTasks, onboardingAllTasksLoading, onboardingAllTasksError, fetchAllOnboardingTasks,
      setOnboardingAllTasks,
      // Notes
      notesMap, notesLoadingMap, notesErrorMap, fetchNotesForNewHire,
      addNoteToNewHire: handleAddNoteToNewHire,
      updateNote: handleUpdateNote,
      deleteNote: handleDeleteNote,
      // Documents
      documentsMap, documentsLoadingMap, documentsErrorMap, fetchDocumentsForNewHire,
      addDocumentToNewHire: handleAddDocumentToNewHire,
      removeDocumentFromNewHire: handleRemoveDocumentFromNewHire,
      onboardingDocs,
      onboardingDocsLoading,
      fetchOnboardingDocs,
      addOnboardingDoc,
      deleteOnboardingDoc,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
} 