"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  User,
  Target,
} from "lucide-react";

export function ViewCandidateProfileDialog({ isOpen, onClose, candidate }) {
  // Add logging to see incoming candidate data
  console.log("ViewCandidateProfileDialog received candidate:", {
    id: candidate?.id,
    name: candidate?.name,
    hasWorkHistory: !!candidate?.workHistory,
    workHistoryLength: candidate?.workHistory?.length,
    workHistoryType: candidate?.workHistory
      ? typeof candidate.workHistory
      : "none",
  });

  if (!candidate) {
    console.log("ViewCandidateProfileDialog: No candidate provided");
    return null;
  }

  // Format the experience level for display
  const formatExperience = (level) => {
    switch (level) {
      case "junior":
        return "Junior (0-2 years)";
      case "mid":
        return "Mid-level (3-5 years)";
      case "senior":
        return "Senior (6+ years)";
      default:
        return level;
    }
  };

  // Format the education level for display
  const formatEducation = (level) => {
    switch (level) {
      case "none":
        return "No formal degree";
      case "associate":
        return "Associate's degree";
      case "bachelor":
        return "Bachelor's degree";
      case "master":
        return "Master's degree";
      case "phd":
        return "PhD";
      default:
        return level;
    }
  };

  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 75) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Candidate Profile</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Detailed information about {candidate.name}'s profile, skills, and
            application status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                  {candidate.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
                <p className="text-gray-600 text-lg mb-3">{candidate.position || "No title specified"}</p>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-sm font-semibold ${getMatchBadgeColor(candidate.matchPercentage)}`}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {Math.min(candidate.matchPercentage, 100)}% Match
                  </Badge>
                  {candidate.status && (
                    <Badge
                      variant="outline"
                      className={candidate.status === "applicant"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {candidate.status === "applicant" ? "Applicant" : "Candidate"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200">
              <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Skills
              </TabsTrigger>
              <TabsTrigger value="experience" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Education
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{candidate.email || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{candidate.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                      <p className="text-gray-900">{candidate.location || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Available From</Label>
                      <p className="text-gray-900">{candidate.availableFrom || "Immediately"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Bio
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {candidate.bio || "No bio provided"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6 mt-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(candidate.skills) && candidate.skills.length > 0) ? (
                    candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))
                  ) : (Array.isArray(candidate.Skills) && candidate.Skills.length > 0) ? (
                    candidate.Skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill.title}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills listed</p>
                  )}
                </div>
              </div>

              {candidate.matchDetails && (
                <>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      Relevant Skills for Position
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchDetails.relevantSkills && candidate.matchDetails.relevantSkills.length > 0 ? (
                        candidate.matchDetails.relevantSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          No relevant skills found
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-600" />
                      Missing Skills for Position
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchDetails.missingSkills && candidate.matchDetails.missingSkills.length > 0 ? (
                        candidate.matchDetails.missingSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-green-600 font-medium">
                          No missing skills!
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="experience" className="space-y-6 mt-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  Work History
                </h4>
                <div className="space-y-4">
                  {Array.isArray(candidate.CandidateExperiences) && candidate.CandidateExperiences.length > 0 ? (
                    candidate.CandidateExperiences.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-6 pb-4 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{exp.title || "Untitled Position"}</h4>
                            <p className="text-blue-600 font-medium">{exp.company || "Company not specified"}</p>
                            {exp.location && (
                              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {exp.location}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            {exp.startDate && exp.endDate
                              ? `${exp.startDate} - ${exp.endDate}`
                              : exp.startDate
                                ? `${exp.startDate} - Present`
                                : "Dates not specified"}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="mt-3 text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No work history available</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-6 mt-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Education
                </h4>

                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Education Level</Label>
                    <p className="text-gray-900 font-medium">
                      {candidate.matchDetails
                        ? formatEducation(candidate.matchDetails.educationLevel)
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {Array.isArray(candidate.CandidateEducations) && candidate.CandidateEducations.length > 0 ? (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Education History</h5>
                    {candidate.CandidateEducations.map((edu, index) => (
                      <div key={index} className="border-l-4 border-purple-200 pl-6 pb-4 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-purple-600 font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block mt-2">
                          {edu.startDate && edu.endDate && edu.endDate.trim() !== ''
                            ? `${new Date(edu.startDate).toLocaleDateString()} - ${new Date(edu.endDate).toLocaleDateString()}`
                            : edu.startDate
                              ? `Started ${new Date(edu.startDate).toLocaleDateString()}`
                              : "Dates not specified"}
                        </p>
                        {edu.description && (
                          <p className="text-gray-700 mt-3 leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No education history available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onClose(false); // Close the profile dialog
              // This would typically open the contact dialog
              // For now, we'll just close this dialog and the parent component will handle opening the contact dialog
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Contact Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}