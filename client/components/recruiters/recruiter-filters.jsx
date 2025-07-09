"use client";
import { useState, useEffect } from "react";
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
import { useRecruiters } from "@/contexts/recruiters-context";
import {
  ChevronRight,
  ChevronLeft,
  Filter,
  Plus,
  Search,
  X,
  Users,
  Briefcase,
  Target,
  Award,
  Star,
  Zap,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function RecruiterFilters() {
  const { toast } = useToast();
  const {
    filters,
    updateFilter,
    resetFilters,
    setIsFilterCollapsed,
    availableDepartments,
    availableSpecializations,
    availableStatuses,
    availablePerformance,
  } = useRecruiters();

  const [expandedItems, setExpandedItems] = useState([
    "department",
    "specialization",
    "performance",
  ]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Dynamic departments and specializations from context
  const [departments, setDepartments] = useState(availableDepartments);
  const [specializations, setSpecializations] = useState(
    availableSpecializations
  );

  // Update local state when available values change
  useEffect(() => {
    setDepartments(availableDepartments);
  }, [availableDepartments]);

  useEffect(() => {
    setSpecializations(availableSpecializations);
  }, [availableSpecializations]);

  // Search states
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [specializationSearch, setSpecializationSearch] = useState("");

  // Show more/less states
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showAllSpecializations, setShowAllSpecializations] = useState(false);

  // New item dialog states
  const [newDepartmentDialogOpen, setNewDepartmentDialogOpen] = useState(false);
  const [newSpecializationDialogOpen, setNewSpecializationDialogOpen] =
    useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");

  // Calculate active filter count
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    filters.departments.length +
    filters.specializations.length +
    filters.performance.length;

  // Update the parent context when collapse state changes
  useEffect(() => {
    setIsFilterCollapsed(isCollapsed);
  }, [isCollapsed, setIsFilterCollapsed]);

  // Handle collapse toggle with animation
  const toggleCollapse = (collapsed) => {
    setIsAnimating(true);
    setIsCollapsed(collapsed);

    // Allow time for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match this with the CSS transition duration
  };

  // Handle status change
  const handleStatusChange = (value) => {
    updateFilter("status", value);
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Special case for on_leave
    if (status.toLowerCase() === "on_leave") {
      return "On Leave";
    }

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

  // Handle department checkbox change
  const handleDepartmentChange = (department, checked) => {
    if (checked) {
      updateFilter("departments", [...filters.departments, department]);
    } else {
      updateFilter(
        "departments",
        filters.departments.filter((d) => d !== department)
      );
    }
  };

  // Handle specialization checkbox change
  const handleSpecializationChange = (specialization, checked) => {
    if (checked) {
      updateFilter("specializations", [
        ...filters.specializations,
        specialization,
      ]);
    } else {
      updateFilter(
        "specializations",
        filters.specializations.filter((s) => s !== specialization)
      );
    }
  };

  // Handle performance checkbox change
  const handlePerformanceChange = (performance, checked) => {
    if (checked) {
      updateFilter("performance", [...filters.performance, performance]);
    } else {
      updateFilter(
        "performance",
        filters.performance.filter((p) => p !== performance)
      );
    }
  };

  // Add new department
  const addNewDepartment = () => {
    const departmentToAdd = newDepartment.trim() || departmentSearch.trim();
    if (departmentToAdd && !departments.includes(departmentToAdd)) {
      setDepartments([...departments, departmentToAdd]);
      setNewDepartment("");
      setDepartmentSearch("");
      setNewDepartmentDialogOpen(false);

      toast({
        title: "Department added",
        description: `"${departmentToAdd}" has been added to available departments.`,
      });
    }
  };

  // Add new specialization
  const addNewSpecialization = () => {
    const specializationToAdd =
      newSpecialization.trim() || specializationSearch.trim();
    if (specializationToAdd && !specializations.includes(specializationToAdd)) {
      setSpecializations([...specializations, specializationToAdd]);
      setNewSpecialization("");
      setSpecializationSearch("");
      setNewSpecializationDialogOpen(false);

      toast({
        title: "Specialization added",
        description: `"${specializationToAdd}" has been added to available specializations.`,
      });
    }
  };

  // Handle department search key press
  const handleDepartmentKeyPress = (e) => {
    if (e.key === "Enter" && departmentSearch.trim()) {
      e.preventDefault();
      addNewDepartment();
    }
  };

  // Handle specialization search key press
  const handleSpecializationKeyPress = (e) => {
    if (e.key === "Enter" && specializationSearch.trim()) {
      e.preventDefault();
      addNewSpecialization();
    }
  };

  // Handle reset filters with toast notification
  const handleResetFilters = () => {
    resetFilters();

    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((department) =>
    department.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter specializations based on search
  const filteredSpecializations = specializations.filter((specialization) =>
    specialization.toLowerCase().includes(specializationSearch.toLowerCase())
  );

  // Determine how many items to show initially
  const initialItemsToShow = 5;
  const displayedDepartments = showAllDepartments
    ? filteredDepartments
    : filteredDepartments.slice(0, initialItemsToShow);
  const displayedSpecializations = showAllSpecializations
    ? filteredSpecializations
    : filteredSpecializations.slice(0, initialItemsToShow);

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
              onClick={() => toggleCollapse(false)}
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
                <p className="text-xs text-gray-600 mt-1">Refine your recruiter search</p>
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
                onClick={() => toggleCollapse(true)}
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
                onValueChange={handleStatusChange}
                className="grid gap-3"
              >
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                  <RadioGroupItem value="all" id="status-all" className="text-blue-600" />
                  <Label htmlFor="status-all" className="text-sm font-medium cursor-pointer">
                    All Recruiters
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
              defaultValue={["departments", "specializations", "performance"]}
              className="w-full space-y-2"
            >
              {/* Departments Filter */}
              <AccordionItem value="departments" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Departments
                    {filters.departments.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {filters.departments.length}
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
                          placeholder="Search departments..."
                          value={departmentSearch}
                          onChange={(e) => setDepartmentSearch(e.target.value)}
                          onKeyPress={handleDepartmentKeyPress}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={addNewDepartment}
                        disabled={!departmentSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add department</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedDepartments.map((department) => (
                          <div
                            key={department}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`dept-${department}`}
                              checked={filters.departments.includes(department)}
                              onCheckedChange={(checked) => handleDepartmentChange(department, checked)}
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor={`dept-${department}`}
                              className="text-sm font-medium capitalize cursor-pointer flex-1"
                            >
                              {department}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredDepartments.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setShowAllDepartments(!showAllDepartments)}
                      >
                        {showAllDepartments
                          ? "Show Less"
                          : `Show All (${filteredDepartments.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Specializations Filter */}
              <AccordionItem value="specializations" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-green-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Specializations
                    {filters.specializations.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {filters.specializations.length}
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
                          placeholder="Search specializations..."
                          value={specializationSearch}
                          onChange={(e) => setSpecializationSearch(e.target.value)}
                          onKeyPress={handleSpecializationKeyPress}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={addNewSpecialization}
                        disabled={!specializationSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add specialization</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedSpecializations.map((specialization) => (
                          <div
                            key={specialization}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`spec-${specialization}`}
                              checked={filters.specializations.includes(specialization)}
                              onCheckedChange={(checked) => handleSpecializationChange(specialization, checked)}
                              className="text-green-600"
                            />
                            <Label
                              htmlFor={`spec-${specialization}`}
                              className="text-sm font-medium capitalize cursor-pointer flex-1"
                            >
                              {specialization}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredSpecializations.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-green-600 hover:bg-green-50 font-medium"
                        onClick={() => setShowAllSpecializations(!showAllSpecializations)}
                      >
                        {showAllSpecializations
                          ? "Show Less"
                          : `Show All (${filteredSpecializations.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Performance Filter */}
              <AccordionItem value="performance" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-yellow-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Performance
                    {filters.performance.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                        {filters.performance.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="space-y-4">
                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {availablePerformance.map((performance) => (
                          <div
                            key={performance}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-yellow-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`perf-${performance}`}
                              checked={filters.performance.includes(performance)}
                              onCheckedChange={(checked) => handlePerformanceChange(performance, checked)}
                              className="text-yellow-600"
                            />
                            <Label
                              htmlFor={`perf-${performance}`}
                              className="text-sm font-medium capitalize cursor-pointer flex-1"
                            >
                              {performance}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Add Department Dialog */}
      <Dialog open={newDepartmentDialogOpen} onOpenChange={setNewDepartmentDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Add New Department</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new department to the available options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-department" className="text-sm font-medium text-gray-700">
                Department Name
              </Label>
              <Input
                id="new-department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Enter department name..."
                className="mt-1 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewDepartmentDialogOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={addNewDepartment}
              disabled={!newDepartment.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Specialization Dialog */}
      <Dialog open={newSpecializationDialogOpen} onOpenChange={setNewSpecializationDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Add New Specialization</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new specialization to the available options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-specialization" className="text-sm font-medium text-gray-700">
                Specialization Name
              </Label>
              <Input
                id="new-specialization"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Enter specialization name..."
                className="mt-1 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewSpecializationDialogOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={addNewSpecialization}
              disabled={!newSpecialization.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Add Specialization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
