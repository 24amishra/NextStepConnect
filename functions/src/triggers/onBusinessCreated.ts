import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  createContact,
  createCompany,
  associateContactWithCompany,
} from "../services/hubspotClient";

const hubspotAccessToken = defineSecret("HUBSPOT_ACCESS_TOKEN");

export const onBusinessCreated = onDocumentCreated(
  {
    document: "businesses/{userId}",
    secrets: [hubspotAccessToken],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("onBusinessCreated: No data in event");
      return;
    }

    const publicData = snapshot.data();
    const userId = event.params.userId;

    logger.info("New business signup detected", {
      userId,
      email: publicData.email,
      companyName: publicData.companyName,
    });

    // Try to read the private subcollection for phone number.
    // It may not have been written yet (saveBusinessData writes public first, then private).
    let phone = "";
    try {
      const privateDoc = await admin
        .firestore()
        .doc(`businesses/${userId}/private/details`)
        .get();
      if (privateDoc.exists) {
        phone = privateDoc.data()?.phone || "";
      }
    } catch (err) {
      logger.warn("Could not read private business data", { userId, err });
    }

    // Parse contact person name
    const nameParts = (publicData.contactPersonName || "").trim().split(/\s+/);
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    const token = hubspotAccessToken.value();

    // 1. Create HubSpot Contact
    const contactId = await createContact(token, {
      email: publicData.email,
      firstname,
      lastname,
      phone,
      company: publicData.companyName || "",
      nextstep_user_type: "business",
      nextstep_location: publicData.location || "",
      nextstep_industry: publicData.industry || "",
      nextstep_project_needs: publicData.potentialProblems || "",
      nextstep_categories: Array.isArray(publicData.categories)
        ? publicData.categories.join("; ")
        : "",
      nextstep_approval_status: publicData.approvalStatus || "pending",
      nextstep_preferred_contact: publicData.preferredContactMethod || "",
    });

    // 2. Create HubSpot Company
    const companyId = await createCompany(token, {
      name: publicData.companyName || "",
      city: publicData.location || "",
      industry: publicData.industry || "",
      description: publicData.potentialProblems || "",
      nextstep_categories: Array.isArray(publicData.categories)
        ? publicData.categories.join("; ")
        : "",
    });

    // 3. Associate contact with company (if contact was created, not a duplicate)
    if (contactId && companyId) {
      await associateContactWithCompany(token, contactId, companyId);
    }
  }
);
