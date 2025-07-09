import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { PDFExtract } from "pdf.js-extract";
import mammoth from "mammoth";

const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: "gemini-2.5-flash-lite-preview-06-17"
});

const pdfExtract = new PDFExtract();
const options = {};

/**
 * Parse a resume file (PDF or DOCX) and extract candidate information
 * @param {string} filePath - Path to the resume file
 * @param {string} fileName - Original filename
 * @returns {Promise<Object>} Parsed candidate data
 */
export async function parseResume(filePath, fileName) {
    try {
        console.log(`[ResumeParserService] Starting to parse resume: ${fileName}`);

        // Extract text from the resume file
        const resumeText = await extractTextFromFile(filePath, fileName);

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error("Could not extract text from resume file");
        }

        console.log(`[ResumeParserService] Extracted text length: ${resumeText.length} characters`);

        // Parse the extracted text using Gemini AI
        const parsedData = await parseWithAI(resumeText, fileName);

        console.log(`[ResumeParserService] Successfully parsed resume for: ${parsedData.name || 'Unknown'}`);

        return parsedData;
    } catch (error) {
        console.log(`[ResumeParserService] Error parsing resume ${fileName}:`, error);
        throw new Error(`Failed to parse resume: ${error.message}`);
    }
}

/**
 * Extract text from PDF or DOCX file
 * @param {string} filePath - Path to the file
 * @param {string} fileName - Original filename
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(filePath, fileName) {
    console.log(`[ResumeParserService] extractTextFromFile called with:`, { filePath, fileName });

    if (!fileName) {
        // Try to get filename from path
        fileName = path.basename(filePath);
        console.log(`[ResumeParserService] Using filename from path: ${fileName}`);
    }

    const fileExtension = path.extname(fileName).toLowerCase();
    console.log(`[ResumeParserService] File extension: ${fileExtension}`);

    try {
        if (fileExtension === '.pdf') {
            return await extractTextFromPDF(filePath);
        } else if (fileExtension === '.docx' || fileExtension === '.doc') {
            return await extractTextFromDOCX(filePath);
        } else {
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }
    } catch (error) {
        console.log(`[ResumeParserService] Error extracting text from ${fileName}:`, error);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(filePath) {
    try {
        const data = await pdfExtract.extract(filePath, options);
        return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
}

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
}

/**
 * Parse resume text using Gemini AI
 * @param {string} resumeText - Extracted text from resume
 * @param {string} fileName - Original filename
 * @returns {Promise<Object>} Parsed candidate data
 */
