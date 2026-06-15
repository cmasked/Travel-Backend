/**
 * PII masking utility per FRD §7.3 DPDP Act Compliance.
 *
 * Mandatory: PII fields (email, mobile_no, ip, device_information,
 * document_number, business_tax_id) must never appear in structured
 * application logs.
 *
 * login_logs.ip must be masked to the first three octets
 * (e.g. 192.168.1.xxx).
 */

/** Mask an IP address to first 3 octets: 192.168.1.100 → 192.168.1.xxx */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return 'unknown';

  // IPv4
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.xxx`;
  }

  // IPv6 — mask last 2 groups
  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length > 2) {
    return ipv6Parts.slice(0, -2).join(':') + ':xxxx:xxxx';
  }

  return 'masked';
}

/** Mask email: john.doe@example.com → j***e@example.com */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return 'unknown';
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return '***@' + (domain ?? 'unknown');
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/** Mask mobile number: 9876543210 → ******3210 */
export function maskMobile(mobile: string | null | undefined): string {
  if (!mobile) return 'unknown';
  if (mobile.length <= 4) return '****';
  return '*'.repeat(mobile.length - 4) + mobile.slice(-4);
}

/** Mask any document number: ABCD1234 → A***4 */
export function maskDocument(doc: string | null | undefined): string {
  if (!doc) return 'unknown';
  if (doc.length <= 2) return '***';
  return `${doc[0]}***${doc[doc.length - 1]}`;
}

/** Truncate device information to max 500 chars per FRD §3.7 */
export function truncateDeviceInfo(info: string | null | undefined): string | null {
  if (!info) return null;
  return info.length > 500 ? info.substring(0, 500) : info;
}
