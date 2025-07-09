export const validateCandidate = (req, res, next) => {
  const { name, email, phone, position, bio, educationHistory } = req.body;

  if (!name || !email || !phone || !position || !bio) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Name, email, phone, position, and bio are required",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  // Phone validation (basic)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: "Invalid phone format",
    });
  }

  // Validate education history if provided
  if (educationHistory && Array.isArray(educationHistory)) {
    for (const education of educationHistory) {
      if (!education.degree || !education.institution) {
        return res.status(400).json({
          error: "Invalid education entry",
          details: "Each education entry must have a degree and institution",
        });
      }

      // Date validation if dates are provided (check for non-empty strings)
      if (education.startDate && education.startDate.trim() !== '') {
        const start = new Date(education.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            error: "Invalid education start date format",
          });
        }
      }

      if (education.endDate && education.endDate.trim() !== '' && education.endDate !== 'Present') {
        const end = new Date(education.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            error: "Invalid education end date format",
          });
        }

        // Check if start date is before end date
        if (education.startDate && education.startDate.trim() !== '' && new Date(education.startDate) > end) {
          return res.status(400).json({
            error: "Education start date cannot be after end date",
          });
        }
      }
    }
  }

  next();
};

export const validateEducation = (req, res, next) => {
  const { institution, degree, startDate, endDate } = req.body;

  if (!institution || !degree || !startDate) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Institution, degree, and start date are required",
    });
  }

  // Date validation
  const start = new Date(startDate);
  const end = endDate && endDate.trim() !== '' && endDate !== 'Present' ? new Date(endDate) : null;

  if (isNaN(start.getTime())) {
    return res.status(400).json({
      error: "Invalid start date format",
    });
  }

  if (end && isNaN(end.getTime())) {
    return res.status(400).json({
      error: "Invalid end date format",
    });
  }

  if (end && start > end) {
    return res.status(400).json({
      error: "Start date cannot be after end date",
    });
  }

  next();
};

export const validateExperience = (req, res, next) => {
  const { company, position, startDate, endDate } = req.body;

  if (!company || !position || !startDate) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Company, position, and start date are required",
    });
  }

  // Date validation
  const start = new Date(startDate);
  const end = endDate && endDate.trim() !== '' && endDate !== 'Present' ? new Date(endDate) : null;

  if (isNaN(start.getTime())) {
    return res.status(400).json({
      error: "Invalid start date format",
    });
  }

  if (end && isNaN(end.getTime())) {
    return res.status(400).json({
      error: "Invalid end date format",
    });
  }

  if (end && start > end) {
    return res.status(400).json({
      error: "Start date cannot be after end date",
    });
  }

  next();
};
