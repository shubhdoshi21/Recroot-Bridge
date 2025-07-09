# Email Automation System

This document describes the automated email system that sends personalized emails based on recruitment events.

## Overview

The automation system automatically sends emails when specific events occur in the recruitment process, such as:

- Candidate applications received
- Candidate status changes (rejected, accepted, etc.)
- Interview scheduling
- Offer letters sent

## Features

### 1. Dynamic Variable Replacement

Emails use template variables that are automatically replaced with real data:

```javascript
// Template example
"Dear {{candidate_name}},

Thank you for applying to the {{job_title}} position at {{company_name}}.

Best regards,
{{sender_name}}"
```

### 2. Available Variables

#### Candidate Variables

- `{{candidate_name}}` - Candidate's full name
- `{{candidate_email}}` - Candidate's email address
- `{{candidate_phone}}` - Candidate's phone number
- `{{candidate_location}}` - Candidate's location
- `{{candidate_position}}` - Candidate's current position
- `{{candidate_company}}` - Candidate's current company
- `{{candidate_experience}}` - Years of experience
- `{{candidate_notice_period}}` - Notice period
- `{{candidate_expected_salary}}` - Expected salary
- `{{candidate_linkedin}}` - LinkedIn profile
- `{{candidate_github}}` - GitHub profile
- `{{candidate_portfolio}}` - Portfolio URL

#### Job Variables

- `{{job_title}}` - Job title
- `{{job_type}}` - Job type (full-time, part-time, etc.)
- `{{job_department}}` - Job department
- `{{job_location}}` - Job location
- `{{job_salary_min}}` - Minimum salary
- `{{job_salary_max}}` - Maximum salary
- `{{job_experience_level}}` - Required experience level
- `{{job_work_type}}` - Work type (remote, on-site, hybrid)
- `{{job_deadline}}` - Application deadline
- `{{job_description}}` - Job description

#### Company Variables

- `{{company_name}}` - Company name
- `{{company_industry}}` - Company industry
- `{{company_size}}` - Company size
- `{{company_location}}` - Company location
- `{{company_website}}` - Company website
- `{{company_phone}}` - Company phone
- `{{company_email}}` - Company email
- `{{company_address}}` - Company address
- `{{company_city}}` - Company city
- `{{company_state}}` - Company state
- `{{company_country}}` - Company country

#### Sender Variables

- `{{sender_name}}` - Sender's full name
- `{{sender_first_name}}` - Sender's first name
- `{{sender_last_name}}` - Sender's last name
- `{{sender_email}}` - Sender's email
- `{{sender_phone}}` - Sender's phone

### 3. Automation Triggers

The system supports the following triggers:

| Trigger                | Description          | When Fired                                  |
| ---------------------- | -------------------- | ------------------------------------------- |
| `candidate_rejected`   | Candidate Rejected   | When candidate status changes to "rejected" |
| `candidate_accepted`   | Candidate Accepted   | When candidate status changes to "accepted" |
| `application_received` | Application Received | When a new candidate is created             |
| `interview_scheduled`  | Interview Scheduled  | When an interview is scheduled              |
| `interview_reminder`   | Interview Reminder   | 24 hours before interview                   |
| `offer_sent`           | Offer Sent           | When an offer letter is sent                |
| `welcome_new_hire`     | Welcome New Hire     | When a new hire joins                       |

## Implementation

### Backend Structure

```
server/
├── services/
│   └── automationService.js      # Core automation logic
├── controllers/
│   └── automationController.js   # API endpoints
├── routes/
│   └── automationRoutes.js       # Route definitions
└── models/
    └── AutomatedMessage.js       # Database model
```

### Key Functions

#### 1. Template Variable Replacement

```javascript
import { fillTemplate } from "../services/automationService.js";

const template = "Dear {{candidate_name}}, welcome to {{company_name}}!";
const variables = {
  candidate_name: "John Doe",
  company_name: "TechCorp",
};

const result = fillTemplate(template, variables);
// Result: "Dear John Doe, welcome to TechCorp!"
```

#### 2. Triggering Automation

```javascript
import { triggerAutomation } from "../services/automationService.js";

const context = {
  candidateId: 123,
  jobId: 456,
  senderId: 789,
  customVariables: {
    interview_date: "2024-01-15",
    interview_time: "2:00 PM",
  },
};

const results = await triggerAutomation(
  "interview_scheduled",
  context,
  accessTokens
);
```

#### 3. Getting Variables for Context

