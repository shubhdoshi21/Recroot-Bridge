"use client";
import { useSettings } from "@/contexts/settings-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import AccountSettings from "@/components/settings/account-settings";
import SecuritySettings from "@/components/settings/security-settings";
// import PreferencesSettings from "@/components/settings/preferences-settings";
// import NotificationSettings from "@/components/settings/notification-settings";
// import PrivacySettings from "@/components/settings/privacy-settings";
import AccessSettings from "@/components/settings/access-settings";
import EditRoleDialog from "@/components/settings/edit-role-dialog";
import DeleteRoleDialog from "@/components/settings/delete-role-dialog";
import CreateRoleDialog from "@/components/settings/create-role-dialog";
import AddUserDialog from "@/components/settings/add-user-dialog";
import { permissionService } from "@/services/permissionService";
import { Settings as SettingsIcon } from "lucide-react";

const defaultAvatars = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5295.jpg-fLw0wGGZp8wuTzU5dnyfjZDwAHN98a.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9720029.jpg-Yf9h2a3kT7rYyCb648iLIeHThq5wEy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27470341_7294795.jpg-XE0zf7R8tk4rfA1vm4fAHeZ1QoVEOo.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/799.jpg-0tEi4Xvg5YsFoGoQfQc698q4Dygl1S.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334228.jpg-eOsHCkvVrVAwcPHKYSs5sQwVKsqWpC.jpeg",
];

// Add type guard for Role
const isRole = (value) => {
  return ["Admin", "Manager", "Recruiter", "User", "Guest"].includes(
    value
  );
};

