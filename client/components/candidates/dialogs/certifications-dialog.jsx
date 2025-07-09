"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Award,
  Building2,
  Calendar,
  Clock,
  X,
  ExternalLink,
  Eye,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CertificationsDialog({ isOpen, onOpenChange, candidate }) {
  if (!candidate) return null;

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry > now;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-purple-50 to-violet-50/50 border-b border-purple-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Certifications</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {candidate.name}'s professional certifications and qualifications.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {candidate.CandidateCertifications &&
            candidate.CandidateCertifications.length > 0 ? (
            <div className="space-y-4">
              {candidate.CandidateCertifications.map((certification, index) => {
                const expired = isExpired(certification.expiryDate);
                const expiringSoon = isExpiringSoon(certification.expiryDate);

                return (
                  <div
                    key={certification.id}
                    className="group relative bg-gradient-to-r from-white to-purple-50/30 border-2 border-gray-200 rounded-xl p-6 space-y-4 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-900 transition-colors">
                            {certification.certificationName}
                          </h3>
                          <p className="text-gray-600 font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            {certification.issuingOrganization}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-medium">
                          <Calendar className="h-3 w-3 mr-1" />
                          Issued: {certification.issueDate}
                        </Badge>
                        {certification.expiryDate && (
                          <Badge
                            className={`font-medium ${expired
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : expiringSoon
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {expired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Valid'} - {certification.expiryDate}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    {certification.expiryDate && (
                      <div className="flex items-center gap-2">
                        {expired ? (
                          <div className="flex items-center gap-2 text-red-600">
                            <X className="h-4 w-4" />
                            <span className="text-sm font-medium">Certification has expired</span>
                          </div>
                        ) : expiringSoon ? (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Certification expires soon</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Certification is valid</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Actions */}
                    {certification.Document && (
                      <div className="flex gap-3 pt-2 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certification.Document.url, "_blank")}
                          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certification.Document.downloadUrl, "_blank")}
                          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certification.Document.url, "_blank")}
                          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certifications</h3>
              <p className="text-gray-600 mb-4">
                No certifications have been added to this candidate's profile yet.
              </p>
              <p className="text-sm text-gray-500">
                Professional certifications and qualifications will appear here when added.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
