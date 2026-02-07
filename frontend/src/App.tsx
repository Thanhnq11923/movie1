import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import ForgetPassword from "./pages/auth/Forget Password/ForgetPassword";
import VerifyCode from "./pages/auth/Verify Code/VerifyCode";
import ResetPassword from "./pages/auth/ResetPassword/ResetPassword";
import HomePage from "./pages/client/home/HomePage";
import { PromotionPage } from "./pages/client/Event/PromotionPage";
import { PromotionDetail } from "./pages/client/Event/PromotionDetail/PromotionDetail";
import MovieDetail from "./pages/client/Movie detail/MovieDetail";
import TicketBooking from "./pages/client/selectticketinfo/TicketBooking";
import SelectSeat from "./pages/client/selectseat/SelectSeat";
import UserProfile from "./pages/userprofile/UserProfile";
import TicketHistory from "./pages/client/tickethistory/TicketHistory";
import Members from "./pages/client/members/MembersPage";
import Error from "./pages/client/error/ErrorPage";
import ShowingMovie from "./pages/client/showingmovie/ShowingMovies";
import UpcomingMovie from "./pages/client/upcomingmovie/UpcomingMovies";
import HomeAdmin from "./pages/admin/home/home";
import AccountPage from "./pages/admin/account/account";
import TicketPage from "./pages/admin/ticket/ticket";
import BookingPage from "./pages/admin/booking/booking";
import EmployeePage from "./pages/admin/employee/employee";
import RoomPage from "./pages/admin/room/room";
import MoviePage from "./pages/admin/moive/movie";
import PromotionPage1 from "./pages/admin/promotion/promotion";
import SelectCorn from "./pages/client/selectcorn/SelectCorn";
import Payment from "./pages/client/payment/Payment";
import OrderPayment from "./pages/client/payment/OrderPayment";
import PaymentTestPage from "./pages/client/payment/PaymentTestPage";
import RulePage from "./pages/client/cultureplex/Rules/RulePage";
import EGiftPage from "./pages/client/cultureplex/Egift/EgiftPage";
import ConcesssionPage from "./pages/admin/concession/concession";
import PointPage from "./pages/admin/point/point";
import DashboardStaff from "./pages/staff/dashboard/dashboard";
import MemberPage from "./pages/staff/member/member";
import MemberBooking from "./pages/staff/member-booking/booking";
import StaffBookingLayout from "./pages/staff/staff-booking/staff-booking-layout";
import TicketStaff from "./pages/staff/ticket/ticket-selling-page";
import SchedulePage from "./pages/admin/schedule/schedule";
import ProfileStaff from "./pages/staff/profile/profile-staff";
import AdminRoute from "./AdminRauter";
import StaffRoute from "./StaffRoute";
import FeedbackPage from "./pages/admin/feedback/feedback";
import PromotionStaff from "./pages/staff/promotion/promotionStaff";
import MovieSchedulePage from "./pages/staff/schedule/schedule";
import ClientRoute from "./ClientRoute";
import VNPayPaymentStatus from "./components/client/payment/VNPayPaymentStatus";
import StaffBookingPage from "./pages/admin/staffbooking/staff-booking";

function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" duration={1000} />
      <Routes>
        <Route
          path="/"
          element={
            <ClientRoute>
              <HomePage />
            </ClientRoute>
          }
        ></Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/promotion"
          element={
            <ClientRoute>
              <PromotionPage />
            </ClientRoute>
          }
        />
        <Route
          path="/promotion/:slug"
          element={
            <ClientRoute>
              <PromotionDetail />
            </ClientRoute>
          }
        />

        <Route
          path="/movie-detail/:id"
          element={
            <ClientRoute>
              <MovieDetail />
            </ClientRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ClientRoute>
              <TicketBooking />
            </ClientRoute>
          }
        />
        <Route
          path="/select-seat"
          element={
            <ClientRoute>
              <SelectSeat />
            </ClientRoute>
          }
        />
        <Route
          path="/select-corn"
          element={
            <ClientRoute>
              <SelectCorn />
            </ClientRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ClientRoute>
              <Payment />
            </ClientRoute>
          }
        />
        <Route
          path="/order-payment"
          element={
            <ClientRoute>
              <OrderPayment />
            </ClientRoute>
          }
        />
        <Route
          path="/payment-test"
          element={
            <ClientRoute>
              <PaymentTestPage />
            </ClientRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ClientRoute>
              <UserProfile />
            </ClientRoute>
          }
        />
        <Route
          path="/ticket-history"
          element={
            <ClientRoute>
              <TicketHistory />
            </ClientRoute>
          }
        />
        <Route
          path="/showtime"
          element={
            <ClientRoute>
              <ShowingMovie />
            </ClientRoute>
          }
        />
        <Route
          path="/comingsoon"
          element={
            <ClientRoute>
              <UpcomingMovie />
            </ClientRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ClientRoute>
              <Members />
            </ClientRoute>
          }
        />
        <Route
          path="/RulePage"
          element={
            <ClientRoute>
              <RulePage />
            </ClientRoute>
          }
        />
        <Route
          path="/EgiftPage"
          element={
            <ClientRoute>
              <EGiftPage />
            </ClientRoute>
          }
        />
        <Route
          path="/booking/success/:bookingId"
          element={
            <ClientRoute>
              <VNPayPaymentStatus />
            </ClientRoute>
          }
        />
        <Route
          path="/booking/failed/:bookingId"
          element={
            <ClientRoute>
              <VNPayPaymentStatus />
            </ClientRoute>
          }
        />

        {/* Admin router */}
        <Route
          path="/admin/home"
          element={
            <AdminRoute>
              <HomeAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/member"
          element={
            <AdminRoute>
              <AccountPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/ticket"
          element={
            <AdminRoute>
              <TicketPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/booking"
          element={
            <AdminRoute>
              <BookingPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <AdminRoute>
              <EmployeePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/staff-booking-management"
          element={
            <AdminRoute>
              <StaffBookingPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/room"
          element={
            <AdminRoute>
              <RoomPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/movie"
          element={
            <AdminRoute>
              <MoviePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/promotion"
          element={
            <AdminRoute>
              <PromotionPage1 />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <AdminRoute>
              <FeedbackPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/concession"
          element={
            <AdminRoute>
              <ConcesssionPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/point"
          element={
            <AdminRoute>
              <PointPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <AdminRoute>
              <SchedulePage />
            </AdminRoute>
          }
        />
        {/* Staff router */}
        <Route
          path="staff/dashboard"
          element={
            <StaffRoute>
              <DashboardStaff />
            </StaffRoute>
          }
        />
        <Route
          path="staff/ticket"
          element={
            <StaffRoute>
              <TicketStaff />
            </StaffRoute>
          }
        />
        <Route
          path="staff/members"
          element={
            <StaffRoute>
              <MemberPage />
            </StaffRoute>
          }
        />
        <Route
          path="/staff/member-booking"
          element={
            <StaffRoute>
              <MemberBooking />
            </StaffRoute>
          }
        />
        <Route
          path="staff/promotion"
          element={
            <StaffRoute>
              <PromotionStaff />
            </StaffRoute>
          }
        />
        <Route
          path="staff/movie-schedule"
          element={
            <StaffRoute>
              <MovieSchedulePage />
            </StaffRoute>
          }
        />
        <Route
          path="staff/staff-booking"
          element={
            <StaffRoute>
              <StaffBookingLayout />
            </StaffRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <StaffRoute>
              <ProfileStaff />
            </StaffRoute>
          }
        />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
}

export default App;
