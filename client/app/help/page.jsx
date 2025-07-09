export default function HelpPage() {
  return (
    <div className="w-full p-4">
      <h1 className="text-3xl font-semibold mb-3 text-primary text-left">
        Help & Support
      </h1>
      <p className="mb-10 text-muted-foreground text-left">
        Welcome to the RecrootBridge Help Center. Here you can find answers to
        common questions and guidance on using the platform. If you need further
        assistance, please contact support.
      </p>
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-medium mb-4 text-left text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-gray-200 border rounded-lg bg-white shadow-sm">
            <div className="p-5 text-left">
              <div className="text-base text-gray-900 mb-1">
                How do I add a new job?
              </div>
              <div className="text-sm text-gray-500">
                Go to the Jobs section and click on "Add Job". Fill in the
                required details and save.
              </div>
            </div>
            <div className="p-5 text-left">
              <div className="text-base text-gray-900 mb-1">
                How can I invite a new recruiter or team member?
              </div>
              <div className="text-sm text-gray-500">
                Navigate to the Teams or Recruiters section and use the "Add"
                button to invite new members.
              </div>
            </div>
            <div className="p-5 text-left">
              <div className="text-base text-gray-900 mb-1">
                How do I reset my password?
              </div>
              <div className="text-sm text-gray-500">
                Click on "Forgot Password" on the login page and follow the
                instructions sent to your email.
              </div>
            </div>
            <div className="p-5 text-left">
              <div className="text-base text-gray-900 mb-1">
                Where can I view candidate applications?
              </div>
              <div className="text-sm text-gray-500">
                Go to the Candidates section to see all applications and their
                statuses.
              </div>
            </div>
            <div className="p-5 text-left">
              <div className="text-base text-gray-900 mb-1">
                How do I schedule an interview?
              </div>
              <div className="text-sm text-gray-500">
                In the Interviews section, click "Schedule Interview" and select
                the candidate and time.
              </div>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-medium mb-2 text-left text-gray-800">
            Need More Help?
          </h2>
          <div className="text-sm text-gray-600 text-left">
            If you can't find what you're looking for, please contact our
            support team at{" "}
            <a
              href="mailto:support@recrootbridge.com"
              className="text-primary underline"
            >
              support@recrootbridge.com
            </a>
            .
          </div>
        </section>
      </div>
    </div>
  );
}
