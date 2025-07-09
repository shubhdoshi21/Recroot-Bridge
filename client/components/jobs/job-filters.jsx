"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useJobs } from "@/contexts/jobs-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function JobFilters({ onCollapsedChange }) {
  const {
    filters,
    updateFilters,
    resetFilters,
    availableDepartments,
    availableLocations,
    availableTypes,
    availableStatuses,
  } = useJobs();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  // Search states
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");

  // Show more/less states
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  // New item states
  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState("");

  // Dialog open states
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);

  // Initial display limits
  const initialLimit = 5;

  // Deduplicate availableTypes
  const uniqueTypes = (availableTypes || []).reduce((acc, current) => {
    if (!acc.find((item) => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Filter departments based on search
  const filteredDepartments = (availableDepartments || []).filter((dept) =>
    dept?.label?.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter locations based on search
  const filteredLocations = (availableLocations || []).filter((loc) =>
    loc?.label?.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Filter types based on search
  const filteredTypes = uniqueTypes.filter((type) =>
    type?.label?.toLowerCase().includes(typeSearch.toLowerCase())
  );

  // Calculate active filter count
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.departments?.length || 0) +
    (filters.locations?.length || 0) +
    (filters.types?.length || 0);

  // Handle adding new department
  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      const newDeptId = newDepartment.trim().toLowerCase().replace(/\s+/g, "-");
      const newDept = { id: newDeptId, label: newDepartment.trim() };
      setAvailableDepartments((prev) => [...(prev || []), newDept]);
      setNewDepartment("");
      setIsAddDepartmentOpen(false);
      toast({
        title: "Department added",
        description: `${newDepartment} has been added to departments.`,
      });
    }
  };

  // Handle adding new location
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const newLocId = newLocation.trim().toLowerCase().replace(/\s+/g, "-");
      const newLoc = { id: newLocId, label: newLocation.trim() };
      setAvailableLocations((prev) => [...(prev || []), newLoc]);
      setNewLocation("");
      setIsAddLocationOpen(false);
      toast({
        title: "Location added",
        description: `${newLocation} has been added to locations.`,
      });
    }
  };

  // Handle adding new type
  const handleAddType = () => {
    if (newType.trim()) {
      const newTypeId = newType.trim().toLowerCase().replace(/\s+/g, "-");
      const newTypeObj = { id: newTypeId, label: newType.trim() };
      setAvailableTypes((prev) => [...(prev || []), newTypeObj]);
      setNewType("");
      setIsAddTypeOpen(false);

      // Add the new type to the filters
      updateFilters("types", newTypeId, true);

      toast({
        title: "Job type added",
        description: `${newType} has been added to job types.`,
      });
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

  // Handle collapsing/expanding the filters
  const handleCollapsedChange = (collapsed) => {
    setIsCollapsed(collapsed);
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  };

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
              onClick={() => handleCollapsedChange(false)}
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
        <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Filters</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Refine your job search
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold shadow-sm"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-100/50 transition-colors duration-200"
                  onClick={() => handleCollapsedChange(true)}
                  title="Collapse filters"
                >
                  <ChevronLeft className="h-4 w-4 text-blue-500" />
                  <span className="sr-only">Collapse filters</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Accordion
              type="multiple"
              defaultValue={["status", "department", "location", "type"]}
              className="w-full"
            >
              <AccordionItem value="status" className="border border-gray-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-gray-50/50 transition-colors duration-200">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Status
                    {filters.status !== "all" && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        1
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 bg-gray-50/30">
                  <RadioGroup
                    value={filters.status}
                    onValueChange={(value) => updateFilters("status", value)}
                    className="grid gap-3"
                  >
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
                      <RadioGroupItem value="all" id="all-jobs" className="text-blue-600" />
                      <Label htmlFor="all-jobs" className="text-sm font-medium cursor-pointer">
                        All Jobs
                      </Label>
                    </div>
                    {(availableStatuses || []).map((status) => (
                      <div key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
                        <RadioGroupItem value={status} id={status} className="text-blue-600" />
                        <Label htmlFor={status} className="text-sm font-medium capitalize cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="department" className="border border-gray-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-gray-50/50 transition-colors duration-200">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Department
                    {filters.departments?.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {filters.departments.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 bg-gray-50/30">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search departments..."
                          className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          value={departmentSearch}
                          onChange={(e) => setDepartmentSearch(e.target.value)}
                        />
                      </div>
                      <Dialog
                        open={isAddDepartmentOpen}
                        onOpenChange={setIsAddDepartmentOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add department</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                          <DialogHeader>
                            <DialogTitle>Add New Department</DialogTitle>
                            <DialogDescription>
                              Enter a new department to add to the filter options.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Enter department name"
                              value={newDepartment}
                              onChange={(e) => setNewDepartment(e.target.value)}
                              className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddDepartmentOpen(false)}
                              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddDepartment();
                              }}
                              disabled={!newDepartment.trim()}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                              Add Department
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea
                      className={cn(
                        "pr-4",
                        filteredDepartments.length > initialLimit
                          ? "h-[200px]"
                          : "h-auto"
                      )}
                    >
                      <div className="grid gap-2">
                        {filteredDepartments
                          .slice(0, showAllDepartments ? undefined : initialLimit)
                          .map((dept, idx) => (
                            <div
                              key={`${dept.id}-${idx}`}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
                            >
                              <Checkbox
                                id={dept.id}
                                checked={filters.departments.includes(dept.id)}
                                onCheckedChange={(checked) =>
                                  updateFilters("departments", dept.id, checked)
                                }
                                className="text-green-600"
                              />
                              <Label htmlFor={dept.id} className="text-sm font-medium cursor-pointer">
                                {dept.label}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>

                    {filteredDepartments.length > initialLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-green-600 hover:bg-green-50 transition-colors duration-200"
                        onClick={() => setShowAllDepartments(!showAllDepartments)}
                      >
                        {showAllDepartments ? (
                          <>
                            <ChevronUp className="mr-1 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1 h-4 w-4" />
                            Show All ({filteredDepartments.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="location" className="border border-gray-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-gray-50/50 transition-colors duration-200">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    Location
                    {filters.locations?.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                        {filters.locations.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 bg-gray-50/30">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search locations..."
                          className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                      </div>
                      <Dialog
                        open={isAddLocationOpen}
                        onOpenChange={setIsAddLocationOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 bg-white/80 backdrop-blur-sm border-yellow-200 hover:bg-yellow-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add location</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/95 backdrop-blur-sm border-yellow-200">
                          <DialogHeader>
                            <DialogTitle>Add New Location</DialogTitle>
                            <DialogDescription>
                              Enter a new location to add to the filter options.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Enter location name"
                              value={newLocation}
                              onChange={(e) => setNewLocation(e.target.value)}
                              className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddLocationOpen(false)}
                              className="bg-white/80 backdrop-blur-sm border-yellow-200 hover:bg-yellow-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddLocation();
                              }}
                              disabled={!newLocation.trim()}
                              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white"
                            >
                              Add Location
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea
                      className={cn(
                        "pr-4",
                        filteredLocations.length > initialLimit
                          ? "h-[200px]"
                          : "h-auto"
                      )}
                    >
                      <div className="grid gap-2">
                        {filteredLocations
                          .slice(0, showAllLocations ? undefined : initialLimit)
                          .map((loc, idx) => (
                            <div
                              key={`${loc.id}-${idx}`}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
                            >
                              <Checkbox
                                id={loc.id}
                                checked={filters.locations.includes(loc.id)}
                                onCheckedChange={(checked) =>
                                  updateFilters("locations", loc.id, checked)
                                }
                                className="text-yellow-600"
                              />
                              <Label htmlFor={loc.id} className="text-sm font-medium cursor-pointer">
                                {loc.label}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>

                    {filteredLocations.length > initialLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-yellow-600 hover:bg-yellow-50 transition-colors duration-200"
                        onClick={() => setShowAllLocations(!showAllLocations)}
                      >
                        {showAllLocations ? (
                          <>
                            <ChevronUp className="mr-1 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1 h-4 w-4" />
                            Show All ({filteredLocations.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="type" className="border border-gray-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-gray-50/50 transition-colors duration-200">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Job Type
                    {filters.types?.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                        {filters.types.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 bg-gray-50/30">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search job types..."
                          className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-400 focus:ring-red-400"
                          value={typeSearch}
                          onChange={(e) => setTypeSearch(e.target.value)}
                        />
                      </div>
                      <Dialog
                        open={isAddTypeOpen}
                        onOpenChange={setIsAddTypeOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add job type</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/95 backdrop-blur-sm border-red-200">
                          <DialogHeader>
                            <DialogTitle>Add New Job Type</DialogTitle>
                            <DialogDescription>
                              Enter a new job type to add to the filter options.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Enter job type"
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                              className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-400 focus:ring-red-400"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddTypeOpen(false)}
                              className="bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddType();
                              }}
                              disabled={!newType.trim()}
                              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                            >
                              Add Job Type
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea
                      className={cn(
                        "pr-4",
                        filteredTypes.length > initialLimit
                          ? "h-[200px]"
                          : "h-auto"
                      )}
                    >
                      <div className="grid gap-2">
                        {filteredTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
                            <Checkbox
                              id={type.id}
                              checked={filters.types.includes(type.id)}
                              onCheckedChange={(checked) => {
                                updateFilters("types", type.id, checked);
                              }}
                              className="text-red-600"
                            />
                            <Label htmlFor={type.id} className="text-sm font-medium cursor-pointer">{type.label}</Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredTypes.length > initialLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-red-600 hover:bg-red-50 transition-colors duration-200"
                        onClick={() => setShowAllTypes(!showAllTypes)}
                      >
                        {showAllTypes ? (
                          <>
                            <ChevronUp className="mr-1 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1 h-4 w-4" />
                            Show All ({filteredTypes.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <Button
              variant="outline"
              className="w-full h-10 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 transition-all duration-200"
              onClick={handleResetFilters}
              disabled={activeFilterCount === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