```javascript
import { getAvailableVariables } from "../services/automationService.js";

const context = {
  candidateId: 123,
  jobId: 456,
};

const variables = await getAvailableVariables(context);
```

### Frontend Integration

The frontend provides:

- Automation management interface
- Template preview with variable replacement
- Test functionality
- Variable reference guide

## Usage Examples

### 1. Creating a Rejection Email Automation

```javascript
// Backend: Create automation
const automation = await AutomatedMessage.create({
  name: "Rejection Email",
  description: "Send rejection email to candidates",
  trigger: "candidate_rejected",
  channel: "Email",
  template: "Rejection Template",
  subject: "Application Status Update - {{candidate_name}}",
  message: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.

We appreciate the time you took to apply and wish you the best in your future endeavors.

Best regards,
{{sender_name}}
{{company_name}}`,
  status: "Active",
  sentCount: 0,
});
```

### 2. Triggering Automation from Candidate Status Change

```javascript
// In candidateController.js
export const updateCandidateStatus = async (req, res) => {
  // ... update candidate status ...

  // Trigger automation based on status
  const status = req.body.status.toLowerCase();
  let triggerType = null;

  if (status.includes("rejected")) {
    triggerType = "candidate_rejected";
  } else if (status.includes("accepted")) {
    triggerType = "candidate_accepted";
  }

  if (triggerType) {
    const context = {
      candidateId: parseInt(req.params.id),
      senderId: req.user.id,
    };

    await triggerAutomation(triggerType, context, {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    });
  }
};
```

### 3. Testing Automation

```javascript
// Frontend: Test automation
const result = await testAutomation({
  automationId: 1,
  candidateId: 123,
  jobId: 456,
  senderId: 789,
});

console.log(result.preview.subject); // Filled subject
console.log(result.preview.message); // Filled message
console.log(result.preview.variables); // Variables used
```

## API Endpoints

### Automation Management

- `POST /api/automation/trigger` - Trigger automation
- `GET /api/automation/variables` - Get variables for context
- `POST /api/automation/test` - Test automation with preview
- `GET /api/automation/triggers` - Get available triggers
- `GET /api/automation/variables/list` - Get available variables list

### Automated Messages

- `GET /api/automated-messages` - Get all automations
- `POST /api/automated-messages` - Create automation
- `PUT /api/automated-messages/:id` - Update automation
- `PATCH /api/automated-messages/:id/toggle` - Toggle automation status

## Configuration

### Environment Variables

```env
GMAIL_FROM_EMAIL=noreply@yourcompany.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
```

### Database Setup

The system uses the `automated_messages` table with the following structure:

- `name` - Automation name
- `description` - Automation description
- `trigger` - Trigger type
- `channel` - Communication channel
- `template` - Template name
- `subject` - Email subject template
- `message` - Email message template
- `status` - Active/Inactive
- `sentCount` - Number of emails sent
- `lastRun` - Last execution time

## Testing

Run the test script to verify the automation system:

```bash
node server/test-automation.js
```

## Best Practices

1. **Template Design**

   - Use clear, professional language
   - Include all necessary information
   - Test templates with various data combinations

2. **Variable Usage**

   - Use descriptive variable names
   - Provide fallback values for optional variables
   - Document all available variables

3. **Error Handling**

   - Automation failures don't block main operations
   - Log all automation attempts and results
   - Provide fallback email templates

4. **Performance**
   - Use async/await for database operations
   - Implement rate limiting for email sending
   - Cache frequently used data

## Troubleshooting

### Common Issues

1. **Variables not replaced**

   - Check variable names match exactly
   - Verify data exists in database
   - Check for typos in template

2. **Automation not triggered**

   - Verify trigger type matches exactly
   - Check automation status is "Active"
   - Ensure user has Gmail access tokens

3. **Email not sent**
   - Check Gmail API credentials
   - Verify recipient email is valid
   - Check Gmail API quotas

### Debugging

Enable debug logging:

```javascript
console.log("[AUTOMATION] Variables:", variables);
console.log("[AUTOMATION] Filled template:", filledMessage);
```

## Future Enhancements

1. **Advanced Triggers**

   - Time-based triggers (scheduled emails)
   - Conditional triggers (based on multiple criteria)
   - Custom trigger conditions

2. **Template Management**

   - Visual template editor
   - Template versioning
   - Template categories and tags

3. **Analytics**

   - Email open rates
   - Click tracking
   - Automation performance metrics

4. **Integration**
   - Calendar integration for interview reminders
   - CRM integration for lead nurturing
   - ATS integration for application tracking
