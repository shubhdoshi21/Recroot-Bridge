import axios from "axios";
import { config } from "../config/config.js";

const getAccessToken = async (code) => {
  try {
    console.log("Getting LinkedIn access token with code:", code);
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: config.linkedin.clientId,
          client_secret: config.linkedin.clientSecret,
          redirect_uri: config.linkedin.redirectUri,
        },
      }
    );

    if (!response.data || !response.data.access_token) {
      throw new Error(
        "Invalid response from LinkedIn: No access token received"
      );
    }

    console.log("LinkedIn access token response:", response.data);

    return response.data.access_token;
  } catch (error) {
    console.log(
      "LinkedIn access token error:",
      error.response?.data || error.message
    );
    if (error.response?.data?.error_description) {
      throw new Error(
        `LinkedIn error: ${error.response.data.error_description}`
      );
    }
    throw new Error("Failed to get LinkedIn access token: " + error.message);
  }
};

const getProfile = async (accessToken) => {
  try {
    console.log("Getting LinkedIn profile with access token");
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.data) {
      throw new Error(
        "Invalid response from LinkedIn: No profile data received"
      );
    }

    console.log("LinkedIn profile response:", response.data);
    const userData = response.data;

    if (!userData.email) {
      throw new Error("LinkedIn profile does not contain email address");
    }

    return {
      firstName: userData.given_name || "",
      lastName: userData.family_name || "",
      email: userData.email,
      picture: userData.picture || "",
    };
  } catch (error) {
    console.log(
      "LinkedIn profile error:",
      error.response?.data || error.message
    );
    if (error.response?.data?.error_description) {
      throw new Error(
        `LinkedIn error: ${error.response.data.error_description}`
      );
    }
    throw new Error("Failed to get LinkedIn profile: " + error.message);
  }
};

export const authenticateLinkedin = async (code) => {
  try {
    console.log("Starting LinkedIn authentication with code:", code);
    const accessToken = await getAccessToken(code);
    const profile = await getProfile(accessToken);
    console.log("LinkedIn authentication successful, profile:", profile);
    return { profile, accessToken };
  } catch (error) {
    console.log("LinkedIn authentication error:", error);
    throw new Error("LinkedIn authentication failed: " + error.message);
  }
};
