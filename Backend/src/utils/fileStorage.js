import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const publicDirectory = path.resolve(currentDirectory, "../../public");
export const uploadDirectory = path.join(publicDirectory, "images");

export const createAttachmentUrl = (filename) => {
  if (!filename || path.basename(filename) !== filename) {
    throw new Error("Invalid stored attachment filename");
  }

  const serverUrl = process.env.SERVER_URL?.replace(/\/+$/, "");
  if (!serverUrl) {
    throw new Error("SERVER_URL is required to create attachment URLs");
  }

  return `${serverUrl}/images/${encodeURIComponent(filename)}`;
};

export const removeTaskAttachmentFiles = async (attachments = []) => {
  const configuredServerUrl = process.env.SERVER_URL;
  if (!configuredServerUrl) return;

  const serverOrigin = new URL(configuredServerUrl).origin;
  for (const attachment of attachments) {
    if (typeof attachment?.url !== "string") continue;

    let attachmentUrl;
    try {
      attachmentUrl = new URL(attachment.url);
    } catch {
      continue;
    }

    if (
      attachmentUrl.origin !== serverOrigin ||
      !attachmentUrl.pathname.startsWith("/images/")
    ) {
      continue;
    }

    let filename;
    try {
      filename = decodeURIComponent(path.basename(attachmentUrl.pathname));
    } catch {
      continue;
    }

    if (!filename || filename === "." || filename === "..") continue;

    const filePath = path.resolve(uploadDirectory, filename);
    if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) continue;

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn("A task attachment could not be removed from storage.");
      }
    }
  }
};
