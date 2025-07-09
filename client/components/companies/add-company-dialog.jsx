"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanies } from "@/contexts/companies-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  MapPin,
  FileText,
  Globe,
  Briefcase,
  Users,
  Plus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddCompanyDialog({ open, onOpenChange }) {
  const { addCompany } = useCompanies();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    status: "active",
    // Add these new fields
    gstin: "",
    panNumber: "",
    taxId: "",
    registrationNumber: "",
    // Address fields
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    // Description
    description: "",
    // Social media
    linkedIn: "",
    twitter: "",
    facebook: "",
    instagram: "",
    // Additional info
    yearFounded: "",
    companyType: "",
    stockSymbol: "",
    parentCompany: "",
    revenue: "",
    employeeCount: "",
    // Contact info
    contactName: "",
    contactPosition: "",
    contactPhone: "",
    contactEmail: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState(["basic-info"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Add this function inside the AddCompanyDialog component, before the handleSubmit function
  const validateCompanyData = (data) => {
    const errors = {};

    // Required fields validation
    if (!data.name?.trim()) errors.name = "Company name is required";
    if (!data.industry?.trim()) errors.industry = "Industry is required";
    if (!data.location?.trim()) errors.location = "Location is required";
    if (!data.status) errors.status = "Status is required";
    if (!data.size?.trim()) errors.size = "Company size is required";

    // Website URL validation
    if (
      data.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        data.website
      )
    ) {
      errors.website = "Please enter a valid website URL";
    }

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (
      data.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
    ) {
      errors.contactEmail = "Please enter a valid contact email address";
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (data.contactPhone && !phoneRegex.test(data.contactPhone)) {
      errors.contactPhone = "Please enter a valid 10-digit phone number";
    }

    // Social media validation
    if (data.linkedIn && !data.linkedIn.includes("linkedin.com")) {
      errors.linkedIn = "Please enter a valid LinkedIn URL";
    }

    if (
      data.twitter &&
      !data.twitter.includes("twitter.com") &&
      !data.twitter.includes("x.com")
    ) {
      errors.twitter = "Please enter a valid Twitter/X URL";
    }

    if (data.facebook && !data.facebook.includes("facebook.com")) {
      errors.facebook = "Please enter a valid Facebook URL";
    }

    if (data.instagram && !data.instagram.includes("instagram.com")) {
      errors.instagram = "Please enter a valid Instagram URL";
    }

    // Year founded validation
    if (data.yearFounded) {
      const currentYear = new Date().getFullYear();
      if (data.yearFounded < 1800 || data.yearFounded > currentYear) {
        errors.yearFounded = `Year must be between 1800 and ${currentYear}`;
      }
    }

    // GSTIN validation (Indian GST format)
    if (
      data.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        data.gstin
      )
    ) {
      errors.gstin = "Please enter a valid GSTIN";
    }

    // PAN validation (Indian PAN format)
    if (
      data.panNumber &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)
    ) {
      errors.panNumber = "Please enter a valid PAN number";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validationErrors = validateCompanyData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await addCompany(formData);
      toast({
        title: "Success",
        description: "Company added successfully!",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        industry: "",
        size: "",
        location: "",
        website: "",
        status: "active",
        gstin: "",
        panNumber: "",
        taxId: "",
        registrationNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        stateProvince: "",
        postalCode: "",
        country: "",
        description: "",
        linkedIn: "",
        twitter: "",
        facebook: "",
        instagram: "",
        yearFounded: "",
        companyType: "",
        stockSymbol: "",
        parentCompany: "",
        revenue: "",
        employeeCount: "",
        contactName: "",
        contactPosition: "",
        contactPhone: "",
        contactEmail: "",
        phone: "",
        email: "",
      });
      setErrors({});
      setExpandedSections(["basic-info"]);
    } catch (error) {
      console.log("Error creating company:", error);
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccordionChange = (value) => {
    setExpandedSections((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Hospitality",
    "Transportation",
    "Construction",
    "Energy",
    "Agriculture",
    "Entertainment",
    "Media",
    "Telecommunications",
    "Consulting",
    "Legal Services",
    "Real Estate",
    "Nonprofit",
    "Government",
    "Other",
  ];

  const sizeOptions = [
    { id: "1-50", label: "1-50 employees" },
    { id: "51-200", label: "51-200 employees" },
    { id: "201-500", label: "201-500 employees" },
    { id: "501-1000", label: "501-1000 employees" },
    { id: "1001-5000", label: "1001-5000 employees" },
    { id: "5001-10000", label: "5001-10000 employees" },
    { id: "10001+", label: "10001+ employees" },
  ];

  const companyTypeOptions = [
    "Public",
    "Private",
    "Nonprofit",
    "Government",
    "Educational Institution",
    "Startup",
    "Subsidiary",
    "Partnership",
    "Sole Proprietorship",
    "Cooperative",
    "Other",
  ];

  const revenueOptions = [
    "Less than $1M",
    "$1M - $10M",
    "$10M - $50M",
    "$50M - $100M",
    "$100M - $500M",
    "$500M - $1B",
    "$1B - $10B",
    "$10B+",
  ];

  const countryOptions = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Add New Company</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Enter the company details to add a new company to your database.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full space-y-4"
          >
            {/* Basic Information */}
            <AccordionItem
              value="basic-info"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Basic Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="flex items-center gap-1">
                      Industry <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleSelectChange("industry", value)}
                    >
                      <SelectTrigger id="industry" className={cn(errors.industry && "border-red-500")}> <SelectValue placeholder="Select industry" /> </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-red-500 text-sm">{errors.industry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size" className="flex items-center gap-1">
                      Company Size <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => handleSelectChange("size", value)}
                    >
                      <SelectTrigger id="size" className={cn(errors.size && "border-red-500")}> <SelectValue placeholder="Select company size" /> </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size.id} value={size.label}>{size.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.size && (
                      <p className="text-red-500 text-sm">{errors.size}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1">
                      Primary Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={cn(errors.location && "border-red-500")}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm">{errors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-1">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={cn(errors.website && "border-red-500")}
                      placeholder="https://example.com"
                    />
                    {errors.website && (
                      <p className="text-red-500 text-sm">{errors.website}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-1">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger id="status" className={cn(errors.status && "border-red-500")}> <SelectValue placeholder="Select status" /> </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-red-500 text-sm">{errors.status}</p>
                    )}
                  </div>
                </div>
                {/* Business Identification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="AAAAA0000A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="Tax identification number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Business Registration Number</Label>
                    <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Company registration number" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Headquarters Location */}
            <AccordionItem
              value="location-info"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-purple-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  Headquarters Location
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateProvince">State/Province</Label>
                    <Input id="stateProvince" name="stateProvince" value={formData.stateProvince} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                      <SelectTrigger id="country"> <SelectValue placeholder="Select country" /> </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Company Description */}
            <AccordionItem
              value="description"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-orange-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Company Description
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter company description, mission statement, and other relevant information" />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Media Profiles */}
            <AccordionItem
              value="social-media"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Social Media Profiles
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input id="linkedIn" name="linkedIn" value={formData.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Additional Information */}
            <AccordionItem
              value="additional-info"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-green-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  Additional Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearFounded">Year Founded</Label>
                    <Input id="yearFounded" name="yearFounded" value={formData.yearFounded} onChange={handleChange} placeholder="e.g., 2010" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select value={formData.companyType} onValueChange={(value) => handleSelectChange("companyType", value)}>
                      <SelectTrigger id="companyType"> <SelectValue placeholder="Select company type" /> </SelectTrigger>
                      <SelectContent>
                        {companyTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockSymbol">Stock Symbol</Label>
                    <Input id="stockSymbol" name="stockSymbol" value={formData.stockSymbol} onChange={handleChange} placeholder="e.g., AAPL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentCompany">Parent Company</Label>
                    <Input id="parentCompany" name="parentCompany" value={formData.parentCompany} onChange={handleChange} placeholder="Parent company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Annual Revenue</Label>
                    <Select value={formData.revenue} onValueChange={(value) => handleSelectChange("revenue", value)}>
                      <SelectTrigger id="revenue"> <SelectValue placeholder="Select revenue range" /> </SelectTrigger>
                      <SelectContent>
                        {revenueOptions.map((revenue) => (
                          <SelectItem key={revenue} value={revenue}>{revenue}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input id="employeeCount" name="employeeCount" value={formData.employeeCount} onChange={handleChange} placeholder="e.g., 500" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contact Information */}
            <AccordionItem
              value="contact-info"
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30"
            >
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-pink-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  Contact Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Company Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="info@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Primary Contact Name</Label>
                    <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPosition">Contact Position</Label>
                    <Input id="contactPosition" name="contactPosition" value={formData.contactPosition} onChange={handleChange} placeholder="e.g., HR Director" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="contact@company.com" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Company...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
