"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  X,
  Users,
  Briefcase,
  Star,
  Clock,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { useCandidates } from "@/contexts/candidates-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export function CandidateFilters() {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [positionSearch, setPositionSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [showAllPositions, setShowAllPositions] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const {
    filters,
    setStatus,
    togglePosition,
    toggleSkill,
    toggleExperience,
    resetFilters,
    activeFilterCount,
    availablePositions,
    availableSkills,
    availableStatuses,
    addPosition,
    addSkill,
  } = useCandidates();

  // Handle reset filters with toast notification
  const handleResetFilters = () => {
    resetFilters();

    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Handle snake_case to title case
    if (status.includes("_")) {
      return status
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }

    // Handle camelCase or lowercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Filter positions based on search
  const filteredPositions = availablePositions.filter((position) =>
    position.toLowerCase().includes(positionSearch.toLowerCase())
  );

  // Filter skills based on search
  const filteredSkills = availableSkills.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Handle adding a new position
  const handleAddPosition = () => {
    const positionToAdd = newPosition.trim() || positionSearch.trim();
    if (positionToAdd) {
      addPosition(positionToAdd);
      setNewPosition("");
      setPositionSearch("");
      setIsAddPositionOpen(false);

      toast({
        title: "Position added",
        description: `"${positionToAdd}" has been added to available positions.`,
      });
    }
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    const skillToAdd = newSkill.trim() || skillSearch.trim();
    if (skillToAdd) {
      addSkill(skillToAdd);
      setNewSkill("");
      setSkillSearch("");
      setIsAddSkillOpen(false);

      toast({
        title: "Skill added",
        description: `"${skillToAdd}" has been added to available skills.`,
      });
    }
  };

  // Handle position search key press
  const handlePositionKeyPress = (e) => {
    if (e.key === "Enter" && positionSearch.trim()) {
      e.preventDefault();
      handleAddPosition();
    }
  };

  // Handle skill search key press
  const handleSkillKeyPress = (e) => {
    if (e.key === "Enter" && skillSearch.trim()) {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Determine how many items to show initially
  const initialItemsToShow = 5;
  const displayedPositions = showAllPositions
    ? filteredPositions
    : filteredPositions.slice(0, initialItemsToShow);
  const displayedSkills = showAllSkills
    ? filteredSkills
    : filteredSkills.slice(0, initialItemsToShow);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out flex-shrink-0",
        isCollapsed ? "w-[80px]" : "w-full max-w-md"
      )}
    >
      {isCollapsed ? (
        // Collapsed view
        <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="p-4 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-auto py-4 flex flex-col items-center gap-3 hover:bg-blue-100/50 transition-all duration-200 rounded-xl group"
              onClick={() => setIsCollapsed(false)}
              title="Expand filters"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full shadow-md group-hover:shadow-lg transition-all duration-200">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Filters</span>
              <ChevronRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Button>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow-sm"
              >
                {activeFilterCount}
              </Badge>
            )}
          </CardHeader>
        </Card>
      ) : (
        // Expanded view
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 flex flex-row items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Filters</CardTitle>
                <p className="text-xs text-gray-600 mt-1">Refine your candidate search</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
                  {activeFilterCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                onClick={() => setIsCollapsed(true)}
                title="Collapse filters"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Collapse filters</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Status Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-700">Status</h3>
              </div>
              <RadioGroup
                value={filters.status}
                onValueChange={(value) => setStatus(value)}
                className="grid gap-3"
              >
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                  <RadioGroupItem value="all" id="status-all" className="text-blue-600" />
                  <Label htmlFor="status-all" className="text-sm font-medium cursor-pointer">
                    All Candidates
                  </Label>
                </div>
                {availableStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <RadioGroupItem value={status} id={`status-${status}`} className="text-blue-600" />
                    <Label htmlFor={`status-${status}`} className="text-sm font-medium cursor-pointer">
                      {formatStatus(status)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["positions", "skills", "experience"]}
              className="w-full space-y-2"
            >
              {/* Positions Filter */}
              <AccordionItem value="positions" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Position Types
                    {filters.positions.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {filters.positions.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search position types..."
                          value={positionSearch}
                          onChange={(e) => setPositionSearch(e.target.value)}
                          onKeyPress={handlePositionKeyPress}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={handleAddPosition}
                        disabled={!positionSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add position</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedPositions.map((position) => (
                          <div
                            key={position}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`pos-${position}`}
                              checked={filters.positions.includes(position)}
                              onCheckedChange={() => togglePosition(position)}
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor={`pos-${position}`}
                              className="text-sm font-medium capitalize cursor-pointer flex-1"
                            >
                              {position}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredPositions.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setShowAllPositions(!showAllPositions)}
                      >
                        {showAllPositions
                          ? "Show Less"
                          : `Show All (${filteredPositions.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Skills Filter */}
              <AccordionItem value="skills" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-green-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500" />
                    Skills
                    {filters.skills.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {filters.skills.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search skills..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          onKeyPress={handleSkillKeyPress}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={handleAddSkill}
                        disabled={!skillSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add skill</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedSkills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={filters.skills.includes(skill)}
                              onCheckedChange={() => toggleSkill(skill)}
                              className="text-green-600"
                            />
                            <Label
                              htmlFor={`skill-${skill}`}
                              className="text-sm font-medium capitalize cursor-pointer flex-1"
                            >
                              {skill}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredSkills.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-green-600 hover:bg-green-50 font-medium"
                        onClick={() => setShowAllSkills(!showAllSkills)}
                      >
                        {showAllSkills
                          ? "Show Less"
                          : `Show All (${filteredSkills.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Experience Filter */}
              <AccordionItem value="experience" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-orange-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Experience
                    {filters.experience.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                        {filters.experience.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                      <Checkbox
                        id="exp-entry"
                        checked={filters.experience.includes("0-2")}
                        onCheckedChange={() => toggleExperience("0-2")}
                        className="text-orange-600"
                      />
                      <Label htmlFor="exp-entry" className="text-sm font-medium cursor-pointer flex-1">
                        Entry Level (0-2 years)
                      </Label>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        Junior
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                      <Checkbox
                        id="exp-mid"
                        checked={filters.experience.includes("2-5")}
                        onCheckedChange={() => toggleExperience("2-5")}
                        className="text-orange-600"
                      />
                      <Label htmlFor="exp-mid" className="text-sm font-medium cursor-pointer flex-1">
                        Mid Level (2-5 years)
                      </Label>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                        Mid
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                      <Checkbox
                        id="exp-senior"
                        checked={filters.experience.includes("5-8")}
                        onCheckedChange={() => toggleExperience("5-8")}
                        className="text-orange-600"
                      />
                      <Label htmlFor="exp-senior" className="text-sm font-medium cursor-pointer flex-1">
                        Senior Level (5-8 years)
                      </Label>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                        Senior
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                      <Checkbox
                        id="exp-lead"
                        checked={filters.experience.includes("8")}
                        onCheckedChange={() => toggleExperience("8")}
                        className="text-orange-600"
                      />
                      <Label htmlFor="exp-lead" className="text-sm font-medium cursor-pointer flex-1">
                        Lead Level (8+ years)
                      </Label>
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                        Lead
                      </Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="px-6 py-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <Button
              variant="outline"
              className="w-full h-11 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 font-medium"
              onClick={handleResetFilters}
              disabled={activeFilterCount === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Reset All Filters
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
