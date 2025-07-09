"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Download,
  Upload,
  FileText,
  Users,
  Loader2,
  Sparkles,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { candidateService } from "@/services/candidateService";
import { toast } from "@/components/ui/use-toast";

export function CandidateBulkUploadDialog({ isOpen, onOpenChange, onUpload }) {
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleBulkUploadFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBulkUploadFile(file);
    setUploadResults(null);
  };

  const downloadTemplate = async () => {
    try {
      await candidateService.downloadBulkUploadTemplate();
    } catch (error) {
      console.log("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const processBulkUpload = async () => {
    if (!bulkUploadFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      // Send the file directly to the service
      const response = await candidateService.bulkUploadCandidates(
        bulkUploadFile
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Set success results
      setUploadResults({
        success: response.success || 0,
        failed: response.failed || 0,
        total: response.total || 0,
        errors: response.errors || [],
        candidates: response.candidates || [],
      });

      if (response.candidates?.length > 0) {
        onUpload(response.candidates);
      }
    } catch (error) {
      console.log("Error in bulk upload:", error);
      setUploadResults({
        success: 0,
        failed: 1,
        total: 1,
        errors: [error.message || "Failed to process bulk upload"],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetBulkUpload = () => {
    setBulkUploadFile(null);
    setUploadResults(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addSampleCandidates = () => {
    // Create sample candidates
    const sampleCandidates = [
      {
        id: Date.now(),
        name: "John Smith",
        email: "john.smith@example.com",
        position: "Frontend Developer",
        date: new Date().toISOString().split("T")[0],
        avatar: "/placeholder.svg?height=40&width=40",
        statusColor: "bg-purple-100 text-purple-800",
        skills: ["javascript", "react"],
        phone: "+1 (555) 111-2222",
        location: "Chicago, IL",
        education: "B.S. Computer Science",
        bio: "Passionate frontend developer with React expertise",
        dateAdded: new Date(),
        assignedJobs: [],
      },
      {
        id: Date.now() + 1,
        name: "Maria Rodriguez",
        email: "maria.rodriguez@example.com",
        position: "UX Designer",
        date: new Date().toISOString().split("T")[0],
        avatar: "/placeholder.svg?height=40&width=40",
        statusColor: "bg-amber-100 text-amber-800",
        skills: ["figma"],
        phone: "+1 (555) 333-4444",
        location: "Miami, FL",
        education: "M.A. Design",
        bio: "Creative UX designer with a focus on user-centered design",
        dateAdded: new Date(),
        assignedJobs: [],
      },
    ];

    onUpload(sampleCandidates);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetBulkUpload();
        }
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50/50 border-b border-green-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Bulk Upload Candidates</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Upload a CSV or Excel file containing multiple candidate records.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {!uploadResults && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-upload" className="text-base font-semibold text-gray-900">Upload CSV/Excel File</Label>
                    <p className="text-sm text-gray-600">
                      File must include name, email, phone, position, and skills columns.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    id="bulk-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkUploadFileChange}
                    disabled={isUploading}
                    ref={fileInputRef}
                    className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                  />
                </div>

                {bulkUploadFile && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 border-2 border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                        <FileSpreadsheet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{bulkUploadFile.name}</span>
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                          {(bulkUploadFile.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetBulkUpload}
                      disabled={isUploading}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="font-medium text-blue-900">Processing file...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Progress</span>
                      <span className="font-medium text-blue-900">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-3 bg-blue-100" />
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200 rounded-xl p-6">
                <div className="flex gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-amber-900 text-lg">
                      File Format Requirements
                    </h4>
                    <p className="text-sm text-amber-700">
                      Download the template file to see the required format. Fields marked with * are required.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Required Fields:
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><strong>Full Name*</strong> - Candidate's full name</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><strong>Email*</strong> - Valid email address</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><strong>Phone*</strong> - 10-digit phone number</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><strong>Position*</strong> - Job position</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><strong>Skills*</strong> - Semicolon-separated list (e.g., "React; JavaScript; TypeScript")</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          Optional Fields:
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Location</strong> - Current location</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Education</strong> - Highest education</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Bio</strong> - Brief description</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Current Company</strong> - Current employer</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Current Role</strong> - Current job title</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Notice Period</strong> - In days</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Expected CTC</strong> - In LPA</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Current CTC</strong> - In LPA</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>LinkedIn URL</strong> - Profile link</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>GitHub URL</strong> - Profile link</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Portfolio URL</strong> - Website link</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><strong>Resume URL</strong> - Document link</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {uploadResults && (
            <div className="space-y-6">
              <div
                className={`p-6 border-2 rounded-xl ${uploadResults.failed === 0
                  ? "bg-gradient-to-r from-green-50 to-emerald-50/30 border-green-200"
                  : "bg-gradient-to-r from-amber-50 to-orange-50/30 border-amber-200"
                  }`}
              >
                <div className="flex gap-4">
                  {uploadResults.failed === 0 ? (
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Upload Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Total records: <strong className="text-gray-900">{uploadResults.total}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Successfully added: <strong className="text-green-900">{uploadResults.success}</strong></span>
                      </div>
                      {uploadResults.failed > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">Failed: <strong className="text-red-900">{uploadResults.failed}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Errors
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto border-2 border-red-200 rounded-xl p-4 bg-red-50/30">
                    <ul className="space-y-2 text-sm text-red-700">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={resetBulkUpload}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-green-50/30 border-t border-gray-100 px-6 py-4">
          {!uploadResults ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={addSampleCandidates}
                disabled={isUploading}
                className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add Test Data
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
                className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={processBulkUpload}
                disabled={!bulkUploadFile || isUploading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
