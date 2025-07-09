"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapPin, Briefcase, Share2, Info, User, Building2, Users, FileText, AlertCircle, Edit, Globe } from "lucide-react"

export function EditCompanyDialog({ open, onOpenChange, company, onUpdateCompany }) {
  const { toast } = useToast()

  // Add these option arrays to match the AddCompanyDialog
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
  ]

  const sizeOptions = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1,000 employees",
    "1,001-5,000 employees",
    "5,001-10,000 employees",
    "10,001+ employees",
  ]

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
  ]

  const revenueOptions = [
    "Less than $1M",
    "$1M - $10M",
    "$10M - $50M",
    "$50M - $100M",
    "$100M - $500M",
    "$500M - $1B",
    "$1B - $10B",
    "$10B+",
  ]

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
  ]

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    status: "active",
    description: "",

    // Business identification
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

    // Contact information
    phone: "",
    email: "",
    contactName: "",
    contactPosition: "",
    contactPhone: "",
    contactEmail: "",

    // Social media
    linkedIn: "",
    twitter: "",
    facebook: "",
    instagram: "",

    // Additional business information
    yearFounded: "",
    companyType: "",
    stockSymbol: "",
    parentCompany: "",
    revenue: "",
    employeeCount: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [expandedSections, setExpandedSections] = useState(["basic-info"])

  // Update form data when company changes or dialog opens
  useEffect(() => {
    if (company && open) {
      setFormData({
        name: company.name || "",
        industry: company.industry || "",
        location: company.location || "",
        size: company.size || "",
        website: company.website || "",
        status: company.status || "active",
        description: company.description || "",

        // Business identification
        gstin: company.gstin || "",
        panNumber: company.panNumber || "",
        taxId: company.taxId || "",
        registrationNumber: company.registrationNumber || "",

        // Address fields
        addressLine1: company.addressLine1 || "",
        addressLine2: company.addressLine2 || "",
        city: company.city || "",
        stateProvince: company.stateProvince || "",
        postalCode: company.postalCode || "",
        country: company.country || "",

        // Contact information - these fields come from the CompanyContact related entity
        phone: company.phone || "",
        email: company.email || "",
        contactName: company.contactName || "",
        contactPosition: company.contactPosition || "",
        contactPhone: company.contactPhone || "",
        contactEmail: company.contactEmail || "",

        // Social media
        linkedIn: company.linkedIn || "",
        twitter: company.twitter || "",
        facebook: company.facebook || "",
        instagram: company.instagram || "",

        // Additional business information
        yearFounded: company.yearFounded ? String(company.yearFounded) : "",
        companyType: company.companyType || "",
        stockSymbol: company.stockSymbol || "",
        parentCompany: company.parentCompany || "",
        revenue: company.revenue || "",
        employeeCount: company.employeeCount ? String(company.employeeCount) : "",
      })

      // Reset errors when dialog opens
      setErrors({})

      console.log("Form data populated with company data:", company);
    }
  }, [company, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Company name is required"
    if (!formData.industry.trim()) newErrors.industry = "Industry is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.size.trim()) newErrors.size = "Company size is required"
    if (!formData.status) newErrors.status = "Status is required"

    // Website URL validation
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL"
    }

    // GSTIN validation (Indian GST number format)
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = "Please enter a valid GSTIN"
    }

    // PAN validation (Indian PAN format)
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "Please enter a valid PAN number"
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid contact email address"
    }

    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid contact phone number"
    }

    // Social media validation
    if (formData.linkedIn && !formData.linkedIn.includes("linkedin.com")) {
      newErrors.linkedIn = "Please enter a valid LinkedIn URL"
    }

    if (formData.twitter && !formData.twitter.includes("twitter.com") && !formData.twitter.includes("x.com")) {
      newErrors.twitter = "Please enter a valid Twitter/X URL"
    }

    if (formData.facebook && !formData.facebook.includes("facebook.com")) {
      newErrors.facebook = "Please enter a valid Facebook URL"
    }

    if (formData.instagram && !formData.instagram.includes("instagram.com")) {
      newErrors.instagram = "Please enter a valid Instagram URL"
    }

    // Year founded validation
    if (formData.yearFounded) {
      const yearFoundedNum = Number.parseInt(formData.yearFounded)
      const currentYear = new Date().getFullYear()
      if (isNaN(yearFoundedNum) || yearFoundedNum < 1800 || yearFoundedNum > currentYear) {
        newErrors.yearFounded = `Year must be between 1800 and ${currentYear}`
      }
    }

    // Employee count validation
    if (formData.employeeCount && isNaN(Number.parseInt(formData.employeeCount))) {
      newErrors.employeeCount = "Employee count must be a number"
    }

    // Update errors state
    setErrors(newErrors)

    // If there are errors, expand the sections containing errors
    if (Object.keys(newErrors).length > 0) {
      const sectionsWithErrors = new Set()

      // Check which sections have errors
      Object.keys(newErrors).forEach((field) => {
        if (
          ["name", "industry", "size", "location", "website", "status", "description", "gstin", "panNumber"].includes(field)
        ) {
          sectionsWithErrors.add("basic-info")
        } else if (["addressLine1", "addressLine2", "city", "stateProvince", "postalCode", "country"].includes(field)) {
          sectionsWithErrors.add("location-info")
        } else if (["description"].includes(field)) {
          sectionsWithErrors.add("description")
        } else if (
          ["linkedIn", "twitter", "facebook", "instagram"].includes(field)
        ) {
          sectionsWithErrors.add("social-media")
        } else if (
          ["yearFounded", "companyType", "stockSymbol", "parentCompany", "revenue", "employeeCount"].includes(field)
        ) {
          sectionsWithErrors.add("additional-info")
        } else if (
          ["contactName", "contactPosition", "contactPhone", "contactEmail", "phone", "email"].includes(field)
        ) {
          sectionsWithErrors.add("contact-info")
        }
      })

      setExpandedSections([...sectionsWithErrors])
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!company) {
      toast({
        title: "Error",
        description: "No company selected",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Create the updated company object
      const updatedCompany = {
        ...company,
        name: formData.name,
        industry: formData.industry,
        size: formData.size,
        location: formData.location,
        website: formData.website,
        status: formData.status,
        description: formData.description,

        // Business identification
        gstin: formData.gstin,
        panNumber: formData.panNumber,
        taxId: formData.taxId,
        registrationNumber: formData.registrationNumber,

        // Address fields
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        country: formData.country,

        // Contact information - explicitly include these fields
        phone: formData.phone,
        email: formData.email,
        contactName: formData.contactName,
        contactPosition: formData.contactPosition,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,

        // Social media
        linkedIn: formData.linkedIn,
        twitter: formData.twitter,
        facebook: formData.facebook,
        instagram: formData.instagram,

        // Additional business information
        yearFounded: formData.yearFounded ? Number.parseInt(formData.yearFounded) : null,
        companyType: formData.companyType,
        stockSymbol: formData.stockSymbol,
        parentCompany: formData.parentCompany,
        revenue: formData.revenue,
        employeeCount: formData.employeeCount ? Number.parseInt(formData.employeeCount) : null,
      }

      console.log("Submitting updated company data:", updatedCompany);

      // Call the update function
      onUpdateCompany(company.id, updatedCompany)

      toast({
        title: "Company Updated",
        description: `${formData.name} has been updated successfully`,
      })

      setIsSubmitting(false)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the company",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // If no company is selected, don't render the dialog content
  if (!company && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>Unable to edit company details.</DialogDescription>
          </DialogHeader>
          <p>No company selected. Please select a company to edit.</p>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Company</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">Update company information and details.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Accordion
            type="multiple"
            defaultValue={expandedSections}
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* 1. Basic Information section (same as AddCompanyDialog, without Description field) */}
            <AccordionItem value="basic-info" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Basic Information
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Company Name, Industry, Size, Location, Website, Status */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">
                      Industry <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleSelectChange("industry", value)}
                    >
                      <SelectTrigger id="industry" className={errors.industry ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-xs text-red-500">{errors.industry}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">
                      Company Size <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => handleSelectChange("size", value)}
                    >
                      <SelectTrigger id="size" className={errors.size ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.size && <p className="text-xs text-red-500">{errors.size}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className={errors.website ? "border-red-500" : ""}
                    />
                    {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* GSTIN, PAN, Tax ID, Registration Number */}
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="Enter GSTIN"
                      className={errors.gstin ? "border-red-500" : ""}
                    />
                    {errors.gstin && <p className="text-xs text-red-500">{errors.gstin}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="Enter PAN Number"
                      className={errors.panNumber ? "border-red-500" : ""}
                    />
                    {errors.panNumber && <p className="text-xs text-red-500">{errors.panNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder="Enter Tax ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="Enter Registration Number"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Headquarters Location section */}
            <AccordionItem value="location-info" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-purple-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  Headquarters Location
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Address Line 1, Address Line 2, City, State/Province, Postal Code, Country */}
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="Enter address line 1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Enter address line 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stateProvince">State/Province</Label>
                    <Input
                      id="stateProvince"
                      name="stateProvince"
                      value={formData.stateProvince}
                      onChange={handleChange}
                      placeholder="Enter state/province"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Company Description section */}
            <AccordionItem value="description" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-orange-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Company Description
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter company description, mission statement, and other relevant information"
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Social Media Profiles section */}
            <AccordionItem value="social-media" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Social Media Profiles
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LinkedIn, Twitter, Facebook, Instagram */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/company/example"
                      className={errors.linkedIn ? "border-red-500" : ""}
                    />
                    {errors.linkedIn && <p className="text-xs text-red-500">{errors.linkedIn}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/example"
                      className={errors.twitter ? "border-red-500" : ""}
                    />
                    {errors.twitter && <p className="text-xs text-red-500">{errors.twitter}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/example"
                      className={errors.facebook ? "border-red-500" : ""}
                    />
                    {errors.facebook && <p className="text-xs text-red-500">{errors.facebook}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/example"
                      className={errors.instagram ? "border-red-500" : ""}
                    />
                    {errors.instagram && <p className="text-xs text-red-500">{errors.instagram}</p>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Additional Information section */}
            <AccordionItem value="additional-info" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-green-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  Additional Information
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Year Founded, Company Type, Stock Symbol, Parent Company, Revenue, Employee Count */}
                  <div className="space-y-2">
                    <Label htmlFor="yearFounded">Year Founded</Label>
                    <Input
                      id="yearFounded"
                      name="yearFounded"
                      type="number"
                      value={formData.yearFounded}
                      onChange={handleChange}
                      placeholder="Enter year founded"
                      className={errors.yearFounded ? "border-red-500" : ""}
                    />
                    {errors.yearFounded && <p className="text-xs text-red-500">{errors.yearFounded}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select
                      value={formData.companyType}
                      onValueChange={(value) => handleSelectChange("companyType", value)}
                    >
                      <SelectTrigger id="companyType">
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockSymbol">Stock Symbol</Label>
                    <Input
                      id="stockSymbol"
                      name="stockSymbol"
                      value={formData.stockSymbol}
                      onChange={handleChange}
                      placeholder="Enter stock symbol"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentCompany">Parent Company</Label>
                    <Input
                      id="parentCompany"
                      name="parentCompany"
                      value={formData.parentCompany}
                      onChange={handleChange}
                      placeholder="Enter parent company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenue">Annual Revenue</Label>
                    <Select
                      value={formData.revenue}
                      onValueChange={(value) => handleSelectChange("revenue", value)}
                    >
                      <SelectTrigger id="revenue">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        {revenueOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      name="employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={handleChange}
                      placeholder="Enter employee count"
                      className={errors.employeeCount ? "border-red-500" : ""}
                    />
                    {errors.employeeCount && <p className="text-xs text-red-500">{errors.employeeCount}</p>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Contact Information section */}
            <AccordionItem value="contact-info" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
              <AccordionTrigger className="text-base font-semibold py-4 px-4 text-gray-700 hover:bg-pink-50/50 transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  Contact Information
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Name, Position, Phone, Email, General Phone, General Email */}
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Primary Contact Name</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Enter primary contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPosition">Contact Position</Label>
                    <Input
                      id="contactPosition"
                      name="contactPosition"
                      value={formData.contactPosition}
                      onChange={handleChange}
                      placeholder="Enter contact position"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Enter contact phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="Enter contact email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Company Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter company phone"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter company email"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
