"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    FileText,
    Upload,
    Brain,
    FileSpreadsheet,
    ArrowRight,
    Clock,
    Zap,
    Users,
    Sparkles,
    CheckCircle,
    Star
} from "lucide-react";
import { CandidateAddDialog } from "./candidate-add-dialog";
import { CandidateBulkResumeUploadDialog } from "./candidate-bulk-resume-upload-dialog";
import { CandidateBulkUploadDialog } from "./candidate-bulk-upload-dialog";

export function CandidateAddOptionsDialog({ isOpen, onOpenChange, onAdd }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [isResumeUploadDialogOpen, setIsResumeUploadDialogOpen] = useState(false);
    const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);

        switch (option) {
            case 'manual':
                setIsManualDialogOpen(true);
                break;
            case 'resume':
                setIsResumeUploadDialogOpen(true);
                break;
            case 'excel':
                setIsBulkUploadDialogOpen(true);
                break;
        }
    };

    const handleManualDialogClose = () => {
        setIsManualDialogOpen(false);
        setSelectedOption(null);
    };

    const handleResumeUploadDialogClose = () => {
        setIsResumeUploadDialogOpen(false);
        setSelectedOption(null);
    };

    const handleBulkUploadDialogClose = () => {
        setIsBulkUploadDialogOpen(false);
        setSelectedOption(null);
    };

    const handleCandidateAdded = (candidates) => {
        onAdd(candidates);
        // Close all dialogs
        setIsManualDialogOpen(false);
        setIsResumeUploadDialogOpen(false);
        setIsBulkUploadDialogOpen(false);
        setSelectedOption(null);
        onOpenChange(false);
    };

    const options = [
        {
            id: 'manual',
            title: 'Manual Entry',
            description: 'Add candidate details manually using a comprehensive form',
            icon: UserPlus,
            features: [
                'Complete candidate profile',
                'Education & experience history',
                'Skills & certifications',
                'Document uploads'
            ],
            timeEstimate: '5-10 minutes',
            badge: 'Traditional',
            color: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            hoverColor: 'hover:from-blue-100 hover:to-indigo-100',
            iconColor: 'text-blue-600',
            iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            popular: false
        },
        {
            id: 'resume',
            title: 'Upload Resumes (AI-Powered)',
            description: 'Upload one or more resumes and let AI extract candidate information automatically',
            icon: Brain,
            features: [
                'AI-powered resume parsing',
                'Automatic field extraction',
                'Multiple resume upload',
                'Instant candidate creation'
            ],
            timeEstimate: '2-5 minutes',
            badge: 'AI-Powered',
            color: 'from-purple-50 to-violet-50',
            borderColor: 'border-purple-200',
            hoverColor: 'hover:from-purple-100 hover:to-violet-100',
            iconColor: 'text-purple-600',
            iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
            popular: true
        },
        {
            id: 'excel',
            title: 'Upload Excel/CSV',
            description: 'Bulk upload multiple candidates using structured Excel or CSV files',
            icon: FileSpreadsheet,
            features: [
                'Bulk candidate import',
                'Template-based upload',
                'Data validation',
                'Error reporting'
            ],
            timeEstimate: '3-8 minutes',
            badge: 'Bulk Import',
            color: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            hoverColor: 'hover:from-green-100 hover:to-emerald-100',
            iconColor: 'text-green-600',
            iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
            popular: false
        }
    ];

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">Add New Candidate</DialogTitle>
                                <DialogDescription className="text-base text-gray-600 mt-1">
                                    Choose your preferred method for adding candidate information to the system.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {options.map((option) => {
                                const IconComponent = option.icon;
                                return (
                                    <Card
                                        key={option.id}
                                        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${option.color} ${option.borderColor} border-2 ${option.hoverColor} group`}
                                        onClick={() => handleOptionSelect(option.id)}
                                    >
                                        {option.popular && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Most Popular
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-3 rounded-xl shadow-lg ${option.iconBg}`}>
                                                    <IconComponent className="h-6 w-6 text-white" />
                                                </div>
                                                <Badge variant="secondary" className="text-xs font-medium bg-white/80 backdrop-blur-sm">
                                                    {option.badge}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                                {option.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                {option.description}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="pt-0 space-y-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{option.timeEstimate}</span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    Features:
                                                </div>
                                                <ul className="space-y-2">
                                                    {option.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex-shrink-0"></div>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`w-full mt-4 bg-white/80 backdrop-blur-sm border-2 ${option.borderColor} hover:bg-white hover:shadow-lg transition-all duration-200 group-hover:scale-105`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptionSelect(option.id);
                                                }}
                                            >
                                                <span className="font-medium">Choose This Option</span>
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">Pro Tips</h3>
                                    <p className="text-sm text-gray-600">Choose the best method for your workflow</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Manual Entry</p>
                                        <p className="text-xs text-gray-600 mt-1">Best for single candidates with detailed information</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">AI Resume Upload</p>
                                        <p className="text-xs text-gray-600 mt-1">Fastest way to process multiple resumes with automatic data extraction</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Excel/CSV Upload</p>
                                        <p className="text-xs text-gray-600 mt-1">Ideal for bulk imports from existing candidate databases</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manual Entry Dialog */}
            <CandidateAddDialog
                isOpen={isManualDialogOpen}
                onOpenChange={handleManualDialogClose}
                onAdd={handleCandidateAdded}
            />

            {/* AI Resume Upload Dialog */}
            <CandidateBulkResumeUploadDialog
                isOpen={isResumeUploadDialogOpen}
                onOpenChange={handleResumeUploadDialogClose}
                onUpload={handleCandidateAdded}
            />

            {/* Excel/CSV Bulk Upload Dialog */}
            <CandidateBulkUploadDialog
                isOpen={isBulkUploadDialogOpen}
                onOpenChange={handleBulkUploadDialogClose}
                onUpload={handleCandidateAdded}
            />
        </>
    );
} 