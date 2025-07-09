"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/contexts/jobs-context";
import { useCompanies } from "@/contexts/companies-context";
import {
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Download,
  Info,
  Loader2,
  Users,
  CheckSquare,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export function BulkUploadDialog({ isOpen, onClose }) {
  const { addJobs } = useJobs();
  const { companies } = useCompanies();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("select");
  const [jobPreviews, setJobPreviews] = useState([]);
  const [uploadResult, setUploadResult] = useState({
    success: 0,
    failed: 0,
    total: 0,
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    // Check required headers
    const requiredHeaders = [
      "title",
      "department",
      "location",
      "type",
      "companyId",
      "openings",
      "requiredSkills",
    ];
    const missingHeaders = requiredHeaders.filter((h) => {
      const headerExists = headers.some(
        (header) => header.toLowerCase() === h.toLowerCase()
      );
      return !headerExists;
    });

    if (missingHeaders.length > 0) {
      alert(`Missing required headers: ${missingHeaders.join(", ")}`);
      return [];
    }

    const previews = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Improved CSV parsing to handle quoted values with commas
      const values = [];
      let currentValue = "";
      let insideQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];

        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }

      // Add the last value
      values.push(currentValue.trim());

      const jobData = {};
      const errors = [];

      // Map values to headers (case-insensitive)
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase();
        jobData[normalizedHeader] = values[index] || "";
      });

      // Validate required fields (case-insensitive)
      requiredHeaders.forEach((field) => {
        const fieldValue = jobData[field.toLowerCase()];
        if (!fieldValue) {
          errors.push(`Missing ${field}`);
        }
      });

      // Validate department
      const validDepartments = [
        "Engineering",
        "Design",
        "Product",
        "Marketing",
        "Sales",
        "Data",
        "Customer Support",
        "HR",
        "Finance",
        "Operations",
      ];
      if (
        jobData.department &&
        !validDepartments.includes(jobData.department)
      ) {
        errors.push(`Invalid department: ${jobData.department}`);
      }

      // Validate job type
      const validTypes = [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Temporary",
        "Freelance",
      ];
      if (jobData.type && !validTypes.includes(jobData.type)) {
        errors.push(`Invalid job type: ${jobData.type}`);
      }

      // Validate status
      const validStatuses = [
        "Active",
        "Draft",
        "New",
        "Closing Soon",
        "Closed",
      ];
      const status = jobData.status || "Active";
      if (jobData.status && !validStatuses.includes(status)) {
        errors.push(`Invalid status: ${jobData.status}`);
      }

      // Validate company ID
      let companyId = null;
      if (jobData.companyid) {
        const parsedId = Number.parseInt(jobData.companyid);
        if (isNaN(parsedId)) {
          errors.push(`Invalid company ID: ${jobData.companyid}`);
        } else {
          // Check if company exists
          const companyExists = companies.some(
            (company) => Number(company.id) === parsedId
          );
          if (!companyExists) {
            errors.push(`Company with ID ${parsedId} does not exist`);
          } else {
            companyId = parsedId;
          }
        }
      }

      // Validate openings
      let openings = 1;
      if (jobData.openings) {
        const parsedOpenings = Number.parseInt(jobData.openings);
        if (isNaN(parsedOpenings) || parsedOpenings <= 0) {
          errors.push(`Invalid number of openings: ${jobData.openings}`);
        } else {
          openings = parsedOpenings;
        }
      }

      // Validate experience level
      const validExperienceLevels = [
        "Entry-Level",
        "Junior",
        "Mid-Level",
        "Senior",
        "Lead",
        "Manager",
        "Director",
        "Executive",
      ];
      const experienceLevel = jobData.experiencelevel || "Mid-Level";
      if (
        jobData.experiencelevel &&
        !validExperienceLevels.includes(experienceLevel)
      ) {
        errors.push(`Invalid experience level: ${jobData.experiencelevel}`);
      }

      previews.push({
        title: jobData.title || "",
        department: jobData.department || "",
        location: jobData.location || "",
        type: jobData.type || "",
        description: jobData.description || "",
        status: status,
        companyId: companyId,
        openings: openings,
        salaryMin: jobData.salarymin || "",
        salaryMax: jobData.salarymax || "",
        requiredSkills: jobData.requiredskills || "",
        experienceLevel: experienceLevel,
        isValid: errors.length === 0,
        errors,
      });
    }

    return previews;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const previews = parseCSV(text);
      setJobPreviews(previews);
      setUploadStep("preview");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    setIsUploading(true);

    // Filter valid jobs
    const validJobs = jobPreviews.filter((job) => job.isValid);

    // Add jobs to the list
    if (validJobs.length > 0) {
      await addJobs(
        validJobs.map((job) => ({
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          status: job.status,
          companyId: job.companyId || undefined,
          openings: job.openings,
          salaryMin: job.salaryMin ? Number.parseInt(job.salaryMin) : undefined,
          salaryMax: job.salaryMax ? Number.parseInt(job.salaryMax) : undefined,
          requiredSkills: job.requiredSkills,
          experienceLevel: job.experienceLevel,
        }))
      );
    }

    // Set result
    setUploadResult({
      success: validJobs.length,
      failed: jobPreviews.length - validJobs.length,
      total: jobPreviews.length,
    });

    setUploadStep("result");
    setIsUploading(false);

    toast({
      title: "Success",
      description: "Jobs uploaded successfully",
    });
  };

  const handleReset = () => {
    setFile(null);
    setJobPreviews([]);
    setUploadStep("select");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const downloadTemplate = () => {
    const headers =
      "title,department,location,type,description,status,companyId,openings,salaryMin,salaryMax,requiredSkills,experienceLevel\n";
    const exampleRow =
      'Senior Developer,Engineering,Remote,Full-time,Job description here,Active,1,2,120000,150000,"React, TypeScript, Next.js",Senior\n';
    const csvContent = headers + exampleRow;

    // Add a second example row to demonstrate multiple entries
    const exampleRow2 =
      'Product Manager,Product,San Francisco,Full-time,Product manager role,New,2,1,130000,160000,"Product Strategy, Agile, User Stories",Senior\n';

    const finalContent = csvContent + exampleRow2;

    const blob = new Blob([finalContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to get company name by ID
  const getCompanyName = (companyId) => {
    if (companyId === null) return "Not specified";
    const company = companies.find((c) => Number(c.id) === companyId);
    return company ? company.name : `Unknown (ID: ${companyId})`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-2xl font-bold">Bulk Upload Jobs</DialogTitle>
          </div>
          <DialogDescription>
            Upload multiple jobs at once using a CSV or Excel file. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        {uploadStep === "select" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Upload Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Download the template file to see the required format</li>
                    <li>Fill in your job data following the template structure</li>
                    <li>Upload your completed file (CSV or Excel format)</li>
                    <li>Review the preview before confirming the upload</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-medium mb-2">Upload your file</p>
              <p className="text-gray-600 mb-4">Drag and drop your CSV or Excel file here, or click to browse</p>
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {uploadStep === "preview" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">File Uploaded Successfully!</p>
                  <p>Review the job previews below before confirming the upload.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Job Previews ({jobPreviews.length})</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {jobPreviews.filter(job => job.errors.length === 0).length} Valid
                  </span>
                  <span className="text-red-600">
                    <X className="h-4 w-4 inline mr-1" />
                    {jobPreviews.filter(job => job.errors.length > 0).length} Invalid
                  </span>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {jobPreviews.map((job, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${job.errors.length > 0
                        ? "border-red-200 bg-red-50"
                        : "border-green-200 bg-green-50"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {job.errors.length > 0 ? (
                              <X className="h-4 w-4 text-red-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            <h4 className="font-medium">{job.title || "Untitled Job"}</h4>
                            <Badge variant="outline">{job.department}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Location:</span> {job.location}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {job.type}
                            </div>
                            <div>
                              <span className="font-medium">Openings:</span> {job.openings}
                            </div>
                            <div>
                              <span className="font-medium">Company:</span> {getCompanyName(job.companyId)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {job.errors.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Errors:</span>
                          </div>
                          <ul className="text-sm text-red-700 space-y-1">
                            {job.errors.map((error, errorIndex) => (
                              <li key={errorIndex} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {uploadStep === "result" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Upload Complete!</p>
                  <p>Your jobs have been processed. Check the results below.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-800">{uploadResult.success}</p>
                <p className="text-sm text-green-700">Successfully Added</p>
              </div>
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800">{uploadResult.failed}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-800">{uploadResult.total}</p>
                <p className="text-sm text-blue-700">Total Processed</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {uploadStep === "select" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </>
          )}

          {uploadStep === "preview" && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Upload Different File
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={jobPreviews.filter(job => job.errors.length === 0).length === 0}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Confirm Upload ({jobPreviews.filter(job => job.errors.length === 0).length} jobs)
              </Button>
            </>
          )}

          {uploadStep === "result" && (
            <Button onClick={handleClose} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
