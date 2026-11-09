export interface BookingRules {
  workspaceTimeZone: string;
  operatingHours: {
    startTime: string;
    endTime: string;
  };
  maxAdvanceBookingDays: number;
  maxBookingDurationHours: number;
}

export interface BookingTimeRange {
  startAt: Date;
  endAt: Date;
}
