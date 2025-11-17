// Lead mapper: Transform Salesforce Contacts and Leads to app's leads schema
import type { LeadInsert, SalesforceContact, SalesforceLead } from './types.ts';

/**
 * Maps a Salesforce Contact to the app's lead schema
 * @param sfContact Salesforce contact record
 * @param businessId Business ID to associate the lead with
 * @returns Mapped lead record ready for database upsert
 */
export function mapSalesforceContactToLead(
  sfContact: SalesforceContact,
  businessId: string,
): Partial<LeadInsert> {
  return {
    business_id: businessId,

    // Source tracking
    source: 'salesforce_contact',
    source_id: sfContact.Id,
    source_metadata: {
      salesforce_type: 'Contact',
      salesforce_created_date: sfContact.CreatedDate,
      salesforce_last_modified: sfContact.LastModifiedDate,
      salesforce_system_modstamp: sfContact.SystemModstamp,
      salesforce_account: sfContact.Account?.Name,
    },

    // Basic information
    first_name: sfContact.FirstName || undefined,
    last_name: sfContact.LastName || undefined,
    email: sfContact.Email || undefined,
    phone: sfContact.Phone || undefined,
    mobile_phone: sfContact.MobilePhone || undefined,

    // Address
    street: sfContact.MailingStreet || undefined,
    city: sfContact.MailingCity || undefined,
    state: sfContact.MailingState || undefined,
    postal_code: sfContact.MailingPostalCode || undefined,
    country: sfContact.MailingCountry || undefined,

    // Organization
    company: sfContact.Account?.Name || undefined,
    title: sfContact.Title || undefined,
    department: sfContact.Department || undefined,

    // Lead quality (default for contacts - typically warmer than cold leads)
    lead_score: 50,
    quality_rating: 'warm',

    // Communication preferences
    // Note: HasOptedOutOfEmail, DoNotCall, and LeadSource may require FLS permissions
    // Setting safe defaults since these fields aren't accessible in all orgs
    do_not_call: false,
    do_not_email: false,
    email_opt_out: false,

    // Sync tracking
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
    sync_error: undefined,
    last_activity_at: sfContact.LastModifiedDate || new Date().toISOString(),

    // Timestamps
    updated_at: new Date().toISOString(),
  };
}

/**
 * Maps a Salesforce Lead to the app's lead schema
 * @param sfLead Salesforce lead record
 * @param businessId Business ID to associate the lead with
 * @returns Mapped lead record ready for database upsert
 */
export function mapSalesforceLeadToLead(
  sfLead: SalesforceLead,
  businessId: string,
): Partial<LeadInsert> {
  return {
    business_id: businessId,

    // Source tracking
    source: 'salesforce_lead',
    source_id: sfLead.Id,
    source_metadata: {
      salesforce_type: 'Lead',
      salesforce_created_date: sfLead.CreatedDate,
      salesforce_last_modified: sfLead.LastModifiedDate,
      salesforce_system_modstamp: sfLead.SystemModstamp,
      salesforce_rating: sfLead.Rating,
    },

    // Basic information
    first_name: sfLead.FirstName || undefined,
    last_name: sfLead.LastName || undefined,
    email: sfLead.Email || undefined,
    phone: sfLead.Phone || undefined,
    mobile_phone: sfLead.MobilePhone || undefined,

    // Address
    street: sfLead.Street || undefined,
    city: sfLead.City || undefined,
    state: sfLead.State || undefined,
    postal_code: sfLead.PostalCode || undefined,
    country: sfLead.Country || undefined,

    // Organization
    company: sfLead.Company || undefined,
    title: sfLead.Title || undefined,
    department: undefined, // Leads don't typically have department

    // Lead quality (map from Salesforce Rating)
    lead_score: mapRatingToScore(sfLead.Rating),
    quality_rating: mapRatingToQuality(sfLead.Rating),

    // Communication preferences
    // Note: DoNotCall, HasOptedOutOfEmail, LeadSource, Description, OwnerId, Status
    // require FLS permissions and are not available in all orgs
    // Setting safe defaults
    do_not_call: false,
    do_not_email: false,
    email_opt_out: false,

    // Sync tracking
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
    sync_error: undefined,
    last_activity_at: sfLead.LastModifiedDate || new Date().toISOString(),

    // Timestamps
    updated_at: new Date().toISOString(),
  };
}

/**
 * Helper function to map Salesforce Rating to lead score
 */
