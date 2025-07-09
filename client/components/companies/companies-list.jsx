"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, Building2, Briefcase, Eye, Edit, Trash2, Users, MapPin, Globe, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export function CompaniesList({
  companies,
  totalCompanies,
  currentPage,
  totalPages,
  startIndex,
  itemsPerPage,
  searchQuery,
  onSearchChange,
  onPageChange,
  onSelectCompany,
  onEditCompany,
  onViewJobs,
  onViewCandidates,
  onDeleteCompany,
}) {
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Companies List
              {companies.length !== totalCompanies && (
                <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {companies.length} of {totalCompanies}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {companies.length} company{companies.length !== 1 ? 'ies' : 'y'} found
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value)
                onPageChange(1) // Reset to first page on search
              }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden transition-all duration-500 ease-in-out">
          <Table className="w-full transition-all duration-500 ease-in-out">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 hover:bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 py-4">Company</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 hidden md:table-cell">Industry</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 hidden lg:table-cell">Location</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 hidden xl:table-cell">Size</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 hidden sm:table-cell">Jobs</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="w-[80px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-md">
                          <AvatarImage
                            src={company.logo || "/placeholder.svg"}
                            alt={company.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {company.name ? company.name.charAt(0).toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{company.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">{company.website || "No website"}</span>
                          </div>
                          {company.industry && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Building2 className="h-3 w-3" />
                              <span>{company.industry}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-800">{company.industry || "Not specified"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-800">{company.location || "Not specified"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-800">{company.size || "Not specified"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-800">{company.openJobs || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewJobs(company.id)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">View Jobs</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105
                                ${company.status === 'active'
                                  ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                                  : company.status === 'inactive'
                                    ? "bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                                    : "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                                }
                              `}
                            >
                              {company.status === 'active' ? (
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                              ) : company.status === 'inactive' ? (
                                <div className="h-2 w-2 bg-gray-500 rounded-full" />
                              ) : (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                              {company.status ? company.status.charAt(0).toUpperCase() + company.status.slice(1) : "Unknown"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white">
                            {company.status === 'active'
                              ? "This company is actively working with us."
                              : company.status === 'inactive'
                                ? "This company is currently inactive."
                                : "Company status is unknown."
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                          <DropdownMenuItem
                            onClick={() => onSelectCompany(company.id)}
                            className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewJobs(company.id)}
                            className="flex items-center gap-2 hover:bg-green-50 cursor-pointer"
                          >
                            <Briefcase className="h-4 w-4 text-green-600" />
                            View Jobs
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onViewCandidates(company.id)}
                            className="flex items-center gap-2 hover:bg-purple-50 cursor-pointer"
                          >
                            <Users className="h-4 w-4 text-purple-600" />
                            View Candidates
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEditCompany(company.id)}
                            className="flex items-center gap-2 hover:bg-indigo-50 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-indigo-600" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteCompany(company.id)}
                            className="flex items-center gap-2 hover:bg-red-50 cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <Building2 className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium">No companies found</p>
                        <p className="text-sm">Try adjusting your filters or search terms</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">{Math.min(startIndex + 1, totalCompanies)}</span> to{" "}
          <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, totalCompanies)}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalCompanies}</span>{" "}
          companies
          {companies.length !== totalCompanies && (
            <span className="text-gray-500"> (filtered from {totalCompanies} total)</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-9 w-9 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 w-8 p-0 ${currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50 hover:border-blue-300"
                    }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-9 w-9 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
