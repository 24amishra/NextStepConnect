import { Client } from "@hubspot/api-client";
import { AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/associations/v4/models/AssociationSpec";
import * as logger from "firebase-functions/logger";

let client: Client | null = null;

function getClient(accessToken: string): Client {
  if (!client) {
    client = new Client({ accessToken });
  }
  return client;
}

export interface HubSpotContactProperties {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  // Custom NextStep properties
  nextstep_user_type?: string;
  nextstep_skills?: string;
  nextstep_desired_roles?: string;
  nextstep_bio?: string;
  nextstep_linkedin_url?: string;
  nextstep_location?: string;
  nextstep_industry?: string;
  nextstep_project_needs?: string;
  nextstep_categories?: string;
  nextstep_approval_status?: string;
  nextstep_preferred_contact?: string;
  [key: string]: string | undefined;
}

export interface HubSpotCompanyProperties {
  name: string;
  city?: string;
  industry?: string;
  description?: string;
  nextstep_categories?: string;
  [key: string]: string | undefined;
}

/**
 * Create a contact in HubSpot.
 * Returns the contact ID on success, or null if the contact already exists (409).
 */
export async function createContact(
  accessToken: string,
  properties: HubSpotContactProperties
): Promise<string | null> {
  const hubspot = getClient(accessToken);

  // Filter out undefined values
  const cleanProps: Record<string, string> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined && value !== null && value !== "") {
      cleanProps[key] = value;
    }
  }

  try {
    const response = await hubspot.crm.contacts.basicApi.create({
      properties: cleanProps,
      associations: [],
    });
    logger.info("HubSpot contact created", {
      contactId: response.id,
      email: properties.email,
    });
    return response.id;
  } catch (error: any) {
    // 409 = contact with this email already exists
    if (error?.code === 409 || error?.response?.status === 409) {
      logger.warn("HubSpot contact already exists", {
        email: properties.email,
      });
      return null;
    }
    logger.error("Failed to create HubSpot contact", { error, email: properties.email });
    throw error;
  }
}

/**
 * Create a company in HubSpot.
 * Returns the company ID on success.
 */
export async function createCompany(
  accessToken: string,
  properties: HubSpotCompanyProperties
): Promise<string> {
  const hubspot = getClient(accessToken);

  const cleanProps: Record<string, string> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined && value !== null && value !== "") {
      cleanProps[key] = value;
    }
  }

  try {
    const response = await hubspot.crm.companies.basicApi.create({
      properties: cleanProps,
      associations: [],
    });
    logger.info("HubSpot company created", {
      companyId: response.id,
      name: properties.name,
    });
    return response.id;
  } catch (error) {
    logger.error("Failed to create HubSpot company", { error, name: properties.name });
    throw error;
  }
}

/**
 * Associate a contact with a company in HubSpot.
 */
export async function associateContactWithCompany(
  accessToken: string,
  contactId: string,
  companyId: string
): Promise<void> {
  const hubspot = getClient(accessToken);

  try {
    await hubspot.crm.associations.v4.basicApi.create(
      "contacts",
      contactId,
      "companies",
      companyId,
      [
        {
          associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
          associationTypeId: 1,
        },
      ]
    );
    logger.info("HubSpot contact-company association created", {
      contactId,
      companyId,
    });
  } catch (error) {
    logger.error("Failed to associate contact with company", {
      error,
      contactId,
      companyId,
    });
    throw error;
  }
}
