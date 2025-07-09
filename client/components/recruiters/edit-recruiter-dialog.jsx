"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRecruiters } from "@/contexts/recruiters-context";
import {
  CheckCircle,
  Loader2,
  User,
  Edit3,
  Mail,
  Phone,
  Building,
  Target,
  Activity,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export function EditRecruiterDialog({ open, onOpenChange, recruiter }) {
  const { updateRecruiter } = useRecruiters();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Reset form data when recruiter changes or dialog opens
  useEffect(() => {
    if (recruiter && open) {
      console.log("Edit dialog received recruiter data:", recruiter);
      setFormData({
        id: recruiter.id,
        firstName: recruiter.firstName || "",
        lastName: recruiter.lastName || "",
        email: recruiter.email || "",
        phone: recruiter.phone || "",
        department: recruiter.department || "",
        specialization: recruiter.specialization || "",
        status: recruiter.status || "active",
        userId: recruiter.userId,
      });
      setErrors({});
      setSuccess(false);
    }
  }, [recruiter, open]);

  if (!recruiter) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear success message when making changes
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.department?.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.specialization?.trim()) {
      newErrors.specialization = "Specialization is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Extract email from formData to exclude it from the update
      const { email, ...updatableFields } = formData;

      // Make sure we're sending the correct data structure expected by the API
      const updatedRecruiterData = {
        ...updatableFields,
        // Any additional fields needed by the backend
      };

      await updateRecruiter(recruiter.id, updatedRecruiterData);
      setSuccess(true);
      toast({
        title: "Success",
        description: "Recruiter updated successfully",
      });

      // Don't close the dialog immediately to show success message
      setTimeout(() => {
        if (open) {
          onOpenChange(false);
        }
      }, 1500);
    } catch (error) {
      console.log("Error updating recruiter:", error);
      toast({
        title: "Error",
        description:
          "Failed to update recruiter: " +
          (error.response?.data?.message || error.message),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Reset success state when closing
        if (!newOpen) {
          setSuccess(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Recruiter</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Update the recruiter's information and status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Changes Saved Successfully
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              The recruiter profile has been updated and all changes have been applied.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Avatar Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={
                          recruiter.profilePicture ||
                          `/placeholder.svg?height=96&width=96&text=${formData.firstName?.charAt(0) || "?"
                          }`
                        }
                        alt={`${formData.firstName || ""} ${formData.lastName || ""}`}
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {formData.firstName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-blue-500 rounded-full shadow-lg">
                      <Edit3 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ""}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="Enter first name"
                        className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ""}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        placeholder="Enter last name"
                        className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-500" />
                    Contact Information
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-500" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-500 italic flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                        className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-400 focus:ring-green-400 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-500" />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-500" />
                        Department
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleChange("department", value)}
                      >
                        <SelectTrigger
                          id="department"
                          className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${errors.department ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                        >
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical Recruiting">Technical Recruiting</SelectItem>
                          <SelectItem value="Corporate Recruiting">Corporate Recruiting</SelectItem>
                          <SelectItem value="Campus Recruiting">Campus Recruiting</SelectItem>
                          <SelectItem value="Executive Recruiting">Executive Recruiting</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.department}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        Specialization
                      </Label>
                      <Select
                        value={formData.specialization}
                        onValueChange={(value) => handleChange("specialization", value)}
                      >
                        <SelectTrigger
                          id="specialization"
                          className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${errors.specialization ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                        >
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.specialization && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.specialization}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger
                        id="status"
                        className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
