"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  Filter,
  FileText,
  Calendar,
  Tag,
  User,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/contexts/documents-context";
import { useAuth } from "@/contexts/auth-context";

// Default filter state
const defaultFilters = {
  documentType: "all",
  dateRange: { from: undefined, to: undefined },
  categories: [],
  tags: [],
  uploadedBy: [],
};

export function DocumentFilters({ onFilterChange, className, isPrivileged }) {
  const { toast } = useToast();
  const {
    categories,
    tags,
    uploaders,
    createCategory,
    createTag,
    documents,
    candidateList,
    selectedCandidateId,
    selectCandidate,
    companyList,
    selectedCompanyId,
    selectCompany,
  } = useDocuments();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [documentType, setDocumentType] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  // Convert static arrays to state variables
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [customTag, setCustomTag] = useState("");

  // Use uploaders from context instead of extracting from documents
  const [selectedUploaders, setSelectedUploaders] = useState([]);
  const [uploaderSearch, setUploaderSearch] = useState("");
  const [showAllUploaders, setShowAllUploaders] = useState(false);

  // Filter categories and tags based on search
  const filteredCategories = Array.isArray(categories)
    ? categories.filter(
      (category) =>
        category &&
        typeof category === "object" &&
        category.name &&
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
    )
    : [];

  const filteredTags = Array.isArray(tags)
    ? tags.filter(
      (tag) =>
        tag &&
        typeof tag === "object" &&
        tag.name &&
        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    )
    : [];

  const filteredUploaders = Array.isArray(uploaders)
    ? uploaders.filter(
      (uploader) =>
        uploader &&
        typeof uploader === "object" &&
        uploader.fullName &&
        uploader.fullName.toLowerCase().includes(uploaderSearch.toLowerCase())
    )
    : [];

  // Limit displayed items
  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 5);
  const displayedTags = showAllTags ? filteredTags : filteredTags.slice(0, 5);
  const displayedUploaders = showAllUploaders
    ? filteredUploaders
    : filteredUploaders.slice(0, 5);

  // Deduplicate uploaders by id before rendering
  const uniqueUploaders = [];
  const seenUploaderIds = new Set();
  for (const uploader of displayedUploaders) {
    if (uploader && uploader.id && !seenUploaderIds.has(uploader.id)) {
      uniqueUploaders.push(uploader);
      seenUploaderIds.add(uploader.id);
    }
  }

  const handleCategoryChange = (category, checked) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c.name !== category.name);

    setSelectedCategories(newCategories);
    if (typeof onFilterChange === "function") {
      onFilterChange({
        documentType,
        dateRange,
        categories: newCategories
          .filter((c) => c && typeof c === "object" && c.name)
          .map((c) => c.name),
        tags: selectedTags
          .filter((t) => t && typeof t === "object" && t.name)
          .map((t) => t.name),
        uploadedBy: selectedUploaders
          .filter((u) => u && typeof u === "object" && u.id)
          .map((u) => u.id),
      });
    }
  };

  const handleTagChange = (tag, checked) => {
    const newTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t.name !== tag.name);

    setSelectedTags(newTags);
    if (typeof onFilterChange === "function") {
      onFilterChange({
        documentType,
        dateRange,
        categories: selectedCategories
          .filter((c) => c && typeof c === "object" && c.name)
          .map((c) => c.name),
        tags: newTags
          .filter((t) => t && typeof t === "object" && t.name)
          .map((t) => t.name),
        uploadedBy: selectedUploaders
          .filter((u) => u && typeof u === "object" && u.id)
          .map((u) => u.id),
      });
    }
  };

  const handleUploaderChange = (uploader, checked) => {
    const newUploaders = checked
      ? [...selectedUploaders, uploader]
      : selectedUploaders.filter((u) => u.id !== uploader.id);

    setSelectedUploaders(newUploaders);
    if (typeof onFilterChange === "function") {
      onFilterChange({
        documentType,
        dateRange,
        categories: selectedCategories
          .filter((c) => c && typeof c === "object" && c.name)
          .map((c) => c.name),
        tags: selectedTags
          .filter((t) => t && typeof t === "object" && t.name)
          .map((t) => t.name),
        uploadedBy: newUploaders
          .filter((u) => u && typeof u === "object" && u.id)
          .map((u) => u.id),
      });
    }
  };

  const addCustomTag = async () => {
    if (
      customTag && !Array.isArray(tags)
        ? tags.find((t) => t.name === customTag)
        : false
    ) {
      try {
        const newTag = await createTag({ name: customTag });
        handleTagChange(newTag, true);
        setCustomTag("");

        toast({
          title: "Tag added",
          description: `${customTag} has been added to tags.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add tag. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle adding new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (newCategory.trim()) {
      if (
        !Array.isArray(categories)
          ? categories.find((c) => c.name === newCategory.trim())
          : false
      ) {
        try {
          const newCategoryObj = await createCategory({
            name: newCategory.trim(),
          });
          handleCategoryChange(newCategoryObj, true);
          setNewCategory("");
          setIsAddCategoryOpen(false);

          toast({
            title: "Category added",
            description: `${newCategory} has been added to categories.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to add category. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Category already exists",
          description: "This category already exists in the list.",
          variant: "destructive",
        });
      }
    }
  };

  const resetFilters = () => {
    setDocumentType("all");
    setDateRange({ from: undefined, to: undefined });
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedUploaders([]);

    if (typeof onFilterChange === "function") {
      onFilterChange(defaultFilters);
    }
  };

  // Count active filters
  const activeFilterCount =
    (documentType !== "all" ? 1 : 0) +
    selectedCategories.length +
    selectedTags.length +
    selectedUploaders.length +
    (dateRange.from || dateRange.to ? 1 : 0);

  return (
    <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "w-[80px]" : "w-[320px]"} ${className} h-full flex flex-col`}>
      {/* Collapsed view */}
      {isCollapsed && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col items-center justify-center gap-2">
          <div
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => setIsCollapsed(false)}
            role="button"
            tabIndex={0}
            aria-label="Expand filters"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsCollapsed(false);
              }
            }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-3 flex items-center justify-center shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Filters</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
              {activeFilterCount}
            </Badge>
          )}
        </Card>
      )}

      {/* Expanded view */}
      {!isCollapsed && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-full flex flex-col">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Filters</CardTitle>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {activeFilterCount} active
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(true)}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-full flex flex-col flex-1">
            <div
              className="space-y-6 overflow-y-auto pr-1 flex-grow"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              {/* Document Type Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Document Type</h3>
                </div>
                <RadioGroup
                  value={documentType}
                  onValueChange={(value) => {
                    setDocumentType(value);
                    if (typeof onFilterChange === "function") {
                      onFilterChange({
                        documentType: value,
                        dateRange,
                        categories: selectedCategories
                          .filter((c) => c && typeof c === "object" && c.name)
                          .map((c) => c.name),
                        tags: selectedTags
                          .filter((t) => t && typeof t === "object" && t.name)
                          .map((t) => t.name),
                        uploadedBy: selectedUploaders
                          .filter((u) => u && typeof u === "object" && u.id)
                          .map((u) => u.id),
                      });
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="all" id="all-documents" />
                    <Label htmlFor="all-documents" className="text-sm font-medium">All Documents</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="document" id="document" />
                    <Label htmlFor="document" className="text-sm">Documents (.doc, .docx)</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="text-sm">PDFs</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="spreadsheet" id="spreadsheet" />
                    <Label htmlFor="spreadsheet" className="text-sm">Spreadsheets</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="presentation" id="presentation" />
                    <Label htmlFor="presentation" className="text-sm">Presentations</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="text-sm">Images</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-sm">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Company Filter (Privileged only) */}
              {isPrivileged && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                  </div>
                  <select
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-blue-400 text-sm"
                    value={selectedCompanyId || ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      await selectCompany(val || null);
                      if (typeof onFilterChange === "function") {
                        onFilterChange({
                          companyId: val || undefined,
                          documentType,
                          dateRange,
                          categories: selectedCategories
                            .filter((c) => c && typeof c === "object" && c.name)
                            .map((c) => c.name),
                          tags: selectedTags
                            .filter((t) => t && typeof t === "object" && t.name)
                            .map((t) => t.name),
                          uploadedBy: selectedUploaders
                            .filter((u) => u && typeof u === "object" && u.id)
                            .map((u) => u.id),
                        });
                      }
                    }}
                  >
                    <option value="">All Companies</option>
                    {companyList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {selectedCompanyId && (
                    <button
                      className="mt-1 text-xs text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
                      onClick={async () => {
                        await selectCompany(null);
                        if (typeof onFilterChange === "function") {
                          onFilterChange({ companyId: undefined });
                        }
                      }}
                    >
                      Clear Company Filter
                    </button>
                  )}
                </div>
              )}

              {/* Candidate Filter (Privileged only) */}
              {isPrivileged && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Candidate</h3>
                  </div>
                  <select
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-blue-400 text-sm"
                    value={selectedCandidateId || ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      await selectCandidate(val || null);
                      if (typeof onFilterChange === "function") {
                        onFilterChange({
                          candidateId: val || undefined,
                          documentType,
                          dateRange,
                          categories: selectedCategories
                            .filter((c) => c && typeof c === "object" && c.name)
                            .map((c) => c.name),
                          tags: selectedTags
                            .filter((t) => t && typeof t === "object" && t.name)
                            .map((t) => t.name),
                          uploadedBy: selectedUploaders
                            .filter((u) => u && typeof u === "object" && u.id)
                            .map((u) => u.id),
                        });
                      }
                    }}
                  >
                    <option value="">All Candidates</option>
                    {candidateList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {selectedCandidateId && (
                    <button
                      className="mt-1 text-xs text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
                      onClick={async () => {
                        await selectCandidate(null);
                        if (typeof onFilterChange === "function") {
                          onFilterChange({
                            candidateId: undefined,
                            documentType,
                            dateRange,
                            categories: selectedCategories
                              .filter(
                                (c) => c && typeof c === "object" && c.name
                              )
                              .map((c) => c.name),
                            tags: selectedTags
                              .filter(
                                (t) => t && typeof t === "object" && t.name
                              )
                              .map((t) => t.name),
                            uploadedBy: selectedUploaders
                              .filter((u) => u && typeof u === "object" && u.id)
                              .map((u) => u.id),
                          });
                        }
                      }}
                    >
                      Clear Candidate Filter
                    </button>
                  )}
                </div>
              )}

              {/* Categories Filter */}
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="categories" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Categories</span>
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                          {selectedCategories.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="h-8 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50"
                          onClick={() => setIsAddCategoryOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {displayedCategories.map((category) =>
                          category &&
                            typeof category === "object" &&
                            category.id &&
                            category.name ? (
                            <div
                              key={category.id}
                              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={selectedCategories.some(
                                  (c) => c.id === category.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(category, checked)
                                }
                              />
                              <Label
                                htmlFor={`category-${category.id}`}
                                className="text-sm font-medium"
                              >
                                {category.name}
                              </Label>
                            </div>
                          ) : null
                        )}
                      </div>
                      {filteredCategories.length > 5 && (
                        <Button
                          variant="link"
                          className="px-0 text-sm text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            setShowAllCategories(!showAllCategories)
                          }
                        >
                          {showAllCategories
                            ? "Show less"
                            : `Show ${filteredCategories.length - 5} more`}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tags" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Tags</span>
                      {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                          {selectedTags.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Search tags..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="h-8 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        {displayedTags.map((tag) =>
                          tag &&
                            typeof tag === "object" &&
                            tag.id &&
                            tag.name ? (
                            <div
                              key={tag.id}
                              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Checkbox
                                id={`tag-${tag.id}`}
                                checked={selectedTags.some(
                                  (t) => t.id === tag.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleTagChange(tag, checked)
                                }
                              />
                              <Label
                                htmlFor={`tag-${tag.id}`}
                                className="text-sm font-medium"
                              >
                                {tag.name}
                              </Label>
                            </div>
                          ) : null
                        )}
                      </div>
                      {filteredTags.length > 5 && (
                        <Button
                          variant="link"
                          className="px-0 text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => setShowAllTags(!showAllTags)}
                        >
                          {showAllTags
                            ? "Show less"
                            : `Show ${filteredTags.length - 5} more`}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {isPrivileged && (
                  <AccordionItem value="uploaded-by" className="border border-gray-200 rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Uploaded By</span>
                        {selectedUploaders.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                            {selectedUploaders.length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-grow">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Search uploaders..."
                              className="pl-8 text-sm bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                              value={uploaderSearch}
                              onChange={(e) =>
                                setUploaderSearch(e.target.value)
                              }
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 hover:bg-blue-50 border-blue-200"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add uploader</span>
                          </Button>
                        </div>

                        {selectedUploaders.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedUploaders.map((uploader) =>
                              uploader &&
                                typeof uploader === "object" &&
                                uploader.id &&
                                uploader.fullName ? (
                                <Badge
                                  key={uploader.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                  {uploader.fullName}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                      handleUploaderChange(uploader, false)
                                    }
                                  />
                                </Badge>
                              ) : null
                            )}
                            {selectedUploaders.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs hover:bg-blue-50"
                                onClick={() => setSelectedUploaders([])}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        )}

                        <div className="space-y-2 max-h-[200px] overflow-auto">
                          {uniqueUploaders.length > 0 ? (
                            uniqueUploaders.map((uploader) =>
                              uploader &&
                                typeof uploader === "object" &&
                                uploader.id &&
                                uploader.fullName ? (
                                <div
                                  key={uploader.id}
                                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <Checkbox
                                    id={`uploader-${uploader.id}`}
                                    checked={selectedUploaders.some(
                                      (u) => u.id === uploader.id
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleUploaderChange(uploader, !!checked)
                                    }
                                  />
                                  <Label htmlFor={`uploader-${uploader.id}`} className="text-sm font-medium">
                                    {uploader.fullName}
                                  </Label>
                                </div>
                              ) : null
                            )
                          ) : (
                            <p className="text-sm text-gray-500">
                              No uploaders found
                            </p>
                          )}
                        </div>

                        {filteredUploaders.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs mt-2 hover:bg-blue-50"
                            onClick={() =>
                              setShowAllUploaders(!showAllUploaders)
                            }
                          >
                            {showAllUploaders
                              ? "Show Less"
                              : `Show All (${filteredUploaders.length})`}
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full box-border rounded-lg px-4 py-2 mt-2 font-medium border-blue-200 text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition"
                onClick={resetFilters}
              >
                Reset Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
            <DialogTitle className="text-xl font-bold text-gray-900">Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name" className="text-sm font-medium text-gray-700">
                Category Name
              </Label>
              <Input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name..."
                className="mt-1 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCategoryOpen(false)}
                className="hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
