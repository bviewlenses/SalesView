export type LeadStatus = 'new' | 'contacted' | 'visited' | 'qualified' | 'converted' | 'rejected' | 'inactive';

export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Lead {
  id: string;
  
  // Lead Information (from product spec)
  opticianName: string;           // Business name
  contactPersonName: string;      // Key contact person
  phoneNumber: string;            // Primary contact
  email: string;                  // Business email
  address: string;                // Complete business address
  gstNumber: string;              // Tax identification
  weekOff: string;               // Business closure day
  
  // Status & Tracking
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high';
  source: string;                 // How lead was acquired
  
  // Assignment
  salesStaffId: string;           // Assigned sales person
  salesStaffName: string;         // For easy display
  territoryId?: string;           // Territory if applicable
  
  // Progress Tracking
  totalVisits: number;
  lastVisitDate?: Date;
  nextFollowUpDate?: Date;
  conversionDate?: Date;          // When converted to retailer
  convertedRetailerId?: string;   // If converted
  
  // Business Information
  currentSuppliers?: string[];    // Existing suppliers
  monthlyVolume?: number;         // Estimated monthly volume
  businessType: 'independent' | 'chain' | 'hospital' | 'clinic';
  
  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  
  // Optional fields
  notes?: string;
  tags?: string[];
}

export interface Visit {
  id: string;
  leadId: string;
  
  // Visit Details
  scheduledDate: Date;
  scheduledTime: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  
  // Status
  status: VisitStatus;
  
  // Geo-tagging (mandatory)
  checkinLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;           // In meters (requirement: 10m precision)
    timestamp: Date;
    address: string;            // Reverse geocoded address
  };
  
  checkoutLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
    address: string;
  };
  
  // Visit Data Capture (from product spec)
  visitNotes: string;             // Text-based visit summary
  photos?: string[];              // URLs to uploaded photos
  followUpTasks?: string[];       // Action items for next steps
  
  // Assessment
  interestLevel: 'low' | 'medium' | 'high';
  nextAction: 'follow_up' | 'proposal' | 'convert' | 'close' | 'schedule_demo';
  nextActionDate?: Date;
  
  // Sales Staff
  salesStaffId: string;
  salesStaffName: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesPerformance {
  id: string;
  salesStaffId: string;
  month: string;                  // YYYY-MM format
  year: number;
  
  // KPIs from product spec
  visitsConducted: number;        // Total visits completed
  leadsGenerated: number;         // New leads captured
  leadsConverted: number;         // Successful onboarding rate
  salesAchieved: number;          // Revenue generated from converted leads
  
  // Additional Metrics
  averageVisitsPerLead: number;
  conversionRate: number;         // Percentage
  averageConversionTime: number;  // Days from lead to conversion
  
  // Targets
  targetVisits: number;
  targetLeads: number;
  targetConversions: number;
  targetSales: number;
  
  // Performance Indicators
  visitsTarget: number;           // Percentage of target achieved
  leadsTarget: number;
  conversionsTarget: number;
  salesTarget: number;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// For creating new leads
export interface CreateLeadRequest {
  opticianName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  address: string;
  gstNumber: string;
  weekOff: string;
  businessType: 'independent' | 'chain' | 'hospital' | 'clinic';
  source: string;
  priority?: 'low' | 'medium' | 'high';
  monthlyVolume?: number;
  currentSuppliers?: string[];
  notes?: string;
}

// For scheduling visits
export interface ScheduleVisitRequest {
  leadId: string;
  scheduledDate: string;          // YYYY-MM-DD
  scheduledTime: string;          // HH:MM
  notes?: string;
}

// For visit check-in/out
export interface VisitLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}