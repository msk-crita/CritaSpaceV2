import { api } from "../../lib/api";
import type {
  Boardroom,
  BoardroomResponse,
  BoardroomsResponse,
  CreateBoardroomInput,
  UpdateBoardroomInput,
} from "./boardroom.types";

const BASE_PATH = "/admin/boardrooms";

export const getAllBoardrooms = async (): Promise<Boardroom[]> => {
  const response = await api.get<BoardroomsResponse>(BASE_PATH);
  return response.data.data;
};

export const createBoardroom = async (
  input: CreateBoardroomInput,
): Promise<Boardroom> => {
  const response = await api.post<BoardroomResponse>(BASE_PATH, input);
  return response.data.data;
};

export const updateBoardroom = async (
  boardroomId: string,
  input: UpdateBoardroomInput,
): Promise<Boardroom> => {
  const response = await api.patch<BoardroomResponse>(
    `${BASE_PATH}/${boardroomId}`,
    input,
  );

  return response.data.data;
};
