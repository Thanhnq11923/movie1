import type { TicketTransaction, UserAccount } from "../types/account";

export const mockUser: UserAccount = {
  _id: "6858d5404fba445bbd3bc687",
  username: "Luu Quang Vu",
  email: "vulq72@gmail.com",
  fullName: "Lưu Quang Vũ",
  phoneNumber: "0967237073",
  address: "Di An, Binh Duong",
  dateOfBirth: new Date(983318400000).toISOString(),
  gender: "Male",
  image: "https://1.bp.blogspot.com/--cwALLkjCmE/YGLZYq7VqvI/AAAAAAAArCw/4uWXNg5iBYQsblpvSO2UDHEG5NF4RYWtgCNcBGAsYHQ/s0/2d27fefccf755efa36a6ba7c9c8ff5db.jpeg",
  roleId: "507f1f77bcf86cd799439028",
  status: 1,
  registerDate: new Date(1750650480176).toISOString(),
  member: {
    memberId: "MEM760069",
    score: 5000000,
  },
  updatedAt: new Date(1750650480180).toISOString(),
  otpEnabled: false,
  totalSpending: 5000000,
};

export const mockTransactions: TicketTransaction[] = [
    {
      _id: "6858d1304fba445bbd3bc681",
      accountId: "507f1f77bcf86cd79943901f",
      movieId: "507f1f77bcf86cd79943901d",
      movieName: "Wicked",
      scheduleId: "507f1f77bcf86cd799439020",
      scheduleShowTime: "2025-06-10T15:45:00Z",
      cinemaId: "507f1f77bcf86cd799439011",
      cinemaRoomId: "507f1f77bcf86cd799439012",
      tickets: [
        {
          ticketId: "507f1f77bcf86cd799439024",
          priceTypeId: "507f1f77bcf86cd799439018",
          seatId: "A1",
          price: 150000
        }
      ],
      promotionId: "507f1f77bcf86cd79943901b",
      totalMoney: 112500,
      addScore: 20,
      useScore: 0,
      paymentMethod: "credit_card",
      status: "confirmed",
      bookingDate: "2025-06-10T15:00:00Z"
    }
]; 