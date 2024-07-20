import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmailSpam(email: string): boolean {
  // Check if the email contains suspicious keywords
  const suspiciousKeywords = ["viagra", "lottery", "inheritance"];
  const containsSuspiciousKeywords = suspiciousKeywords.some((keyword) =>
    email.toLowerCase().includes(keyword)
  );

  // Check if the email contains suspicious links or attachments
  const containsSuspiciousLinksOrAttachments =
    /<a\s+href=|<script>|<iframe>|attachment/i.test(email);

  // Check if the domain is a disposable email provider
  const disposableDomains = [
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
  ];
  const emailDomain = email.split("@")[1]?.toLowerCase();
  const isDisposableDomain = disposableDomains.includes(emailDomain);

  // Check if the email address has a valid format
  const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    containsSuspiciousKeywords ||
    containsSuspiciousLinksOrAttachments ||
    isDisposableDomain ||
    !isValidFormat
  );
}

export const base64ToBlob = (base64Data: string, contentType: string) => {
  const sliceSize = 1024;
  const byteCharacters = atob(
    base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
  );
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }

  return new Blob(byteArrays, { type: contentType });
};