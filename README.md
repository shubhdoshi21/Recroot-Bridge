# RecrootBridge v3

A comprehensive recruitment management system built with Next.js and Node.js.

## Features

### Candidate Management
- **Bulk Resume Upload with AI Parsing**: Upload multiple resume files (PDF/DOCX) and let AI automatically extract candidate information
- **Resume Storage After Creation**: Original resume files are automatically stored in the candidate's profile after successful creation during bulk upload
- **Candidate Profile Management**: Complete candidate profiles with education, experience, skills, and certifications
- **Document Management**: Upload and manage candidate documents including resumes, certifications, and other files
- **Job Matching**: AI-powered job matching based on candidate skills and job requirements

### Resume Storage Enhancement (New Feature)

The bulk resume upload functionality now includes automatic resume file storage:

#### How It Works
1. **File Upload**: Multiple resume files are uploaded and temporarily stored
2. **AI Parsing**: Files are parsed using AI to extract candidate information
3. **Candidate Customization**: Users can review and customize parsed data
4. **Candidate Creation**: Candidates are created in the system
5. **Resume Storage**: Original resume files are automatically stored in the candidate's profile
6. **File Cleanup**: Temporary files are cleaned up after successful storage

#### Key Benefits
- **No Orphaned Files**: Resume files are only stored after successful candidate creation
- **Automatic Association**: Files are properly linked to candidate profiles
- **Resume Section Access**: Stored resumes appear in the candidate's Resume section
- **Download Capability**: Users can view and download stored resumes
- **Cleanup Process**: Temporary files are automatically cleaned up to prevent storage bloat

#### Technical Implementation
- Files are temporarily stored during the parsing phase
- After successful candidate creation, files are moved to permanent storage
- Files are linked to candidates via the `CandidateDocument` model
- Failed candidate creations don't result in stored files
- Automatic cleanup removes temporary files older than 24 hours

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd RecrootBridge-v3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the development server
npm run dev
```

## API Endpoints

### Candidates
- `POST /api/candidates/bulk-upload-resumes` - Upload multiple resumes for parsing
- `POST /api/candidates/store-resume-after-creation` - Store resume after candidate creation
- `POST /api/candidates/cleanup-temporary-files` - Clean up temporary resume files

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.# Recroot-Bridge
