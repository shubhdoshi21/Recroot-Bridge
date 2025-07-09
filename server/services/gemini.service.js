import { GoogleGenerativeAI } from "@google/generative-ai";

const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

export async function analyzeJobMatch(candidate, job) {
    console.log('[GeminiService] Starting job-candidate match analysis');
    try {
        // Extract candidate data
        const candidateProfile = {
            id: candidate.id,
            name: candidate.name,
            skills: candidate.CandidateSkillMaps?.map((skillMap) => skillMap.Skill?.title).filter(Boolean) || [],
            experiences: candidate.CandidateExperiences?.map((exp) => ({
                title: exp.title,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate,
                description: exp.description,
                isCurrentRole: exp.isCurrentRole,
            })) || [],
            educations: candidate.CandidateEducations?.map((edu) => ({
                degree: edu.degree,
                institution: edu.institution,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: edu.startDate,
                endDate: edu.endDate,
                location: edu.location,
            })) || [],
        };

        // Extract job data
        const jobData = {
            id: job.id,
            title: job.jobTitle,
            requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills :
                (typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills) : []),
            requiredExperience: job.requiredExperience,
            requiredEducation: job.requiredEducation,
            description: job.description,
            responsibilities: job.responsibilities
        };

        // Build the prompt
        const prompt = `Analyze the match between this candidate and job. Return a JSON object with the following structure:
        {
            "skillsMatch": number (0-100),
            "experienceMatch": number (0-100),
            "educationMatch": number (0-100),
            "analysis": string (detailed analysis of the match)
        }

        Candidate Data:
        ${JSON.stringify(candidateProfile, null, 2)}

        Job Data:
        ${JSON.stringify(jobData, null, 2)}

        Consider the following:
        1. Skills Match: Compare candidate skills with required skills
        2. Experience Match: Evaluate if candidate's experience meets job requirements
        3. Education Match: Check if candidate's education meets job requirements
        4. Provide a detailed analysis of the match`;

        console.log('[GeminiService] Sending prompt to Gemini:', prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('[GeminiService] Raw Gemini response:', text);
        return parseAnalysisResponse(text);
    } catch (error) {
        console.log("[GeminiService] Error analyzing job match:", error);
        return {
            atsScore: 0,
            skillsMatch: 0,
            experienceMatch: 0,
            educationMatch: 0,
            analysis: "Error analyzing match: " + error.message
        };
    }
}

export async function parseJobRequirements(requirementsText) {
    try {
        console.log("[GeminiService] Using Gemini to parse job requirements");
        const prompt = `Extract the following from the job requirements text below:
- requiredSkills: an array of skill names (strings)
- requiredExperience: a string (junior, mid, senior, lead, or a phrase)
- requiredEducation: a string (high_school, associate, bachelor, master, phd, or a phrase)

Return a JSON object with these keys. Only use information present in the text. If not found, use null.

Job Requirements:
"""
${requirementsText}
"""

Example output:
{
  "requiredSkills": ["Skill1", "Skill2"],
  "requiredExperience": "junior",
  "requiredEducation": "bachelor"
}`;

        console.log("[GeminiService] Sending requirements parsing prompt:", prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("[GeminiService] Raw requirements parsing response:", text);

        // Extract JSON from the response by removing markdown code block markers
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON object found in response");
        }

        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        // Validate the parsed object
        if (!parsed.requiredSkills || !Array.isArray(parsed.requiredSkills)) {
            parsed.requiredSkills = [];
        }
        if (!parsed.requiredExperience) {
            parsed.requiredExperience = null;

        }
        if (!parsed.requiredEducation) {
            parsed.requiredEducation = null;
        }

        console.log("[GeminiService] Parsed requirements:", parsed);
        return parsed;
    } catch (error) {
        console.log("[GeminiService] Error parsing job requirements:", error);
        // Return default values if parsing fails
        return {
            requiredSkills: [],
            requiredExperience: null,
            requiredEducation: null
        };
    }
}

export function buildAnalysisPrompt(candidate, job) {
    const prompt = `
      Analyze the match between a candidate and a job position. Calculate scores for skills match, experience match, and education match.
      
      Job Details:
      Title: ${job.jobTitle}
      Required Skills: ${JSON.stringify(job.requiredSkills)}
      Required Experience: ${job.requiredExperience}
      Required Education: ${job.requiredEducation}
      
      Candidate Details:
      Name: ${candidate.name}
      Skills: ${JSON.stringify(candidate.skills?.map(s => s.title) || [])}
      Experience: ${JSON.stringify(candidate.experiences || [])}
      Education: ${JSON.stringify(candidate.educations || [])}
      
      Please analyze and provide scores in the following format:
      {
        "skillsMatch": <score between 0-100>,
        "experienceMatch": <score between 0-100>,
        "educationMatch": <score between 0-100>,
        "analysis": "<brief explanation of the scores>"
      }
      
      Consider:
      1. Skills Match (40% weight):
         - Exact matches
         - Related skills
         - Skill level proficiency
      
      2. Experience Match (35% weight):
         - Years of experience
         - Relevant industry experience
         - Role level match
      
      3. Education Match (25% weight):
         - Degree level match
         - Field of study relevance
         - Additional certifications
    `;
    console.log('[GeminiService] Built analysis prompt:', prompt);
    return prompt;
}

export function parseAnalysisResponse(text) {
    try {
        console.log('[GeminiService] Attempting to parse response:', text);

        // Extract JSON object from the response
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }

        const jsonText = jsonMatch[0];
        console.log('[GeminiService] Cleaned response text:', jsonText);

        const parsed = JSON.parse(jsonText);
        console.log('[GeminiService] Successfully parsed response:', parsed);

        // Validate the parsed response
        if (typeof parsed.skillsMatch !== 'number' ||
            typeof parsed.experienceMatch !== 'number' ||
            typeof parsed.educationMatch !== 'number') {
            throw new Error('Invalid score format in response');
        }

        // Ensure scores are within 0-100 range
        const skillsMatch = Math.min(Math.max(parsed.skillsMatch, 0), 100);
        const experienceMatch = Math.min(Math.max(parsed.experienceMatch, 0), 100);
        const educationMatch = Math.min(Math.max(parsed.educationMatch, 0), 100);

        // Calculate total ATS score using weights
        const atsScore = Math.round(
            (skillsMatch * 0.4) +
            (experienceMatch * 0.35) +
            (educationMatch * 0.25)
        );

        return {
            atsScore,
            skillsMatch,
            experienceMatch,
            educationMatch,
            analysis: parsed.analysis || 'No detailed analysis provided'
        };
    } catch (error) {
        console.log('[GeminiService] Error parsing analysis response:', error);
        console.log('[GeminiService] Failed to parse text:', text);
        return {
            atsScore: 0,
            skillsMatch: 0,
            experienceMatch: 0,
            educationMatch: 0,
            analysis: 'Error parsing analysis: ' + error.message
        };
    }
} 