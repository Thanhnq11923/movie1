export type SeatStatus = "available" | "booked" | "selected" | "locked"

export interface Seat {
    row: string
    col: number
    status: SeatStatus
}

export interface SelectedSeatInfo {
    row: string
    col: number
} 