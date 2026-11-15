// Exact Mock Data Matching Infera AI Enterprise Video Showcase

export const initialConversationsList = [
  {
    id: 'conv-1',
    title: 'Annual Paid Leave & Carry Forward',
    folder: 'HR Folder Only',
    folderTag: 'HR Folder',
    time: 'Today, 2:45 PM',
    activeQuery: 'How many paid leaves are employees entitled to?'
  },
  {
    id: 'conv-2',
    title: 'Corporate Hardware & VPN Policy',
    folder: 'IT Folder Only',
    folderTag: 'IT Folder',
    time: 'Yesterday, 4:12 PM',
    activeQuery: 'What is the laptop replacement cycle and mandatory VPN requirement?'
  },
  {
    id: 'conv-3',
    title: 'Client Travel Meal Per Diem Limits',
    folder: 'Finance Folder Only',
    folderTag: 'Finance Folder',
    time: 'Nov 01, 2:15 PM',
    activeQuery: 'What is the reimbursement limit for domestic and international client travel meals?'
  }
];

export const sampleQuestionsList = [
  'How many paid leaves are employees entitled to?',
  'What is the laptop replacement cycle and mandatory VPN requirement?',
  'What is the reimbursement limit for domestic and international client travel meals?',
  'What are the warehouse lease renewal terms for Pune facility?'
];

export const conversationDetailsMap = {
  'conv-1': {
    title: 'Annual Paid Leave & Carry Forward',
    folderTag: 'HR Folder',
    scopeName: 'HR Folder Only',
    userQuery: 'How many paid leaves are employees entitled to?',
    time: '10:41 AM',
    aiAnswer: `Employees are entitled to 24 paid leaves per calendar year, accrued at a rate of 2.0 days per month of active service. Additionally, full-time team members may carry forward up to 10 unused paid leave days into the next calendar year, while requests exceeding 4 consecutive days require 14 days advance notice in the HRMS portal.`,
    citations: [
      {
        id: 'c1',
        name: 'HR Policy.pdf',
        page: 12,
        match: '98% Match',
        section: 'Section 4.2 - Annual Paid Leave Entitlement',
        excerpt: 'All full-time permanent personnel accrue 2.0 days of paid annual leave per completed month of active service (total 24 days per year). Up to 10 unused days may be carried over to the subsequent calendar year.'
      },
      {
        id: 'c2',
        name: 'Leave Policy.docx',
        page: 5,
        match: '93% Match',
        section: 'Section 1.4 - Notice Period for Planned Leave',
        excerpt: 'Planned leaves extending beyond four (4) consecutive business days require formal submission in the HRMS at least fourteen (14) calendar days prior to commencement.'
      }
    ]
  },
  'conv-2': {
    title: 'Corporate Hardware & VPN Policy',
    folderTag: 'IT Folder',
    scopeName: 'IT Folder Only',
    userQuery: 'What is the laptop replacement cycle and mandatory VPN requirement?',
    time: '4:15 PM',
    aiAnswer: `Corporate MacBook Pro and Dell Latitude workstations are eligible for hardware refresh every 36 months. When accessing production environments or internal staging clusters, employees must maintain an active WireGuard zero-trust VPN connection alongside the CrowdStrike Falcon endpoint sensor.`,
    citations: [
      {
        id: 'c3',
        name: 'IT Guidelines.pdf',
        page: 17,
        match: '97% Match',
        section: 'Section 3.1 - Equipment Lifecycle & Hardware Refresh',
        excerpt: 'Standard issue enterprise laptops are scheduled for complete refresh every 36 calendar months from provisioning date. Zero-trust WireGuard VPN is strictly mandatory for all remote access.'
      }
    ]
  },
  'conv-3': {
    title: 'Client Travel Meal Per Diem Limits',
    folderTag: 'Finance Folder',
    scopeName: 'Finance Folder Only',
    userQuery: 'What is the reimbursement limit for domestic and international client travel meals?',
    time: '11:20 AM',
    aiAnswer: `According to the Finance Policy, the meal per-diem allowance is capped at INR 2,500 per day for domestic metro travel and USD $85 per day for international client visits. Employees must attach itemized GST invoices for any individual expense claim exceeding INR 1,000.`,
    citations: [
      {
        id: 'c4',
        name: 'Finance Policy.pdf',
        page: 8,
        match: '95% Match',
        section: 'Section 6 - Domestic & International Travel Allowances',
        excerpt: 'Per-diem food and beverage allowances are fixed at INR 2,500 per diem for domestic Tier-1 locations and USD $85 per diem for foreign client engagements. All bills exceeding INR 1,000 require GST receipts.'
      }
    ]
  }
};

// Dynamic response generator for new queries typed by the user
export const generateDynamicAiResponse = (query, scope) => {
  return {
    text: `Based on your indexed organization documents in ${scope}:\n\nRegarding your inquiry "${query}", all employees must adhere to internal compliance guidelines and verify department-specific policies before initiating formal requests.`,
    citations: [
      {
        id: `c-dyn-${Date.now()}`,
        name: 'Corporate_Policies_Master.pdf',
        page: 14,
        match: '96% Match',
        section: 'Section 2.1 - Operational Standards & Governance',
        excerpt: 'All procedural requirements and organizational exceptions must be formally authorized through the designated management portal.'
      }
    ]
  };
};