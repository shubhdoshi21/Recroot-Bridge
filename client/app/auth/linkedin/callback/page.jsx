"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LinkedInCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          window.opener.postMessage(
            { type: "linkedin-auth-error", error },
            window.location.origin
          );
          return;
        }

        if (!code) {
          window.opener.postMessage(
            {
              type: "linkedin-auth-error",
              error: "No authorization code received",
            },
            window.location.origin
          );
          return;
        }

        // Send the code to the backend
        const response = await fetch(
          "http://localhost:3001/api/auth/linkedin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          window.opener.postMessage(
            {
              type: "linkedin-auth-error",
              error: data.message || "Authentication failed",
            },
            window.location.origin
          );
          return;
        }

        // Notify the opener window of success
        window.opener.postMessage(
          { type: "linkedin-auth-success" },
          window.location.origin
        );
      } catch (error) {
        console.log("LinkedIn callback error:", error);
        window.opener.postMessage(
          {
            type: "linkedin-auth-error",
            error: "Failed to process authentication",
          },
          window.location.origin
        );
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Processing LinkedIn Login
        </h1>
        <p className="text-gray-600">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
}
