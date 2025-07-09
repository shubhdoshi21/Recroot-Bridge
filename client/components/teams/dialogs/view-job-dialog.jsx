"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Building,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

/**
 * Dialog for viewing job details
 */
export function ViewJobDialog({ open, onOpenChange, job }) {
  if (!job) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      "active": "bg-green-100 text-green-700",
      "inactive": "bg-gray-100 text-gray-700",
      "closed": "bg-red-100 text-red-700",
      "draft": "bg-yellow-100 text-yellow-700",
      "pending": "bg-blue-100 text-blue-700"
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Job Details</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                View comprehensive information about this position
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Job Header Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Position Overview
                </CardTitle>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.department}</span>
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                    <p className="text-sm font-medium text-gray-900">{job.location || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Positions</label>
                    <p className="text-sm font-medium text-gray-900">{job.positions || 1}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posted Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {job.postedDate
                        ? format(new Date(job.postedDate), "MMM d, yyyy")
                        : "Not posted"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Open</label>
                    <p className="text-sm font-medium text-gray-900">{job.timeOpen || 0} days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruitment Progress Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recruitment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Candidates</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{job.candidates || 0}</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Interviews</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{job.interviews || 0}</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Offers</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{job.offers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description Card */}
          {job.description && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-b border-gray-100">
                <CardTitle className="text-lg font-bold text-gray-900">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
