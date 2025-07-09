"use client";
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useJobs } from "@/contexts/jobs-context";
import { useCompanies } from "@/contexts/companies-context";
import { Check, ChevronsUpDown, Sparkles, Loader2, Bot, FileText, Settings, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add normalization function
const normalizeForComparison = (value) => {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "-");
};

export function AIJobDialog({ isOpen, onClose }) {
  const { addJob } = useJobs();
  const { companies } = useCompanies();
  const { toast } = useToast();

  // Form states
  const [jobPrompt, setJobPrompt] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [companyId, setCompanyId] = useState(undefined);
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState(1);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [workType, setWorkType] = useState("Remote");
  const [status, setStatus] = useState("New");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCompanySelect, setOpenCompanySelect] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Generated content
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [generatedSkills, setGeneratedSkills] = useState("");
  const [generatedJob, setGeneratedJob] = useState(null);
  const [responsibilities, setResponsibilities] = useState("");
  const [benefits, setBenefits] = useState("");
  const [applicationProcess, setApplicationProcess] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  // Form validation
  const [errors, setErrors] = useState({});

  // Add new state for active tab
  const [activeTab, setActiveTab] = useState("fields");

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to prevent visual glitches during closing animation
      const timer = setTimeout(() => {
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCompanySelect = (id) => {
    setCompanyId(id);
    setOpenCompanySelect(false);

    // Clear error if exists
    if (errors.companyId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.companyId;
        return newErrors;
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      // Validate required fields before generating
      if (!companyId) {
        throw new Error("Please select a company first");
      }

      let data;
      if (activeTab === "fields") {
        // Fields based generation
        data = await jobService.generateJobDescription({
          jobType,
          department,
          requiredSkills: requiredSkills
            .split(",")
            .map((skill) => skill.trim()),
          experienceLevel,
          location,
        });
      } else {
        // Prompt based generation
        if (!jobPrompt.trim()) {
          throw new Error("Please enter a job prompt");
        }
        data = await jobService.generateJobDescription({
          prompt: jobPrompt,
          jobType,
          department,
          requiredSkills: requiredSkills
            .split(",")
            .map((skill) => skill.trim()),
          experienceLevel,
          location,
        });
      }

      // Handle the response data
      if (!data || !data.description) {
        throw new Error("Invalid response from AI service");
      }

      if (activeTab === "prompt") {
        // Use backend-extracted fields directly
        setGeneratedTitle(data.title || "");
        setDepartment(data.department || "");
        setLocation(data.location || "");
        setGeneratedDescription(data.jobOverview || "");
        setRequirements(data.requirements || "");
        setResponsibilities(data.responsibilities || "");
        setBenefits(data.benefits || "");
        setOtherDetails(data.otherDetails || "");
        setGeneratedSkills(
          data.requiredSkills && data.requiredSkills.length > 0
            ? data.requiredSkills.join(", ")
            : ""
        );
        // Set application stages from AI response
        const jobObj = {
          jobTitle: data.title || "",
          department: data.department || "",
          location: data.location || "",
          jobType: jobType,
          description: data.jobOverview || "",
          requirements: data.requirements || "",
          responsibilities: data.responsibilities || "",
          benefits: data.benefits || "",
          otherDetails: data.otherDetails || "",
          requiredSkills: data.requiredSkills || [],
          experienceLevel: experienceLevel,
          companyId: companyId,
          openings: openings,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          deadline: deadline || null,
          workType: workType,
          jobStatus: "draft",
          applicationStages: data.applicationStages || [],
        };
        console.log("AI Application Stages:", data.applicationStages);
        setGeneratedJob(jobObj);
        console.log("Generated Job:", jobObj);
      } else {
        // Existing fields-based logic (keep as is)
        const description = data.description || "";
        // Extract sections using a more robust regex pattern
        const sections = {};
        const sectionRegex = /\*\*([^*]+):\*\*\s*([^*]+)(?=\*\*|\n\n|$)/g;
        let match;
        while ((match = sectionRegex.exec(description)) !== null) {
          const sectionTitle = match[1].trim();
          const content = match[2].trim();
          sections[sectionTitle] = content;
        }
        // Extract job title, department, and location from the header section
        const headerMatch = description.match(/\*\*Job Title:\*\*\s*([^\n]+)/);
        const extractedTitle = headerMatch
          ? headerMatch[1].trim()
          : data.title || "";
        const departmentMatch = description.match(
          /\*\*Department:\*\*\s*([^\n]+)/
        );
        const extractedDepartment = departmentMatch
          ? departmentMatch[1].trim()
          : data.department || "";
        const locationMatch = description.match(/\*\*Location:\*\*\s*([^\n]+)/);
        const extractedLocation = locationMatch
          ? locationMatch[1].trim()
          : data.location || "";
        // Extract skills from requirements section
        const requirementsSection =
          sections["Required Qualifications"] ||
          sections["3. Required Qualifications"] ||
          "";
        const skillsList = requirementsSection
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.replace(/^-\s*/, "").trim())
          .join(", ");
        setGeneratedTitle(extractedTitle);
        setDepartment(extractedDepartment);
        setLocation(extractedLocation);
        setGeneratedSkills(skillsList);
        setGeneratedDescription(
          sections["Job Overview"] || sections["1. Job Overview"] || ""
        );
        setRequirements(
          sections["Required Qualifications"] ||
          sections["3. Required Qualifications"] ||
          ""
        );
        setResponsibilities(
          sections["Key Responsibilities"] ||
          sections["2. Key Responsibilities"] ||
          ""
        );
        setBenefits(
          sections["Benefits and Perks"] ||
          sections["5. Benefits and Perks"] ||
          ""
        );
        setApplicationProcess(
          sections["Application Process"] ||
          sections["6. Application Process"] ||
          ""
        );
        setOtherDetails(
          sections["Other Relevant Details"] ||
          sections["7. Other Relevant Details"] ||
          ""
        );
      }

      // Create a complete job object for submission
      const generatedJobData = {
        jobTitle: data.title || generatedTitle,
        department: data.department || department,
        location: data.location || location,
        jobType: jobType,
        description: data.jobOverview || generatedDescription,
        requirements: data.requirements || requirements,
        responsibilities: data.responsibilities || responsibilities,
        benefits: data.benefits || benefits,
        applicationProcess: data.applicationProcess || applicationProcess,
        otherDetails: data.otherDetails || otherDetails,
        requiredSkills: generatedSkills.split(",").map((skill) => skill.trim()),
        experienceLevel: experienceLevel,
        companyId: companyId,
        openings: openings,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        deadline: deadline || null,
        workType: workType,
        jobStatus: "draft",
        applicationStages: data.applicationStages || [
          {
            name: "Applied",
            order: 1,
            description: "Initial application received",
            requirements: [],
            duration: 1,
          },
          {
            name: "Screening",
            order: 2,
            description: "Resume screening",
            requirements: [],
            duration: 3,
          },
          {
            name: "Interview",
            order: 3,
            description: "Technical interview",
            requirements: [],
            duration: 7,
          },
          {
            name: "Offer",
            order: 4,
            description: "Job offer",
            requirements: [],
            duration: 3,
          },
        ],
        postedDate:
          status.toLowerCase() === "draft"
            ? null
            : new Date().toISOString().split("T")[0],
      };

      setGeneratedJob(generatedJobData);
      setGenerationComplete(true);
      toast({
        title: "Success",
        description: "Job description generated successfully",
      });
    } catch (error) {
      console.log("Error generating job description:", error);
      setGenerationError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to generate job description",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedJob) return;

    // Validate required fields
    if (!generatedTitle || !generatedTitle.trim()) {
      toast({
        title: "Error",
        description: "Job title is required.",
        variant: "destructive",
      });
      return;
    }
    if (!department || !department.trim()) {
      toast({
        title: "Error",
        description: "Department is required.",
        variant: "destructive",
      });
      return;
    }
    if (!location || !location.trim()) {
      toast({
        title: "Error",
        description: "Location is required.",
        variant: "destructive",
      });
      return;
    }
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addJob({
        jobTitle: generatedTitle,
        jobType: jobType,
        companyId: companyId,
        department: department,
        location: location,
        openings: openings,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        experienceLevel: experienceLevel,
        description: generatedDescription,
        requirements: requirements,
        responsibilities: responsibilities,
        benefits: benefits,
        jobStatus: status.toLowerCase() === "draft" ? "draft" : "active",
        applicants: 0,
        postedDate:
          status.toLowerCase() === "draft"
            ? null
            : new Date().toISOString().split("T")[0],
        deadline: deadline || null,
        workType: workType,
        requiredSkills: generatedSkills.split(",").map((skill) => skill.trim()),
        applicationStages: generatedJob?.applicationStages || [
          {
            name: "Applied",
            order: 1,
            description: "Initial application received",
            requirements: [],
            duration: 1,
          },
          {
            name: "Screening",
            order: 2,
            description: "Resume screening",
            requirements: [],
            duration: 3,
          },
          {
            name: "Interview",
            order: 3,
            description: "Technical interview",
            requirements: [],
            duration: 7,
          },
          {
            name: "Offer",
            order: 4,
            description: "Job offer",
            requirements: [],
            duration: 3,
          },
        ],
      });

      toast({
        title: "Success",
        description: "Job created successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobPrompt("");
    setJobType("Full-time");
    setCompanyId(undefined);
    setLocation("");
    setOpenings(1);
    setSalaryMin("");
    setSalaryMax("");
    setExperienceMin("");
    setExperienceMax("");
    setRequiredSkills("");
    setRequirements("");
    setDeadline("");
    setWorkType("Remote");
    setStatus("New");
    setAdditionalDetails("");
    setGeneratedTitle("");
    setGeneratedDescription("");
    setGeneratedSkills("");
    setGenerationComplete(false);
    setErrors({});
    setGenerationError(null);
    setGeneratedJob(null);
    setDepartment("");
    setExperienceLevel("");
    setResponsibilities("");
    setBenefits("");
    setApplicationProcess("");
    setOtherDetails("");
  };

  const selectedCompany =
    companyId !== undefined
      ? companies.find((company) => company.id === companyId)
      : null;

  // Mock AI generation function
  const generateJobDetails = (
    prompt,
    type,
    expMin,
    expMax,
    skills,
    additionalInfo
  ) => {
    // Extract potential job title from prompt
    const promptLower = prompt.toLowerCase();
    let title = "";
    let department = "";
    let experienceLevel = "Mid-Level";

    // Determine job title and department based on prompt keywords
    if (
      promptLower.includes("developer") ||
      promptLower.includes("engineer") ||
      promptLower.includes("programming")
    ) {
      title = promptLower.includes("senior")
        ? "Senior Software Engineer"
        : "Software Engineer";
      department = "Engineering";

      if (
        promptLower.includes("frontend") ||
        promptLower.includes("front-end") ||
        promptLower.includes("react")
      ) {
        title = promptLower.includes("senior")
          ? "Senior Frontend Developer"
          : "Frontend Developer";
      } else if (
        promptLower.includes("backend") ||
        promptLower.includes("back-end") ||
        promptLower.includes("node")
      ) {
        title = promptLower.includes("senior")
          ? "Senior Backend Developer"
          : "Backend Developer";
      }
    } else if (
      promptLower.includes("designer") ||
      promptLower.includes("design") ||
      promptLower.includes("ui") ||
      promptLower.includes("ux")
    ) {
      title = "UX/UI Designer";
      department = "Design";
    } else if (
      promptLower.includes("product") &&
      (promptLower.includes("manager") || promptLower.includes("management"))
    ) {
      title = "Product Manager";
      department = "Product";
    } else if (promptLower.includes("marketing")) {
      title = "Marketing Specialist";
      department = "Marketing";
    } else if (promptLower.includes("sales")) {
      title = "Sales Representative";
      department = "Sales";
    } else if (
      promptLower.includes("data") ||
      promptLower.includes("analyst")
    ) {
      title = "Data Analyst";
      department = "Data";
    } else if (
      promptLower.includes("customer") ||
      promptLower.includes("support")
    ) {
      title = "Customer Support Specialist";
      department = "Customer Support";
    } else {
      title = "Professional";
      department = "General";
    }

    // Determine experience level based on provided range or prompt keywords
    if (expMin !== undefined && expMax !== undefined) {
      if (expMin >= 5 || expMax >= 7) {
        experienceLevel = "Senior";
      } else if (expMin <= 1 && expMax <= 3) {
        experienceLevel = "Entry-Level";
      } else {
        experienceLevel = "Mid-Level";
      }
    } else if (
      promptLower.includes("senior") ||
      promptLower.includes("lead") ||
      promptLower.includes("experienced")
    ) {
      experienceLevel = "Senior";
    } else if (
      promptLower.includes("junior") ||
      promptLower.includes("entry") ||
      promptLower.includes("beginner")
    ) {
      experienceLevel = "Entry-Level";
    }

    // Generate skills based on job title, prompt, and provided skills
    let generatedSkills = "";

    // Use provided skills if available
    if (skills && skills.trim()) {
      generatedSkills = skills.trim();
    } else {
      // Otherwise generate based on job title
      if (title.includes("Frontend")) {
        generatedSkills =
          "HTML, CSS, JavaScript, React, TypeScript, Responsive Design";
      } else if (title.includes("Backend")) {
        generatedSkills =
          "Node.js, Express, SQL, NoSQL, API Design, Cloud Services";
      } else if (title.includes("Software Engineer")) {
        generatedSkills =
          "JavaScript, TypeScript, Git, CI/CD, Testing, Problem Solving";
      } else if (title.includes("Designer")) {
        generatedSkills =
          "Figma, Adobe XD, User Research, Wireframing, Prototyping, UI/UX Principles";
      } else if (title.includes("Product Manager")) {
        generatedSkills =
          "Product Strategy, User Stories, Agile Methodologies, Roadmapping, Stakeholder Management";
      } else if (title.includes("Marketing")) {
        generatedSkills =
          "Content Creation, SEO, Social Media, Analytics, Campaign Management";
      } else if (title.includes("Data")) {
        generatedSkills =
          "SQL, Python, Data Visualization, Statistical Analysis, Reporting";
      } else {
        generatedSkills =
          "Communication, Problem Solving, Teamwork, Time Management";
      }

      // Add any skills mentioned in the prompt
      const skillKeywords = [
        "javascript",
        "typescript",
        "react",
        "node",
        "python",
        "java",
        "c#",
        "sql",
        "nosql",
        "aws",
        "azure",
        "figma",
        "adobe",
        "marketing",
        "seo",
        "analytics",
      ];

      skillKeywords.forEach((skill) => {
        if (
          promptLower.includes(skill) &&
          !generatedSkills.toLowerCase().includes(skill)
        ) {
          generatedSkills += `, ${skill.charAt(0).toUpperCase() + skill.slice(1)
            }`;
        }
      });
    }

    // Generate experience requirement text based on provided range
    let experienceText = "";
    if (expMin !== undefined && expMax !== undefined) {
      if (expMin === expMax) {
        experienceText = `${expMin} years of experience`;
      } else {
        experienceText = `${expMin}-${expMax} years of experience`;
      }
    } else {
      experienceText =
        experienceLevel === "Entry-Level"
          ? "0-2"
          : experienceLevel === "Senior"
            ? "5+"
            : "2-5";
      experienceText += " years of experience";
    }

    // Generate description
    let description = `
We are looking for a ${title} to join our team${type !== "Full-time" ? ` on a ${type.toLowerCase()} basis` : ""
      }.

The ideal candidate will ${getResponsibilitiesForRole(title)}.

Requirements:
- ${experienceLevel === "Entry-Level"
        ? "Basic"
        : experienceLevel === "Senior"
          ? "Advanced"
          : "Solid"
      } knowledge of ${generatedSkills.split(", ").slice(0, 3).join(", ")}
- ${experienceText} in ${department.toLowerCase()}
- Strong problem-solving abilities and attention to detail
- Excellent communication and teamwork skills
${getAdditionalRequirements(title)}
`;

    // Add additional details if provided
    if (additionalInfo && additionalInfo.trim()) {
      description += `\nAdditional Information:\n${additionalInfo.trim()}\n`;
    }

    description += `
What we offer:
- Competitive salary and benefits
- Professional development opportunities
- Collaborative and innovative work environment
- ${type === "Remote"
        ? "Fully remote work arrangement"
        : "Flexible working arrangements"
      }

Join our team and help us ${getMissionForDepartment(department)}!
`.trim();

    return {
      title,
      department,
      description,
      skills: generatedSkills,
      experienceLevel,
    };
  };

  // Helper functions for generating job descriptions
  const getResponsibilitiesForRole = (role) => {
    if (role.includes("Developer") || role.includes("Engineer")) {
      return "be responsible for designing, developing, and maintaining software applications, collaborating with cross-functional teams, and implementing best practices";
    } else if (role.includes("Designer")) {
      return "create user-centered designs, develop wireframes and prototypes, and collaborate with developers to implement visual elements";
    } else if (role.includes("Product Manager")) {
      return "define product strategy, gather and prioritize requirements, and work with engineering teams to deliver features that address customer needs";
    } else if (role.includes("Marketing")) {
      return "develop marketing strategies, create content, analyze campaign performance, and identify opportunities for brand growth";
    } else if (role.includes("Data")) {
      return "analyze complex data sets, create reports and visualizations, and provide insights to support business decisions";
    } else if (role.includes("Customer Support")) {
      return "provide exceptional customer service, resolve customer inquiries and issues, and identify opportunities to improve customer satisfaction";
    } else {
      return "contribute to team objectives, take ownership of assigned tasks, and continuously improve processes";
    }
  };

  const getAdditionalRequirements = (role) => {
    if (role.includes("Developer") || role.includes("Engineer")) {
      return "- Experience with version control systems (e.g., Git)\n- Familiarity with agile development methodologies";
    } else if (role.includes("Designer")) {
      return "- Portfolio demonstrating UI/UX design skills\n- Experience with user research and usability testing";
    } else if (role.includes("Product Manager")) {
      return "- Experience with product lifecycle management\n- Ability to translate business requirements into product features";
    } else if (role.includes("Marketing")) {
      return "- Experience with digital marketing platforms\n- Data-driven approach to marketing strategy";
    } else if (role.includes("Data")) {
      return "- Experience with data visualization tools\n- Understanding of statistical analysis methods";
    } else {
      return "- Ability to work independently and as part of a team\n- Strong organizational skills";
    }
  };

  const getMissionForDepartment = (department) => {
    switch (department) {
      case "Engineering":
        return "build innovative solutions that solve real-world problems";
      case "Design":
        return "create beautiful and intuitive user experiences";
      case "Product":
        return "develop products that delight our customers";
      case "Marketing":
        return "grow our brand and reach new audiences";
      case "Sales":
        return "drive business growth and build strong customer relationships";
      case "Data":
        return "unlock insights that drive strategic decisions";
      case "Customer Support":
        return "provide exceptional service that exceeds customer expectations";
      default:
        return "achieve our mission and make a positive impact";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <DialogTitle className="text-2xl font-bold">AI Job Creator</DialogTitle>
          </div>
          <DialogDescription>
            Use AI to generate comprehensive job descriptions and requirements automatically.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Form Fields
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Prompt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-6 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Form-Based Generation:</p>
                  <p>Fill in the basic job details and let AI generate a comprehensive job description.</p>
                </div>
              </div>
            </div>
            {!generationComplete ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="font-medium">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Popover
                    open={openCompanySelect}
                    onOpenChange={setOpenCompanySelect}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCompanySelect}
                        className={cn(
                          "w-full justify-between",
                          !selectedCompany && "text-muted-foreground",
                          errors.companyId && "border-red-500"
                        )}
                      >
                        {selectedCompany
                          ? selectedCompany.name
                          : "Select company..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search company..." />
                        <CommandList>
                          <CommandEmpty>No company found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => handleCompanySelect(company.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCompany?.id === company.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {company.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.companyId && (
                    <p className="text-sm text-red-500">{errors.companyId}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType" className="font-medium">
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger
                        id="jobType"
                        className={cn(errors.jobType && "border-red-500")}
                      >
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.jobType && (
                      <p className="text-sm text-red-500">{errors.jobType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="font-medium">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Data">Data</SelectItem>
                        <SelectItem value="Customer Support">
                          Customer Support
                        </SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-medium">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote, New York, NY, etc."
                      className={cn(errors.location && "border-red-500")}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType" className="font-medium">
                      Work Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={workType} onValueChange={setWorkType}>
                      <SelectTrigger
                        id="workType"
                        className={cn(errors.workType && "border-red-500")}
                      >
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.workType && (
                      <p className="text-sm text-red-500">{errors.workType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel" className="font-medium">
                      Experience Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={experienceLevel}
                      onValueChange={setExperienceLevel}
                    >
                      <SelectTrigger id="experienceLevel">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openings" className="font-medium">
                      Number of Openings <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="openings"
                      type="number"
                      min="1"
                      value={openings}
                      onChange={(e) =>
                        setOpenings(Number.parseInt(e.target.value) || 1)
                      }
                      placeholder="e.g. 1"
                      className={cn(errors.openings && "border-red-500")}
                    />
                    {errors.openings && (
                      <p className="text-sm text-red-500">{errors.openings}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin" className="font-medium">
                      Minimum Salary
                    </Label>
                    <Input
                      id="salaryMin"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="e.g. $50,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax" className="font-medium">
                      Maximum Salary
                    </Label>
                    <Input
                      id="salaryMax"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="e.g. $80,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills" className="font-medium">
                    Required Skills <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="requiredSkills"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="Enter required skills (comma-separated)"
                    className={cn(
                      "min-h-[80px]",
                      errors.requiredSkills && "border-red-500"
                    )}
                  />
                  {errors.requiredSkills && (
                    <p className="text-sm text-red-500">
                      {errors.requiredSkills}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="font-medium">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={cn(errors.deadline && "border-red-500")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline}</p>
                  )}
                </div>

                {generationError && (
                  <Alert variant="destructive">
                    <AlertDescription>{generationError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full md:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Job Description
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Review and edit the AI-generated job description below
                    before posting.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="generatedTitle" className="font-medium">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="generatedTitle"
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedDepartment" className="font-medium">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="generatedDepartment">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Customer Support">
                        Customer Support
                      </SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedSkills" className="font-medium">
                    Required Skills <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="generatedSkills"
                    value={generatedSkills}
                    onChange={(e) => setGeneratedSkills(e.target.value)}
                    className={cn(
                      "min-h-[80px]",
                      errors.skills && "border-red-500"
                    )}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="generatedExperienceLevel"
                    className="font-medium"
                  >
                    Experience Level
                  </Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger id="generatedExperienceLevel">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedDescription" className="font-medium">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="generatedDescription"
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    className={cn(
                      "min-h-[200px]",
                      errors.description && "border-red-500"
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="font-medium">
                    Requirements <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className={cn(
                      "min-h-[80px]",
                      errors.requirements && "border-red-500"
                    )}
                  />
                  {errors.requirements && (
                    <p className="text-sm text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities" className="font-medium">
                    Responsibilities
                  </Label>
                  <Textarea
                    id="responsibilities"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    className={cn("min-h-[80px]")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits" className="font-medium">
                    Benefits
                  </Label>
                  <Textarea
                    id="benefits"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className={cn("min-h-[80px]")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="font-medium">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={cn(errors.deadline && "border-red-500")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedLocation" className="font-medium">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="generatedLocation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={cn(errors.location && "border-red-500")}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workType" className="font-medium">
                    Work Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger
                      id="workType"
                      className={cn(errors.workType && "border-red-500")}
                    >
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workType && (
                    <p className="text-sm text-red-500">{errors.workType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                      id="status"
                      className={cn(errors.status && "border-red-500")}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                </div>

                {Array.isArray(generatedJob?.applicationStages) &&
                  generatedJob.applicationStages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-medium">Application Stages</Label>
                      <div className="space-y-1">
                        {generatedJob.applicationStages.map((stage, idx) => (
                          <div
                            key={idx}
                            className="border rounded p-2 bg-muted"
                          >
                            <div>
                              <b>Stage {stage.order}:</b> {stage.name}
                            </div>
                            {stage.description && (
                              <div className="text-sm text-muted-foreground">
                                {stage.description}
                              </div>
                            )}
                            {stage.duration && (
                              <div className="text-xs text-muted-foreground">
                                Duration: {stage.duration} days
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setGenerationComplete(false)}
                  >
                    Back to Requirements
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button
                      onClick={(e) => handleSubmit(e)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompt" className="space-y-6 mt-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">AI Prompt Generation:</p>
                  <p>Describe the job in your own words and let AI create a complete job posting.</p>
                </div>
              </div>
            </div>
            {!generationComplete ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="font-medium">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Popover
                    open={openCompanySelect}
                    onOpenChange={setOpenCompanySelect}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCompanySelect}
                        className={cn(
                          "w-full justify-between",
                          !selectedCompany && "text-muted-foreground",
                          errors.companyId && "border-red-500"
                        )}
                      >
                        {selectedCompany
                          ? selectedCompany.name
                          : "Select company..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search company..." />
                        <CommandList>
                          <CommandEmpty>No company found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => handleCompanySelect(company.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCompany?.id === company.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {company.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.companyId && (
                    <p className="text-sm text-red-500">{errors.companyId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobPrompt" className="font-medium">
                    Job Prompt <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="jobPrompt"
                    value={jobPrompt}
                    onChange={(e) => setJobPrompt(e.target.value)}
                    placeholder={`Example format:
Looking for a [Job Title] for [Company Name]

Key Requirements:
- [Years] years of experience in [specific skills/technologies]
- [Specific qualifications or certifications]
- [Key responsibilities or role expectations]

Additional Details:
- [Work arrangement: Remote/Onsite/Hybrid]
- [Salary range if applicable]
- [Any specific industry experience needed]
- [Company culture or team details]
- [Growth opportunities or benefits]

Please provide as much detail as possible to generate a comprehensive job description.`}
                    className={cn(
                      "min-h-[300px] font-mono text-sm",
                      errors.jobPrompt && "border-red-500"
                    )}
                  />
                  {errors.jobPrompt && (
                    <p className="text-sm text-red-500">{errors.jobPrompt}</p>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    <p className="font-medium mb-2">
                      Tips for a better job description:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Be specific about required skills and experience</li>
                      <li>Include key responsibilities and expectations</li>
                      <li>Mention work arrangement and location preferences</li>
                      <li>Specify any industry-specific requirements</li>
                      <li>
                        Include information about company culture and benefits
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {generationError && (
                  <Alert variant="destructive">
                    <AlertDescription>{generationError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobPrompt.trim() || !companyId}
                    className="w-full md:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Job Description
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Review and edit the AI-generated job description below
                    before posting.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="generatedTitle" className="font-medium">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="generatedTitle"
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedDepartment" className="font-medium">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="generatedDepartment">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Customer Support">
                        Customer Support
                      </SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedSkills" className="font-medium">
                    Required Skills <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="generatedSkills"
                    value={generatedSkills}
                    onChange={(e) => setGeneratedSkills(e.target.value)}
                    className={cn(
                      "min-h-[80px]",
                      errors.skills && "border-red-500"
                    )}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="generatedExperienceLevel"
                    className="font-medium"
                  >
                    Experience Level
                  </Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger id="generatedExperienceLevel">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedDescription" className="font-medium">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="generatedDescription"
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    className={cn(
                      "min-h-[200px]",
                      errors.description && "border-red-500"
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="font-medium">
                    Requirements <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className={cn(
                      "min-h-[80px]",
                      errors.requirements && "border-red-500"
                    )}
                  />
                  {errors.requirements && (
                    <p className="text-sm text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities" className="font-medium">
                    Responsibilities
                  </Label>
                  <Textarea
                    id="responsibilities"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    className={cn("min-h-[80px]")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits" className="font-medium">
                    Benefits
                  </Label>
                  <Textarea
                    id="benefits"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className={cn("min-h-[80px]")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="font-medium">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={cn(errors.deadline && "border-red-500")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generatedLocation" className="font-medium">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="generatedLocation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={cn(errors.location && "border-red-500")}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workType" className="font-medium">
                    Work Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger
                      id="workType"
                      className={cn(errors.workType && "border-red-500")}
                    >
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workType && (
                    <p className="text-sm text-red-500">{errors.workType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                      id="status"
                      className={cn(errors.status && "border-red-500")}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                </div>

                {Array.isArray(generatedJob?.applicationStages) &&
                  generatedJob.applicationStages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-medium">Application Stages</Label>
                      <div className="space-y-1">
                        {generatedJob.applicationStages.map((stage, idx) => (
                          <div
                            key={idx}
                            className="border rounded p-2 bg-muted"
                          >
                            <div>
                              <b>Stage {stage.order}:</b> {stage.name}
                            </div>
                            {stage.description && (
                              <div className="text-sm text-muted-foreground">
                                {stage.description}
                              </div>
                            )}
                            {stage.duration && (
                              <div className="text-xs text-muted-foreground">
                                Duration: {stage.duration} days
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setGenerationComplete(false)}
                  >
                    Back to Requirements
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button
                      onClick={(e) => handleSubmit(e)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Generated Content Section */}
        {generationComplete && (
          <div className="space-y-6 mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">AI Generation Complete!</p>
                  <p>Review and customize the generated content before creating the job.</p>
                </div>
              </div>
            </div>
            {/* ... existing generated content ... */}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!generationComplete ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !companyId}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Job
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
