import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { createContact } from "../services/hubspotClient";

const hubspotAccessToken = defineSecret("HUBSPOT_ACCESS_TOKEN");

export const onStudentCreated = onDocumentCreated(
  {
    document: "students/{userId}",
    secrets: [hubspotAccessToken],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("onStudentCreated: No data in event");
      return;
    }

    const data = snapshot.data();
    const userId = event.params.userId;

    logger.info("New student signup detected", { userId, email: data.email });

    // Parse name into first/last
    const nameParts = (data.name || "").trim().split(/\s+/);
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    await createContact(hubspotAccessToken.value(), {
      email: data.email,
      firstname,
      lastname,
      nextstep_user_type: "student",
      nextstep_skills: Array.isArray(data.skills)
        ? data.skills.join("; ")
        : data.skills || "",
      nextstep_desired_roles: Array.isArray(data.desiredRoles)
        ? data.desiredRoles.join("; ")
        : data.desiredRoles || "",
      nextstep_bio: data.bio || "",
      nextstep_linkedin_url: data.linkedinUrl || "",
    });
  }
);