export async function parseWithAI(resumeText, fileName) {
    try {
        const prompt = `You are an expert resume parser with deep understanding of recruitment and HR processes. Your task is to extract comprehensive candidate information from the provided resume text with maximum accuracy and completeness.

CONTEXT: You are analyzing a professional resume to extract structured candidate data for an Applicant Tracking System (ATS). Accuracy and completeness are critical for successful candidate matching and recruitment processes.

RESUME TEXT TO ANALYZE:
"""
${resumeText}
"""

DETAILED EXTRACTION PROTOCOL:

1. PERSONAL INFORMATION EXTRACTION:
   - NAME: Identify the candidate's full name (first + last + middle if present). Look for the largest/boldest name at the top, or in header sections. Common patterns: "John Doe", "JANE SMITH", "Name: John Doe"
   - EMAIL: Extract the primary professional email. Look for patterns like "email@domain.com", "john.doe@company.com". If multiple emails exist, prioritize the most professional one.
   - PHONE: Find the primary contact number. Look for formats: "+1-555-123-4567", "(555) 123-4567", "555.123.4567". Include country code if present.
   - LOCATION: Extract current location in "City, State, Country" format. Look for "Location:", "Address:", or city/state combinations.

2. PROFESSIONAL PROFILE ANALYSIS:
   - POSITION: Extract current job title or desired position. Search for: "Current Role:", "Desired Position:", "Objective:", "Target Role:", or the most recent job title in experience section.
   - BIO: Extract the complete professional summary/objective. Look for sections titled: "Summary", "Profile", "About", "Objective", "Professional Summary". Include the full text without truncation.
   - CURRENT COMPANY: Extract the company name from the most recent work experience entry.
   - CURRENT ROLE: Extract the job title from the most recent work experience entry.

3. DIGITAL PRESENCE MAPPING:
   - LINKEDIN: Search for LinkedIn URLs. Common patterns: "linkedin.com/in/username", "LinkedIn: linkedin.com/in/username"
   - GITHUB: Find GitHub profile URLs. Look for: "github.com/username", "GitHub: github.com/username"
   - PORTFOLIO: Identify personal website or portfolio. Search for: "portfolio.com", "www.username.com", "Personal Website:", "Portfolio:"

4. COMPREHENSIVE SKILLS EXTRACTION:
   - TECHNICAL SKILLS: Extract all programming languages, frameworks, tools, technologies. Look for sections: "Technical Skills", "Programming Languages", "Technologies", "Tools & Technologies", "Tech Stack"
   - SOFT SKILLS: Extract communication, leadership, project management, and interpersonal skills. Look for: "Soft Skills", "Interpersonal Skills", "Leadership", "Communication"
   - DOMAIN SKILLS: Extract industry-specific skills, methodologies, certifications. Look for: "Domain Knowledge", "Methodologies", "Certifications"
   - Remove duplicates, normalize skill names, and categorize appropriately
   - IMPORTANT: Extract skills from both dedicated skills sections AND from job descriptions, project descriptions, and other relevant sections

5. EDUCATION HISTORY MAPPING:
   - DEGREE: Extract complete degree information: "Bachelor of Science", "Master of Business Administration", "PhD in Computer Science"
   - INSTITUTION: Extract full university/college name: "Massachusetts Institute of Technology", "Stanford University"
   - FIELD OF STUDY: Extract major/specialization: "Computer Science", "Business Administration", "Data Science"
   - DATES: Use YYYY-MM format. For ongoing education, use "Present" as end date
   - LOCATION: Extract institution location: "Cambridge, MA", "Stanford, CA"
   - GPA: If mentioned, include in description
   - HONORS: If mentioned (Dean's List, Honors, etc.), include in description
   - IMPORTANT: Look for education information in various sections: "Education", "Academic Background", "Qualifications", "Degrees"

6. WORK EXPERIENCE DETAILED EXTRACTION:
   - TITLE: Extract complete job title: "Senior Software Engineer", "Product Manager", "Data Scientist"
   - COMPANY: Extract full company name: "Google Inc.", "Microsoft Corporation"
   - LOCATION: Extract work location: "San Francisco, CA", "Remote", "New York, NY"
   - DATES: Use YYYY-MM format. For current roles, use "Present" as end date
   - DESCRIPTION: Extract comprehensive job description including responsibilities, achievements, technologies used, team size, project scope
   - IS CURRENT ROLE: Set to true for the most recent position, false for all others
   - ACHIEVEMENTS: Include quantifiable achievements, metrics, and impact
   - IMPORTANT: Look for experience in sections like: "Work Experience", "Professional Experience", "Employment History", "Career History"

7. CERTIFICATION DETAILED EXTRACTION:
   - CERTIFICATION NAME: Extract full certification name: "AWS Certified Solutions Architect", "PMP Certification"
   - ISSUING ORGANIZATION: Extract certifying body: "Amazon Web Services", "Project Management Institute"
   - ISSUE DATE: Use YYYY-MM format when available
   - EXPIRY DATE: Use YYYY-MM format if mentioned, otherwise null
   - CERTIFICATION ID: If mentioned, include in description
   - IMPORTANT: Look for certifications in sections like: "Certifications", "Licenses", "Professional Certifications", "Credentials"

8. EXTRACURRICULAR & VOLUNTEER ACTIVITIES:
   - TITLE: Extract role/position: "President", "Volunteer Coordinator", "Team Lead"
   - ORGANIZATION: Extract organization name: "Student Council", "Red Cross", "Local Food Bank"
   - DESCRIPTION: Extract detailed description of responsibilities, impact, and duration
   - IMPORTANT: Look for activities in sections like: "Volunteer Work", "Community Service", "Leadership", "Activities", "Involvement"

ADVANCED DATA PROCESSING RULES:
- TEXT NORMALIZATION: Remove extra whitespace, normalize line breaks, clean special characters
- DATE STANDARDIZATION: Convert all dates to YYYY-MM format. Handle various formats: "Jan 2020", "01/2020", "2020-01", "January 2020"
- EMAIL VALIDATION: Ensure proper email format, remove extra spaces
- PHONE CLEANING: Remove parentheses, dashes, dots, keep only digits and plus sign
- LOCATION FORMATTING: Standardize to "City, State, Country" format
- SKILL DEDUPLICATION: Remove exact duplicates, normalize variations (e.g., "JavaScript" vs "JS")
- BIO COMPLETENESS: Extract the entire professional summary without truncation
- CURRENT ROLE DETECTION: Analyze date patterns to identify current vs past positions
- SECTION DETECTION: Be thorough in finding information across all sections of the resume, not just obvious headers

QUALITY ASSURANCE CHECKS:
- Verify email format is valid
- Ensure phone number contains only valid characters
- Confirm dates are in correct format
- Validate that arrays contain proper objects
- Check that required fields are not empty strings
- Ensure boolean values are properly set
- Verify JSON structure is valid
- Ensure all sections are thoroughly searched for relevant information

RETURN FORMAT:
Return ONLY a valid JSON object with this exact structure:

{
  "name": "string",
  "email": "string",
  "phone": "string", 
  "location": "string",
  "position": "string",
  "bio": "text",
  "currentCompany": "string",
  "currentRole": "string",
  "linkedInProfile": "string",
  "githubProfile": "string",
  "portfolioUrl": "string",
  "skills": ["string"],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "fieldOfStudy": "string", 
      "startDate": "string",
      "endDate": "string",
      "location": "string"
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string", 
      "description": "string",
      "isCurrentRole": boolean
    }
  ],
  "certifications": [
    {
      "certificationName": "string",
      "issuingOrganization": "string",
      "issueDate": "string",
      "expiryDate": "string"
    }
  ],
  "extraCurricular": [
    {
      "title": "string",
      "organization": "string",
      "description": "string"
    }
  ]
}

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object - no explanations, no additional text
- Ensure all field mappings are accurate and complete
- Extract maximum information available in the resume
- Maintain data quality and consistency
- Handle edge cases and missing information gracefully
- Be extremely thorough in searching all sections of the resume for relevant information
- If a section is not explicitly mentioned, still search for related information throughout the document`;

        console.log(`[ResumeParserService] Sending resume to Gemini for parsing`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`[ResumeParserService] Raw Gemini response received`);

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON object found in AI response");
        }

        const jsonStr = jsonMatch[0];
        const parsedData = JSON.parse(jsonStr);

        // Validate and clean the parsed data
        return validateAndCleanParsedData(parsedData);
    } catch (error) {
        console.log(`[ResumeParserService] AI parsing error:`, error);
        throw new Error(`AI parsing failed: ${error.message}`);
    }
}

