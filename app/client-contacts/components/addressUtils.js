// Shared rules for which address pairs a company sees, based on its
// company_type(s): Client/Owner share the Main+Billing pair, Engineer/
// Architect share the Mailing+Shipping pair. Client+Owner on the same
// company is the one combination that can split Main+Billing into two
// role-tagged pairs (via AddressBook's split toggle) instead of sharing one.

export const MAIN_BILLING_TYPES = ['Main', 'Billing'];
export const MAILING_SHIPPING_TYPES = ['Mailing', 'Shipping'];

export function showsMainBilling(companyType = []) {
  return companyType.length === 0 || companyType.includes('Client') || companyType.includes('Owner');
}

export function showsMailingShipping(companyType = []) {
  return companyType.length === 0 || companyType.includes('Engineer') || companyType.includes('Architect');
}

export function needsClientOwnerSplit(companyType = []) {
  return companyType.includes('Client') && companyType.includes('Owner');
}

export function relevantAddressTypes(companyType = []) {
  return [
    ...(showsMainBilling(companyType) ? MAIN_BILLING_TYPES : []),
    ...(showsMailingShipping(companyType) ? MAILING_SHIPPING_TYPES : []),
  ];
}

// The type used to derive the company's city/state and to anchor a newly
// created contact's address_id.
export function primaryAddressType(companyType = []) {
  return showsMainBilling(companyType) ? 'Main' : 'Mailing';
}

// Prefers the shared (non role-tagged) address, falling back to the
// Client-tagged copy when the Main/Billing pair was split by role.
export function pickPrimaryAddress(addresses, companyType = []) {
  const type = primaryAddressType(companyType);
  return (
    addresses.find((a) => a.type === type && !a.for_role) ||
    addresses.find((a) => a.type === type && a.for_role === 'Client') ||
    addresses.find((a) => a.type === type) ||
    {}
  );
}
