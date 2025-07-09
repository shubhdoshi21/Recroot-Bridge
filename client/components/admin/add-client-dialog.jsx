"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/admin-context";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  Edit3
} from "lucide-react";

export default function AddClientDialog({
  open,
  onOpenChange,
  onClientAdded,
  onClientUpdated,
  initialData,
  mode = "add",
}) {
  const { toast } = useToast();
  const { createClient, subscriptionModels } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    industry: "",
    companySize: "",
    location: "",
    website: "",
    status: "active",
    GSTIN: "",
    PAN: "",
    taxID: "",
    registrationNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    subscriptionModelId: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        companyName: initialData.companyName || "",
        companyEmail: initialData.companyEmail || "",
        companyPhone: initialData.companyPhone || "",
        industry: initialData.industry || "",
        companySize: initialData.companySize || "",
        location: initialData.location || "",
        website: initialData.website || "",
        status: initialData.status || "active",
        GSTIN: initialData.GSTIN || "",
        PAN: initialData.PAN || "",
        taxID: initialData.taxID || "",
        registrationNumber: initialData.registrationNumber || "",
        addressLine1: initialData.addressLine1 || "",
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city || "",
        stateProvince: initialData.stateProvince || "",
        postalCode: initialData.postalCode || "",
        country: initialData.country || "",
        subscriptionModelId: initialData.subscriptionModel?.id?.toString() || "",
      });
    } else {
      // Reset form when opening in add mode
      setFormData({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        industry: "",
        companySize: "",
        location: "",
        website: "",
        status: "active",
        GSTIN: "",
        PAN: "",
        taxID: "",
        registrationNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        stateProvince: "",
        postalCode: "",
        country: "",
        subscriptionModelId: "",
      });
    }
  }, [initialData, mode, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.companyName) {
        throw new Error("Company name is required");
      }

      // Validate company name length
      if (formData.companyName.length > 255) {
        throw new Error("Company name is too long");
      }

      // Validate email format if provided
      if (formData.companyEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.companyEmail)) {
          throw new Error("Please enter a valid company email address");
        }
        if (formData.companyEmail.length > 255) {
          throw new Error("Company email address is too long");
        }
      }

      // Validate phone format if provided
      if (formData.companyPhone) {
        const phoneRegex =
          /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(formData.companyPhone)) {
          throw new Error("Please enter a valid phone number");
        }
      }

      // Validate website format if provided
      if (formData.website) {
        const websiteRegex =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!websiteRegex.test(formData.website)) {
          throw new Error("Please enter a valid website URL");
        }
      }

      // Validate GSTIN format if provided
      if (formData.GSTIN) {
        const gstinRegex =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(formData.GSTIN)) {
          throw new Error("Please enter a valid GSTIN number");
        }
      }

      // Validate PAN format if provided
      if (formData.PAN) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.PAN)) {
          throw new Error("Please enter a valid PAN number");
        }
      }

      // Validate postal code format if provided
      if (formData.postalCode) {
        const postalCodeRegex = /^[0-9]{6}$/;
        if (!postalCodeRegex.test(formData.postalCode)) {
          throw new Error("Please enter a valid 6-digit postal code");
        }
      }

      // Validate subscription model is selected
      if (!formData.subscriptionModelId) {
        throw new Error("Please select a subscription plan");
      }

      const clientData = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      if (mode === "edit") {
        await onClientUpdated(clientData);
        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        await createClient(clientData);
        onClientAdded();
        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }
    } catch (error) {
      console.log("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${mode === "edit" ? "update" : "add"} client`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "edit" ? (
              <Edit3 className="h-5 w-5 text-blue-500" />
            ) : (
              <Plus className="h-5 w-5 text-green-500" />
            )}
            {mode === "edit" ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === "edit"
              ? "Update the client information below"
              : "Create a new client account with company details and subscription plan."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Enter company name"
                  required
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail" className="text-sm font-medium">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyEmail: e.target.value,
                    }))
                  }
                  placeholder="Enter company email"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone" className="text-sm font-medium">Company Phone</Label>
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyPhone: e.target.value,
                    }))
                  }
                  placeholder="Enter company phone"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">Company Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="Enter company website"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, industry: value }))
                  }
                  required
                >
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium">Company Size</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      companySize: value,
                    }))
                  }
                >
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501+">501+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Enter location"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tax and Registration Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <FileText className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tax & Registration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="GSTIN" className="text-sm font-medium">GSTIN</Label>
                <Input
                  id="GSTIN"
                  value={formData.GSTIN}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      GSTIN: e.target.value,
                    }))
                  }
                  placeholder="Enter GSTIN"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PAN" className="text-sm font-medium">PAN</Label>
                <Input
                  id="PAN"
                  value={formData.PAN}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      PAN: e.target.value,
                    }))
                  }
                  placeholder="Enter PAN"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxID" className="text-sm font-medium">Tax ID</Label>
                <Input
                  id="taxID"
                  value={formData.taxID}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxID: e.target.value,
                    }))
                  }
                  placeholder="Enter tax ID"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter registration number"
                  className="input-modern"
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1" className="text-sm font-medium">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine1: e.target.value,
                    }))
                  }
                  placeholder="Enter address line 1"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2" className="text-sm font-medium">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine2: e.target.value,
                    }))
                  }
                  placeholder="Enter address line 2"
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Enter city"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateProvince" className="text-sm font-medium">State/Province</Label>
                  <Input
                    id="stateProvince"
                    value={formData.stateProvince}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stateProvince: e.target.value,
                      }))
                    }
                    placeholder="Enter state/province"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="Enter postal code"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="Enter country"
                    className="input-modern"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Subscription Plan</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="subscriptionModelId" className="text-sm font-medium">Subscription Plan *</Label>
                <Select
                  value={formData.subscriptionModelId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subscriptionModelId: value }))
                  }
                  required
                >
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Select subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionModels.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{model.subscriptionPlan}</span>
                          <span className="text-sm text-gray-500">
                            {model.maxUsersAllowed} users • {model.maxJobPostsAllowed} jobs
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === "edit" && initialData?.subscriptionModel && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-2">Current Subscription Details</div>
                      <div className="space-y-1 text-blue-700">
                        <div>• Plan: <span className="font-medium">{initialData.subscriptionModel.subscriptionPlan}</span></div>
                        <div>• Billing Cycle: <span className="font-medium">{initialData.subscriptionModel.billingCycle}</span></div>
                        <div>• Status: <Badge variant={initialData.subscriptionModel.isActive ? "success" : "destructive"} className="ml-1">
                          {initialData.subscriptionModel.isActive ? "Active" : "Inactive"}
                        </Badge></div>
                        {initialData.subscriptionModel.isTrial && (
                          <div className="text-yellow-600 font-medium">• Trial Period Active</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {mode === "edit" ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  {mode === "edit" ? (
                    <Edit3 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {mode === "edit" ? "Update Client" : "Add Client"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}