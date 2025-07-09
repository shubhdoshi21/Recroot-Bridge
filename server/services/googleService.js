import axios from "axios";
import { config } from "../config/config.js";

// Remove Gmail API scopes from SCOPES
export const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

const getAccessToken = async (code) => {
  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          redirect_uri: config.google.redirectUri,
          grant_type: "authorization_code",
        },
      }
    );

    console.log("Google token exchange response:", response.data);
    if (!response.data.refresh_token) {
      console.warn("No refresh_token received! This is likely due to Google not showing the consent screen. Try removing app access from your Google account and re-authenticating.");
    }

    if (!response.data || !response.data.access_token) {
      throw new Error("Invalid response from Google: No access token received");
    }

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token, // Only present on first consent or with prompt=consent
    };
  } catch (error) {
    console.log("Google access token error:", error.response?.data || error.message);
    if (error.response?.data?.error_description) {
      throw new Error(`Google error: ${error.response.data.error_description}`);
    }
    throw new Error("Failed to get Google access token: " + error.message);
  }
};

const getProfile = async (accessToken) => {
  try {
    console.log("Getting Google profile with access token");
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.data) {
      throw new Error("Invalid response from Google: No profile data received");
    }

    console.log("Google profile response:", response.data);
    const userData = response.data;

    if (!userData.email) {
      throw new Error("Google profile does not contain email address");
    }

    return {
      firstName: userData.given_name || "",
      lastName: userData.family_name || "",
      email: userData.email,
      picture: userData.picture || "",
    };
  } catch (error) {
    console.log("Google profile error:", error.response?.data || error.message);
    if (error.response?.data?.error_description) {
      throw new Error(`Google error: ${error.response.data.error_description}`);
    }
    throw new Error("Failed to get Google profile: " + error.message);
  }
};

export const authenticateGoogle = async (code) => {
  try {
    console.log("Starting Google authentication with code:", code);
    const { accessToken, refreshToken } = await getAccessToken(code);
    const profile = await getProfile(accessToken);
    console.log("Google authentication successful, profile:", profile);
    // Return both tokens so you can store them in the user record
    return { profile, accessToken, refreshToken };
  } catch (error) {
    console.log("Google authentication error:", error);
    throw new Error("Google authentication failed: " + error.message);
  }
};
