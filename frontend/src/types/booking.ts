export interface DateOption {
    date: number;
    day: string;
    month: string;
    fullDate: string;
}

export interface Theater {
    id: string;
    name: string;
    location: string;
    isExpanded: boolean;
    showtimes: string[];
}

export interface MovieInfo {
    id: string;
    title: string;
    duration: string;
    rating: string;
    posterUrl: string;
    genre: string[];
}

export const dates: DateOption[] = [
    { date: 28, day: "WED", month: "NOV", fullDate: "2024-11-28" },
    { date: 29, day: "THU", month: "NOV", fullDate: "2024-11-29" },
    { date: 30, day: "FRI", month: "NOV", fullDate: "2024-11-30" },
    { date: 31, day: "SAT", month: "NOV", fullDate: "2024-11-31" },
    { date: 1, day: "SUN", month: "DEC", fullDate: "2024-12-01" },
    { date: 2, day: "MON", month: "DEC", fullDate: "2024-12-02" },
    { date: 3, day: "TUE", month: "DEC", fullDate: "2024-12-03" },
    { date: 4, day: "WED", month: "DEC", fullDate: "2024-12-04" },
    { date: 5, day: "THU", month: "DEC", fullDate: "2024-12-05" },
    { date: 6, day: "FRI", month: "DEC", fullDate: "2024-12-06" },
    { date: 7, day: "SAT", month: "DEC", fullDate: "2024-12-07" },
    { date: 8, day: "SUN", month: "DEC", fullDate: "2024-12-08" },
    { date: 9, day: "MON", month: "DEC", fullDate: "2024-12-09" },
    { date: 10, day: "TUE", month: "DEC", fullDate: "2024-12-10" },
    { date: 11, day: "WED", month: "DEC", fullDate: "2024-12-11" },
    { date: 12, day: "THU", month: "DEC", fullDate: "2024-12-12" },
]; 