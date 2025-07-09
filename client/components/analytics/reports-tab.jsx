"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Download,
  Eye,
  FileText,
  Printer,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Initial mock data for reports
const initialRecentReports = [
  {
    id: 1,
    name: "Q1 Recruitment Performance",
    type: "Recruitment Performance",
    date: "Mar 15, 2023",
    format: "PDF",
    status: "completed",
    content: {
      title: "Q1 Recruitment Performance Report",
      summary:
        "This report provides an overview of recruitment performance metrics for Q1 2023.",
      sections: [
        {
          title: "Time-to-Fill Metrics",
          description:
            "Average time taken to fill positions across different departments and roles.",
          data: [
            { department: "Engineering", average: "32 days", change: "-5%" },
            { department: "Marketing", average: "28 days", change: "-2%" },
          ],
        },
      ],
    },
  },
  {
    id: 2,
    name: "Candidate Pipeline Analysis",
    type: "Candidate Pipeline",
    date: "Feb 28, 2023",
    format: "CSV",
    status: "completed",
    content: {
      title: "Candidate Pipeline Analysis",
      summary:
        "This report analyzes the candidate pipeline and conversion rates at each stage.",
      sections: [
        {
          title: "Pipeline Overview",
          description:
            "Number of candidates at each stage of the recruitment process.",
          data: [
            { stage: "Applied", count: 523, conversion: "100%" },
            { stage: "Screening", count: 312, conversion: "59.7%" },
          ],
        },
      ],
    },
  },
  {
    id: 3,
    name: "Interview Efficiency Report",
    type: "Interview Analytics",
    date: "Feb 15, 2023",
    format: "PDF",
    status: "completed",
    content: {
      title: "Interview Efficiency Report",
      summary: "This report analyzes interview performance and outcomes.",
      sections: [
        {
          title: "Interview Outcomes",
          description: "Analysis of interview results by department.",
          data: [
            {
              department: "Engineering",
              interviews: 87,
              passes: 32,
              fails: 55,
              passRate: "36.8%",
            },
            {
              department: "Marketing",
              interviews: 45,
              passes: 18,
              fails: 27,
              passRate: "40.0%",
            },
          ],
        },
      ],
    },
  },
  {
    id: 4,
    name: "Offer Conversion Trends",
    type: "Offer Conversion",
    date: "Jan 31, 2023",
    format: "Excel",
    status: "completed",
    content: {
      title: "Offer Conversion Trends",
      summary: "This report analyzes offer extensions and acceptance rates.",
      sections: [
        {
          title: "Offer Acceptance by Department",
          description: "Acceptance rates across different departments.",
          data: [
            {
              department: "Engineering",
              offered: 32,
              accepted: 28,
              rate: "87.5%",
            },
            {
              department: "Marketing",
              offered: 18,
              accepted: 14,
              rate: "77.8%",
            },
          ],
        },
      ],
    },
  },
];

// Report types
const reportTypes = [
  { id: "recruitment", name: "Recruitment Performance" },
  { id: "hiring", name: "Hiring Metrics" },
  { id: "candidates", name: "Candidate Pipeline" },
  { id: "interviews", name: "Interview Analytics" },
  { id: "offers", name: "Offer Conversion" },
  { id: "onboarding", name: "Onboarding Status" },
];

