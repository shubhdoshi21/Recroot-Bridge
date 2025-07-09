"use client";
import { useState, useCallback, useEffect } from "react";
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
  Building2,
  MapPin,
  Users,
  Target,
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
import { useCompanies } from "@/contexts/companies-context";

export function CompanyFilters({ onFiltersChange, onCollapseChange }) {
  const { toast } = useToast();
  const {
    availableIndustries,
    availableLocations,
    availableSizes,
    availableStatuses,
  } = useCompanies();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    industries: [],
    locations: [],
    sizes: [],
  });

  // Search states
  const [industrySearch, setIndustrySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sizeSearch, setSizeSearch] = useState("");

  // Show more/less states
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);

  // New item states
  const [newIndustry, setNewIndustry] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Dialog open states
  const [isAddIndustryOpen, setIsAddIndustryOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  // Initial display limits
  const initialLimit = 5;

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (newFilters) => {
    console.log("[CompanyFilters] Current filters:", filters);
    console.log("[CompanyFilters] New filters to apply:", newFilters);

    const updatedFilters = { ...filters, ...newFilters };
    console.log("[CompanyFilters] Updated filters:", updatedFilters);

    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleStatusChange = useCallback(
    (value) => {
      updateFilters({ status: value });
    },
    [updateFilters]
  );

  const handleIndustryChange = (industry, checked) => {
    const updatedIndustries = checked
      ? [...filters.industries, industry]
      : filters.industries.filter((i) => i !== industry);

    updateFilters({ industries: updatedIndustries });
  };

  const handleLocationChange = (location, checked) => {
    const updatedLocations = checked
      ? [...filters.locations, location]
      : filters.locations.filter((l) => l !== location);

    updateFilters({ locations: updatedLocations });
  };

  const handleSizeChange = (sizeId, checked) => {
    console.log("[CompanyFilters] Size change:", { sizeId, checked });
    console.log("[CompanyFilters] Current sizes in filters:", filters.sizes);

    const updatedSizes = checked
      ? [...filters.sizes, sizeId]
      : filters.sizes.filter((s) => s !== sizeId);

    console.log("[CompanyFilters] Updated sizes:", updatedSizes);

    updateFilters({ sizes: updatedSizes });
  };

  // Handle adding new industry
  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      const formattedIndustry = newIndustry.trim();
      // Note: This would need to be implemented in the context
      // setAvailableIndustries((prev) => [...prev, formattedIndustry]);
      handleIndustryChange(formattedIndustry, true);
      setNewIndustry("");
      setIsAddIndustryOpen(false);
      toast({
        title: "Industry added",
        description: `${formattedIndustry} has been added to industries.`,
      });
    }
  };

  // Handle adding new location
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const formattedLocation = newLocation.trim();
      // Note: This would need to be implemented in the context
      // setAvailableLocations((prev) => [...prev, formattedLocation]);
      handleLocationChange(formattedLocation, true);
      setNewLocation("");
      setIsAddLocationOpen(false);
      toast({
        title: "Location added",
        description: `${formattedLocation} has been added to locations.`,
      });
    }
  };

  // Handle reset filters with toast notification
  const handleResetFilters = () => {
    const resetState = {
      status: "all",
      industries: [],
      locations: [],
      sizes: [],
    };
    setFilters(resetState);
    onFiltersChange(resetState);

    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  // Calculate the number of active filters
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    filters.industries.length +
    filters.locations.length +
    filters.sizes.length;

  // Filter industries based on search
  const filteredIndustries = availableIndustries.filter((industry) =>
    industry.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Filter locations based on search
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Filter sizes based on search
  const filteredSizes = availableSizes.filter((size) =>
    size.label.toLowerCase().includes(sizeSearch.toLowerCase())
  );

  // Handle collapsing/expanding the filters
  const handleCollapsedChange = (collapsed) => {
    setIsCollapsed(collapsed);
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  };

  // Add logging for initial render
  useEffect(() => {
    console.log("[CompanyFilters] Initial render with filters:", filters);
    console.log("[CompanyFilters] Available sizes:", availableSizes);
  }, []);

  // Add logging when filters change
  useEffect(() => {
    console.log("[CompanyFilters] Filters updated:", filters);
  }, [filters]);

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
                <p className="text-xs text-gray-600 mt-1">Refine your company search</p>
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
                <Target className="h-4 w-4 text-blue-500" />
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
                    All Companies
                  </Label>
                </div>
                {availableStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <RadioGroupItem value={status} id={`status-${status}`} className="text-blue-600" />
                    <Label htmlFor={`status-${status}`} className="text-sm font-medium cursor-pointer">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["industry", "location", "size"]}
              className="w-full space-y-2"
            >
              {/* Industry Filter */}
              <AccordionItem value="industry" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Industries
                    {filters.industries.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {filters.industries.length}
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
                          placeholder="Search industries..."
                          value={industrySearch}
                          onChange={(e) => setIndustrySearch(e.target.value)}
                          className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>
                      <Dialog
                        open={isAddIndustryOpen}
                        onOpenChange={setIsAddIndustryOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            disabled={!industrySearch.trim()}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add industry</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Industry</DialogTitle>
                            <DialogDescription>
                              Enter a new industry to add to the filter options.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Enter industry name"
                              value={newIndustry}
                              onChange={(e) => setNewIndustry(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddIndustryOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddIndustry}>
                              Add Industry
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {filteredIndustries
                          .slice(
                            0,
                            showAllIndustries ? undefined : initialLimit
                          )
                          .map((industry) => (
                            <div
                              key={industry}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
                            >
                              <Checkbox
                                id={`industry-${industry}`}
                                checked={filters.industries.includes(industry)}
                                onCheckedChange={(checked) =>
                                  handleIndustryChange(industry, checked)
                                }
                                className="text-blue-600"
                              />
                              <Label
                                htmlFor={`industry-${industry}`}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {industry}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>

                    {filteredIndustries.length > initialLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setShowAllIndustries(!showAllIndustries)}
                      >
                        {showAllIndustries
                          ? "Show Less"
                          : `Show All (${filteredIndustries.length})`}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Location Filter */}
              <AccordionItem value="location" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
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
                          className="pl-10 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
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
                            className="shrink-0 hover:bg-green-50 hover:border-green-300 transition-colors"
                            disabled={!locationSearch.trim()}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add location</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddLocationOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddLocation}>
                              Add Location
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {filteredLocations
                          .slice(
                            0,
                            showAllLocations ? undefined : initialLimit
                          )
                          .map((location) => (
                            <div
                              key={location}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors"
                            >
                              <Checkbox
                                id={`location-${location}`}
                                checked={filters.locations.includes(location)}
                                onCheckedChange={(checked) =>
                                  handleLocationChange(location, checked)
                                }
                                className="text-green-600"
                              />
                              <Label
                                htmlFor={`location-${location}`}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {location}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>

                    {filteredLocations.length > initialLimit && (
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

              {/* Size Filter */}
              <AccordionItem value="size" className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                <AccordionTrigger className="text-sm font-semibold py-4 px-4 text-gray-700 hover:bg-blue-50/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Company Size
                    {filters.sizes.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                        {filters.sizes.length}
                      </Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search company sizes..."
                        value={sizeSearch}
                        onChange={(e) => setSizeSearch(e.target.value)}
                        className="pl-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>

                    <ScrollArea className="max-h-[200px] pr-4">
                      <div className="grid gap-2">
                        {filteredSizes
                          .slice(
                            0,
                            showAllSizes ? undefined : initialLimit
                          )
                          .map((size) => (
                            <div
                              key={size.id}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50/50 transition-colors"
                            >
                              <Checkbox
                                id={`size-${size.id}`}
                                checked={filters.sizes.includes(size.id)}
                                onCheckedChange={(checked) =>
                                  handleSizeChange(size.id, checked)
                                }
                                className="text-purple-600"
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

                    {filteredSizes.length > initialLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-purple-600 hover:bg-purple-50 font-medium"
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
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
