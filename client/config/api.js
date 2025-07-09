const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = {
  auth: {
    register: () => `${API_BASE_URL}/auth/register`,
    login: () => `${API_BASE_URL}/auth/login`,
    logout: () => `${API_BASE_URL}/auth/logout`,
    googleAuth: () => `${API_BASE_URL}/auth/google`,
    googleAuthUrl: () => `${API_BASE_URL}/auth/google/url`,
    linkedinAuth: () => `${API_BASE_URL}/auth/linkedin`,
    linkedinAuthUrl: () => `${API_BASE_URL}/auth/linkedin/url`,
    getProfile: () => `${API_BASE_URL}/auth/profile`,
    changePassword: () => `${API_BASE_URL}/auth/change-password`,
    updateProfile: () => `${API_BASE_URL}/auth/profile`,
    checkAuthType: () => `${API_BASE_URL}/auth/check-auth-type`,
    requestOtp: () => `${API_BASE_URL}/auth/request-otp`,
    verifyOtp: () => `${API_BASE_URL}/auth/verify-otp`,
    resendOtp: () => `${API_BASE_URL}/auth/resend-otp`,
    resetPassword: () => `${API_BASE_URL}/auth/reset-password`,
    forgotPassword: () => `${API_BASE_URL}/auth/forgot-password`,
    getUserCountsByRole: () => `${API_BASE_URL}/auth/users/counts`,
  },
  users: {
    getAll: () => `${API_BASE_URL}/users`,
    getUsersForSuperAdmin: () => `${API_BASE_URL}/users/super-admin`,
    getById: (id) => `${API_BASE_URL}/users/${id}`,
    create: () => `${API_BASE_URL}/users`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    updateRole: (id) => `${API_BASE_URL}/users/${id}/role`,
    updateClient: (id) => `${API_BASE_URL}/users/${id}/client`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
    getCountsByRole: () => `${API_BASE_URL}/users/counts/role`,
  },
  permissions: {
    getAll: () => `${API_BASE_URL}/permissions`,
    getByRole: (role) => `${API_BASE_URL}/permissions/role/${role}`,
    updateRole: (role) => `${API_BASE_URL}/permissions/role/${role}`,
    getUserPermissions: (userId) => `${API_BASE_URL}/permissions/user/${userId}`,
    checkUserPermission: (userId, permissionName) => `${API_BASE_URL}/permissions/user/${userId}/check/${permissionName}`,
    grantUserPermission: (userId) => `${API_BASE_URL}/permissions/user/${userId}/grant`,
    revokeUserPermission: (userId, permissionName) => `${API_BASE_URL}/permissions/user/${userId}/revoke/${permissionName}`,
    getCategories: () => `${API_BASE_URL}/permissions/categories`,
    getMyPermissions: () => `${API_BASE_URL}/permissions/me`,
    checkMyPermission: (permissionName) => `${API_BASE_URL}/permissions/me/check/${permissionName}`,
    getSettingsPermissions: () => `${API_BASE_URL}/permissions/settings`,
    updateSettingsPermissions: () => `${API_BASE_URL}/permissions/settings`,
    seedPermissions: () => `${API_BASE_URL}/permissions/seed`,
  },
  candidates: {
    getAll: () => `${API_BASE_URL}/candidates`,
    getAllWithSkills: () => `${API_BASE_URL}/candidates/with-skills`,
    getAllWithRelations: () => `${API_BASE_URL}/candidates/with-relations`,
    getById: (id) => `${API_BASE_URL}/candidates/${id}`,
    create: () => `${API_BASE_URL}/candidates`,
    update: (id) => `${API_BASE_URL}/candidates/${id}`,
    delete: (id) => `${API_BASE_URL}/candidates/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/candidates/${id}/status`,
    // Optimized endpoints for better performance
    getProfileOptimized: (id) => `${API_BASE_URL}/candidates/${id}/profile-optimized`,
    getEducationOptimized: (id) => `${API_BASE_URL}/candidates/${id}/education-optimized`,
    getExperienceOptimized: (id) => `${API_BASE_URL}/candidates/${id}/experience-optimized`,
    getActivitiesOptimized: (id) => `${API_BASE_URL}/candidates/${id}/activities-optimized`,
    getCertificationsOptimized: (id) => `${API_BASE_URL}/candidates/${id}/certifications-optimized`,
    // Job Assignments
    getJobs: (id) => `${API_BASE_URL}/candidates/${id}/jobs`,
    assignJobs: (id) => `${API_BASE_URL}/candidates/${id}/jobs`,
    removeJob: (id, jobId) => `${API_BASE_URL}/candidates/${id}/jobs/${jobId}`,
    // Bulk Operations
    bulkUpload: () => `${API_BASE_URL}/candidates/bulk-upload`,
    bulkUploadResumes: () => `${API_BASE_URL}/candidates/bulk-upload-resumes`,
    getBulkUploadTemplate: () =>
      `${API_BASE_URL}/candidates/bulk-upload/template`,
    // Resume upload
    uploadResume: (id) => `${API_BASE_URL}/candidates/${id}/resume`,
    getResume: (id) => `${API_BASE_URL}/candidates/${id}/resume`,
    deleteResume: (id) => `${API_BASE_URL}/candidates/${id}/resume`,
    storeResumeAfterCreation: () => `${API_BASE_URL}/candidates/store-resume-after-creation`,
    uploadDocuments: (id) => `${API_BASE_URL}/candidates/${id}/documents`,
    updateDocument: (id, docId) =>
      `${API_BASE_URL}/candidates/${id}/documents/${docId}`,
    getDocuments: (id) => `${API_BASE_URL}/candidates/${id}/documents`,
    deleteDocument: (id, docId) =>
      `${API_BASE_URL}/candidates/${id}/documents/${docId}`,
    getFinalStageCandidates: () => `${API_BASE_URL}/candidates/final-stage-candidates`,
  },
  jobs: {
    // Simple get all jobs
    getJobs: () => `${API_BASE_URL}/jobs/simple`,
    // Core Job Operations
    getAll: (params) => {
      const url = new URL(`${API_BASE_URL}/jobs`);
      if (params) {
        Object.keys(params).forEach(
          (key) =>
            params[key] !== undefined &&
            url.searchParams.append(key, params[key])
        );
      }
      return url.toString();
    },
    getById: (id) => `${API_BASE_URL}/jobs/${id}`,
    create: () => `${API_BASE_URL}/jobs`,
    update: (id) => `${API_BASE_URL}/jobs/${id}`,
    delete: (id) => `${API_BASE_URL}/jobs/${id}`,

    // Job Status Management
    updateStatus: (id) => `${API_BASE_URL}/jobs/${id}/status`,

    // Job Applicants
    getApplicants: (id) => `${API_BASE_URL}/jobs/${id}/applicants`,
    applyToJob: (jobId, candidateId) =>
      `${API_BASE_URL}/jobs/${jobId}/apply/${candidateId}`,
    updateSourcedCandidateStatus: (jobId, candidateId) =>
      `${API_BASE_URL}/jobs/${jobId}/sourced-candidates/${candidateId}/status`,

    // Job Templates
    getTemplates: () => `${API_BASE_URL}/jobs/templates`,
    createTemplate: () => `${API_BASE_URL}/jobs/templates`,
    updateTemplate: (id) => `${API_BASE_URL}/jobs/templates/${id}`,
    deleteTemplate: (id) => `${API_BASE_URL}/jobs/templates/${id}`,

    // Statistics and Analytics
    getStats: () => `${API_BASE_URL}/jobs/stats`,
    getAnalytics: () => `${API_BASE_URL}/jobs/analytics`,

    // Document Management
    getDocuments: (id) => `${API_BASE_URL}/jobs/${id}/documents`,
    addDocument: (id) => `${API_BASE_URL}/jobs/${id}/documents`,

    // Bulk Operations
    getBulkUploadTemplate: () => `${API_BASE_URL}/jobs/bulk-upload/template`,

    // Reference Data
    getDepartments: () => `${API_BASE_URL}/jobs/departments`,
    addDepartment: () => `${API_BASE_URL}/jobs/departments`,
    getLocations: () => `${API_BASE_URL}/jobs/locations`,
    addLocation: () => `${API_BASE_URL}/jobs/locations`,
    getTypes: () => `${API_BASE_URL}/jobs/types`,
    addType: () => `${API_BASE_URL}/jobs/types`,

    // AI Features
    generateDescription: () => `${API_BASE_URL}/jobs/ai-generate`,

    // Interview Scheduling
    scheduleInterview: () => `${API_BASE_URL}/interviews`,

    // Unassigned Jobs
    getUnassigned: () => `${API_BASE_URL}/jobs/unassigned`,

    getAllWithApplicantsCount: () =>
      `${API_BASE_URL}/jobs/with-applicants-count`,

    // Route for updating the status of a sourced candidate (assignment)
    updateAssignmentStatus: (jobId, candidateId) =>
      `${API_BASE_URL}/jobs/${jobId}/assignments/${candidateId}/status`,
  },
  applications: {
    // Route for updating the status of a formal application
    updateStatus: (applicationId) =>
      `${API_BASE_URL}/applications/${applicationId}/status`,
    // Route for rejecting a formal application
    reject: (applicationId) =>
      `${API_BASE_URL}/applications/${applicationId}/reject`,
  },
  ats: {
    // Calculate ATS scores for a candidate across all jobs
    calculateCandidateScore: (candidateId) =>
      `${API_BASE_URL}/ats/candidate/${candidateId}`,
    // Calculate ATS scores for a job across all candidates
    calculateJobScore: (jobId) => `${API_BASE_URL}/ats/job/${jobId}`,
    // Get all ATS scores for a candidate
    getCandidateScores: (candidateId) =>
      `${API_BASE_URL}/ats/candidate/${candidateId}/scores`,
    // Get all ATS scores for a job
    getJobScores: (jobId) => `${API_BASE_URL}/ats/job/${jobId}/scores`,
    // Get single ATS score for a candidate-job combination
    getSingleATSScore: (candidateId, jobId) =>
      `${API_BASE_URL}/ats/score/${candidateId}/${jobId}`,
    // Ensure ATS scores exist for a candidate-job combination
    ensureATSScores: (candidateId, jobId) =>
      `${API_BASE_URL}/ats/ensure/${candidateId}/${jobId}`,
  },
  recruiters: {
    getAll: () => `${API_BASE_URL}/recruiters`,
    getById: (id) => `${API_BASE_URL}/recruiters/${id}`,
    create: () => `${API_BASE_URL}/recruiters`,
    update: (id) => `${API_BASE_URL}/recruiters/${id}`,
    delete: (id) => `${API_BASE_URL}/recruiters/${id}`,
    getPerformance: (id) => `${API_BASE_URL}/recruiters/${id}/performance`,
    getAllPerformance: () => `${API_BASE_URL}/recruiters/performance`,
    getJobs: (id) => `${API_BASE_URL}/recruiters/${id}/jobs`,
    assignJob: (id) => `${API_BASE_URL}/recruiters/${id}/jobs`,
    removeJob: (id, jobId) => `${API_BASE_URL}/recruiters/${id}/jobs/${jobId}`,
    search: () => `${API_BASE_URL}/recruiters/search`,
    getStats: () => `${API_BASE_URL}/recruiters/stats`,
    getAvailableJobs: (id) => `${API_BASE_URL}/recruiters/${id}/available-jobs`,
  },

  teams: {
    getAll: () => `${API_BASE_URL}/teams`,
    getById: (id) => `${API_BASE_URL}/teams/${id}`,
    create: () => `${API_BASE_URL}/teams`,
    update: (id) => `${API_BASE_URL}/teams/${id}`,
    delete: (id) => `${API_BASE_URL}/teams/${id}`,
    getMembers: (id) => `${API_BASE_URL}/teams/${id}/members`,
    addMember: (id) => `${API_BASE_URL}/teams/${id}/members`,
    updateMember: (teamId, memberId) =>
      `${API_BASE_URL}/teams/${teamId}/members/${memberId}`,
    removeMember: (teamId, memberId) =>
      `${API_BASE_URL}/teams/${teamId}/members/${memberId}`,
    getJobs: (id) => `${API_BASE_URL}/teams/${id}/jobs`,
    assignJobs: (id) => `${API_BASE_URL}/teams/${id}/jobs`,
    removeJob: (teamId, jobId) =>
      `${API_BASE_URL}/teams/${teamId}/jobs/${jobId}`,
    getJobById: (id, jobId) => `${API_BASE_URL}/teams/${id}/jobs/${jobId}`,
    getPerformance: (id) => `${API_BASE_URL}/teams/${id}/performance`,
    getSubteams: (id) => `${API_BASE_URL}/teams/${id}/subteams`,
    addSubteam: (id) => `${API_BASE_URL}/teams/${id}/subteams`,
    removeSubteam: (id, subteamId) =>
      `${API_BASE_URL}/teams/${id}/subteams/${subteamId}`,
    updateLead: (id) => (id ? `${API_BASE_URL}/teams/${id}/lead` : null),
    search: () => `${API_BASE_URL}/teams/search`,
    stats: () => `${API_BASE_URL}/teams/stats`,
    departments: () => `${API_BASE_URL}/teams/departments`,
    locations: () => `${API_BASE_URL}/teams/locations`,
  },
  companies: {
    getAll: (params) => {
      const url = new URL(`${API_BASE_URL}/companies`);
      if (params) {
        Object.keys(params).forEach(
          (key) =>
            params[key] !== undefined &&
            url.searchParams.append(key, params[key])
        );
      }
      return url.toString();
    },
    getById: (id) => `${API_BASE_URL}/companies/${id}`,
    create: () => `${API_BASE_URL}/companies`,
    update: (id) => `${API_BASE_URL}/companies/${id}`,
    delete: (id) => `${API_BASE_URL}/companies/${id}`,
    // Contacts
    getContacts: (id) => `${API_BASE_URL}/companies/${id}/contacts`,
    addContact: (id) => `${API_BASE_URL}/companies/${id}/contacts`,
    updateContact: (id, contactId) =>
      `${API_BASE_URL}/companies/${id}/contacts/${contactId}`,
    deleteContact: (id, contactId) =>
      `${API_BASE_URL}/companies/${id}/contacts/${contactId}`,
    // Documents
    getDocuments: (id) => `${API_BASE_URL}/companies/${id}/documents`,
    addDocument: (id) => `${API_BASE_URL}/companies/${id}/documents`,
    getDocumentById: (id, documentId) =>
      `${API_BASE_URL}/companies/${id}/documents/${documentId}`,
    updateDocument: (id, documentId) =>
      `${API_BASE_URL}/companies/${id}/documents/${documentId}`,
    deleteDocument: (id, documentId) =>
      `${API_BASE_URL}/companies/${id}/documents/${documentId}`,
    shareDocument: (id, documentId) =>
      `${API_BASE_URL}/companies/${id}/documents/${documentId}/share`,
    // Notes
    getNotes: (id) => `${API_BASE_URL}/companies/${id}/notes`,
    addNote: (id) => `${API_BASE_URL}/companies/${id}/notes`,
    updateNote: (id, noteId) =>
      `${API_BASE_URL}/companies/${id}/notes/${noteId}`,
    deleteNote: (id, noteId) =>
      `${API_BASE_URL}/companies/${id}/notes/${noteId}`,
    // Jobs
    getJobs: (id) => `${API_BASE_URL}/companies/${id}/jobs`,
    addJob: (id) => `${API_BASE_URL}/companies/${id}/jobs`,
    deleteJob: (id, jobId) => `${API_BASE_URL}/companies/${id}/jobs/${jobId}`,
    // Candidates
    getCandidates: (id) => `${API_BASE_URL}/companies/${id}/candidates`,
    getCandidateById: (id, candidateId) =>
      `${API_BASE_URL}/companies/${id}/candidates/${candidateId}`,
    // Analytics
    getActivity: (id) => `${API_BASE_URL}/companies/${id}/activity`,
    getHiringAnalytics: (id) =>
      `${API_BASE_URL}/companies/${id}/analytics/hiring`,
    getPipelineAnalytics: (id) =>
      `${API_BASE_URL}/companies/${id}/analytics/pipeline`,
    // Reference data
    getIndustries: () => `${API_BASE_URL}/companies/industries`,
    addIndustry: () => `${API_BASE_URL}/companies/industries`,
    getLocations: () => `${API_BASE_URL}/companies/locations`,
    addLocation: () => `${API_BASE_URL}/companies/locations`,
    getSizes: () => `${API_BASE_URL}/companies/sizes`,
    getStats: () => `${API_BASE_URL}/companies/stats`,
    // Validation
    validateGSTIN: () => `${API_BASE_URL}/companies/validate/gstin`,
    validatePAN: () => `${API_BASE_URL}/companies/validate/pan`,
  },
  clients: {
    getAll: () => `${API_BASE_URL}/clients`,
    getById: (id) => `${API_BASE_URL}/clients/${id}`,
    create: () => `${API_BASE_URL}/clients`,
    update: (id) => `${API_BASE_URL}/clients/${id}`,
    delete: (id) => `${API_BASE_URL}/clients/${id}`,
    deactivate: (id) => `${API_BASE_URL}/clients/${id}/deactivate`,
    reactivate: (id) => `${API_BASE_URL}/clients/${id}/reactivate`,
  },
  pipelines: {
    create: () => `${API_BASE_URL}/pipelines`,
    getAll: () => `${API_BASE_URL}/pipelines`,
    getById: (id) => `${API_BASE_URL}/pipelines/${id}`,
    update: (id) => `${API_BASE_URL}/pipelines/${id}`,
    delete: (id) => `${API_BASE_URL}/pipelines/${id}`,
  },
  documents: {
    // Core Document Operations
    getAll: (params) => {
      const url = new URL(`${API_BASE_URL}/documents`);
      if (params) {
        Object.keys(params).forEach(
          (key) =>
            params[key] !== undefined &&
            url.searchParams.append(key, params[key])
        );
      }
      return url.toString();
    },
    getById: (id) => `${API_BASE_URL}/documents/${id}`,
    upload: () => `${API_BASE_URL}/documents`,
    update: (id) => `${API_BASE_URL}/documents/${id}`,
    delete: (id) => `${API_BASE_URL}/documents/${id}`,

    // Content and Download
    download: (id) => `${API_BASE_URL}/documents/${id}/download`,
    getContent: (id) => `${API_BASE_URL}/documents/${id}/content`,

    // Sharing
    share: (id) => `${API_BASE_URL}/documents/${id}/share`,
    getShared: (params) => {
      const url = new URL(`${API_BASE_URL}/documents/shared`);
      if (params) {
        Object.keys(params).forEach(
          (key) =>
            params[key] !== undefined &&
            url.searchParams.append(key, params[key])
        );
      }
      return url.toString();
    },
    removeAccess: (id) => `${API_BASE_URL}/documents/shared/${id}/access`,

    // Document Templates
    // getTemplates: () => `${API_BASE_URL}/documents/templates`,
    // createTemplate: () => `${API_BASE_URL}/documents/templates`,
    // getTemplateById: (id) => `${API_BASE_URL}/documents/templates/${id}`,
    // updateTemplate: (id) => `${API_BASE_URL}/documents/templates/${id}`,
    // deleteTemplate: (id) => `${API_BASE_URL}/documents/templates/${id}`,
    // useTemplate: (id) => `${API_BASE_URL}/documents/templates/${id}/use`,

    // Document Categories
    getCategories: () => `${API_BASE_URL}/documents/categories`,
    createCategory: () => `${API_BASE_URL}/documents/categories`,

    // Document Tags
    getTags: () => `${API_BASE_URL}/documents/tags`,
    createTag: () => `${API_BASE_URL}/documents/tags`,

    // Document Uploaders
    getUploaders: () => `${API_BASE_URL}/documents/uploaders`,

    // Document Versions
    getVersions: (id) => `${API_BASE_URL}/documents/${id}/versions`,
    createVersion: (id) => `${API_BASE_URL}/documents/${id}/versions`,

    // Document Analytics
    getStats: () => `${API_BASE_URL}/documents/stats`,
    search: () => `${API_BASE_URL}/documents/search`,
    getActivity: (id) => `${API_BASE_URL}/documents/${id}/activity`,

    // Bulk Operations
    bulkUpload: () => `${API_BASE_URL}/documents/bulk-upload`,
    export: () => `${API_BASE_URL}/documents/export`,

    getCandidateList: () => `${API_BASE_URL}/documents/candidate-list`,
    getCandidateDocuments: () =>
      `${API_BASE_URL}/documents/candidate-documents`,
    getCompanyList: () => `${API_BASE_URL}/documents/company-list`,
    getCompanyDocuments: () => `${API_BASE_URL}/documents/company-documents`,
  },
  interviews: {
    getAll: `${API_BASE_URL}/interviews`,
    getById: (id) => `${API_BASE_URL}/interviews/${id}`,
    create: `${API_BASE_URL}/interviews`,
    update: (id) => `${API_BASE_URL}/interviews/${id}`,
    delete: (id) => `${API_BASE_URL}/interviews/${id}`,
    getByCandidate: (candidateId) =>
      `${API_BASE_URL}/interviews/candidate/${candidateId}`,
    getByApplication: (applicationId) =>
      `${API_BASE_URL}/interviews/application/${applicationId}`,
    getCandidatesWithApplications: `${API_BASE_URL}/interviews/candidates-with-applications`,
    getApplicationsWithCandidates: `${API_BASE_URL}/interviews/applications-with-candidates`,
    getPipelineStages: `${API_BASE_URL}/interviews/pipeline-stages`,
    getCandidateWithDetails: (candidateId) =>
      `${API_BASE_URL}/interviews/candidate-details/${candidateId}`,
    getApplicationWithDetails: (applicationId) =>
      `${API_BASE_URL}/interviews/application-details/${applicationId}`,
    getCandidateInterviewsWithDetails: (candidateId) =>
      `${API_BASE_URL}/interviews/candidate-interviews/${candidateId}`,
    getApplicationInterviewsWithDetails: (applicationId) =>
      `${API_BASE_URL}/interviews/application-interviews/${applicationId}`,
  },
  communications: {
    emailTemplates: {
      getAll: () => `${API_BASE_URL}/communications/email-templates`,
      getById: (id) => `${API_BASE_URL}/communications/email-templates/${id}`,
    },
    automatedMessages: {
      getAll: () => `${API_BASE_URL}/communications/automated-messages`,
      create: () => `${API_BASE_URL}/communications/automated-messages`,
      update: (id) => `${API_BASE_URL}/communications/automated-messages/${id}`,
      toggleStatus: (id) => `${API_BASE_URL}/communications/automated-messages/${id}/toggle-status`,
      delete: (id) => `${API_BASE_URL}/communications/automated-messages/${id}`,
    },
    automation: {
      trigger: () => `${API_BASE_URL}/communications/automation/trigger`,
      variables: () => `${API_BASE_URL}/communications/automation/variables`,
      test: () => `${API_BASE_URL}/communications/automation/test`,
      triggers: () => `${API_BASE_URL}/communications/automation/triggers`,
      variablesList: () => `${API_BASE_URL}/communications/automation/variables/list`,
      message: () => `${API_BASE_URL}/communications/automation/message`,
      editMessage: () => `${API_BASE_URL}/communications/automation/edit-message`,
    },
    sendEmail: () => `${API_BASE_URL}/communications/send-email`,
  },
  onboarding: {
    initiate: () => `${API_BASE_URL}/onboarding/initiate`,
    getAllNewHires: () => `${API_BASE_URL}/onboarding/new-hires`,
    updateNewHire: (id) => `${API_BASE_URL}/onboarding/new-hires/${id}`,
    deleteNewHire: (id) => `${API_BASE_URL}/onboarding/new-hires/${id}`,
    templates: {
      getAll: () => `${API_BASE_URL}/onboarding/templates`,
      getById: (id) => `${API_BASE_URL}/onboarding/templates/${id}`,
      create: () => `${API_BASE_URL}/onboarding/templates`,
      update: (id) => `${API_BASE_URL}/onboarding/templates/${id}`,
      delete: (id) => `${API_BASE_URL}/onboarding/templates/${id}`,
      getTasks: (id) => `${API_BASE_URL}/onboarding/templates/${id}/tasks`,
      updateTasks: (id) => `${API_BASE_URL}/onboarding/templates/${id}/tasks`,
    },
    taskTemplates: {
      getAll: () => `${API_BASE_URL}/onboarding/task-templates`,
      getById: (id) => `${API_BASE_URL}/onboarding/task-templates/${id}`,
      create: () => `${API_BASE_URL}/onboarding/task-templates`,
      update: (id) => `${API_BASE_URL}/onboarding/task-templates/${id}`,
      delete: (id) => `${API_BASE_URL}/onboarding/task-templates/${id}`,
    },
    applyTemplateToNewHire: () => `${API_BASE_URL}/onboarding/apply-template`,
    getOnboardingTasksForNewHire: (newHireId) => `${API_BASE_URL}/onboarding/tasks/${newHireId}`,
    getAllOnboardingTasks: (newHireId) => newHireId ? `${API_BASE_URL}/onboarding/tasks?newHireId=${newHireId}` : `${API_BASE_URL}/onboarding/tasks`,
    updateTask: (taskId) => `${API_BASE_URL}/onboarding/tasks/${taskId}`,
    deleteTask: (taskId) => `${API_BASE_URL}/onboarding/tasks/${taskId}`,
    notes: {
      addNote: () => `${API_BASE_URL}/onboarding/notes`,
      getNotes: (newHireId) => `${API_BASE_URL}/onboarding/notes/${newHireId}`,
      updateNote: (noteId) => `${API_BASE_URL}/onboarding/notes/${noteId}`,
      deleteNote: (noteId) => `${API_BASE_URL}/onboarding/notes/${noteId}`,
    },
    newHireDocuments: {
      get: (newHireId) => `${API_BASE_URL}/onboarding/new-hires/${newHireId}/documents`,
      add: (newHireId) => `${API_BASE_URL}/onboarding/new-hires/${newHireId}/documents`,
      remove: (newHireId, documentId) => `${API_BASE_URL}/onboarding/new-hires/${newHireId}/documents/${documentId}`,
    },
    documents: {
      getAll: () => `${API_BASE_URL}/onboarding/documents`,
      add: () => `${API_BASE_URL}/onboarding/documents`,
      remove: (id) => `${API_BASE_URL}/onboarding/documents/${id}`,
    },
    createTask: () => `${API_BASE_URL}/onboarding/tasks`,
  },
};
