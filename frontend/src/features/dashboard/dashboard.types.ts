export type DashboardTimestamp =
  | string
  | {
      _seconds: number;
      _nanoseconds: number;
    };

export interface DashboardBoardroom {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  facilities: string[];
  status: "active" | "inactive";
  createdBy?: string;
  createdAt?: DashboardTimestamp;
  updatedAt?: DashboardTimestamp;
}

export interface DashboardBooking {
  id: string;
  userId: string;
  status: string;
  startAt: DashboardTimestamp;
  endAt: DashboardTimestamp;
  [key: string]: unknown;
}

export interface DashboardSummary {
  generatedAt: DashboardTimestamp;

  boardrooms: {
    total: number;
    active: number;
    items: DashboardBoardroom[];
  };

  bookings: {
    today: number;
    upcoming: number;
    upcomingItems: DashboardBooking[];
  };

  negotiations: {
    pending: number;
  };

  maintenance: {
    activeBlocks: number;
  };

  companies?: {
    total: number;
    active: number;
  };

  users?: {
    total: number;
    active: number;
  };
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}
