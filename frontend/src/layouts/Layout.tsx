import type { ReactNode } from "react";
import { Footer } from "../components/client/footer/Footer";
import { Toaster } from "react-hot-toast";
import { HeaderWhite } from "../components/client/header/HeaderWhite";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWhite />
      <main className="flex-1 mt-10">{children}</main>
      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "500",
            maxWidth: "300px",
            padding: "12px 16px",
          },
          success: {
            style: {
              background: "#10B981",
              fontSize: "12px",
            },
          },
          error: {
            style: {
              background: "#EF4444",
              fontSize: "12px",
            },
          },
        }}
        containerStyle={{
          top: 16,
          right: 16,
        }}
        containerClassName="!z-50"
      />
    </div>
  );
};
