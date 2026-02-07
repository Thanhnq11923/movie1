export interface ScheduleTime {
  date: string;
  day: string;
  month: string;
  fulldate: string;
  time: string[];
}

export interface MovieSchedule {
  _id?: string;
  movieId: string;
  cinemaId: string;
  cinemaRoomId: string;
  scheduleTime: ScheduleTime[];
  format: string;
}

export interface MovieScheduleResponse {
  success: boolean;
  count: number;
  data: MovieSchedule[];
} 