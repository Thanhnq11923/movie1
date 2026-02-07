import { useEffect, useState } from "react";
import { ProfileLayout } from "../../../layouts/ProfileLayout"
import { TransactionHistoryTab } from "../../../components/client/userprofile/TransactionHistoryTab"
import { mockUser } from "../../../data/mockData"
import { getBookings } from "../../../services/api/seatService";
import type { TicketTransaction } from "../../../types/account";

type BookingAPI = {
    _id: string;
    userId: string;
    movieId: string | { _id: string; versionMovieEnglish: string };
    movieName?: string;
    scheduleId: string;
    bookedAt: string;
    cinemaId?: string;
    cinemaRoomId: string | { _id: string; roomName: string };
    promotion?: string;
    date?: string;
    time?: string;
    theater?: string;
    format?: string;
    promotionId?: string;
    scheduleSeatsId?: string;
    amount: number;
    seats?: Array<{ row: string; col?: number; number?: string }>;
    concessions?: Array<{ name: string; quantity: number; price: number }>;
    row?: string;
    col?: number;
};

export default function TicketHistory() {
    const [transactions, setTransactions] = useState<TicketTransaction[]>([]);
    useEffect(() => {
        getBookings().then(res => {
            // Nếu backend trả về { success, data }, lấy data
            const bookings: BookingAPI[] = res.data || res;
            const transactions = bookings.map((b) => ({
                _id: b._id,
                accountId: b.userId,
                movieId: typeof b.movieId === 'object' && b.movieId !== null ? b.movieId._id : b.movieId,
                movieName: typeof b.movieId === 'object' && b.movieId !== null ? b.movieId.versionMovieEnglish : b.movieName || "Movie",
                cinemaRoomId: typeof b.cinemaRoomId === 'object' && b.cinemaRoomId !== null ? b.cinemaRoomId._id : b.cinemaRoomId,
                cinemaRoomName: typeof b.cinemaRoomId === 'object' && b.cinemaRoomId !== null ? b.cinemaRoomId.roomName : '',
                promotion: b.promotion || '',
                date: b.date,
                time: b.time,
                theater: b.theater,
                format: b.format,
                seats: b.seats || (b.row && b.col ? [{ row: b.row, col: b.col }] : []),
                concessions: b.concessions || [],
                scheduleId: b.scheduleId,
                scheduleShowTime: b.bookedAt,
                tickets: [],
                promotionId: b.promotionId || undefined,
                totalMoney: b.amount || 0,
                status: "confirmed" as const,
                bookingDate: b.bookedAt,
                addScore: 0,
                useScore: 0,
                paymentMethod: "Online",
            }));
            // Sắp xếp transactions mới nhất đến cũ nhất
            transactions.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
            setTransactions(transactions);
        });
    }, []);
    return (
        <ProfileLayout user={mockUser}>
            <TransactionHistoryTab transactions={transactions} />
        </ProfileLayout>
    )
}
