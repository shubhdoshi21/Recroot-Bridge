"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useRecruiters } from "@/contexts/recruiters-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/config/api";
import axios from "axios";
import { UserPlus, Loader2, Mail, Phone, Briefcase, Target, UserCheck } from "lucide-react";

export function AddRecruiterDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const { addRecruiter } = useRecruiters();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    status: "active", // lowercase to match backend
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Step 1: Directly create recruiter with all necessary data
      // The backend will handle creating both the user and recruiter
      const recruiterData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        specialization: formData.specialization,
        status: formData.status,
        // Default values for performance metrics
        activeJobs: 0,
        candidates: 0,
        hires: 0,
        hireRate: 0,
        averageTimeToHire: 0,
        CandidateSatisfactionRate: 0,
      };

      console.log("Creating recruiter with data:", recruiterData);

      // Create both user and recruiter in one API call
      const recruiterResponse = await addRecruiter(recruiterData);
      console.log("Recruiter created successfully:", recruiterResponse);

      // Reset form and close dialog
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        specialization: "",
        status: "active",
      });

      onOpenChange(false);
      toast({
        title: "Recruiter Added",
        description: "A welcome email with login credentials has been sent.",
      });
    } catch (error) {
      console.log("Error adding recruiter:", error);
      let errorMessage = "Failed to add recruiter";

      // Extract error message from response if available
      if (error.response?.data?.message) {
        errorMessage += ": " + error.response.data.message;
      } else if (error.message) {
        errorMessage += ": " + error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Add New Recruiter</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Fill in the details to add a new recruiter to your team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-blue-100 shadow-lg mb-3">
              <AvatarImage
                src={`/placeholder.svg?height=96&width=96&text=${formData.firstName.charAt(0) || "?"
                  }`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xl">
                {formData.firstName.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500 text-center">
              Avatar will be generated automatically based on the name
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors ${errors.firstName ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors ${errors.lastName ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                  }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors ${errors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                  }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger
                    id="department"
                    className={`bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors ${errors.department ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                      }`}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                    <SelectItem value="Technical Recruiting">Technical Recruiting</SelectItem>
                    <SelectItem value="Corporate Recruiting">Corporate Recruiting</SelectItem>
                    <SelectItem value="Campus Recruiting">Campus Recruiting</SelectItem>
                    <SelectItem value="Executive Recruiting">Executive Recruiting</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.department}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Specialization
                </Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) =>
                    handleSelectChange("specialization", value)
                  }
                >
                  <SelectTrigger
                    id="specialization"
                    className={`bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400 transition-colors ${errors.specialization ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                      }`}
                  >
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
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
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.specialization}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-500" />
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status" className="bg-white/80 backdrop-blur-sm border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Recruiter
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
