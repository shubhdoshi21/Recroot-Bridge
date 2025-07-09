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
    FileText,
    X,
    Upload,
    Brain,
    Loader2,
    Sparkles,
    Users,
    FileSpreadsheet,
    Zap,
    ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { candidateService } from "@/services/candidateService";
import { toast } from "@/components/ui/use-toast";
import { CandidateParsedDataCustomizationDialog } from "./candidate-parsed-data-customization-dialog";

export function CandidateBulkResumeUploadDialog({ isOpen, onOpenChange, onUpload }) {
    const [resumeFiles, setResumeFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResults, setUploadResults] = useState(null);
    const [customizationStep, setCustomizationStep] = useState(0);
    const [customizationCandidates, setCustomizationCandidates] = useState([]);
    const [showCustomization, setShowCustomization] = useState(false);
    const [processedCandidates, setProcessedCandidates] = useState([]);
    const [skippedCandidates, setSkippedCandidates] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const fileInputRef = useRef(null);

    const handleResumeFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setResumeFiles(files);
        setUploadResults(null);
    };

    const removeFile = (index) => {
        setResumeFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processBulkResumeUpload = async () => {
        if (resumeFiles.length === 0) {
            toast({
                title: "No files selected",
                description: "Please select one or more resume files to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadResults(null);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            const response = await candidateService.bulkUploadResumes(resumeFiles);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.error) {
                throw new Error(response.error);
            }

            setUploadResults({
                success: response.success || 0,
                failed: response.failed || 0,
                total: response.total || 0,
                errors: response.errors || [],
                candidates: response.candidates || [],
                parseResults: response.parseResults || {},
            });

            if (response.parseResults && response.parseResults.candidates && response.parseResults.candidates.length > 0) {
                // Store parsed candidates for customization
                const candidatesWithFileInfo = response.parseResults.candidates.map((c, i) => ({
                    ...c,
                    originalFileName: response.parseResults?.files?.[i]?.name || c.originalFileName || c.name || `Resume ${i + 1}`,
                    filePath: response.parseResults?.files?.[i]?.path || c.filePath
                }));

                console.log(`[BulkUpload] Setting up ${candidatesWithFileInfo.length} candidates for sequential processing:`,
                    candidatesWithFileInfo.map(c => ({ name: c.name, email: c.email, fileName: c.originalFileName }))
                );

                setCustomizationCandidates(candidatesWithFileInfo);
                setCustomizationStep(0);
                setShowCustomization(true);
                return; // Don't call onUpload yet
            }

            toast({
                title: "Bulk resume upload completed",
                description: `Successfully processed ${response.success} resumes. ${response.failed} failed.`,
                variant: response.failed > 0 ? "default" : "default",
            });
        } catch (error) {
            console.log("Error in bulk resume upload:", error);
            setUploadResults({
                success: 0,
                failed: 1,
                total: 1,
                errors: [error.message || "Failed to process bulk resume upload"],
            });

            toast({
                title: "Upload failed",
                description: error.message || "Failed to process bulk resume upload",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Handler for confirming a customized candidate
    const handleCustomizationConfirm = async (customizedCandidate) => {
        try {
            console.log(`[BulkUpload] Processing candidate ${customizationStep + 1}/${customizationCandidates.length}:`, customizedCandidate.name);

            const response = await candidateService.createCandidate(customizedCandidate);

            if (response.error) {
                throw new Error(response.error);
            }

            // Get the created candidate ID
            const candidateId = response.data?.id || response.id;
            if (!candidateId) {
                throw new Error("Candidate created but no ID returned");
            }

            // Store the original resume file for this candidate
            const currentCandidate = customizationCandidates[customizationStep];
            const originalFileName = currentCandidate?.originalFileName;
            const filePath = currentCandidate?.filePath;

            if (originalFileName && filePath) {
                try {
                    console.log(`[BulkUpload] Storing resume for candidate ${candidateId}: ${originalFileName}`);
                    const resumeStorageResponse = await candidateService.storeResumeAfterCreation(
                        candidateId,
                        originalFileName,
                        filePath
                    );

                    if (resumeStorageResponse.error) {
                        console.log(`[BulkUpload] Warning: Failed to store resume for candidate ${candidateId}:`, resumeStorageResponse.error);
                        // Don't fail the entire process, just log the warning
                    } else {
                        console.log(`[BulkUpload] Successfully stored resume for candidate ${candidateId}`);
                    }
                } catch (resumeError) {
                    console.log(`[BulkUpload] Error storing resume for candidate ${candidateId}:`, resumeError);
                    // Don't fail the entire process, just log the error
                }
            }

            // Add to processed candidates
            setProcessedCandidates(prev => {
                const newProcessed = [...prev, {
                    ...customizedCandidate,
                    originalFileName: customizationCandidates[customizationStep]?.originalFileName,
                    status: 'created',
                    candidateId: candidateId
                }];
                console.log(`[BulkUpload] Updated processed candidates. Total: ${newProcessed.length}`);
                return newProcessed;
            });

            console.log(`[BulkUpload] Candidate ${customizedCandidate.name} created successfully. Current step: ${customizationStep + 1}/${customizationCandidates.length}`);

            // Move to next candidate or finish
            if (customizationStep < customizationCandidates.length - 1) {
                const nextStep = customizationStep + 1;
                console.log(`[BulkUpload] Moving to next candidate: step ${nextStep + 1}/${customizationCandidates.length}`);
                setCustomizationStep(nextStep);
                toast({
                    title: "Candidate Created",
                    description: `Successfully created ${customizedCandidate.name}. Moving to next candidate...`,
                    variant: "default",
                });
            } else {
                // All candidates processed
                console.log(`[BulkUpload] All candidates processed. Moving to summary.`);
                setShowCustomization(false);
                setShowSummary(true);
                toast({
                    title: "All Candidates Processed",
                    description: `Successfully processed all ${customizationCandidates.length} candidates`,
                    variant: "default",
                });
            }
        } catch (error) {
            console.log(`[BulkUpload] Error creating candidate:`, error);
            toast({
                title: "Error",
                description: error.message || "Failed to create candidate.",
                variant: "destructive",
            });
        }
    };

    // Handler for skipping a candidate
    const handleCustomizationSkip = () => {
        const currentCandidate = customizationCandidates[customizationStep];
        console.log(`[BulkUpload] Skipping candidate ${customizationStep + 1}/${customizationCandidates.length}:`, currentCandidate?.name);

        // Add to skipped candidates
        setSkippedCandidates(prev => {
            const newSkipped = [...prev, {
                ...currentCandidate,
                originalFileName: currentCandidate?.originalFileName,
                status: 'skipped'
            }];
            console.log(`[BulkUpload] Updated skipped candidates. Total: ${newSkipped.length}`);
            return newSkipped;
        });

        // Move to next candidate or finish
        if (customizationStep < customizationCandidates.length - 1) {
            const nextStep = customizationStep + 1;
            console.log(`[BulkUpload] Moving to next candidate after skip: step ${nextStep + 1}/${customizationCandidates.length}`);
            setCustomizationStep(nextStep);
            toast({
                title: "Candidate Skipped",
                description: `Skipped ${currentCandidate?.name || 'candidate'}. Moving to next...`,
                variant: "default",
            });
        } else {
            // All candidates processed
            console.log(`[BulkUpload] All candidates processed after skip. Moving to summary.`);
            setShowCustomization(false);
            setShowSummary(true);
            toast({
                title: "All Candidates Processed",
                description: `Processed all ${customizationCandidates.length} candidates`,
                variant: "default",
            });
        }
    };

    const resetBulkResumeUpload = () => {
        setResumeFiles([]);
        setUploadResults(null);
        setUploadProgress(0);
        setCustomizationCandidates([]);
        setCustomizationStep(0);
        setShowCustomization(false);
        setProcessedCandidates([]);
        setSkippedCandidates([]);
        setShowSummary(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📄';
        if (ext === 'docx' || ext === 'doc') return '📝';
        return '📎';
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    onOpenChange(open);
                    if (!open) {
                        resetBulkResumeUpload();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-purple-50 to-violet-50/50 border-b border-purple-100/50 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">Bulk Resume Upload with AI</DialogTitle>
                                <DialogDescription className="text-gray-600 mt-1">
                                    Upload multiple resume files (PDF or DOCX) and let AI automatically extract candidate information.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Progress Indicator for Sequential Customization */}
                        {showCustomization && customizationCandidates.length > 0 && (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-200 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Customization Progress
                                    </h4>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        {customizationStep + 1} of {customizationCandidates.length}
                                    </Badge>
                                </div>
                                <Progress
                                    value={((customizationStep + 1) / customizationCandidates.length) * 100}
                                    className="w-full h-3 bg-blue-100"
                                />
                                <div className="mt-2 text-sm text-blue-700">
                                    Currently reviewing: <strong>{customizationCandidates[customizationStep]?.originalFileName}</strong>
                                </div>
                            </div>
                        )}

                        {/* Summary View */}
                        {showSummary && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">Bulk Upload Summary</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 border-2 border-green-200 rounded-xl">
                                        <div className="text-3xl font-bold text-green-600">{processedCandidates.length}</div>
                                        <div className="text-sm text-green-700 font-medium">Created</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50/30 border-2 border-yellow-200 rounded-xl">
                                        <div className="text-3xl font-bold text-yellow-600">{skippedCandidates.length}</div>
                                        <div className="text-sm text-yellow-700 font-medium">Skipped</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 border-2 border-blue-200 rounded-xl">
                                        <div className="text-3xl font-bold text-blue-600">{customizationCandidates.length}</div>
                                        <div className="text-sm text-blue-700 font-medium">Total</div>
                                    </div>
                                </div>

                                {processedCandidates.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-green-600 font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Successfully Created Candidates
                                        </Label>
                                        <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-green-50/30 border border-green-200 rounded-lg">
                                            {processedCandidates.map((candidate, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>{candidate.name} ({candidate.email})</span>
                                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                                        {candidate.originalFileName}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {skippedCandidates.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-yellow-600 font-semibold flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Skipped Candidates
                                        </Label>
                                        <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-yellow-50/30 border border-yellow-200 rounded-lg">
                                            {skippedCandidates.map((candidate, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <span>{candidate.name || 'Unknown'} ({candidate.email || 'No email'})</span>
                                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                                        {candidate.originalFileName}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!uploadResults && !showSummary && (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resume-upload" className="text-base font-semibold text-gray-900">Upload Resume Files</Label>
                                        <p className="text-sm text-gray-600">
                                            Select multiple PDF or DOCX files. AI will automatically parse and extract candidate information.
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="resume-upload"
                                            type="file"
                                            accept=".pdf,.docx,.doc"
                                            multiple
                                            onChange={handleResumeFilesChange}
                                            disabled={isUploading}
                                            ref={fileInputRef}
                                            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                        />
                                    </div>

                                    {resumeFiles.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-gray-700">Selected Files ({resumeFiles.length})</Label>
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {resumeFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50/30 border-2 border-purple-200 rounded-lg hover:border-purple-300 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                                                                <FileText className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-sm text-gray-900">{file.name}</span>
                                                                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile(index)}
                                                            disabled={isUploading}
                                                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                                <span className="font-medium text-blue-900">Processing resumes with AI...</span>
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
                                </div>
                            </>
                        )}

                        {uploadResults && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">Upload Results</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 border-2 border-green-200 rounded-xl">
                                        <div className="text-3xl font-bold text-green-600">{uploadResults.success}</div>
                                        <div className="text-sm text-green-700 font-medium">Successfully Created</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50/30 border-2 border-red-200 rounded-xl">
                                        <div className="text-3xl font-bold text-red-600">{uploadResults.failed}</div>
                                        <div className="text-sm text-red-700 font-medium">Failed</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 border-2 border-blue-200 rounded-xl">
                                        <div className="text-3xl font-bold text-blue-600">{uploadResults.total}</div>
                                        <div className="text-sm text-blue-700 font-medium">Total Files</div>
                                    </div>
                                </div>

                                {uploadResults.parseResults && (
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-200 rounded-xl">
                                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            AI Parsing Results
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-blue-700">Successfully parsed:</span>
                                                <strong className="text-blue-900">{uploadResults.parseResults.success}</strong>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="text-blue-700">Failed to parse:</span>
                                                <strong className="text-blue-900">{uploadResults.parseResults.failed}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {uploadResults.errors && uploadResults.errors.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-red-600 font-semibold flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Errors
                                        </Label>
                                        <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-red-50/30 border border-red-200 rounded-lg">
                                            {uploadResults.errors.map((error, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm text-red-700">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span>{error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {uploadResults.candidates && uploadResults.candidates.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-green-600 font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Successfully Created Candidates
                                        </Label>
                                        <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-green-50/30 border border-green-200 rounded-lg">
                                            {uploadResults.candidates.map((candidate, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>{candidate.name} ({candidate.email})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-100 px-6 py-4">
                        {!uploadResults && !showSummary ? (
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={resetBulkResumeUpload}
                                    disabled={isUploading}
                                    className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={processBulkResumeUpload}
                                    disabled={resumeFiles.length === 0 || isUploading}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Upload & Parse with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : showSummary ? (
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={resetBulkResumeUpload}
                                    className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload More
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (onUpload && processedCandidates.length > 0) {
                                            onUpload(processedCandidates);
                                        }
                                        onOpenChange(false);
                                    }}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={resetBulkResumeUpload}
                                    className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel All
                                </Button>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Done
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {showCustomization && customizationCandidates.length > 0 && (
                <CandidateParsedDataCustomizationDialog
                    isOpen={showCustomization}
                    onOpenChange={(open) => {
                        if (!open) {
                            // If dialog is closed without confirmation, treat as skip
                            handleCustomizationSkip();
                        }
                    }}
                    parsedData={customizationCandidates[customizationStep]}
                    originalFileName={customizationCandidates[customizationStep]?.originalFileName}
                    onConfirm={handleCustomizationConfirm}
                    onSkip={handleCustomizationSkip}
                    isSequentialMode={true}
                    currentStep={customizationStep + 1}
                    totalSteps={customizationCandidates.length}
                />
            )}
        </>
    );
} 