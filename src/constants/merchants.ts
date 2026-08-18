// src/constants/merchants.ts
import { DispatchMethod } from '@prisma/client';

export interface SeedMerchant {
  slug: string;
  name: string;
  category: 'Gym' | 'Telecom' | 'SaaS' | 'Streaming' | 'Subscription Box';
  cancellationType: DispatchMethod;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  faxNumber?: string | null;
  statutoryClause: string;
}

/**
 * Standard legal statutory clauses applied based on vendor category and regulations.
 */
export const LEGAL_STATUTORY_CLAUSES = {
  GYM_MEMBERSHIP:
    'Pursuant to state consumer health club protection statutes and the original membership terms, this written instrument serves as unconditional formal notice of immediate termination of all membership agreements and permanent revocation of electronic funds transfer (EFT) authorization under the Electronic Fund Transfer Act (15 U.S.C. 1693 et seq.).',
  
  TELECOM_CONTRACT:
    'Under the Federal Trade Commission (FTC) Click-to-Cancel provisions, unfair and deceptive trade practices regulations (16 CFR Part 425), and applicable state consumer rights laws, I hereby demand unconditional termination and disconnection of all telecom, cable, and internet account services as of the date of transmission.',
  
  DIGITAL_SAAS_ENTERPRISE:
    'In accordance with governing consumer protection statutes regarding automatic renewal contracts (including California Business and Professions Code § 17600 et seq.), formal notice is hereby rendered to terminate all recurring subscription terms, cancel auto-renewals, and delete payment methods on file.',
  
  FITNESS_INTERNATIONAL:
    'Notice is hereby given that the undersigned consumer terminates all agreements with Fitness International, LLC. Revocation of recurring ACH debit permissions and credit card billing is effective immediately under federal Regulation E.',
} as const;

/**
 * Default verified list of high-friction merchants supported out-of-the-box.
 */
export const DEFAULT_MERCHANTS: SeedMerchant[] = [
  {
    slug: 'planet-fitness',
    name: 'Planet Fitness Headquarters',
    category: 'Gym',
    cancellationType: DispatchMethod.HYBRID_BOTH,
    recipientName: 'Planet Fitness Member Relations & Cancellations',
    addressLine1: '400 Fox Run Rd',
    city: 'Newington',
    state: 'NH',
    postalCode: '03801',
    country: 'US',
    faxNumber: '+16037500001',
    statutoryClause: LEGAL_STATUTORY_CLAUSES.GYM_MEMBERSHIP,
  },
  {
    slug: 'la-fitness',
    name: 'LA Fitness (Fitness International, LLC)',
    category: 'Gym',
    cancellationType: DispatchMethod.CERTIFIED_MAIL,
    recipientName: 'Operations Support Group / Member Cancellations',
    addressLine1: 'PO Box 54170',
    city: 'Irvine',
    state: 'CA',
    postalCode: '92619',
    country: 'US',
    faxNumber: null,
    statutoryClause: LEGAL_STATUTORY_CLAUSES.FITNESS_INTERNATIONAL,
  },
  {
    slug: 'equinox',
    name: 'Equinox Holdings, Inc.',
    category: 'Gym',
    cancellationType: DispatchMethod.HYBRID_BOTH,
    recipientName: 'Equinox Concierge & Membership Services',
    addressLine1: '895 Broadway',
    addressLine2: 'Fl 4',
    city: 'New York',
    state: 'NY',
    postalCode: '10003',
    country: 'US',
    faxNumber: '+12127746301',
    statutoryClause: LEGAL_STATUTORY_CLAUSES.GYM_MEMBERSHIP,
  },
  {
    slug: 'comcast-xfinity',
    name: 'Comcast / Xfinity',
    category: 'Telecom',
    cancellationType: DispatchMethod.HYBRID_BOTH,
    recipientName: 'Comcast Cable Legal & Escalations Department',
    addressLine1: '1701 John F Kennedy Blvd',
    city: 'Philadelphia',
    state: 'PA',
    postalCode: '19103',
    country: 'US',
    faxNumber: '+12152865801',
    statutoryClause: LEGAL_STATUTORY_CLAUSES.TELECOM_CONTRACT,
  },
  {
    slug: 'adobe',
    name: 'Adobe Systems Incorporated',
    category: 'SaaS',
    cancellationType: DispatchMethod.HYBRID_BOTH,
    recipientName: 'Adobe Legal Department - Contract Discontinuance',
    addressLine1: '345 Park Ave',
    city: 'San Jose',
    state: 'CA',
    postalCode: '95110',
    country: 'US',
    faxNumber: '+14085366799',
    statutoryClause: LEGAL_STATUTORY_CLAUSES.DIGITAL_SAAS_ENTERPRISE,
  },
];
