import type { Theater, MovieInfo } from "./booking";

export const locations = [
] as const;

export type Location = typeof locations[number];

export const formats = ["2D", "3D", "IMAX 2D", "4DX2D"] as const;

export type Format = typeof formats[number];

export const movieData: MovieInfo = {
    id: "movie-1",
    title: "Wonka",
    duration: "1h 56m",
    rating: "PG-13",
    posterUrl: "/assets/images/movies/wonka.jpg",
    genre: ["Adventure", "Comedy", "Family"]
};

export const theatersByLocation: Partial<Record<Location, Theater[]>> = {
    "HO CHI MINH": [
        {
            id: "cinestar-satra",
            name: "Cinestar Satra District 6 (HCMC)",
            location: "6th Floor, Satra Vo Van Kiet Shopping Center, 1406 Vo Van Kiet, Ward 1, District 6, HCMC",
            isExpanded: true,
            showtimes: ["11:00", "13:45", "15:45", "18:45", "19:45", "21:30"],
        },
        {
            id: "cinestar-hai-ba-trung",
            name: "Cinestar Hai Ba Trung (HCMC)",
            location: "Level 3, Vincom Center Hai Ba Trung, 65 Le Loi, Ben Nghe Ward, District 1, HCMC",
            isExpanded: false,
            showtimes: ["10:30", "13:15", "16:00", "18:45", "21:30"],
        },
        {
            id: "galaxy-nguyen-du",
            name: "Galaxy Nguyen Du (HCMC)",
            location: "116 Nguyen Du Street, Ben Thanh Ward, District 1, HCMC",
            isExpanded: false,
            showtimes: ["09:45", "12:30", "15:15", "18:00", "20:45"],
        },
    ],
    "HANOI": [
        {
            id: "lotte-lang-ha",
            name: "Lotte Cinema Lang Ha",
            location: "7th Floor, Lotte Center Hanoi, 54 Lieu Giai, Ba Dinh District, Hanoi",
            isExpanded: false,
            showtimes: ["10:00", "12:45", "15:30", "18:15", "21:00"],
        },
        {
            id: "cgv-vincom-ba-trieu",
            name: "CGV Vincom Ba Trieu",
            location: "5th Floor, Vincom Center Ba Trieu, 191 Ba Trieu, Hai Ba Trung District, Hanoi",
            isExpanded: false,
            showtimes: ["11:15", "14:00", "16:45", "19:30", "22:15"],
        },
    ],
    "DA NANG": [
        {
            id: "lotte-da-nang",
            name: "Lotte Cinema Da Nang",
            location: "3rd Floor, Lotte Mart Da Nang, 6 Nai Nam Street, Hoa Cuong Bac Ward, Hai Chau District",
            isExpanded: false,
            showtimes: ["10:30", "13:15", "16:00", "18:45", "21:30"],
        },
    ],
    "CAN THO": [
        {
            id: "lotte-can-tho",
            name: "Lotte Cinema Can Tho",
            location: "4th Floor, Vincom Plaza Xuan Khanh, 209 30/4 Street, Xuan Khanh Ward, Ninh Kieu District",
            isExpanded: false,
            showtimes: ["11:00", "13:45", "16:30", "19:15", "22:00"],
        },
    ],
    "HAI PHONG": [
        {
            id: "lotte-hai-phong",
            name: "Lotte Cinema Hai Phong",
            location: "6th Floor, Lotte Mart Hai Phong, 90 Tran Phu Street, Minh Khai Ward, Hong Bang District",
            isExpanded: false,
            showtimes: ["10:15", "13:00", "15:45", "18:30", "21:15"],
        },
    ],
    "BIEN HOA": [
        {
            id: "mega-gs-bien-hoa",
            name: "Mega GS Cinemas Bien Hoa",
            location: "3rd Floor, Bien Hoa City Mall, 1096 Phạm Van Thuan, Thong Nhat Ward, Bien Hoa City",
            isExpanded: false,
            showtimes: ["09:30", "12:15", "15:00", "17:45", "20:30"],
        },
    ],
    "NHA TRANG": [
        {
            id: "lotte-nha-trang",
            name: "Lotte Cinema Nha Trang",
            location: "4th Floor, Lotte Mart Nha Trang, 01 Le Dai Hanh Street, Loc Tho Ward, Nha Trang City",
            isExpanded: false,
            showtimes: ["10:45", "13:30", "16:15", "19:00", "21:45"],
        },
    ],
    "HUE": [
        {
            id: "lotte-hue",
            name: "Lotte Cinema Hue",
            location: "3rd Floor, Vincom Plaza Hue, 51 Hung Vuong Street, Phu Hoi Ward, Hue City",
            isExpanded: false,
            showtimes: ["11:30", "14:15", "17:00", "19:45", "22:30"],
        },
    ],
}; 