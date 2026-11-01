import type { LegalDocument } from "@/types/legal";

// DRAFT. Bracketed values are placeholders the owner must replace, and a
// Nigerian lawyer must review both documents before launch.
export const legalEntity = {
  name: "[Registered company name]",
  rcNumber: "[RC number]",
  address: "[Registered address], Lagos, Nigeria",
  privacyEmail: "[privacy contact email]",
} as const;

const updated = "1 November 2026";

export const privacyPolicy = {
  slug: "privacy",
  title: "Privacy Policy",
  summary:
    "What we collect when you visit TemmsTech or send us a project brief, why we collect it, and the choices you have.",
  updated,
  sections: [
    {
      id: "who-we-are",
      short: "Who we are",
      title: "Who we are",
      paragraphs: [
        `TemmsTech is operated by ${legalEntity.name} (${legalEntity.rcNumber}), ${legalEntity.address}. We are the data controller for the personal information described here.`,
        `For any privacy question or request, write to ${legalEntity.privacyEmail}.`,
      ],
    },
    {
      id: "what-we-collect",
      short: "What we collect",
      title: "How we collect and use data",
      paragraphs: [
        "We collect only what we need to answer you and to keep the website working.",
      ],
      items: [
        "Your project brief. If you use the contact form, we receive what you write, the kind of work and timing you choose, and the email address or phone number you give us so we can reply.",
        "Basic visit information. Our hosting and analytics record the page visited, approximate location (country or city), device and browser type, and referring site. This is aggregated and not used to identify you.",
        "Technical data. Our hosting provider keeps server logs, including IP addresses, for security and reliability.",
      ],
    },
    {
      id: "why",
      short: "Why we use it",
      title: "Why we use it, and our lawful basis",
      items: [
        "To reply to your enquiry and discuss a project. Basis: steps you ask us to take before entering a contract, and our legitimate interest in responding to enquiries.",
        "To understand how the website is used and improve it. Basis: our legitimate interest, using privacy-friendly analytics.",
        "To keep the website secure and prevent spam or abuse. Basis: our legitimate interest.",
        "To meet legal obligations. Basis: legal obligation.",
      ],
      paragraphs: [
        "We do not sell your personal information, and we do not use your brief for advertising.",
      ],
    },
    {
      id: "analytics",
      short: "Cookies & analytics",
      title: "Cookies and analytics",
      paragraphs: [
        "We use website analytics to count visits and see which pages are useful. The analytics we use is designed not to set cookies or track you across other websites. If that changes, we will update this policy and ask for your consent where the law requires it.",
        "The site does not use advertising cookies.",
      ],
    },
    {
      id: "third-parties",
      short: "Who we share it with",
      title: "Who we share it with",
      paragraphs: [
        "We share data only with service providers who help us run the website, under their own data protection terms:",
      ],
      items: [
        "Hosting and analytics: Vercel Inc.",
        "Database and email delivery for project briefs: to be confirmed. We will list each provider here when the contact form is connected.",
        "Images: some photographs on this website are loaded from Unsplash (images.unsplash.com). When a page loads, your browser contacts Unsplash, which can see your IP address and browser details under its own privacy policy.",
      ],
    },
    {
      id: "transfers",
      short: "Transfers",
      title: "International transfers",
      paragraphs: [
        "Our providers may process data outside Nigeria, including in the United States and the European Economic Area. Where we transfer personal data abroad, we rely on safeguards the Nigeria Data Protection Act 2023 allows, such as contractual protections.",
      ],
    },
    {
      id: "retention",
      short: "Retention",
      title: "How long we keep it",
      paragraphs: [
        "We keep project briefs and contact details for up to 12 months after our last conversation, unless we start working together, in which case we keep them for as long as the relationship and our legal duties require. Analytics data is kept in aggregated form. You can ask us to delete your brief earlier.",
      ],
    },
    {
      id: "rights",
      short: "Your rights",
      title: "Your rights",
      paragraphs: [
        "Under the Nigeria Data Protection Act 2023, and the GDPR where it applies to you, you may:",
      ],
      items: [
        "ask what personal data we hold about you and receive a copy;",
        "ask us to correct or delete it;",
        "object to or ask us to restrict how we use it;",
        "ask for your data in a portable format;",
        "withdraw consent at any time, where we rely on it.",
      ],
    },
    {
      id: "deletion",
      title: "Deleting your data",
      short: "Deletion",
      paragraphs: [
        `If you ask us to delete your personal data, we will delete it from our systems and our providers' systems within 30 days, unless the law requires us to keep something. Write to ${legalEntity.privacyEmail} from the address you used, or tell us which phone number you gave.`,
        "We keep a minimal record of each deletion request: the date, what you asked for and that we completed it, with no more of your details than needed to identify the request. We keep this so we can show we honoured your request, as the law expects. We tell you when the deletion is done.",
      ],
    },
    {
      id: "complaints",
      short: "Complaints",
      title: "Complaints",
      paragraphs: [
        `Contact ${legalEntity.privacyEmail} first and we will try to put it right. You can also complain to the Nigeria Data Protection Commission (NDPC), or to your local data protection authority if you are in the EU or UK.`,
      ],
    },
    {
      id: "security",
      short: "Security",
      title: "Security",
      paragraphs: [
        "We use reasonable technical and organisational measures to protect your information. No online service is completely secure, so please avoid sending sensitive personal data in a brief.",
      ],
    },
    {
      id: "children",
      short: "Children",
      title: "Children",
      paragraphs: [
        "The website is intended for businesses and adults. We do not knowingly collect information from children.",
      ],
    },
    {
      id: "changes",
      short: "Changes",
      title: "Changes to this policy",
      paragraphs: [
        "We will post any changes on this page and update the date at the top.",
      ],
    },
  ],
} satisfies LegalDocument;

