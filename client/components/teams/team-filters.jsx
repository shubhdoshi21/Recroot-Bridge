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
  Building,
  MapPin,
  Users2,
  Target,
  Award,
} from "lucide-react";
import { useTeams } from "@/contexts/teams-context";
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

export function TeamFilters({ onCollapsedChange }) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sizeSearch, setSizeSearch] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);

  const {
    filters,
    updateFilters,
    resetFilters,
    availableDepartments,
    availableLocations,
    availableStatuses,
    availableSizes,
  } = useTeams();

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

  // Filter departments based on search
  const filteredDepartments = availableDepartments.filter((dept) =>
    dept.label.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter locations based on search
  const filteredLocations = availableLocations.filter((loc) =>
    loc.label.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Filter sizes based on search
  const filteredSizes = availableSizes.filter((size) =>
    size.label.toLowerCase().includes(sizeSearch.toLowerCase())
  );

  // Calculate active filter count
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    filters.departments.length +
    filters.locations.length +
    filters.sizes.length;

  // Handle adding new department
  const handleAddDepartment = () => {
    const deptToAdd = newDepartment.trim() || departmentSearch.trim();
    if (deptToAdd) {
      // Create a kebab-case ID from the department name
      const newDeptId = deptToAdd.toLowerCase().replace(/\s+/g, "-");

      // Add the new department to the list
      // Note: This would need to be implemented in the context
      setNewDepartment("");
      setDepartmentSearch("");
      setIsAddDepartmentOpen(false);

      toast({
        title: "Department added",
        description: `"${deptToAdd}" has been added to available departments.`,
      });
    }
  };

  // Handle adding new location
  const handleAddLocation = () => {
    const locToAdd = newLocation.trim() || locationSearch.trim();
    if (locToAdd) {
      // Create a kebab-case ID from the location name
      const newLocId = locToAdd.toLowerCase().replace(/\s+/g, "-");

      // Add the new location to the list
      // Note: This would need to be implemented in the context
      setNewLocation("");
      setLocationSearch("");
      setIsAddLocationOpen(false);

      toast({
        title: "Location added",
        description: `"${locToAdd}" has been added to available locations.`,
      });
    }
  };

  // Handle department search key press
  const handleDepartmentKeyPress = (e) => {
    if (e.key === "Enter" && departmentSearch.trim()) {
      e.preventDefault();
      handleAddDepartment();
    }
  };

  // Handle location search key press
  const handleLocationKeyPress = (e) => {
    if (e.key === "Enter" && locationSearch.trim()) {
      e.preventDefault();
      handleAddLocation();
    }
  };

  // Handle collapsing/expanding the filters
  const handleCollapsedChange = (collapsed) => {
    setIsCollapsed(collapsed);
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  };

  // Determine how many items to show initially
  const initialItemsToShow = 5;
  const displayedDepartments = showAllDepartments
    ? filteredDepartments
    : filteredDepartments.slice(0, initialItemsToShow);
  const displayedLocations = showAllLocations
    ? filteredLocations
    : filteredLocations.slice(0, initialItemsToShow);
  const displayedSizes = showAllSizes
    ? filteredSizes
    : filteredSizes.slice(0, initialItemsToShow);

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
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 flex flex-row items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Filters</CardTitle>
                <p className="text-xs text-gray-600 mt-1">Refine your team search</p>
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
                onClick={() => handleCollapsedChange(true)}
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
                onValueChange={(value) => updateFilters("status", value)}
                className="grid gap-3"
              >
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                  <RadioGroupItem value="all" id="status-all" className="text-blue-600" />
                  <Label htmlFor="status-all" className="text-sm font-medium cursor-pointer">
                    All Teams
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
              defaultValue={["departments", "locations", "sizes"]}
              className="w-full space-y-2"
            >
              {/* Departments Filter */}
              <AccordionItem value="departments" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
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
                        onClick={handleAddDepartment}
                        disabled={!departmentSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add department</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedDepartments.map((dept) => (
                          <div
                            key={dept.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`dept-${dept.id}`}
                              checked={filters.departments.includes(dept.id)}
                              onCheckedChange={(checked) =>
                                updateFilters("departments", dept.id, checked)
                              }
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor={`dept-${dept.id}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {dept.label}
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

              {/* Locations Filter */}
              <AccordionItem value="locations" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-green-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Locations
                    {filters.locations.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {filters.locations.length}
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
                          placeholder="Search locations..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          onKeyPress={handleLocationKeyPress}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={handleAddLocation}
                        disabled={!locationSearch.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add location</span>
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedLocations.map((loc) => (
                          <div
                            key={loc.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`loc-${loc.id}`}
                              checked={filters.locations.includes(loc.id)}
                              onCheckedChange={(checked) =>
                                updateFilters("locations", loc.id, checked)
                              }
                              className="text-green-600"
                            />
                            <Label
                              htmlFor={`loc-${loc.id}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {loc.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredLocations.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-green-600 hover:bg-green-50 font-medium"
                        onClick={() => setShowAllLocations(!showAllLocations)}
                      >
                        {showAllLocations
                          ? "Show Less"
                          : `Show All (${filteredLocations.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Team Sizes Filter */}
              <AccordionItem value="sizes" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-orange-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-orange-500" />
                    Team Sizes
                    {filters.sizes.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                        {filters.sizes.length}
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
                          placeholder="Search team sizes..."
                          value={sizeSearch}
                          onChange={(e) => setSizeSearch(e.target.value)}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                      </div>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {displayedSizes.map((size) => (
                          <div
                            key={size.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors"
                          >
                            <Checkbox
                              id={`size-${size.id}`}
                              checked={filters.sizes.includes(size.id)}
                              onCheckedChange={(checked) =>
                                updateFilters("sizes", size.id, checked)
                              }
                              className="text-orange-600"
                            />
                            <Label
                              htmlFor={`size-${size.id}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {size.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {filteredSizes.length > initialItemsToShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-orange-600 hover:bg-orange-50 font-medium"
                        onClick={() => setShowAllSizes(!showAllSizes)}
                      >
                        {showAllSizes
                          ? "Show Less"
                          : `Show All (${filteredSizes.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Add New Department</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter a new department to add to the filter options.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter department name"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDepartmentOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDepartment}
              disabled={!newDepartment.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Add New Location</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter a new location to add to the filter options.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter location name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddLocationOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLocation}
              disabled={!newLocation.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
