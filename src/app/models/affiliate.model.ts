export interface UserAffiliateLink {
  id: string;
  userId: string;
  productId: string;
  affiliateLink: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateClick {
  id: string;
  userAffiliateLinkId: string;
  userId?: string;
  productId: string;
  clickedAt: string;
  ipAddress?: string;
  userAgent?: string;
  converted: boolean;
  conversionValue?: number;
  commissionEarned?: number;
  convertedAt?: string;
}

export interface UserAffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
  conversionRate: number;
  activeLinks: number;
}
