"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { FileText } from "lucide-react";
import { companyService } from "@/services/companyService";
import { useToast } from "@/components/ui/use-toast";

const initialCompanies = [
  {
    id: "1",
    name: "Acme Corporation",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "1000-5000",
    jobs: 12,
    candidates: 24,
    status: "active",
    website: "https://acme.example.com",
    contactName: "John Smith",
    contactEmail: "john.smith@acme.example.com",
    contactPhone: "+1 (555) 123-4567",
    description:
      "Acme Corporation is a leading technology company specializing in innovative software solutions for enterprise clients.",
    yearFounded: 1985,
    companyType: "Public",
    stockSymbol: "ACME",
    addressLine1: "123 Tech Boulevard",
    city: "San Francisco",
    stateProvince: "CA",
    postalCode: "94105",
    country: "United States",
    linkedIn: "https://linkedin.com/company/acme-corp",
    twitter: "https://twitter.com/acmecorp",
    contactPosition: "HR Director",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 12,
  },
  {
    id: "2",
    name: "Globex Industries",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Manufacturing",
    location: "Chicago, IL",
    size: "5000-10000",
    jobs: 8,
    candidates: 16,
    status: "active",
    website: "https://globex.example.com",
    contactName: "Sarah Johnson",
    contactEmail: "sarah.johnson@globex.example.com",
    contactPhone: "+1 (555) 234-5678",
    description:
      "Globex Industries is a manufacturing powerhouse with cutting-edge facilities across North America.",
    yearFounded: 1972,
    companyType: "Public",
    stockSymbol: "GLX",
    addressLine1: "456 Industrial Parkway",
    city: "Chicago",
    stateProvince: "IL",
    postalCode: "60601",
    country: "United States",
    linkedIn: "https://linkedin.com/company/globex-industries",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 8,
  },
  {
    id: "3",
    name: "Initech Software",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Software",
    location: "Austin, TX",
    size: "500-1000",
    jobs: 15,
    candidates: 30,
    status: "active",
    website: "https://initech.example.com",
    contactName: "Michael Bolton",
    contactEmail: "michael.bolton@initech.example.com",
    contactPhone: "+1 (555) 345-6789",
    description:
      "Initech Software develops enterprise management solutions for businesses of all sizes.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 15,
  },
  {
    id: "4",
    name: "Massive Dynamics",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Technology",
    location: "New York, NY",
    size: "10000+",
    jobs: 25,
    candidates: 50,
    status: "active",
    website: "https://massive.example.com",
    contactName: "Walter Bishop",
    contactEmail: "walter.bishop@massive.example.com",
    contactPhone: "+1 (555) 456-7890",
    description:
      "Massive Dynamics is at the forefront of technological innovation across multiple industries.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 25,
  },
  {
    id: "5",
    name: "Stark Industries",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Engineering",
    location: "Los Angeles, CA",
    size: "5000-10000",
    jobs: 18,
    candidates: 36,
    status: "active",
    website: "https://stark.example.com",
    contactName: "Pepper Potts",
    contactEmail: "pepper.potts@stark.example.com",
    contactPhone: "+1 (555) 567-8901",
    description:
      "Stark Industries leads the world in clean energy and advanced engineering solutions.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 18,
  },
  {
    id: "6",
    name: "Wayne Enterprises",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Conglomerate",
    location: "Gotham City",
    size: "10000+",
    jobs: 10,
    candidates: 20,
    status: "on hold",
    website: "https://wayne.example.com",
    contactName: "Lucius Fox",
    contactEmail: "lucius.fox@wayne.example.com",
    contactPhone: "+1 (555) 678-9012",
    description:
      "Wayne Enterprises is a global conglomerate with interests in technology, healthcare, and urban development.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-amber-100 text-amber-800",
    openJobs: 10,
  },
  {
    id: "7",
    name: "Umbrella Corporation",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Pharmaceuticals",
    location: "Raccoon City",
    size: "5000-10000",
    jobs: 5,
    candidates: 10,
    status: "inactive",
    website: "https://umbrella.example.com",
    contactName: "Albert Wesker",
    contactEmail: "albert.wesker@umbrella.example.com",
    contactPhone: "+1 (555) 789-0123",
    description:
      "Umbrella Corporation is a pharmaceutical company specializing in viral research and bioengineering.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-red-100 text-red-800",
    openJobs: 5,
  },
  {
    id: "8",
    name: "Cyberdyne Systems",
    logo: "/placeholder.svg?height=40&width=40",
    industry: "Robotics",
    location: "Sunnyvale, CA",
    size: "1000-5000",
    jobs: 7,
    candidates: 14,
    status: "active",
    website: "https://cyberdyne.example.com",
    contactName: "Miles Dyson",
    contactEmail: "miles.dyson@cyberdyne.example.com",
    contactPhone: "+1 (555) 890-1234",
    description:
      "Cyberdyne Systems is pioneering the future of robotics and artificial intelligence.",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    statusColor: "bg-green-100 text-green-800",
    openJobs: 7,
  },
];

