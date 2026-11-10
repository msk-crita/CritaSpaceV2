export type BoardroomStatus = "active" | "inactive";

export type BoardroomTimestamp =
  | string
  | {
      _seconds: number;
      _nanoseconds: number;
    };

export interface Boardroom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
  status: BoardroomStatus;
  createdAt: BoardroomTimestamp;
  updatedAt: BoardroomTimestamp;
  createdBy: string;
}

export interface BoardroomResponse {
  success: boolean;
  message?: string;
  data: Boardroom;
}

export interface BoardroomsResponse {
  success: boolean;
  data: Boardroom[];
}

export interface CreateBoardroomInput {
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
}

export interface UpdateBoardroomInput {
  name?: string;
  description?: string;
  capacity?: number;
  facilities?: string[];
  status?: BoardroomStatus;
}
