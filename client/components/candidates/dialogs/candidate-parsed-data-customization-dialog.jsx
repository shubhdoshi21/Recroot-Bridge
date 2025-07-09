"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertTriangle,
    CheckCircle2,
    Plus,
    Trash2,
    Edit3,
    Eye,
    User,
    GraduationCap,
    Briefcase,
    Award,
    Users,
    Star,
    AlertCircle,
    Info,
    SkipForward
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/utils";

export function CandidateParsedDataCustomizationDialog({
    isOpen,
    onOpenChange,
    parsedData,
    originalFileName,
    onConfirm,
    onSkip,
    isSequentialMode = false,
    currentStep = 1,
    totalSteps = 1
}) {
    const [customizedData, setCustomizedData] = useState(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Initialize customized data when dialog opens
    useEffect(() => {
        if (isOpen && parsedData) {
            console.log('[CustomizationDialog] Parsed data received:', parsedData);
            console.log('[CustomizationDialog] Original filename:', originalFileName);

            const initializedData = {
                ...parsedData,
                originalFileName,
                // Ensure all arrays exist
                skills: parsedData.skills || [],
                education: parsedData.education || [],
                experience: parsedData.experience || [],
                certifications: parsedData.certifications || [],
                extraCurricular: parsedData.extraCurricular || [],
            };

            console.log('[CustomizationDialog] Initialized data:', initializedData);
            setCustomizedData(initializedData);
        }
    }, [isOpen, parsedData, originalFileName]);

    // Check for missing or low-confidence fields
    const getFieldConfidence = (field, value) => {
        if (!value || value.trim() === '') return 'missing';
        if (value.length < 3) return 'low';
        return 'good';
    };

    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'missing': return 'text-red-600 bg-red-50 border-red-200';
            case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'good': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getConfidenceIcon = (confidence) => {
        switch (confidence) {
            case 'missing': return <AlertTriangle className="h-4 w-4" />;
            case 'low': return <AlertCircle className="h-4 w-4" />;
            case 'good': return <CheckCircle2 className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const updateField = (field, value) => {
        setCustomizedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateArrayField = (field, index, value) => {
        setCustomizedData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? { ...item, ...value } : item)
        }));
    };

    const addArrayItem = (field, template) => {
        setCustomizedData(prev => ({
            ...prev,
            [field]: [...prev[field], { id: generateId(field), ...template }]
        }));
    };

    const removeArrayItem = (field, index) => {
        setCustomizedData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const addSkill = () => {
        setCustomizedData(prev => ({
            ...prev,
            skills: [...prev.skills, '']
        }));
    };

    const updateSkill = (index, value) => {
        setCustomizedData(prev => ({
            ...prev,
            skills: prev.skills.map((skill, i) => i === index ? value : skill)
        }));
    };

    const removeSkill = (index) => {
        setCustomizedData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const deduplicateArray = (arr, keyFn) => {
        const seen = new Set();
        return arr.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    // Helper to normalize date fields to YYYY-MM-DD format for backend
    const normalizeDate = (date) => {
        if (!date || typeof date !== 'string' || date.trim() === '') return null;
        const trimmed = date.trim();
        if (trimmed.toLowerCase() === 'present') return 'Present';

        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

        // If in YYYY-MM format, return as is
        if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;

        // If in DD/MM/YYYY format, convert to YYYY-MM-DD
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return null;
    };

    // Deduplicate, map, normalize, and submit only backend-expected fields
    const handleSubmit = async () => {
        if (!customizedData) return;

        // Validate required fields
        const requiredFields = ['name', 'email'];
        const missingFields = requiredFields.filter(field =>
            !customizedData[field] || customizedData[field].trim() === ''
        );

        if (missingFields.length > 0) {
            toast({
                title: "Missing Required Fields",
                description: `Please fill in: ${missingFields.join(', ')}`,
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Normalize and deduplicate arrays, then map to backend field names
            const dedupedData = {
                ...customizedData,
                skills: deduplicateArray(
                    customizedData.skills.filter(skill => skill.trim() !== ''),
                    skill => skill.trim().toLowerCase()
                ),
                educationHistory: deduplicateArray(
                    customizedData.education.filter(edu => edu.degree && edu.institution).map(edu => ({
                        ...edu,
                        startDate: normalizeDate(edu.startDate),
                        endDate: normalizeDate(edu.endDate),
                    })),
                    edu => [edu.degree, edu.institution, edu.fieldOfStudy, edu.startDate, edu.endDate, edu.location].map(x => (x || '').trim().toLowerCase()).join('|')
                ),
                workHistory: deduplicateArray(
                    customizedData.experience.filter(exp => exp.title && exp.company).map(exp => ({
                        ...exp,
                        startDate: normalizeDate(exp.startDate),
                        endDate: normalizeDate(exp.endDate),
                    })),
                    exp => [exp.title, exp.company, exp.location, exp.startDate, exp.endDate].map(x => (x || '').trim().toLowerCase()).join('|')
                ),
                certifications: deduplicateArray(
                    customizedData.certifications.filter(cert => cert.certificationName),
                    cert => [cert.certificationName, cert.issuingOrganization, cert.issueDate, cert.expiryDate].map(x => (x || '').trim().toLowerCase()).join('|')
                ),
                extracurricularActivities: deduplicateArray(
                    customizedData.extraCurricular.filter(activity => activity.title),
                    activity => [activity.title, activity.organization, activity.description].map(x => (x || '').trim().toLowerCase()).join('|')
                ),
            };
            // Hard delete old arrays to avoid backend confusion and UI issues
            delete dedupedData.education;
            delete dedupedData.experience;
            delete dedupedData.extraCurricular;
            setCustomizedData(dedupedData); // Update UI state so user sees only unique entries
            await onConfirm(dedupedData);
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create candidate. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!customizedData) return null;

    const confidenceFields = {
        name: getFieldConfidence('name', customizedData.name),
        email: getFieldConfidence('email', customizedData.email),
        phone: getFieldConfidence('phone', customizedData.phone),
        position: getFieldConfidence('position', customizedData.position),
        bio: getFieldConfidence('bio', customizedData.bio),
    };

    // Use mapped arrays after deduplication/mapping
    const educationArray = customizedData.educationHistory || customizedData.education || [];
    const experienceArray = customizedData.workHistory || customizedData.experience || [];
    const certificationsArray = customizedData.certifications || [];
    const extraCurricularArray = customizedData.extracurricularActivities || customizedData.extraCurricular || [];
    const skillsArray = customizedData.skills || [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-t-lg -m-6 mb-0"></div>
                    <div className="relative">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                                <Edit3 className="h-6 w-6 text-white" />
                            </div>
                            Customize Candidate Data
                            {isSequentialMode && (
                                <Badge className="ml-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md">
                                    {currentStep} of {totalSteps}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-base mt-3 text-slate-600">
                            Review and edit the AI-parsed data for <span className="font-semibold text-blue-600">{originalFileName}</span>.
                            Fields marked with warnings may need attention.
                        </DialogDescription>
                        {isSequentialMode && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                <Info className="h-4 w-4 inline mr-2" />
                                You can skip this candidate and move to the next one using the Skip button.
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Summary of parsed data */}
                    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                    <Info className="h-5 w-5 text-white" />
                                </div>
                                AI Parsing Summary
                            </CardTitle>
                            <CardDescription className="text-slate-600 text-base">
                                Overview of what AI extracted from the resume
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{educationArray.length || 0}</div>
                                    <div className="text-slate-600 font-medium">Education</div>
                                </div>
                                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{experienceArray.length || 0}</div>
                                    <div className="text-slate-600 font-medium">Experience</div>
                                </div>
                                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{skillsArray.length || 0}</div>
                                    <div className="text-slate-600 font-medium">Skills</div>
                                </div>
                                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {certificationsArray.length + extraCurricularArray.length}
                                    </div>
                                    <div className="text-slate-600 font-medium">Other</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-slate-100/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-1">
                            <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
                                <User className="h-4 w-4" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="education" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
                                <GraduationCap className="h-4 w-4" />
                                Education
                            </TabsTrigger>
                            <TabsTrigger value="experience" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
                                <Briefcase className="h-4 w-4" />
                                Experience
                            </TabsTrigger>
                            <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
                                <Star className="h-4 w-4" />
                                Skills
                            </TabsTrigger>
                            <TabsTrigger value="other" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
                                <Award className="h-4 w-4" />
                                Other
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-4">
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Core candidate details and contact information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <User className="h-4 w-4 text-blue-600" />
                                                Full Name *
                                                <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidenceFields.name)} border-0 shadow-sm`}>
                                                    {getConfidenceIcon(confidenceFields.name)}
                                                    {confidenceFields.name === 'missing' ? 'Missing' :
                                                        confidenceFields.name === 'low' ? 'Low Confidence' : 'Good'}
                                                </Badge>
                                            </Label>
                                            <Input
                                                value={customizedData.name || ''}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                placeholder="Enter full name"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-blue-100 rounded">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                Email *
                                                <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidenceFields.email)} border-0 shadow-sm`}>
                                                    {getConfidenceIcon(confidenceFields.email)}
                                                    {confidenceFields.email === 'missing' ? 'Missing' :
                                                        confidenceFields.email === 'low' ? 'Low Confidence' : 'Good'}
                                                </Badge>
                                            </Label>
                                            <Input
                                                type="email"
                                                value={customizedData.email || ''}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-green-100 rounded">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                </div>
                                                Phone
                                                <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidenceFields.phone)} border-0 shadow-sm`}>
                                                    {getConfidenceIcon(confidenceFields.phone)}
                                                    {confidenceFields.phone === 'missing' ? 'Missing' :
                                                        confidenceFields.phone === 'low' ? 'Low Confidence' : 'Good'}
                                                </Badge>
                                            </Label>
                                            <Input
                                                value={customizedData.phone || ''}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-purple-100 rounded">
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                </div>
                                                Location
                                            </Label>
                                            <Input
                                                value={customizedData.location || ''}
                                                onChange={(e) => updateField('location', e.target.value)}
                                                placeholder="City, State, Country"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <Briefcase className="h-4 w-4 text-indigo-600" />
                                                Position
                                                <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidenceFields.position)} border-0 shadow-sm`}>
                                                    {getConfidenceIcon(confidenceFields.position)}
                                                    {confidenceFields.position === 'missing' ? 'Missing' :
                                                        confidenceFields.position === 'low' ? 'Low Confidence' : 'Good'}
                                                </Badge>
                                            </Label>
                                            <Input
                                                value={customizedData.position || ''}
                                                onChange={(e) => updateField('position', e.target.value)}
                                                placeholder="Current or desired position"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-orange-100 rounded">
                                                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                                </div>
                                                Current Company
                                            </Label>
                                            <Input
                                                value={customizedData.currentCompany || ''}
                                                onChange={(e) => updateField('currentCompany', e.target.value)}
                                                placeholder="Current company name"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <div className="p-1 bg-teal-100 rounded">
                                                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                                            </div>
                                            Professional Summary
                                            <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidenceFields.bio)} border-0 shadow-sm`}>
                                                {getConfidenceIcon(confidenceFields.bio)}
                                                {confidenceFields.bio === 'missing' ? 'Missing' :
                                                    confidenceFields.bio === 'low' ? 'Low Confidence' : 'Good'}
                                            </Badge>
                                        </Label>
                                        <Textarea
                                            value={customizedData.bio || ''}
                                            onChange={(e) => updateField('bio', e.target.value)}
                                            placeholder="Professional summary or objective"
                                            rows={4}
                                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-blue-100 rounded">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                LinkedIn Profile
                                            </Label>
                                            <Input
                                                value={customizedData.linkedInProfile || ''}
                                                onChange={(e) => updateField('linkedInProfile', e.target.value)}
                                                placeholder="LinkedIn URL"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-gray-100 rounded">
                                                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                                                </div>
                                                GitHub Profile
                                            </Label>
                                            <Input
                                                value={customizedData.githubProfile || ''}
                                                onChange={(e) => updateField('githubProfile', e.target.value)}
                                                placeholder="GitHub URL"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <div className="p-1 bg-purple-100 rounded">
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                </div>
                                                Portfolio URL
                                            </Label>
                                            <Input
                                                value={customizedData.portfolioUrl || ''}
                                                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                                                placeholder="Portfolio website"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Education Tab */}
                        <TabsContent value="education" className="space-y-4">
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                        </div>
                                        Education History
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Academic background and qualifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {educationArray.map((edu, index) => (
                                        <Card key={index} className="p-6 border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Degree *</Label>
                                                    <Input
                                                        value={edu.degree || ''}
                                                        onChange={(e) => updateArrayField('education', index, { degree: e.target.value })}
                                                        placeholder="e.g., Bachelor of Science"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Institution *</Label>
                                                    <Input
                                                        value={edu.institution || ''}
                                                        onChange={(e) => updateArrayField('education', index, { institution: e.target.value })}
                                                        placeholder="University name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Field of Study</Label>
                                                    <Input
                                                        value={edu.fieldOfStudy || ''}
                                                        onChange={(e) => updateArrayField('education', index, { fieldOfStudy: e.target.value })}
                                                        placeholder="e.g., Computer Science"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Location</Label>
                                                    <Input
                                                        value={edu.location || ''}
                                                        onChange={(e) => updateArrayField('education', index, { location: e.target.value })}
                                                        placeholder="City, State"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={edu.startDate && edu.startDate !== 'Present' ? edu.startDate : ''}
                                                        onChange={e => updateArrayField('education' + (educationArray === customizedData.educationHistory ? 'History' : ''), index, { startDate: e.target.value })}
                                                        placeholder="DD/MM/YYYY"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="date"
                                                            value={edu.endDate && edu.endDate !== 'Present' ? edu.endDate : ''}
                                                            onChange={e => updateArrayField('education' + (educationArray === customizedData.educationHistory ? 'History' : ''), index, { endDate: e.target.value })}
                                                            placeholder="DD/MM/YYYY"
                                                            disabled={edu.endDate === 'Present'}
                                                        />
                                                        <label className="flex items-center gap-1 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={edu.endDate === 'Present'}
                                                                onChange={e => updateArrayField('education' + (educationArray === customizedData.educationHistory ? 'History' : ''), index, { endDate: e.target.checked ? 'Present' : '' })}
                                                            />
                                                            Present
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeArrayItem('education', index)}
                                                className="mt-2"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={() => addArrayItem('education', {
                                            degree: '',
                                            institution: '',
                                            fieldOfStudy: '',
                                            startDate: '',
                                            endDate: '',
                                            location: ''
                                        })}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Education
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Experience Tab */}
                        <TabsContent value="experience" className="space-y-4">
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <Briefcase className="h-5 w-5 text-white" />
                                        </div>
                                        Work Experience
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Professional work history and achievements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {experienceArray.map((exp, index) => (
                                        <Card key={index} className="p-6 border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Job Title *</Label>
                                                    <Input
                                                        value={exp.title || ''}
                                                        onChange={(e) => updateArrayField('experience', index, { title: e.target.value })}
                                                        placeholder="e.g., Senior Software Engineer"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Company *</Label>
                                                    <Input
                                                        value={exp.company || ''}
                                                        onChange={(e) => updateArrayField('experience', index, { company: e.target.value })}
                                                        placeholder="Company name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Location</Label>
                                                    <Input
                                                        value={exp.location || ''}
                                                        onChange={(e) => updateArrayField('experience', index, { location: e.target.value })}
                                                        placeholder="City, State"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={exp.startDate && exp.startDate !== 'Present' ? exp.startDate : ''}
                                                        onChange={e => updateArrayField('experience', index, { startDate: e.target.value })}
                                                        placeholder="DD/MM/YYYY"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="date"
                                                            value={exp.endDate && exp.endDate !== 'Present' ? exp.endDate : ''}
                                                            onChange={e => updateArrayField('experience', index, { endDate: e.target.value })}
                                                            placeholder="DD/MM/YYYY"
                                                            disabled={exp.endDate === 'Present'}
                                                        />
                                                        <label className="flex items-center gap-1 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.endDate === 'Present'}
                                                                onChange={e => updateArrayField('experience', index, { endDate: e.target.checked ? 'Present' : '' })}
                                                            />
                                                            Present
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 flex items-center">
                                                    <Checkbox
                                                        checked={exp.isCurrentRole || false}
                                                        onCheckedChange={(checked) => updateArrayField('experience', index, { isCurrentRole: checked })}
                                                    />
                                                    <Label className="ml-2">Current Role</Label>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={exp.description || ''}
                                                    onChange={(e) => updateArrayField('experience', index, { description: e.target.value })}
                                                    placeholder="Job responsibilities and achievements"
                                                    rows={3}
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeArrayItem('experience', index)}
                                                className="mt-2"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={() => addArrayItem('experience', {
                                            title: '',
                                            company: '',
                                            location: '',
                                            startDate: '',
                                            endDate: '',
                                            description: '',
                                            isCurrentRole: false
                                        })}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Experience
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Skills Tab */}
                        <TabsContent value="skills" className="space-y-4">
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <Star className="h-5 w-5 text-white" />
                                        </div>
                                        Skills & Competencies
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Technical skills, programming languages, and soft skills
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillsArray.map((skill, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                                                <Input
                                                    value={skill}
                                                    onChange={(e) => updateSkill(index, e.target.value)}
                                                    placeholder="Enter skill"
                                                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 shadow-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeSkill(index)}
                                                    className="bg-red-500 text-white border-0 hover:bg-red-600 shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={addSkill}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Skill
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Other Tab */}
                        <TabsContent value="other" className="space-y-6">
                            {/* Certifications */}
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <Award className="h-5 w-5 text-white" />
                                        </div>
                                        Certifications
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Professional certifications and licenses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {certificationsArray.map((cert, index) => (
                                        <Card key={index} className="p-6 border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Certification Name *</Label>
                                                    <Input
                                                        value={cert.certificationName || ''}
                                                        onChange={(e) => updateArrayField('certifications', index, { certificationName: e.target.value })}
                                                        placeholder="e.g., AWS Certified Solutions Architect"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Issuing Organization</Label>
                                                    <Input
                                                        value={cert.issuingOrganization || ''}
                                                        onChange={(e) => updateArrayField('certifications', index, { issuingOrganization: e.target.value })}
                                                        placeholder="e.g., Amazon Web Services"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Issue Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={cert.issueDate || ''}
                                                        onChange={(e) => updateArrayField('certifications', index, { issueDate: e.target.value })}
                                                        placeholder="DD/MM/YYYY"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Expiry Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={cert.expiryDate || ''}
                                                        onChange={(e) => updateArrayField('certifications', index, { expiryDate: e.target.value })}
                                                        placeholder="DD/MM/YYYY"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeArrayItem('certifications', index)}
                                                className="mt-2"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={() => addArrayItem('certifications', {
                                            certificationName: '',
                                            issuingOrganization: '',
                                            issueDate: '',
                                            expiryDate: ''
                                        })}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Certification
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Extracurricular Activities */}
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        Extracurricular Activities
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 text-base">
                                        Volunteer work, leadership roles, and community involvement
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {extraCurricularArray.map((activity, index) => (
                                        <Card key={index} className="p-6 border-2 border-dashed border-teal-200 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Activity Title *</Label>
                                                    <Input
                                                        value={activity.title || ''}
                                                        onChange={(e) => updateArrayField('extraCurricular', index, { title: e.target.value })}
                                                        placeholder="e.g., Team Lead, Volunteer Coordinator"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Organization</Label>
                                                    <Input
                                                        value={activity.organization || ''}
                                                        onChange={(e) => updateArrayField('extraCurricular', index, { organization: e.target.value })}
                                                        placeholder="Organization name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={activity.description || ''}
                                                    onChange={(e) => updateArrayField('extraCurricular', index, { description: e.target.value })}
                                                    placeholder="Describe your role and achievements"
                                                    rows={3}
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeArrayItem('extraCurricular', index)}
                                                className="mt-2"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={() => addArrayItem('extraCurricular', {
                                            title: '',
                                            organization: '',
                                            description: ''
                                        })}
                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Activity
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200/50">
                    {isSequentialMode && onSkip && (
                        <Button
                            variant="outline"
                            onClick={onSkip}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <SkipForward className="h-4 w-4" />
                            Skip Candidate
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 border-slate-200 shadow-sm hover:bg-slate-200 transition-all duration-300"
                    >
                        {isSequentialMode ? 'Cancel All' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating Candidate...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Create Candidate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 