const initialJobs = {
  1: [
    {
      id: "1",
      companyId: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      applicants: 24,
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      postedDate: "2023-05-15",
      deadline: "2023-06-15",
      description:
        "We are looking for a Senior Software Engineer to join our team...",
      requirements: "5+ years of experience in software development...",
      responsibilities: "Design and implement new features...",
      benefits: "Competitive salary, health insurance, 401k...",
    },
    {
      id: "2",
      companyId: "1",
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      applicants: 18,
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      postedDate: "2023-05-10",
      deadline: "2023-06-10",
      description: "We are looking for a Product Manager to join our team...",
      requirements: "3+ years of experience in product management...",
      responsibilities: "Define product vision and strategy...",
      benefits: "Competitive salary, health insurance, 401k...",
    },
    {
      id: "3",
      companyId: "1",
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      applicants: 12,
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      postedDate: "2023-05-05",
      deadline: "2023-06-05",
      description: "We are looking for a UX Designer to join our team...",
      requirements: "3+ years of experience in UX design...",
      responsibilities: "Create user-centered designs...",
      benefits: "Competitive salary, health insurance, 401k...",
    },
  ],
  2: [
    {
      id: "4",
      companyId: "2",
      title: "Manufacturing Engineer",
      department: "Engineering",
      location: "Chicago, IL",
      type: "Full-time",
      applicants: 15,
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      postedDate: "2023-05-20",
      deadline: "2023-06-20",
      description:
        "We are looking for a Manufacturing Engineer to join our team...",
      requirements: "5+ years of experience in manufacturing engineering...",
      responsibilities: "Optimize manufacturing processes...",
      benefits: "Competitive salary, health insurance, 401k...",
    },
  ],
};

const initialDocuments = {
  1: [
    {
      id: "1",
      companyId: "1",
      name: "Master Service Agreement",
      type: "pdf",
      size: "3.2 MB",
      uploadedBy: "Robert Kim",
      uploadedDate: "2023-05-10",
      category: "Legal",
      tags: ["Contract", "Legal"],
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
    },
    {
      id: "2",
      companyId: "1",
      name: "Recruitment Strategy Presentation",
      type: "pptx",
      size: "5.7 MB",
      uploadedBy: "Sarah Johnson",
      uploadedDate: "2023-06-15",
      category: "Strategy",
      tags: ["Presentation", "Planning"],
      icon: FileText,
      iconColor: "text-orange-500",
      url: "#",
    },
    {
      id: "3",
      companyId: "1",
      name: "Job Descriptions Package",
      type: "zip",
      size: "8.1 MB",
      uploadedBy: "Michael Chen",
      uploadedDate: "2023-07-01",
      category: "Job Descriptions",
      tags: ["Templates", "Jobs"],
      icon: FileText,
      iconColor: "text-yellow-500",
      url: "#",
    },
  ],
};