// Report formats
const reportFormats = [
  {
    id: "pdf",
    name: "PDF Document",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  {
    id: "csv",
    name: "CSV Spreadsheet",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  {
    id: "xlsx",
    name: "Excel Spreadsheet",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
];

// Local storage key for reports
const STORAGE_KEY = "financial-dashboard-reports";

export function ReportsTab() {
  const { toast } = useToast();

  // State for report generation
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // State for recent reports
  const [recentReports, setRecentReports] = useState(initialRecentReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportPreview, setShowReportPreview] = useState(false);

  const [scheduledReports, setScheduledReports] = useState([
    {
      id: 1,
      name: "Weekly Recruitment Summary",
      schedule: "Weekly",
      day: "Monday",
      time: "9:00 AM",
      format: "PDF",
      reportType: "recruitment",
      active: true,
    },
    {
      id: 2,
      name: "Monthly Hiring Metrics",
      schedule: "Monthly",
      day: "1st",
      time: "8:00 AM",
      format: "Excel",
      reportType: "hiring",
      active: true,
    },
  ]);
  const [editingReport, setEditingReport] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load reports from local storage on component mount
  useEffect(() => {
    try {
      const storedReports = localStorage.getItem(STORAGE_KEY);
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports);
        // Ensure each report has a valid content property
        const validReports = parsedReports.map((report) => {
          if (!report.content) {
            // Add default content if missing
            return {
              ...report,
              content: {
                title: report.name || "Report",
                summary: `${report.type || "Generated"} report from ${report.date || "unknown date"
                  }.`,
                sections: [],
              },
            };
          }
          return report;
        });
        setRecentReports(validReports);
      }
    } catch (error) {
      console.log("Error loading reports from localStorage:", error);
      // Fallback to initial reports if there's an error
      setRecentReports(initialRecentReports);
    }
  }, []);

  // Save reports to local storage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentReports));
    } catch (error) {
      console.log("Error saving reports to localStorage:", error);
    }
  }, [recentReports]);

  // Function to handle report generation
  const handleGenerateReport = () => {
    if (!selectedReportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFormat) {
      toast({
        title: "Error",
        description: "Please select a report format",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate report generation with progress updates
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        if (newProgress >= 100) {
          clearInterval(interval);

          // Get report type name safely
          const reportTypeName =
            reportTypes.find((r) => r.id === selectedReportType)?.name ||
            "Generated Report";

          // Get format name safely
          const formatName =
            reportFormats
              .find((f) => f.id === selectedFormat)
              ?.name.split(" ")[0] || "Document";

          // Create mock report data
          const reportData = {
            id: Date.now(), // Use timestamp as unique ID
            name: `${reportTypeName} Report`,
            type: reportTypeName,
            date: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            format: formatName,
            status: "completed",
            content: generateMockReportContent(selectedReportType),
            charts: includeCharts,
            tables: includeTables,
            createdAt: new Date().toISOString(), // For sorting
          };

          setGeneratedReport(reportData);

          // Add to recent reports (at the beginning)
          setRecentReports((prevReports) => {
            const newReports = [reportData, ...prevReports];
            // Limit to 10 most recent reports
            return newReports.slice(0, 10);
          });

          setIsGenerating(false);

          // Show success toast after state updates are complete
          setTimeout(() => {
            toast({
              title: "Report Generated",
              description:
                "Your report has been successfully generated and added to Recent Reports",
            });

            // Show preview dialog
            setShowPreviewDialog(true);
          }, 0);

          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  // Function to generate mock report content based on type
  const generateMockReportContent = (reportType) => {
    switch (reportType) {
      case "recruitment":
        return {
          title: "Recruitment Performance Report",
          summary:
            "This report provides an overview of recruitment performance metrics for the selected period.",
          sections: [
            {
              title: "Time-to-Fill Metrics",
              description:
                "Average time taken to fill positions across different departments and roles.",
              data: [
                {
                  department: "Engineering",
                  average: "32 days",
                  change: "-5%",
                },
                { department: "Marketing", average: "28 days", change: "-2%" },
                { department: "Sales", average: "21 days", change: "-8%" },
                { department: "Product", average: "35 days", change: "+3%" },
              ],
            },
            {
              title: "Source Effectiveness",
              description: "Effectiveness of different recruitment channels.",
              data: [
                {
                  source: "Job Boards",
                  candidates: 145,
                  hires: 12,
                  ratio: "8.3%",
                },
                {
                  source: "Referrals",
                  candidates: 78,
                  hires: 15,
                  ratio: "19.2%",
                },
                {
                  source: "LinkedIn",
                  candidates: 210,
                  hires: 18,
                  ratio: "8.6%",
                },
                { source: "Agency", candidates: 42, hires: 5, ratio: "11.9%" },
              ],
            },
          ],
        };
      case "candidates":
        return {
          title: "Candidate Pipeline Analysis",
          summary:
            "This report analyzes the candidate pipeline and conversion rates at each stage.",
          sections: [
            {
              title: "Pipeline Overview",
              description:
                "Number of candidates at each stage of the recruitment process.",
              data: [
                { stage: "Applied", count: 523, conversion: "100%" },
                { stage: "Screening", count: 312, conversion: "59.7%" },
                { stage: "Interview", count: 187, conversion: "35.8%" },
                { stage: "Assessment", count: 98, conversion: "18.7%" },
                { stage: "Offer", count: 45, conversion: "8.6%" },
                { stage: "Hired", count: 32, conversion: "6.1%" },
              ],
            },
          ],
        };
      case "hiring":
        return {
          title: "Hiring Metrics Report",
          summary:
            "This report provides key metrics about the hiring process and outcomes.",
          sections: [
            {
              title: "Hiring Efficiency",
              description:
                "Metrics related to the efficiency of the hiring process.",
              data: [
                {
                  metric: "Average Time to Hire",
                  value: "45 days",
                  benchmark: "Industry: 52 days",
                },
                {
                  metric: "Cost per Hire",
                  value: "$4,285",
                  benchmark: "Industry: $4,700",
                },
                {
                  metric: "Offer Acceptance Rate",
                  value: "78%",
                  benchmark: "Industry: 68%",
                },
                {
                  metric: "Interview to Hire Ratio",
                  value: "6:1",
                  benchmark: "Industry: 8:1",
                },
              ],
            },
            {
              title: "Hiring Sources",
              description: "Breakdown of successful hires by source.",
              data: [
                {
                  source: "Employee Referrals",
                  percentage: "32%",
                  change: "+5%",
                },
                { source: "Job Boards", percentage: "28%", change: "-3%" },
                { source: "Company Website", percentage: "15%", change: "+2%" },
                { source: "LinkedIn", percentage: "18%", change: "+4%" },
                { source: "Recruiters", percentage: "7%", change: "-2%" },
              ],
            },
          ],
        };
      case "interviews":
        return {
          title: "Interview Analytics Report",
          summary: "This report analyzes interview performance and outcomes.",
          sections: [
            {
              title: "Interview Outcomes",
              description: "Analysis of interview results by department.",
              data: [
                {
                  department: "Engineering",
                  interviews: 87,
                  passes: 32,
                  fails: 55,
                  passRate: "36.8%",
                },
                {
                  department: "Marketing",
                  interviews: 45,
                  passes: 18,
                  fails: 27,
                  passRate: "40.0%",
                },
                {
                  department: "Sales",
                  interviews: 63,
                  passes: 29,
                  fails: 34,
                  passRate: "46.0%",
                },
                {
                  department: "Product",
                  interviews: 38,
                  passes: 12,
                  fails: 26,
                  passRate: "31.6%",
                },
                {
                  department: "Design",
                  interviews: 29,
                  passes: 11,
                  fails: 18,
                  passRate: "37.9%",
                },
              ],
            },
          ],
        };
      case "offers":
        return {
          title: "Offer Conversion Report",
          summary:
            "This report analyzes offer extensions and acceptance rates.",
          sections: [
            {
              title: "Offer Acceptance by Department",
              description: "Acceptance rates across different departments.",
              data: [
                {
                  department: "Engineering",
                  offered: 32,
                  accepted: 28,
                  rate: "87.5%",
                },
                {
                  department: "Marketing",
                  offered: 18,
                  accepted: 14,
                  rate: "77.8%",
                },
                {
                  department: "Sales",
                  offered: 29,
                  accepted: 25,
                  rate: "86.2%",
                },
                {
                  department: "Product",
                  offered: 12,
                  accepted: 9,
                  rate: "75.0%",
                },
                {
                  department: "Design",
                  offered: 11,
                  accepted: 8,
                  rate: "72.7%",
                },
              ],
            },
            {
              title: "Offer Decline Reasons",
              description: "Primary reasons candidates declined offers.",
              data: [
                { reason: "Compensation", percentage: "42%", change: "+5%" },
                {
                  reason: "Accepted Another Offer",
                  percentage: "28%",
                  change: "+2%",
                },
                { reason: "Role Fit", percentage: "15%", change: "-3%" },
                {
                  reason: "Location/Remote Work",
                  percentage: "10%",
                  change: "+4%",
                },
                { reason: "Other", percentage: "5%", change: "-2%" },
              ],
            },
          ],
        };
      case "onboarding":
        return {
          title: "Onboarding Status Report",
          summary:
            "This report provides an overview of the onboarding process and new hire integration.",
          sections: [
            {
              title: "Onboarding Completion",
              description:
                "Completion rates for onboarding tasks by department.",
              data: [
                {
                  department: "Engineering",
                  completed: "92%",
                  inProgress: "8%",
                  avgTime: "12 days",
                },
                {
                  department: "Marketing",
                  completed: "88%",
                  inProgress: "12%",
                  avgTime: "10 days",
                },
                {
                  department: "Sales",
                  completed: "95%",
                  inProgress: "5%",
                  avgTime: "8 days",
                },
                {
                  department: "Product",
                  completed: "85%",
                  inProgress: "15%",
                  avgTime: "14 days",
                },
                {
                  department: "Design",
                  completed: "90%",
                  inProgress: "10%",
                  avgTime: "11 days",
                },
              ],
            },
          ],
        };
      default:
        return {
          title: "Generated Report",
          summary:
            "This is a generated report based on the selected parameters.",
          sections: [
            {
              title: "Overview",
              description: "General overview of the selected metrics.",
              data: [],
            },
          ],
        };
    }
  };

  // Function to handle report download
  const handleDownloadReport = (report = generatedReport) => {
    if (!report) return;

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      toast({
        title: "Downloading Report",
        description: `Preparing ${report.format || "document"
          } file for download...`,
      });
    }, 0);

    // Create the appropriate content based on format
    setTimeout(() => {
      try {
        let content = "";
        let mimeType = "";
        let fileExtension = "";

        // Ensure report has content
        const reportContent = report.content || {
          title: report.name || "Report",
          summary: `${report.type || "Generated"} report.`,
          sections: [],
        };

        // Determine content type and create appropriate data
        const format = (report.format || "").toLowerCase();
        switch (format) {
          case "pdf":
            // For PDF, we'd normally use a library like jsPDF
            // This is a simplified version that creates a basic HTML representation
            content = `
              <html>
                <head>
                  <title>${reportContent.title}</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    h1 { color: #333; }
                    h2 { color: #555; margin-top: 20px; }
                    p { line-height: 1.5; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                  </style>
                </head>
                <body>
                  <h1>${reportContent.title}</h1>
                  <p><strong>Generated:</strong> ${report.date || new Date().toLocaleDateString()
              }</p>
                  <p><strong>Report Type:</strong> ${report.type || "Generated Report"
              }</p>
                  <p>${reportContent.summary}</p>
                  ${(reportContent.sections || [])
                .map(
                  (section) => `
          <h2>${section.title || "Section"}</h2>
          <p>${section.description || ""}</p>
          ${(section.data || []).length > 0 && report.tables
                      ? `
            <table>
              <thead>
                <tr>
                  ${Object.keys(section.data[0])
                        .map(
                          (key) =>
                            `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
                        )
                        .join("")}
                </tr>
              </thead>
              <tbody>
                ${section.data
                        .map(
                          (item) => `
          <tr>
            ${Object.values(item)
                              .map((value) => `<td>${value}</td>`)
                              .join("")}
          </tr>
        `
                        )
                        .join("")}
              </tbody>
            </table>
          `
                      : ""
                    }
        `
                )
                .join("")}
                </body>
              </html>
            `;
            mimeType = "application/pdf";
            fileExtension = "pdf";
            break;

          case "csv":
            // Create CSV content
            const csvRows = [];

            // Add report title and metadata
            csvRows.push(`"${reportContent.title || "Report"}"`);
            csvRows.push(
              `"Generated: ${report.date || new Date().toLocaleDateString('en-GB')}"`
            );
            csvRows.push(`"Report Type: ${report.type || "Generated Report"}"`);
            csvRows.push("");
            csvRows.push(`"${reportContent.summary || ""}"`);
            csvRows.push("");

            // For each section with data
            (reportContent.sections || []).forEach((section) => {
              if (section.data && section.data.length > 0) {
                // Add section header
                csvRows.push(`"${section.title || "Section"}"`);
                csvRows.push(`"${section.description || ""}"`);

                // Add headers
                const headers = Object.keys(section.data[0]);
                csvRows.push(headers.map((header) => `"${header}"`).join(","));

                // Add data rows
                section.data.forEach((item) => {
                  const values = Object.values(item);
                  csvRows.push(values.map((value) => `"${value}"`).join(","));
                });

                // Add empty row between sections
                csvRows.push("");
              }
            });

            content = csvRows.join("\n");
            mimeType = "text/csv";
            fileExtension = "csv";
            break;

          case "excel":
            // For Excel, we'd normally use a library like xlsx
            // This is a simplified version that creates a CSV that Excel can open
            const excelRows = [];

            // Add report title and metadata
            excelRows.push(`"${reportContent.title || "Report"}"`);
            excelRows.push(
              `"Generated: ${report.date || new Date().toLocaleDateString('en-GB')}"`
            );
            excelRows.push(
              `"Report Type: ${report.type || "Generated Report"}"`
            );
            excelRows.push("");
            excelRows.push(`"${reportContent.summary || ""}"`);
            excelRows.push("");

            // For each section with data
            (reportContent.sections || []).forEach((section) => {
              if (section.data && section.data.length > 0) {
                // Add section header
                excelRows.push(`"${section.title || "Section"}"`);
                excelRows.push(`"${section.description || ""}"`);

                // Add headers
                const headers = Object.keys(section.data[0]);
                excelRows.push(
                  headers.map((header) => `"${header}"`).join(",")
                );

                // Add data rows
                section.data.forEach((item) => {
                  const values = Object.values(item);
                  excelRows.push(values.map((value) => `"${value}"`).join(","));
                });

                // Add empty row between sections
                excelRows.push("");
                excelRows.push("");
              }
            });

            content = excelRows.join("\n");
            mimeType = "application/vnd.ms-excel";
            fileExtension = "xlsx";
            break;

          default:
            // Default to text
            content = JSON.stringify(report, null, 2);
            mimeType = "text/plain";
            fileExtension = "txt";
        }

        // Create a blob with the content
        const blob = new Blob([content], { type: mimeType });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(report.name || "report").replace(
          /\s+/g,
          "_"
        )}.${fileExtension}`;

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success toast
        setTimeout(() => {
          toast({
            title: "Download Complete",
            description: `${report.name || "Report"} has been downloaded`,
          });
        }, 0);
      } catch (error) {
        console.log("Download error:", error);
        setTimeout(() => {
          toast({
            title: "Download Failed",
            description:
              "There was an error downloading your report. Please try again.",
            variant: "destructive",
          });
        }, 0);
      }
    }, 1000);
  };

  // Function to handle report printing
  const handlePrintReport = (report = generatedReport) => {
    if (!report) return;

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      toast({
        title: "Preparing Print",
        description: "Formatting report for printing...",
      });
    }, 0);

    setTimeout(() => {
      try {
        // Ensure report has content
        const reportContent = report.content || {
          title: report.name || "Report",
          summary: `${report.type || "Generated"} report.`,
          sections: [],
        };

        // In a real application, this would open the print dialog
        // For this demo, we're creating a printable version in a new window
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${reportContent.title || "Report"}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 30px; }
                  h1 { color: #333; }
                  h2 { color: #555; margin-top: 20px; }
                  p { line-height: 1.5; }
                  table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  @media print {
                    .no-print { display: none; }
                    body { margin: 0; }
                  }
                </style>
              </head>
              <body>
                <div class="no-print" style="margin-bottom: 20px;">
                  <button onclick="window.print()">Print Report</button>
                  <button onclick="window.close()">Close</button>
                </div>
                <h1>${reportContent.title || "Report"}</h1>
                <p><strong>Generated:</strong> ${report.date || new Date().toLocaleDateString()
            }</p>
                <p><strong>Report Type:</strong> ${report.type || "Generated Report"
            }</p>
                <p>${reportContent.summary || ""}</p>
                ${(reportContent.sections || [])
              .map(
                (section) => `
        <h2>${section.title || "Section"}</h2>
        <p>${section.description || ""}</p>
        ${(section.data || []).length > 0 && report.tables
                    ? `
          <table>
            <thead>
              <tr>
                ${Object.keys(section.data[0])
                      .map(
                        (key) =>
                          `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
                      )
                      .join("")}
              </tr>
            </thead>
            <tbody>
              ${section.data
                      .map(
                        (item) => `
        <tr>
          ${Object.values(item)
                            .map((value) => `<td>${value}</td>`)
                            .join("")}
        </tr>
      `
                      )
                      .join("")}
            </tbody>
          </table>
        `
                    : ""
                  }
      `
              )
              .join("")}
              </body>
            </html>
          `);
          printWindow.document.close();
        }

        // Show success toast
        setTimeout(() => {
          toast({
            title: "Print Ready",
            description: "Report has been prepared for printing",
          });
        }, 0);
      } catch (error) {
        console.log("Print error:", error);
        setTimeout(() => {
          toast({
            title: "Print Failed",
            description:
              "There was an error preparing your report for printing. Please try again.",
            variant: "destructive",
          });
        }, 0);
      }
    }, 1000);
  };

  const handlePreviewReport = (report) => {
    if (!report) return;

    // Ensure report has content before showing preview
    if (!report.content) {
      report = {
        ...report,
        content: {
          title: report.name || "Report",
          summary: `${report.type || "Generated"} report from ${report.date || "unknown date"
            }.`,
          sections: [],
        },
      };
    }

    setSelectedReport(report);
    setShowReportPreview(true);
  };

  const handleDeleteReport = (reportId) => {
    if (!reportId) return;

    setRecentReports((prevReports) =>
      prevReports.filter((report) => report.id !== reportId)
    );

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      toast({
        title: "Report Deleted",
        description: "The report has been removed from your recent reports",
      });
    }, 0);
  };

  // Function to handle pausing/resuming a scheduled report
  const handleToggleReportStatus = (reportId) => {
    if (!reportId) return;

    setScheduledReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id === reportId) {
          const newStatus = !report.active;
          // Use setTimeout to avoid state updates during render
          setTimeout(() => {
            toast({
              title: newStatus ? "Report Activated" : "Report Paused",
              description: `${report.name} has been ${newStatus ? "activated" : "paused"
                }`,
            });
          }, 0);
          return { ...report, active: newStatus };
        }
        return report;
      })
    );
  };

  // Function to open the edit dialog for a scheduled report
  const handleEditReport = (report) => {
    if (!report) return;

    setEditingReport({ ...report });
    setShowEditDialog(true);
  };

  // Function to save edited report
  const handleSaveEditedReport = () => {
    if (!editingReport) return;

    setScheduledReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id === editingReport.id) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => {
            toast({
              title: "Report Updated",
              description: `${editingReport.name} has been updated`,
            });
          }, 0);
          return editingReport;
        }
        return report;
      })
    );

    setShowEditDialog(false);
    setEditingReport(null);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reports Center</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass-card border-none shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Generate New Report</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Create custom reports based on your requirements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type" className="font-semibold text-slate-700 dark:text-slate-200">Report Type</Label>
              <Select
                value={selectedReportType}
                onValueChange={setSelectedReportType}
              >
                <SelectTrigger id="report-type" className="glass-tile border border-white/20">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-200">Date Range</Label>
              <DateRangePicker />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-format" className="font-semibold text-slate-700 dark:text-slate-200">Report Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger id="report-format" className="glass-tile border border-white/20">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {reportFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center">
                        {format.icon}
                        {format.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-200">Report Options</Label>
              <div className="flex flex-col space-y-3 p-4 rounded-lg glass-tile border border-white/10">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked)}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                  />
                  <label
                    htmlFor="include-charts"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include charts and visualizations
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="include-tables"
                    checked={includeTables}
                    onCheckedChange={(checked) => setIncludeTables(checked)}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                  />
                  <label
                    htmlFor="include-tables"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include data tables
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="h-fit glass-card border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Reports</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Your recently generated reports</CardDescription>
              </div>
            </div>
            {recentReports.length > 0 && (
              <Badge variant="outline" className="ml-2 glass-tile border border-white/20">
                {recentReports.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all"
                  >
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{report.name}</p>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <span>{report.date}</span>
                        <span className="mx-1">•</span>
                        <Badge variant="secondary" className="text-xs glass-tile border border-white/20">
                          {report.format}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePreviewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePrintReport(report)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No reports generated yet</p>
                <p className="text-sm">Generate a report to see it here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Scheduled Reports</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Manage your automated report generation schedules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4 glass-tile rounded-full p-1 bg-white/30 backdrop-blur-md border border-white/10">
              <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Active Schedules</TabsTrigger>
              <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500 data-[state=active]:text-white">History</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              {scheduledReports.length > 0 ? (
                scheduledReports.map((report) => (
                  <div key={report.id} className="rounded-lg glass-tile border border-white/10 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{report.name}</h3>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          <span>
                            {report.schedule === "Weekly"
                              ? `Every ${report.day}`
                              : `${report.day} of every month`}{" "}
                            at {report.time} • {report.format}
                            <span className="ml-2">
                              <Badge
                                variant={
                                  report.active ? "default" : "secondary"
                                }
                                className={report.active ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "glass-tile border border-white/20"}
                              >
                                {report.active ? "Active" : "Paused"}
                              </Badge>
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                          className="glass-tile border border-white/20"
                        >
                          Edit
                        </Button>
                        <Button
                          variant={report.active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleReportStatus(report.id)}
                          className={report.active ? "glass-tile border border-white/20" : "glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white"}
                        >
                          {report.active ? "Pause" : "Resume"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No scheduled reports</p>
                  <p className="text-sm">Schedule a report to see it here</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="history">
              <div className="text-center py-6 text-muted-foreground">
                <p>Report generation history will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Generation Progress Dialog */}
      {isGenerating && (
        <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generating Report</DialogTitle>
              <DialogDescription>
                Please wait while we generate your report...
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-center mt-2 text-sm text-muted-foreground">
                {generationProgress}% Complete
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Preview Dialog for newly generated report */}
      {generatedReport && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {generatedReport.content?.title || "Report Preview"}
              </DialogTitle>
              <DialogDescription>
                Generated on{" "}
                {generatedReport.date || new Date().toLocaleDateString('en-GB')}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-4">
                {generatedReport.content?.summary ||
                  "Report summary not available."}
              </p>

              {(generatedReport.content?.sections || []).map(
                (section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {section.title || "Section"}
                    </h3>
                    <p className="mb-3">{section.description || ""}</p>

                    {(section.data || []).length > 0 &&
                      generatedReport.tables && (
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(section.data[0]).map((key, i) => (
                                  <th
                                    key={i}
                                    className="px-4 py-2 text-left font-medium"
                                  >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.data.map((item, i) => (
                                <tr
                                  key={i}
                                  className={
                                    i % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  }
                                >
                                  {Object.values(item).map((value, j) => (
                                    <td key={j} className="px-4 py-2 border-t">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                )
              )}
            </div>

            <DialogFooter className="flex sm:justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePrintReport(generatedReport)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReport(generatedReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPreviewDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Preview Dialog for reports from Recent Reports */}
      {selectedReport && (
        <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedReport.content?.title || "Report Preview"}
              </DialogTitle>
              <DialogDescription>
                Generated on{" "}
                {selectedReport.date || new Date().toLocaleDateString('en-GB')}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-4">
                {selectedReport.content?.summary ||
                  "Report summary not available."}
              </p>

              {(selectedReport.content?.sections || []).map(
                (section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {section.title || "Section"}
                    </h3>
                    <p className="mb-3">{section.description || ""}</p>

                    {(section.data || []).length > 0 &&
                      selectedReport.tables && (
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(section.data[0]).map((key, i) => (
                                  <th
                                    key={i}
                                    className="px-4 py-2 text-left font-medium"
                                  >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.data.map((item, i) => (
                                <tr
                                  key={i}
                                  className={
                                    i % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  }
                                >
                                  {Object.values(item).map((value, j) => (
                                    <td key={j} className="px-4 py-2 border-t">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                )
              )}
            </div>

            <DialogFooter className="flex sm:justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePrintReport(selectedReport)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReport(selectedReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowReportPreview(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Scheduled Report Dialog */}
      {editingReport && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Scheduled Report</DialogTitle>
              <DialogDescription>
                Modify your scheduled report settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-report-name">Report Name</Label>
                <input
                  id="edit-report-name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingReport.name}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-report-schedule">Schedule</Label>
                <Select
                  value={editingReport.schedule}
                  onValueChange={(value) =>
                    setEditingReport({ ...editingReport, schedule: value })
                  }
                >
                  <SelectTrigger id="edit-report-schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingReport.schedule === "Weekly" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-report-day">Day of Week</Label>
                  <Select
                    value={editingReport.day}
                    onValueChange={(value) =>
                      setEditingReport({ ...editingReport, day: value })
                    }
                  >
                    <SelectTrigger id="edit-report-day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingReport.schedule === "Monthly" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-report-day">Day of Month</Label>
                  <Select
                    value={editingReport.day}
                    onValueChange={(value) =>
                      setEditingReport({ ...editingReport, day: value })
                    }
                  >
                    <SelectTrigger id="edit-report-day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="15th">15th</SelectItem>
                      <SelectItem value="Last">Last day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-report-time">Time</Label>
                <Select
                  value={editingReport.time}
                  onValueChange={(value) =>
                    setEditingReport({ ...editingReport, time: value })
                  }
                >
                  <SelectTrigger id="edit-report-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                    <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                    <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-report-format">Format</Label>
                <Select
                  value={editingReport.format}
                  onValueChange={(value) =>
                    setEditingReport({ ...editingReport, format: value })
                  }
                >
                  <SelectTrigger id="edit-report-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF Document</SelectItem>
                    <SelectItem value="CSV">CSV Spreadsheet</SelectItem>
                    <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-report-type">Report Type</Label>
                <Select
                  value={editingReport.reportType}
                  onValueChange={(value) =>
                    setEditingReport({ ...editingReport, reportType: value })
                  }
                >
                  <SelectTrigger id="edit-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEditedReport}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