function mapRatingToScore(rating?: string): number {
  switch (rating?.toLowerCase()) {
    case 'hot':
      return 90;
    case 'warm':
      return 70;
    case 'cold':
      return 30;
    default:
      return 50;
  }
}

/**
 * Helper function to map Salesforce Rating to quality rating
 */
function mapRatingToQuality(rating?: string): string {
  switch (rating?.toLowerCase()) {
    case 'hot':
      return 'hot';
    case 'warm':
      return 'warm';
    case 'cold':
      return 'cold';
    default:
      return 'unrated';
  }
}

/**
 * Validates a Salesforce contact has minimum required fields
 * @param sfContact Salesforce contact to validate
 * @returns true if contact is valid, false otherwise
 */
export function isValidContact(sfContact: SalesforceContact): boolean {
  // At minimum, we need an ID
  if (!sfContact.Id) {
    return false;
  }

  // Should have at least one of: name, email, or phone
  const hasIdentity =
    sfContact.FirstName ||
    sfContact.LastName ||
    sfContact.Email ||
    sfContact.Phone ||
    sfContact.MobilePhone;

  return !!hasIdentity;
}

/**
 * Validates a Salesforce lead has minimum required fields
 * @param sfLead Salesforce lead to validate
 * @returns true if lead is valid, false otherwise
 */
export function isValidLead(sfLead: SalesforceLead): boolean {
  // At minimum, we need an ID
  if (!sfLead.Id) {
    return false;
  }

  // Should have at least one of: name, email, or phone
  const hasIdentity =
    sfLead.FirstName ||
    sfLead.LastName ||
    sfLead.Email ||
    sfLead.Phone ||
    sfLead.MobilePhone;

  return !!hasIdentity;
}

/**
 * Sanitizes a lead record before database insertion
 * Removes any undefined values and trims strings
 * @param lead Lead record to sanitize
 * @returns Sanitized lead record
 */
export function sanitizeLead(lead: Partial<LeadInsert>): Partial<LeadInsert> {
  const sanitized: Partial<LeadInsert> = {};

  for (const [key, value] of Object.entries(lead)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      (sanitized as any)[key] = value.trim();
    } else {
      (sanitized as any)[key] = value;
    }
  }

  return sanitized;
}

/**
 * Builds the SOQL query for fetching Salesforce Contacts
 *
 * NOTE: Fields like Description, OwnerId, HasOptedOutOfEmail, DoNotCall, and LeadSource
 * may require Field-Level Security (FLS) permissions and are excluded to avoid errors.
 *
 * @param lastSyncAt ISO timestamp of last sync, or null for full sync
 * @param limit Maximum number of records to fetch
 * @returns SOQL query string
 */
export function buildContactQuery(
  lastSyncAt: string | null,
  limit = 2000,
): string {
  // Use epoch start if never synced
  const syncTimestamp = lastSyncAt || new Date(0).toISOString();

  const soql = `
    SELECT
      Id,
      FirstName,
      LastName,
      Email,
      Phone,
      MobilePhone,
      MailingStreet,
      MailingCity,
      MailingState,
      MailingPostalCode,
      MailingCountry,
      Title,
      Department,
      Account.Name,
      SystemModstamp,
      CreatedDate,
      LastModifiedDate
    FROM Contact
    WHERE SystemModstamp > ${syncTimestamp}
    ORDER BY SystemModstamp ASC
    LIMIT ${limit}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return soql;
}

/**
 * Builds the SOQL query for fetching Salesforce Leads
 *
 * NOTE: Fields like Description, LeadSource, OwnerId, DoNotCall, HasOptedOutOfEmail,
 * and Status may require Field-Level Security (FLS) permissions.
 * These fields are excluded from the query to avoid permission errors.
 *
 * @param lastSyncAt ISO timestamp of last sync, or null for full sync
 * @param limit Maximum number of records to fetch
 * @returns SOQL query string
 */
export function buildLeadQuery(
  lastSyncAt: string | null,
  limit = 2000,
): string {
  // Use epoch start if never synced
  const syncTimestamp = lastSyncAt || new Date(0).toISOString();

  const soql = `
    SELECT
      Id,
      FirstName,
      LastName,
      Email,
      Phone,
      MobilePhone,
      Street,
      City,
      State,
      PostalCode,
      Country,
      Company,
      Title,
      Rating,
      IsConverted,
      SystemModstamp,
      CreatedDate,
      LastModifiedDate
    FROM Lead
    WHERE SystemModstamp > ${syncTimestamp}
      AND IsConverted = false
    ORDER BY SystemModstamp ASC
    LIMIT ${limit}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return soql;
}
