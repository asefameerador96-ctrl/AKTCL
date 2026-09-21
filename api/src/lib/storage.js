import { randomUUID } from "node:crypto";
import { TableClient } from "@azure/data-tables";

const TABLE = "enquiries";

let cached;

export const storageConfigured = () => Boolean((process.env.ENQUIRY_STORAGE_CONNECTION_STRING || "").trim());

/** Lazily create the table client; the table is created on first use. */
async function getTable() {
  if (cached) return cached;
  const client = TableClient.fromConnectionString(process.env.ENQUIRY_STORAGE_CONNECTION_STRING.trim(), TABLE);
  await client.createTable().catch((e) => {
    if (e.statusCode !== 409) throw e; // 409 = already exists
  });
  cached = client;
  return cached;
}

/**
 * One row per enquiry. PartitionKey is the month (yyyy-mm) so a month can be read
 * or exported in one query; the descending RowKey lists the newest enquiry first.
 *
 * @returns {Promise<{ partitionKey: string, rowKey: string }>}
 */
export async function saveEnquiry(enquiry, now, emailStatus) {
  const table = await getTable();
  const key = {
    partitionKey: now.toISOString().slice(0, 7),
    rowKey: `${(9999999999999 - now.getTime()).toString().padStart(13, "0")}-${randomUUID().slice(0, 8)}`,
  };
  await table.createEntity({
    ...key,
    submittedAt: now.toISOString(),
    name: enquiry.name,
    company: enquiry.company,
    country: enquiry.country,
    email: enquiry.email,
    phone: enquiry.phone,
    product: enquiry.product,
    volume: enquiry.volume,
    message: enquiry.message,
    page: enquiry.page,
    consent: true,
    emailStatus,
  });
  return key;
}

/** Lets whoever reads the table see which enquiries never reached the mailbox. */
export async function setEmailStatus(key, emailStatus) {
  const table = await getTable();
  await table.updateEntity({ ...key, emailStatus }, "Merge");
}