// Add defaultRolePermissions at the top of the component
const defaultRolePermissions = {
  admin: [
    'dashboard.view', 'dashboard.edit_widgets', 'dashboard.view_analytics',
    'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.delete', 'candidates.bulk_upload',
    'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete', 'jobs.publish',
    'settings.view', 'settings.edit_system', 'settings.manage_users', 'settings.manage_integrations',
    'companies.view', 'companies.create', 'companies.edit', 'companies.delete',
    'recruiters.view', 'recruiters.create', 'recruiters.edit', 'recruiters.delete',
    'teams.view', 'teams.create', 'teams.edit', 'teams.delete',
    'documents.view', 'documents.create', 'documents.edit', 'documents.delete', 'documents.share',
    'interviews.view', 'interviews.create', 'interviews.edit', 'interviews.delete',
    'communications.view', 'communications.create', 'communications.edit',
    'analytics.view', 'analytics.export',
    'onboarding.view', 'onboarding.create', 'onboarding.edit', 'onboarding.delete'
  ],
  manager: [
    'dashboard.view', 'dashboard.edit_widgets', 'dashboard.view_analytics',
    'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.bulk_upload',
    'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.publish',
    'settings.view',
    'companies.view', 'companies.create', 'companies.edit',
    'recruiters.view', 'recruiters.create', 'recruiters.edit',
    'teams.view', 'teams.create', 'teams.edit',
    'documents.view', 'documents.create', 'documents.edit', 'documents.share',
    'interviews.view', 'interviews.create', 'interviews.edit',
    'communications.view', 'communications.create', 'communications.edit',
    'analytics.view',
    'onboarding.view', 'onboarding.create', 'onboarding.edit'
  ],
  recruiter: [
    'dashboard.view', 'dashboard.view_analytics',
    'candidates.view', 'candidates.create', 'candidates.edit',
    'jobs.view',
    'companies.view',
    'teams.view',
    'documents.view', 'documents.create', 'documents.edit',
    'interviews.view', 'interviews.create', 'interviews.edit',
    'communications.view', 'communications.create',
    'analytics.view',
    'onboarding.view'
  ],
  user: [
    'dashboard.view',
    'candidates.view',
    'jobs.view',
    'companies.view',
    'teams.view',
    'documents.view',
    'interviews.view',
    'communications.view',
    'onboarding.view'
  ],
  guest: [
    'jobs.view'
  ]
};

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    users,
    roleCounts,
    isLoadingUsers,
    isLoadingRoleCounts,
    addUser,
    updateUserRole,
    fetchUsers,
    fetchRoleCounts,
  } = useSettings();
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    avatar: "/placeholder.svg?height=40&width=40",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Custom roles state
  const [customRoles, setCustomRoles] = useState([
    { id: 1, name: "Senior Recruiter", basedOn: "Recruiter", users: 3 },
    { id: 2, name: "Team Lead", basedOn: "Manager", users: 5 },
    { id: 3, name: "Hiring Manager", basedOn: "User", users: 12 },
  ]);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);
  const [isEditingRole, setIsEditingRole] = useState(false);

  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    basedOn: "User",
    users: 0,
  });
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Add a new state variable for tracking the saving state of access settings
  const [isSavingAccessSettings, setIsSavingAccessSettings] = useState(false);

  // Add state to track permissions for each role
  const [permissions, setPermissions] = useState({
    admin: {},
    manager: {},
    recruiter: {},
    user: {},
    guest: {},
  });

  // Store the default permissions for reset functionality
  const defaultPermissionsRef = useRef({});

  // Add state for saving permissions
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Load permissions from API on component mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      const response = await permissionService.getSettingsPermissions();
      const rolePermissions = response.data || response;

      if (rolePermissions) {
        // Transform the API response to match the frontend format
        const transformedPermissions = {};

        Object.keys(rolePermissions).forEach(role => {
          const normalizedRole = role.toLowerCase();
          const rolePerms = rolePermissions[role];
          transformedPermissions[normalizedRole] = {
            Dashboard: [
              { name: "View Dashboard", enabled: rolePerms.includes('dashboard.view') },
              { name: "Edit Dashboard Widgets", enabled: rolePerms.includes('dashboard.edit_widgets') },
              { name: "View Analytics", enabled: rolePerms.includes('dashboard.view_analytics') },
            ],
            Candidates: [
              { name: "View Candidates", enabled: rolePerms.includes('candidates.view') },
              { name: "Add Candidates", enabled: rolePerms.includes('candidates.create') },
              { name: "Edit Candidates", enabled: rolePerms.includes('candidates.edit') },
              { name: "Delete Candidates", enabled: rolePerms.includes('candidates.delete') },
            ],
            Jobs: [
              { name: "View Jobs", enabled: rolePerms.includes('jobs.view') },
              { name: "Create Jobs", enabled: rolePerms.includes('jobs.create') },
              { name: "Edit Jobs", enabled: rolePerms.includes('jobs.edit') },
              { name: "Delete Jobs", enabled: rolePerms.includes('jobs.delete') },
            ],
            Settings: [
              { name: "View Settings", enabled: rolePerms.includes('settings.view') },
              { name: "Edit System Settings", enabled: rolePerms.includes('settings.edit_system') },
              { name: "Manage Users", enabled: rolePerms.includes('settings.manage_users') },
              { name: "Manage Integrations", enabled: rolePerms.includes('settings.manage_integrations') },
            ],
            Companies: [
              { name: "View Companies", enabled: rolePerms.includes('companies.view') },
              { name: "Create Companies", enabled: rolePerms.includes('companies.create') },
              { name: "Edit Companies", enabled: rolePerms.includes('companies.edit') },
              { name: "Delete Companies", enabled: rolePerms.includes('companies.delete') },
            ],
            Recruiters: [
              { name: "View Recruiters", enabled: rolePerms.includes('recruiters.view') },
              { name: "Create Recruiters", enabled: rolePerms.includes('recruiters.create') },
              { name: "Edit Recruiters", enabled: rolePerms.includes('recruiters.edit') },
              { name: "Delete Recruiters", enabled: rolePerms.includes('recruiters.delete') },
            ],
            Teams: [
              { name: "View Teams", enabled: rolePerms.includes('teams.view') },
              { name: "Create Teams", enabled: rolePerms.includes('teams.create') },
              { name: "Edit Teams", enabled: rolePerms.includes('teams.edit') },
              { name: "Delete Teams", enabled: rolePerms.includes('teams.delete') },
            ],
            Documents: [
              { name: "View Documents", enabled: rolePerms.includes('documents.view') },
              { name: "Create Documents", enabled: rolePerms.includes('documents.create') },
              { name: "Edit Documents", enabled: rolePerms.includes('documents.edit') },
              { name: "Delete Documents", enabled: rolePerms.includes('documents.delete') },
              { name: "Share Documents", enabled: rolePerms.includes('documents.share') },
            ],
            Interviews: [
              { name: "View Interviews", enabled: rolePerms.includes('interviews.view') },
              { name: "Create Interviews", enabled: rolePerms.includes('interviews.create') },
              { name: "Edit Interviews", enabled: rolePerms.includes('interviews.edit') },
              { name: "Delete Interviews", enabled: rolePerms.includes('interviews.delete') },
            ],
            Communications: [
              { name: "View Communications", enabled: rolePerms.includes('communications.view') },
              { name: "Create Communications", enabled: rolePerms.includes('communications.create') },
              { name: "Edit Communications", enabled: rolePerms.includes('communications.edit') },
            ],
            Analytics: [
              { name: "View Analytics", enabled: rolePerms.includes('analytics.view') },
              { name: "Export Analytics", enabled: rolePerms.includes('analytics.export') },
            ],
            Onboarding: [
              // Onboarding Document permissions
              { name: "View Onboarding Documents", enabled: rolePerms.includes('onboarding_document.view') },
              { name: "Upload Onboarding Documents", enabled: rolePerms.includes('onboarding_document.upload') },
              { name: "Download Onboarding Documents", enabled: rolePerms.includes('onboarding_document.download') },
              { name: "Delete Onboarding Documents", enabled: rolePerms.includes('onboarding_document.delete') },
              // Onboarding Task permissions
              { name: "View Onboarding Tasks", enabled: rolePerms.includes('onboarding_task.view') },
              { name: "Create Onboarding Tasks", enabled: rolePerms.includes('onboarding_task.create') },
              { name: "Edit Onboarding Tasks", enabled: rolePerms.includes('onboarding_task.edit') },
              { name: "Delete Onboarding Tasks", enabled: rolePerms.includes('onboarding_task.delete') },
              { name: "Assign Onboarding Tasks", enabled: rolePerms.includes('onboarding_task.assign') },
              // Onboarding Template permissions
              { name: "View Onboarding Templates", enabled: rolePerms.includes('onboarding_template.view') },
              { name: "Create Onboarding Templates", enabled: rolePerms.includes('onboarding_template.create') },
              { name: "Edit Onboarding Templates", enabled: rolePerms.includes('onboarding_template.edit') },
              { name: "Delete Onboarding Templates", enabled: rolePerms.includes('onboarding_template.delete') },
              { name: "Assign Onboarding Templates", enabled: rolePerms.includes('onboarding_template.assign') },
              // Task Template permissions
              { name: "View Task Templates", enabled: rolePerms.includes('task_template.view') },
              { name: "Create Task Templates", enabled: rolePerms.includes('task_template.create') },
              { name: "Edit Task Templates", enabled: rolePerms.includes('task_template.edit') },
              { name: "Delete Task Templates", enabled: rolePerms.includes('task_template.delete') },
              // New Hire permissions
              { name: "View New Hires", enabled: rolePerms.includes('new_hires.view') },
              { name: "Create New Hires", enabled: rolePerms.includes('new_hires.create') },
              { name: "Edit New Hires", enabled: rolePerms.includes('new_hires.edit') },
              { name: "Delete New Hires", enabled: rolePerms.includes('new_hires.delete') },
            ],
          };
        });

        setPermissions(transformedPermissions);
        defaultPermissionsRef.current = JSON.parse(JSON.stringify(transformedPermissions));
      }
    } catch (error) {
      console.log("Error loading permissions:", error);
      toast.error("Failed to load permissions", {
        description: "Please refresh the page to try again.",
      });
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handleSaveAccount = async () => {
    // Validate inputs
    if (!settings.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (
      !settings.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)
    ) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSaving(true);

      // Create an object with only the account-related settings
      const accountSettings = {
        avatar: selectedAvatar,
        fullName: settings.fullName,
        email: settings.email,
        phone: settings.phone,
      };

      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update the settings
      updateSettings(accountSettings);

      // Update user profile in auth context if available
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("auth");
        if (authData) {
          const userData = JSON.parse(authData);
          userData.user = {
            ...userData.user,
            fullName: accountSettings.fullName,
            email: accountSettings.email,
            avatar: accountSettings.avatar,
          };
          localStorage.setItem("auth", JSON.stringify(userData));

          // Force refresh auth context if needed
          if (window.dispatchEvent) {
            window.dispatchEvent(new Event("storage"));
          }
        }
      }

      // Show success message
      toast.success("Account settings saved successfully", {
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      console.log("Error saving settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // const handleSaveNotifications = () => {
  //   updateNotificationSettings(settings.notifications);
  //   toast.success("Notification settings saved successfully");
  // };

  // const handleSavePrivacy = () => {
  //   updatePrivacySettings(settings.privacy);
  //   toast.success("Privacy settings saved successfully");
  // };

  const handleSaveSecurity = async () => {
    // Validate inputs
    if (!securityForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (securityForm.newPassword && securityForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSavingSecurity(true);

      // Simulate API call to verify current password and save new settings
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In a real app, you would verify the current password and update the password in your backend

      // Show success message
      toast.success("Security settings saved successfully", {
        description: securityForm.newPassword
          ? "Your password has been updated."
          : "Your security settings have been updated.",
      });

      // Clear password fields after successful save
      if (securityForm.newPassword) {
        setSecurityForm({
          ...securityForm,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.log("Error saving security settings:", error);
      toast.error("Failed to save security settings", {
        description: "Please try again later.",
      });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleAddUser = async () => {
    // Validate inputs
    if (!newUser.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (
      !newUser.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)
    ) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsAddingUser(true);

      // Simulate API call to add user
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Add the new user to the list
      setUsers([...users, { ...newUser }]);

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        role: "User",
        avatar: "/placeholder.svg?height=40&width=40",
      });
      setShowAddUserDialog(false);

      // Show success message
      toast.success("User added successfully", {
        description: `${newUser.name} has been added with ${newUser.role} role.`,
      });
    } catch (error) {
      console.log("Error adding user:", error);
      toast.error("Failed to add user", {
        description: "Please try again later.",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  // Function to handle creating a new custom role
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (!isRole(newRole.basedOn)) {
      toast.error("Invalid role type");
      return;
    }

    try {
      setIsCreatingRole(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newRoleWithId = {
        id: Date.now(),
        name: newRole.name,
        basedOn: newRole.basedOn,
        users: newRole.users,
      };

      setCustomRoles([...customRoles, newRoleWithId]);
      setShowCreateRoleDialog(false);
      setNewRole({
        name: "",
        basedOn: "User",
        users: 0,
      });

      toast.success("Role created successfully", {
        description: `${newRole.name} has been created.`,
      });
    } catch (error) {
      console.log("Error creating role:", error);
      toast.error("Failed to create role", {
        description: "Please try again later.",
      });
    }
  };

  // Function to handle editing a custom role
  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowEditRoleDialog(true);
  };

  // Function to handle deleting a custom role
  const handleDeleteRole = (roleId) => {
    setDeletingRoleId(roleId);
    setShowDeleteRoleDialog(true);
  };

  // Function to save edited role
  const handleSaveEditedRole = async () => {
    if (!editingRole?.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setIsEditingRole(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCustomRoles(
        customRoles.map((role) =>
          role.id === editingRole.id ? editingRole : role
        )
      );
      setShowEditRoleDialog(false);
      setEditingRole(null);
      toast.success("Role updated successfully", {
        description: `${editingRole.name} has been updated.`,
      });
    } catch (error) {
      console.log("Error updating role:", error);
      toast.error("Failed to update role", {
        description: "Please try again later.",
      });
    } finally {
      setIsEditingRole(false);
    }
  };

  // Function to confirm role deletion
  const handleConfirmDeleteRole = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get the role name before deletion for the toast message
      const roleName = customRoles.find(
        (role) => role.id === deletingRoleId
      )?.name;

      // Remove the role from the list
      setCustomRoles(customRoles.filter((role) => role.id !== deletingRoleId));

      // Close dialog and reset state
      setShowDeleteRoleDialog(false);
      setDeletingRoleId(null);

      // Show success message
      toast.success("Role deleted successfully", {
        description: `${roleName} has been removed.`,
      });
    } catch (error) {
      console.log("Error deleting role:", error);
      toast.error("Failed to delete role", {
        description: "Please try again later.",
      });
    }
  };

  // Function to save all access settings
  // const handleSaveAccessSettings = async () => {
  //   try {
  //     setIsSavingAccessSettings(true);

  //     // Simulate API call to save all access settings
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // In a real app, you would save all the access-related settings:
  //     // - Custom roles
  //     // - User role assignments
  //     // - Permissions for each role

  //     // Show success message
  //     toast.success("Access settings saved successfully", {
  //       description: "All role and permission changes have been applied.",
  //     });
  //   } catch (error) {
  //     console.log("Error saving access settings:", error);
  //     toast.error("Failed to save access settings", {
  //       description: "Please try again later.",
  //     });
  //   } finally {
  //     setIsSavingAccessSettings(false);
  //   }
  // };

  const filteredUsers = users.filter(
    (user) =>
      (user?.name?.toLowerCase?.() || "").includes(searchQuery.toLowerCase()) ||
      (user?.email?.toLowerCase?.() || "").includes(searchQuery.toLowerCase())
  );

  // Function to handle permission toggle
  const handlePermissionToggle = (role, category, permissionIndex, enabled) => {
    if (role === "admin" && category === "Settings") return;

    setPermissions((prev) => {
      const newPermissions = { ...prev };
      newPermissions[role][category][permissionIndex].enabled = enabled;
      return newPermissions;
    });
  };

  // Function to reset permissions to default
  const handleResetPermissions = async (role) => {
    try {
      setIsSavingPermissions(true);
      const defaultPerms = defaultRolePermissions[role.toLowerCase()];
      await permissionService.updateRolePermissions(role, defaultPerms);
      toast.success(`Permissions for ${role.charAt(0).toUpperCase() + role.slice(1)} reset to default`);
      await loadPermissions();
    } catch (error) {
      toast.error("Failed to reset permissions");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Function to save permissions
  const handleSavePermissions = async (role) => {
    try {
      setIsSavingPermissions(true);

      // Transform frontend permissions back to API format
      const rolePermissions = permissions[role];
      const permissionNames = [];

      // Map frontend permissions to API permission names
      Object.keys(rolePermissions).forEach(category => {
        const categoryPerms = rolePermissions[category];
        categoryPerms.forEach((permission, index) => {
          if (permission.enabled) {
            // Map permission names to API format
            const permissionMap = {
              "View Dashboard": "dashboard.view",
              "Edit Dashboard Widgets": "dashboard.edit_widgets",
              "View Analytics": "dashboard.view_analytics",
              "View Candidates": "candidates.view",
              "Add Candidates": "candidates.create",
              "Edit Candidates": "candidates.edit",
              "Delete Candidates": "candidates.delete",
              "View Jobs": "jobs.view",
              "Create Jobs": "jobs.create",
              "Edit Jobs": "jobs.edit",
              "Delete Jobs": "jobs.delete",
              "View Settings": "settings.view",
              "Edit System Settings": "settings.edit_system",
              "Manage Users": "settings.manage_users",
              "Manage Integrations": "settings.manage_integrations",
              "View Companies": "companies.view",
              "Create Companies": "companies.create",
              "Edit Companies": "companies.edit",
              "Delete Companies": "companies.delete",
              "View Recruiters": "recruiters.view",
              "Create Recruiters": "recruiters.create",
              "Edit Recruiters": "recruiters.edit",
              "Delete Recruiters": "recruiters.delete",
              "View Teams": "teams.view",
              "Create Teams": "teams.create",
              "Edit Teams": "teams.edit",
              "Delete Teams": "teams.delete",
              "View Documents": "documents.view",
              "Create Documents": "documents.create",
              "Edit Documents": "documents.edit",
              "Delete Documents": "documents.delete",
              "Share Documents": "documents.share",
              "View Interviews": "interviews.view",
              "Create Interviews": "interviews.create",
              "Edit Interviews": "interviews.edit",
              "Delete Interviews": "interviews.delete",
              "View Communications": "communications.view",
              "Create Communications": "communications.create",
              "Edit Communications": "communications.edit",
              "View Analytics": "analytics.view",
              "Export Analytics": "analytics.export",
              // Onboarding Document permissions
              "View Onboarding Documents": "onboarding_document.view",
              "Upload Onboarding Documents": "onboarding_document.upload",
              "Download Onboarding Documents": "onboarding_document.download",
              "Delete Onboarding Documents": "onboarding_document.delete",
              // Onboarding Task permissions
              "View Onboarding Tasks": "onboarding_task.view",
              "Create Onboarding Tasks": "onboarding_task.create",
              "Edit Onboarding Tasks": "onboarding_task.edit",
              "Delete Onboarding Tasks": "onboarding_task.delete",
              "Assign Onboarding Tasks": "onboarding_task.assign",
              // Onboarding Template permissions
              "View Onboarding Templates": "onboarding_template.view",
              "Create Onboarding Templates": "onboarding_template.create",
              "Edit Onboarding Templates": "onboarding_template.edit",
              "Delete Onboarding Templates": "onboarding_template.delete",
              "Assign Onboarding Templates": "onboarding_template.assign",
              // Task Template permissions
              "View Task Templates": "task_template.view",
              "Create Task Templates": "task_template.create",
              "Edit Task Templates": "task_template.edit",
              "Delete Task Templates": "task_template.delete",
              // New Hire permissions
              "View New Hires": "new_hires.view",
              "Create New Hires": "new_hires.create",
              "Edit New Hires": "new_hires.edit",
              "Delete New Hires": "new_hires.delete",
            };

            const apiPermissionName = permissionMap[permission.name];
            if (apiPermissionName) {
              permissionNames.push(apiPermissionName);
            }
          }
        });
      });

      // Save permissions to API
      await permissionService.updateRolePermissions(role, permissionNames);

      // Update default permissions reference
      defaultPermissionsRef.current[role] = JSON.parse(JSON.stringify(permissions[role]));

      toast.success(
        `Permissions for ${role.charAt(0).toUpperCase() + role.slice(1)
        } role have been saved successfully`
      );
    } catch (error) {
      console.log("Error saving permissions:", error);
      toast.error("Failed to save permissions", {
        description: "Please try again later.",
      });
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleRoleChange = (email, newRole) => {
    setUsers(
      users.map((user) =>
        user.email === email ? { ...user, role: newRole } : user
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
        <div className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent text-left">Settings</h1>
        </div>
        <div className="p-6">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="w-full bg-white/80 border border-gray-200 p-1 rounded-lg flex overflow-x-auto mb-8">
              <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md text-lg font-semibold">Account</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md text-lg font-semibold">Security</TabsTrigger>
              <TabsTrigger value="access" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md text-lg font-semibold">Access</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="access">
              <AccessSettings
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredUsers={filteredUsers}
                handleRoleChange={handleRoleChange}
                setShowAddUserDialog={setShowAddUserDialog}
                customRoles={customRoles}
                handleEditRole={handleEditRole}
                handleDeleteRole={handleDeleteRole}
                setShowCreateRoleDialog={setShowCreateRoleDialog}
                permissions={permissions}
                handlePermissionToggle={handlePermissionToggle}
                handleResetPermissions={handleResetPermissions}
                handleSavePermissions={handleSavePermissions}
                isSavingPermissions={isSavingPermissions}
                isLoadingPermissions={isLoadingPermissions}
                isRole={isRole}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditRoleDialog
        showEditRoleDialog={showEditRoleDialog}
        setShowEditRoleDialog={setShowEditRoleDialog}
        editingRole={editingRole}
        setEditingRole={setEditingRole}
        handleSaveEditedRole={handleSaveEditedRole}
        isEditingRole={isEditingRole}
      />

      <DeleteRoleDialog
        showDeleteRoleDialog={showDeleteRoleDialog}
        setShowDeleteRoleDialog={setShowDeleteRoleDialog}
        handleConfirmDeleteRole={handleConfirmDeleteRole}
      />

      <CreateRoleDialog
        showCreateRoleDialog={showCreateRoleDialog}
        setShowCreateRoleDialog={setShowCreateRoleDialog}
        newRole={newRole}
        setNewRole={setNewRole}
        handleCreateRole={handleCreateRole}
        isCreatingRole={isCreatingRole}
      />

      <AddUserDialog
        showAddUserDialog={showAddUserDialog}
        setShowAddUserDialog={setShowAddUserDialog}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        isAddingUser={isAddingUser}
        isRole={isRole}
      />
    </div>
  );
}