/**
 * Validate and clean parsed data
 * @param {Object} parsedData - Raw parsed data from AI
 * @returns {Object} Cleaned and validated data
 */
export function validateAndCleanParsedData(parsedData) {
    const cleaned = {
        name: cleanString(parsedData.name),
        email: cleanString(parsedData.email),
        phone: cleanString(parsedData.phone),
        location: cleanString(parsedData.location),
        position: cleanString(parsedData.position),
        bio: cleanString(parsedData.bio),
        currentCompany: cleanString(parsedData.currentCompany),
        currentRole: cleanString(parsedData.currentRole),
        linkedInProfile: cleanString(parsedData.linkedInProfile),
        githubProfile: cleanString(parsedData.githubProfile),
        portfolioUrl: cleanString(parsedData.portfolioUrl),
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.map(s => cleanString(s)).filter(Boolean) : [],
        education: Array.isArray(parsedData.education) ? parsedData.education.map(edu => ({
            degree: cleanString(edu.degree),
            institution: cleanString(edu.institution),
            fieldOfStudy: cleanString(edu.fieldOfStudy),
            startDate: cleanString(edu.startDate),
            endDate: cleanString(edu.endDate),
            location: cleanString(edu.location)
        })).filter(edu => edu.degree && edu.institution) : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience.map(exp => ({
            title: cleanString(exp.title),
            company: cleanString(exp.company),
            location: cleanString(exp.location),
            startDate: cleanString(exp.startDate),
            endDate: cleanString(exp.endDate),
            description: cleanString(exp.description),
            isCurrentRole: Boolean(exp.isCurrentRole)
        })).filter(exp => exp.title && exp.company) : [],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications.map(cert => ({
            certificationName: cleanString(cert.certificationName),
            issuingOrganization: cleanString(cert.issuingOrganization),
            issueDate: cleanString(cert.issueDate),
            expiryDate: cleanString(cert.expiryDate)
        })).filter(cert => cert.certificationName) : [],
        extraCurricular: Array.isArray(parsedData.extraCurricular) ? parsedData.extraCurricular.map(activity => ({
            title: cleanString(activity.title),
            organization: cleanString(activity.organization),
            description: cleanString(activity.description)
        })).filter(activity => activity.title) : []
    };

    return cleaned;
}

/**
 * Clean and normalize string values
 * @param {string} value - String to clean
 * @returns {string} Cleaned string
 */
export function cleanString(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ');
}

/**
 * Parse multiple resume files
 * @param {Array} files - Array of file objects with path and name
 * @returns {Promise<Array>} Array of parsed candidate data
 */
export async function parseMultipleResumes(files) {
    const results = {
        success: 0,
        failed: 0,
        total: files.length,
        errors: [],
        candidates: []
    };

    console.log(`[ResumeParserService] Starting to parse ${files.length} resumes`);
    console.log(`[ResumeParserService] Files received:`, files.map(f => ({ name: f.name, path: f.path })));

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            console.log(`[ResumeParserService] Parsing resume ${i + 1}/${files.length}: ${file.name}`);
            console.log(`[ResumeParserService] File details:`, {
                name: file.name,
                path: file.path,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype
            });

            const parsedData = await parseResume(file.path, file.name);

            // Add file information to parsed data
            parsedData.originalFileName = file.name;
            parsedData.filePath = file.path;

            results.candidates.push(parsedData);
            results.success++;

            console.log(`[ResumeParserService] Successfully parsed: ${parsedData.name || file.name}`);
        } catch (error) {
            console.log(`[ResumeParserService] Failed to parse ${file.name}:`, error);
            results.failed++;
            results.errors.push(`${file.name}: ${error.message}`);
        }
    }

    console.log(`[ResumeParserService] Completed parsing. Success: ${results.success}, Failed: ${results.failed}`);
    return results;
} 