export const termsOfUse = {
  slug: "terms",
  title: "Terms of Use",
  summary: "The rules for using the TemmsTech website.",
  updated,
  sections: [
    {
      id: "agreement",
      short: "Using the site",
      title: "Using this website",
      paragraphs: [
        `These terms apply to your use of the TemmsTech website, operated by ${legalEntity.name} (${legalEntity.rcNumber}). By using it, you agree to them. If you do not agree, please do not use the website.`,
      ],
    },
    {
      id: "information",
      short: "Information only",
      title: "Information only",
      paragraphs: [
        "The website describes our services and work in general terms. It is not an offer, quotation or contract. Any project is agreed separately in writing.",
        "Sample concepts on the website are illustrations of what we could build, and are labelled as such. They are not delivered client projects.",
      ],
    },
    {
      id: "acceptable-use",
      short: "Acceptable use",
      title: "Acceptable use",
      items: [
        "Do not misuse the website, interfere with it, or try to gain unauthorised access to it or its systems.",
        "Do not send unlawful, abusive or misleading content through the contact form, or use it for spam.",
        "Do not scrape or copy the website at scale without our written permission.",
      ],
    },
    {
      id: "ip",
      short: "Intellectual property",
      title: "Intellectual property",
      paragraphs: [
        "The TemmsTech name, logo, design and original content belong to us or our licensors and may not be reused without permission.",
        "Third-party names, logos and websites shown in our work belong to their owners. Some 3D models and photographs are used under open licences; credits are on the 3D model credits page.",
      ],
    },
    {
      id: "your-brief",
      short: "Your brief",
      title: "What you send us",
      paragraphs: [
        "You keep ownership of the ideas and information in your brief. You allow us to use it to respond to you and to assess a possible project. We will handle it as described in the Privacy Policy. Please do not include confidential information you are not willing to share.",
      ],
    },
    {
      id: "links",
      short: "Links",
      title: "Links to other websites",
      paragraphs: [
        "The website links to websites we do not control. We are not responsible for their content or practices.",
      ],
    },
    {
      id: "liability",
      short: "Liability",
      title: "Disclaimer and liability",
      paragraphs: [
        "We work to keep the website accurate and available, but it is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for losses arising from your use of, or inability to use, the website. Nothing here limits liability that cannot be limited by law.",
      ],
    },
    {
      id: "law",
      short: "Governing law",
      title: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Nigeria have jurisdiction over disputes.",
      ],
    },
    {
      id: "changes",
      short: "Changes",
      title: "Changes",
      paragraphs: [
        "We may update these terms. The date above shows when they last changed, and continued use means you accept the update.",
      ],
    },
    {
      id: "contact",
      short: "Contact",
      title: "Contact",
      paragraphs: [`Questions about these terms: ${legalEntity.privacyEmail}.`],
    },
  ],
} satisfies LegalDocument;
