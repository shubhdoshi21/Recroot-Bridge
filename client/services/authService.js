import { api } from "../config/api";

class AuthService {
  async register(userData) {
    try {
      const response = await fetch(api.auth.register(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(api.auth.login(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkAuthType(email) {
    try {
      const response = await fetch(api.auth.checkAuthType(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to check auth type");
      }

      const data = await response.json();
      return data.authType;
    } catch (error) {
      console.log("Error in checkAuthType:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(api.auth.logout(), {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(api.auth.getProfile(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await fetch(api.auth.updateProfile(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Profile update failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkAuthType(email) {
    const requestId = Math.random().toString(36).substring(2, 8);
    console.log(
      `[${requestId}] [checkAuthType] Starting check for email:`,
      email
    );

    try {
      const url = api.auth.checkAuthType();
      console.log(`[${requestId}] [checkAuthType] Sending request to:`, url);

      const requestBody = { email };
      console.log(
        `[${requestId}] [checkAuthType] Request body:`,
        JSON.stringify(requestBody)
      );

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      };

      console.log(`[${requestId}] [checkAuthType] Request options:`, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        credentials: requestOptions.credentials,
        hasBody: !!requestOptions.body,
      });

      const response = await fetch(url, requestOptions);
      console.log(
        `[${requestId}] [checkAuthType] Response status:`,
        response.status,
        response.statusText
      );

      // Log response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log(
        `[${requestId}] [checkAuthType] Response headers:`,
        responseHeaders
      );

      const responseText = await response.text();
      console.log(
        `[${requestId}] [checkAuthType] Raw response text:`,
        responseText
      );

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.log(
          `[${requestId}] [checkAuthType] Failed to parse JSON response:`,
          e
        );
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        console.log(
          `[${requestId}] [checkAuthType] Error response:`,
          responseData
        );
        throw new Error(
          responseData.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log(
        `[${requestId}] [checkAuthType] Success response:`,
        responseData
      );
      const authType = responseData.authType || "local";
      console.log(
        `[${requestId}] [checkAuthType] Determined auth type:`,
        authType
      );

      return authType;
    } catch (error) {
      console.log(`[${requestId}] [checkAuthType] Error in checkAuthType:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      // Default to local auth if there's an error
      return "local";
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      console.log("Sending change password request...");

      const response = await fetch(api.auth.changePassword(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });

      console.log("Change password response status:", response.status);
      const data = await response.json();
      console.log("Change password response data:", data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to change password",
        };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.log("Password change error:", error);
      return {
        success: false,
        message: error.message || "Failed to change password",
      };
    }
  }

  async loginWithGoogle() {
    try {
      // Get the Google authorization URL from the backend
      const response = await fetch(api.auth.googleAuthUrl(), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get Google authorization URL");
      }

      const { url } = await response.json();

      // Open Google authorization in a new window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        "Google Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Return a promise that resolves when the authentication is complete
      return new Promise((resolve, reject) => {
        const handleMessage = async (event) => {
          // Verify the origin of the message
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "google-auth-success") {
            window.removeEventListener("message", handleMessage);
            authWindow.close();

            // Get the user profile after successful authentication
            const profileResponse = await fetch(api.auth.getProfile(), {
              credentials: "include",
            });

            if (!profileResponse.ok) {
              throw new Error("Failed to get user profile");
            }

            const userData = await profileResponse.json();
            resolve(userData);
          } else if (event.data.type === "google-auth-error") {
            window.removeEventListener("message", handleMessage);
            authWindow.close();
            reject(
              new Error(event.data.error || "Google authentication failed")
            );
          }
        };

        window.addEventListener("message", handleMessage);
      });
    } catch (error) {
      throw error;
    }
  }

  async loginWithLinkedIn() {
    try {
      // Get the LinkedIn authorization URL from the backend
      const response = await fetch(api.auth.linkedinAuthUrl(), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get LinkedIn authorization URL");
      }

      const { url } = await response.json();

      // Open LinkedIn authorization in a new window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        "LinkedIn Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Return a promise that resolves when the authentication is complete
      return new Promise((resolve, reject) => {
        const handleMessage = async (event) => {
          // Verify the origin of the message
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "linkedin-auth-success") {
            window.removeEventListener("message", handleMessage);
            authWindow.close();

            // Get the user profile after successful authentication
            const profileResponse = await fetch(api.auth.getProfile(), {
              credentials: "include",
            });

            if (!profileResponse.ok) {
              throw new Error("Failed to get user profile");
            }

            const userData = await profileResponse.json();
            resolve(userData);
          } else if (event.data.type === "linkedin-auth-error") {
            window.removeEventListener("message", handleMessage);
            authWindow.close();
            reject(
              new Error(event.data.error || "LinkedIn authentication failed")
            );
          }
        };

        window.addEventListener("message", handleMessage);
      });
    } catch (error) {
      throw error;
    }
  }

  // Add function to request OTP before signup
  async requestOtp(email) {
    try {
      const response = await fetch(api.auth.requestOtp(), {
        // Assuming api.auth.requestOtp() exists and returns the correct endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to request OTP");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Add function to verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(api.auth.verifyOtp(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "OTP verification failed");
      }

      return await response.json(); // Or just return true/success status
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(api.auth.forgotPassword(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      return data;
    } catch (error) {
      console.log("Forgot password error:", error);
      throw error;
    }
  }

  async getUserCountsByRole() {
    try {
      const response = await fetch(api.auth.getUserCountsByRole(), {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Error response:", data);
        // Return empty counts instead of throwing error
        return {
          admin: 0,
          user: 0,
          total: 0,
        };
      }

      return data;
    } catch (error) {
      console.log("Get user counts error:", error);
      // Return empty counts instead of throwing error
      return {
        admin: 0,
        user: 0,
        total: 0,
      };
    }
  }
}

export const authService = new AuthService();
