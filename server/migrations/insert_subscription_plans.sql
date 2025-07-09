-- Insert subscription plans
INSERT INTO [subscription_models] (
    subscriptionPlan,
    subscriptionEndDate,
    isTrial,
    isActive,
    maxUsersAllowed,
    maxJobPostsAllowed,
    usageStats,
    billingCycle,
    paymentStatus,
    paymentMethod,
    lastPaymentDate,
    nextBillingDate,
    preferences,
    createdAt,
    updatedAt
)
VALUES 
    (
        
        'Basic Plan', -- subscriptionPlan
        DATEADD(MONTH, 1, GETDATE()), -- subscriptionEndDate
        0, -- isTrial
        1, -- isActive
        5, -- maxUsersAllowed
        10, -- maxJobPostsAllowed
        '{"activeJobs": 0, "totalCandidates": 0, "totalInterviews": 0}', -- usageStats
        'monthly', -- billingCycle
        'active', -- paymentStatus
        'Credit Card', -- paymentMethod
        GETDATE(), -- lastPaymentDate
        DATEADD(MONTH, 1, GETDATE()), -- nextBillingDate
        '{}', -- preferences
        GETDATE(), -- createdAt
        GETDATE() -- updatedAt
    ),
    (
        
        'Professional Plan',
        DATEADD(MONTH, 1, GETDATE()),
        0,
        1,
        20,
        50,
        '{"activeJobs": 0, "totalCandidates": 0, "totalInterviews": 0}',
        'monthly',
        'active',
        'Credit Card',
        GETDATE(),
        DATEADD(MONTH, 1, GETDATE()),
        '{}',
        GETDATE(),
        GETDATE()
    ),
    (
        
        'Enterprise Plan',
        DATEADD(MONTH, 1, GETDATE()),
        0,
        1,
        100,
        200,
        '{"activeJobs": 0, "totalCandidates": 0, "totalInterviews": 0}',
        'monthly',
        'active',
        'Credit Card',
        GETDATE(),
        DATEADD(MONTH, 1, GETDATE()),
        '{}',
        GETDATE(),
        GETDATE()
    ); 