const CompaniesContext = createContext();

export function CompaniesProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState({});
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [companyJobs, setCompanyJobs] = useState({});
  const [jobsLoading, setJobsLoading] = useState({});
  const { toast } = useToast();

  // Add state for available filter values
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Default filter values
  const defaultFilterValues = {
    industries: [
      "Technology",
      "Manufacturing",
      "Software",
      "Engineering",
      "Pharmaceuticals",
      "Conglomerate",
      "Robotics",
    ],
    locations: [
      "San Francisco, CA",
      "Chicago, IL",
      "Austin, TX",
      "New York, NY",
      "Los Angeles, CA",
      "Gotham City",
      "Raccoon City",
      "Sunnyvale, CA",
    ],
    sizes: [
      { id: "1-50", label: "1-50 employees" },
      { id: "51-200", label: "51-200 employees" },
      { id: "201-500", label: "201-500 employees" },
      { id: "501-1000", label: "501-1000 employees" },
      { id: "1001-5000", label: "1001-5000 employees" },
      { id: "5001-10000", label: "5001-10000 employees" },
      { id: "10001+", label: "10001+ employees" },
    ],
    statuses: ["active", "on hold", "inactive"],
  };

  // Initialize with default values
  useEffect(() => {
    setAvailableIndustries(defaultFilterValues.industries);
    setAvailableLocations(defaultFilterValues.locations);
    setAvailableSizes(defaultFilterValues.sizes);
    setAvailableStatuses(defaultFilterValues.statuses);
  }, []);

  // Fetch companies on initial load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const result = await companyService.getAllCompanies();
        const fetchedCompanies = result.companies || [];
        setCompanies(fetchedCompanies);

        // Extract unique values for filters
        const uniqueIndustries = [
          ...new Set(fetchedCompanies.map((company) => company.industry)),
        ].filter(Boolean);
        const uniqueLocations = [
          ...new Set(fetchedCompanies.map((company) => company.location)),
        ].filter(Boolean);
        const uniqueStatuses = [
          ...new Set(fetchedCompanies.map((company) => company.status)),
        ].filter(Boolean);

        // Set available filter values, fallback to defaults if empty
        setAvailableIndustries(
          uniqueIndustries.length > 0
            ? uniqueIndustries
            : defaultFilterValues.industries
        );
        setAvailableLocations(
          uniqueLocations.length > 0
            ? uniqueLocations
            : defaultFilterValues.locations
        );
        setAvailableStatuses(
          uniqueStatuses.length > 0
            ? uniqueStatuses
            : defaultFilterValues.statuses
        );

        // Calculate available sizes based on company data
        const availableSizes = [];
        const sizeRanges = [
          { id: "1-50", min: 1, max: 50 },
          { id: "51-200", min: 51, max: 200 },
          { id: "201-500", min: 201, max: 500 },
          { id: "501-1000", min: 501, max: 1000 },
          { id: "1001-5000", min: 1001, max: 5000 },
          { id: "5001-10000", min: 5001, max: 10000 },
          { id: "10001+", min: 10001, max: Infinity },
        ];

        sizeRanges.forEach((range) => {
          const hasCompaniesInRange = fetchedCompanies.some((company) => {
            const size = parseInt(company.size.split("-")[0]);
            return size >= range.min && size <= range.max;
          });
          if (hasCompaniesInRange) {
            availableSizes.push({
              id: range.id,
              label: `${range.min}-${
                range.max === Infinity ? "+" : range.max
              } employees`,
            });
          }
        });

        setAvailableSizes(
          availableSizes.length > 0 ? availableSizes : defaultFilterValues.sizes
        );
      } catch (err) {
        console.log("Failed to fetch companies:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load companies. Using sample data instead.",
          variant: "destructive",
        });
        setCompanies(initialCompanies);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  const getCompanyById = useCallback(
    async (id) => {
      try {
        const company = await companyService.getCompanyById(id);
        return company;
      } catch (err) {
        console.log(`Failed to fetch company ${id}:`, err);
        // Fallback to local state
        return companies.find((company) => company.id === id);
      }
    },
    [companies]
  );

  const validateCompanyData = useCallback((company) => {
    const errors = {};
    if (!company.name?.trim()) errors.name = "Company name is required";
    if (!company.industry?.trim()) errors.industry = "Industry is required";
    if (!company.location?.trim()) errors.location = "Location is required";
    if (!company.status) errors.status = "Status is required";
    if (!company.size?.trim()) errors.size = "Company size is required";
    if (
      company.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        company.website
      )
    ) {
      errors.website = "Please enter a valid website URL";
    }
    if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (
      company.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.contactEmail)
    ) {
      errors.contactEmail = "Please enter a valid contact email address";
    }
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (company.phone && !phoneRegex.test(company.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (company.contactPhone && !phoneRegex.test(company.contactPhone)) {
      errors.contactPhone = "Please enter a valid contact phone number";
    }
    if (company.linkedIn && !company.linkedIn.includes("linkedin.com")) {
      errors.linkedIn = "Please enter a valid LinkedIn URL";
    }
    if (
      company.twitter &&
      !company.twitter.includes("twitter.com") &&
      !company.twitter.includes("x.com")
    ) {
      errors.twitter = "Please enter a valid Twitter/X URL";
    }
    if (company.facebook && !company.facebook.includes("facebook.com")) {
      errors.facebook = "Please enter a valid Facebook URL";
    }
    if (company.instagram && !company.instagram.includes("instagram.com")) {
      errors.instagram = "Please enter a valid Instagram URL";
    }
    if (company.yearFounded) {
      const currentYear = new Date().getFullYear();
      if (company.yearFounded < 1800 || company.yearFounded > currentYear) {
        errors.yearFounded = `Year must be between 1800 and ${currentYear}`;
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }, []);

  const addCompany = useCallback(
    async (company) => {
      try {
        const newCompany = await companyService.createCompany(company);

        setCompanies((prev) => {
          const updatedCompanies = [...prev, newCompany];

          // Update available filter values
          const uniqueIndustries = [
            ...new Set(updatedCompanies.map((c) => c.industry)),
          ].filter(Boolean);
          const uniqueLocations = [
            ...new Set(updatedCompanies.map((c) => c.location)),
          ].filter(Boolean);
          const uniqueStatuses = [
            ...new Set(updatedCompanies.map((c) => c.status)),
          ].filter(Boolean);

          // Update available filter values
          setAvailableIndustries(
            uniqueIndustries.length > 0
              ? uniqueIndustries
              : defaultFilterValues.industries
          );
          setAvailableLocations(
            uniqueLocations.length > 0
              ? uniqueLocations
              : defaultFilterValues.locations
          );
          setAvailableStatuses(
            uniqueStatuses.length > 0
              ? uniqueStatuses
              : defaultFilterValues.statuses
          );

          // Calculate available sizes
          const availableSizes = [];
          const sizeRanges = [
            { id: "1-50", min: 1, max: 50 },
            { id: "51-200", min: 51, max: 200 },
            { id: "201-500", min: 201, max: 500 },
            { id: "501-1000", min: 501, max: 1000 },
            { id: "1001-5000", min: 1001, max: 5000 },
            { id: "5001-10000", min: 5001, max: 10000 },
            { id: "10001+", min: 10001, max: Infinity },
          ];

          sizeRanges.forEach((range) => {
            const hasCompaniesInRange = updatedCompanies.some((c) => {
              // Extract the first number from the size string (e.g., "501-1000 employees" -> 501)
              const sizeMatch = c.size.match(/^(\d+)/);
              if (!sizeMatch) return false;
              const size = parseInt(sizeMatch[1]);
              return size >= range.min && size <= range.max;
            });
            if (hasCompaniesInRange) {
              availableSizes.push({
                id: range.id,
                label: `${range.min}-${
                  range.max === Infinity ? "+" : range.max
                } employees`,
              });
            }
          });

          setAvailableSizes(
            availableSizes.length > 0
              ? availableSizes
              : defaultFilterValues.sizes
          );

          return updatedCompanies;
        });

        toast({
          title: "Success",
          description: "Company created successfully",
        });

        return newCompany;
      } catch (err) {
        console.log("Failed to create company:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to create company",
          variant: "destructive",
        });

        // Fallback to local state
        const newCompany = {
          ...company,
          id: `company-${Date.now()}`,
          jobs: 0,
          candidates: 0,
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusColor: getStatusColor(company.status || "active"),
          openJobs: 0,
        };

        setCompanies((prev) => {
          const updatedCompanies = [...prev, newCompany];

          // Update available filter values
          const uniqueIndustries = [
            ...new Set(updatedCompanies.map((c) => c.industry)),
          ].filter(Boolean);
          const uniqueLocations = [
            ...new Set(updatedCompanies.map((c) => c.location)),
          ].filter(Boolean);
          const uniqueStatuses = [
            ...new Set(updatedCompanies.map((c) => c.status)),
          ].filter(Boolean);

          // Update available filter values
          setAvailableIndustries(
            uniqueIndustries.length > 0
              ? uniqueIndustries
              : defaultFilterValues.industries
          );
          setAvailableLocations(
            uniqueLocations.length > 0
              ? uniqueLocations
              : defaultFilterValues.locations
          );
          setAvailableStatuses(
            uniqueStatuses.length > 0
              ? uniqueStatuses
              : defaultFilterValues.statuses
          );

          // Calculate available sizes
          const availableSizes = [];
          const sizeRanges = [
            { id: "1-50", min: 1, max: 50 },
            { id: "51-200", min: 51, max: 200 },
            { id: "201-500", min: 201, max: 500 },
            { id: "501-1000", min: 501, max: 1000 },
            { id: "1001-5000", min: 1001, max: 5000 },
            { id: "5001-10000", min: 5001, max: 10000 },
            { id: "10001+", min: 10001, max: Infinity },
          ];

          sizeRanges.forEach((range) => {
            const hasCompaniesInRange = updatedCompanies.some((c) => {
              // Extract the first number from the size string (e.g., "501-1000 employees" -> 501)
              const sizeMatch = c.size.match(/^(\d+)/);
              if (!sizeMatch) return false;
              const size = parseInt(sizeMatch[1]);
              return size >= range.min && size <= range.max;
            });
            if (hasCompaniesInRange) {
              availableSizes.push({
                id: range.id,
                label: `${range.min}-${
                  range.max === Infinity ? "+" : range.max
                } employees`,
              });
            }
          });

          setAvailableSizes(
            availableSizes.length > 0
              ? availableSizes
              : defaultFilterValues.sizes
          );

          return updatedCompanies;
        });

        return newCompany;
      }
    },
    [toast]
  );

  const updateCompany = useCallback(
    async (id, data) => {
      try {
        const updatedCompany = await companyService.updateCompany(id, data);

        setCompanies((prev) =>
          prev.map((company) =>
            company.id === id ? { ...company, ...updatedCompany } : company
          )
        );

        toast({
          title: "Success",
          description: "Company updated successfully",
        });

        return updatedCompany;
      } catch (err) {
        console.log(`Failed to update company ${id}:`, err);
        toast({
          title: "Error",
          description: err.message || "Failed to update company",
          variant: "destructive",
        });

        // Fallback to local state
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === id ? { ...company, ...data } : company
          )
        );
      }
    },
    [toast]
  );

  const deleteCompany = useCallback(
    async (id) => {
      try {
        await companyService.deleteCompany(id);

        setCompanies((prev) => prev.filter((company) => company.id !== id));
        setJobs((prev) => {
          const newJobs = { ...prev };
          delete newJobs[id];
          return newJobs;
        });
        setDocuments((prev) => {
          const newDocuments = { ...prev };
          delete newDocuments[id];
          return newDocuments;
        });

        toast({
          title: "Success",
          description: "Company deleted successfully",
        });
      } catch (err) {
        console.log(`Failed to delete company ${id}:`, err);
        toast({
          title: "Error",
          description: err.message || "Failed to delete company",
          variant: "destructive",
        });

        // Fallback to local state
        setCompanies((prev) => prev.filter((company) => company.id !== id));
        // Also remove related data
        setJobs((prev) => {
          const newJobs = { ...prev };
          delete newJobs[id];
          return newJobs;
        });
        setDocuments((prev) => {
          const newDocuments = { ...prev };
          delete newDocuments[id];
          return newDocuments;
        });
      }
    },
    [toast]
  );

  const getJobsByCompanyId = useCallback(
    async (companyId) => {
      try {
        const response = await companyService.getCompanyJobs(companyId);
        console.log("[CompaniesContext] Raw API response:", response);

        // The API returns { jobs: [], totalJobs: number, totalPages: number, currentPage: number }
        const companyJobs = response?.jobs || [];

        // Normalize job data
        const normalizedJobs = companyJobs.map((job) => ({
          ...job,
          jobTitle: job.jobTitle || job.title,
          title: job.jobTitle || job.title,
          jobType: job.jobType || job.type,
          type: job.jobType || job.type,
          jobStatus: job.jobStatus || job.status,
          status: job.jobStatus || job.status,
          statusColor: getStatusColor(job.jobStatus || job.status),
        }));

        console.log("[CompaniesContext] Fetched and normalized company jobs:", {
          companyId,
          totalJobs: response?.totalJobs || 0,
          currentPage: response?.currentPage || 1,
          totalPages: response?.totalPages || 1,
          jobs: normalizedJobs,
        });

        // Update local state
        setJobs((prev) => ({
          ...prev,
          [companyId]: normalizedJobs,
        }));

        return normalizedJobs;
      } catch (err) {
        console.log("[CompaniesContext] Failed to fetch jobs:", err);
        // Fallback to local state
        return jobs[companyId] || [];
      }
    },
    [jobs]
  );

  const getJobById = useCallback(
    (companyId, jobId) => {
      return (jobs[companyId] || []).find((job) => job.id === jobId);
    },
    [jobs]
  );

  const addJob = useCallback(
    async (companyId, jobData) => {
      try {
        // Ensure consistent job data structure
        const normalizedJobData = {
          ...jobData,
          jobTitle: jobData.jobTitle || jobData.title,
          title: jobData.jobTitle || jobData.title,
          jobType: jobData.jobType || jobData.type,
          type: jobData.jobType || jobData.type,
          jobStatus: jobData.jobStatus || jobData.status || "Active",
          status: jobData.jobStatus || jobData.status || "Active",
          postedDate: jobData.postedDate || null,
        };

        console.log(
          "[CompaniesContext] Adding job with normalized data:",
          normalizedJobData
        );

        const newJob = await companyService.addCompanyJob(
          companyId,
          normalizedJobData
        );

        console.log("[CompaniesContext] Job added successfully:", newJob);

        // Update local state
        setJobs((prev) => ({
          ...prev,
          [companyId]: [newJob, ...(prev[companyId] || [])],
        }));

        // Update company open jobs count
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, openJobs: (company.openJobs || 0) + 1 }
              : company
          )
        );

        toast({
          title: "Success",
          description: "Job added successfully",
        });

        return newJob;
      } catch (err) {
        console.log("[CompaniesContext] Failed to add job:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to add job",
          variant: "destructive",
        });

        // Fallback to local state with normalized data
        const statusColor = getStatusColor(
          jobData.jobStatus || jobData.status || "Active"
        );
        const newJob = {
          id: `job-${Date.now()}`,
          companyId,
          jobTitle: jobData.jobTitle || jobData.title,
          title: jobData.jobTitle || jobData.title,
          jobType: jobData.jobType || jobData.type,
          type: jobData.jobType || jobData.type,
          jobStatus: jobData.jobStatus || jobData.status || "Active",
          status: jobData.jobStatus || jobData.status || "Active",
          postedDate: jobData.postedDate || null,
          ...jobData,
          statusColor,
        };

        setJobs((prev) => ({
          ...prev,
          [companyId]: [newJob, ...(prev[companyId] || [])],
        }));
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, openJobs: (company.openJobs || 0) + 1 }
              : company
          )
        );
        return newJob;
      }
    },
    [toast]
  );

  const updateJob = useCallback((companyId, jobId, data) => {
    // Normalize job data for update
    const normalizedData = {
      ...data,
      jobTitle: data.jobTitle || data.title,
      title: data.jobTitle || data.title,
      jobType: data.jobType || data.type,
      type: data.jobType || data.type,
      jobStatus: data.jobStatus || data.status,
      status: data.jobStatus || data.status,
    };

    setJobs((prev) => ({
      ...prev,
      [companyId]: (prev[companyId] || []).map((job) =>
        job.id === jobId
          ? {
              ...job,
              ...normalizedData,
              statusColor:
                normalizedData.jobStatus || normalizedData.status
                  ? getStatusColor(
                      normalizedData.jobStatus || normalizedData.status
                    )
                  : job.statusColor,
            }
          : job
      ),
    }));
  }, []);

  const deleteJob = useCallback(
    async (companyId, jobId) => {
      try {
        await companyService.deleteCompanyJob(companyId, jobId);

        // Update local state
        setJobs((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).filter(
            (job) => job.id !== jobId
          ),
        }));

        // Update company open jobs count
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  openJobs: Math.max(0, (company.openJobs || 0) - 1),
                }
              : company
          )
        );

        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
      } catch (err) {
        console.log(
          `Failed to delete job ${jobId} for company ${companyId}:`,
          err
        );
        toast({
          title: "Error",
          description: err.message || "Failed to delete job",
          variant: "destructive",
        });

        // Fallback to local state
        setJobs((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).filter(
            (job) => job.id !== jobId
          ),
        }));
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  openJobs: Math.max(0, (company.openJobs || 0) - 1),
                }
              : company
          )
        );
      }
    },
    [toast]
  );

  const getDocumentsByCompanyId = useCallback(
    async (companyId) => {
      try {
        const companyDocuments = await companyService.getCompanyDocuments(
          companyId
        );

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: companyDocuments,
        }));

        return companyDocuments;
      } catch (err) {
        console.log(`Failed to fetch documents for company ${companyId}:`, err);
        // Fallback to local state
        return documents[companyId] || [];
      }
    },
    [documents]
  );

  const getDocumentById = useCallback(
    (companyId, documentId) =>
      (documents[companyId] || []).find((doc) => doc.id === documentId),
    [documents]
  );

  const addDocument = useCallback(
    async (companyId, documentData) => {
      try {
        const newDocument = await companyService.addCompanyDocument(
          companyId,
          documentData
        );

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: [newDocument, ...(prev[companyId] || [])],
        }));

        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });

        return newDocument;
      } catch (err) {
        console.log(`Failed to add document for company ${companyId}:`, err);
        toast({
          title: "Error",
          description: err.message || "Failed to upload document",
          variant: "destructive",
        });

        // Fallback to local state
        const newDocument = {
          id: `doc-${Date.now()}`,
          companyId,
          ...documentData,
        };
        setDocuments((prev) => ({
          ...prev,
          [companyId]: [newDocument, ...(prev[companyId] || [])],
        }));
        return newDocument;
      }
    },
    [toast]
  );

  const updateDocument = useCallback(
    async (companyId, documentId, data) => {
      try {
        const updatedDocument = await companyService.updateCompanyDocument(
          companyId,
          documentId,
          data
        );

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).map((doc) =>
            doc.id === documentId ? { ...doc, ...updatedDocument } : doc
          ),
        }));

        toast({
          title: "Success",
          description: "Document updated successfully",
        });

        return updatedDocument;
      } catch (err) {
        console.log(
          `Failed to update document ${documentId} for company ${companyId}:`,
          err
        );
        toast({
          title: "Error",
          description: err.message || "Failed to update document",
          variant: "destructive",
        });

        // Fallback to local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).map((doc) =>
            doc.id === documentId ? { ...doc, ...data } : doc
          ),
        }));
      }
    },
    [toast]
  );

  const deleteDocument = useCallback(
    async (companyId, documentId) => {
      try {
        await companyService.deleteCompanyDocument(companyId, documentId);

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).filter(
            (doc) => doc.id !== documentId
          ),
        }));

        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (err) {
        console.log(
          `Failed to delete document ${documentId} for company ${companyId}:`,
          err
        );
        toast({
          title: "Error",
          description: err.message || "Failed to delete document",
          variant: "destructive",
        });

        // Fallback to local state
        setDocuments((prev) => ({
          ...prev,
          [companyId]: (prev[companyId] || []).filter(
            (doc) => doc.id !== documentId
          ),
        }));
      }
    },
    [toast]
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on hold":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchCompanyJobs = async (companyId) => {
    if (!companyId) return;

    try {
      setJobsLoading((prev) => ({ ...prev, [companyId]: true }));
      const response = await companyService.getCompanyJobs(companyId);
      setCompanyJobs((prev) => ({ ...prev, [companyId]: response.jobs }));
      return response;
    } catch (error) {
      console.log("Error fetching company jobs:", error);
      throw error;
    } finally {
      setJobsLoading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  const addCompanyJob = async (companyId, jobData) => {
    try {
      const response = await companyService.addCompanyJob(companyId, jobData);
      setCompanyJobs((prev) => ({
        ...prev,
        [companyId]: [...(prev[companyId] || []), response],
      }));

      // Update company's job count
      await updateCompany(companyId, {
        openJobs:
          (companies.find((c) => c.id === companyId)?.openJobs || 0) + 1,
      });

      return response;
    } catch (error) {
      console.log("Error adding company job:", error);
      throw error;
    }
  };

  const deleteCompanyJob = async (companyId, jobId) => {
    try {
      await companyService.deleteCompanyJob(companyId, jobId);
      setCompanyJobs((prev) => ({
        ...prev,
        [companyId]: (prev[companyId] || []).filter((job) => job.id !== jobId),
      }));

      // Update company's job count
      await updateCompany(companyId, {
        openJobs:
          (companies.find((c) => c.id === companyId)?.openJobs || 0) - 1,
      });
    } catch (error) {
      console.log("Error deleting company job:", error);
      throw error;
    }
  };

  const value = {
    companies,
    loading,
    error,
    activeCompanyId,
    setActiveCompanyId,
    companyJobs,
    jobsLoading,
    availableIndustries,
    availableLocations,
    availableSizes,
    availableStatuses,
    getCompanyById,
    validateCompanyData,
    addCompany,
    updateCompany,
    deleteCompany,
    getJobsByCompanyId,
    getJobById,
    addJob,
    updateJob,
    deleteJob,
    getDocumentsByCompanyId,
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    fetchCompanyJobs,
    addCompanyJob,
    deleteCompanyJob,
  };

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error("useCompanies must be used within a CompaniesProvider");
  }
  return context;
}
