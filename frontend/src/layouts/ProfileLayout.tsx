import type { ReactNode } from "react";
import type { UserAccount } from "../types/account";
import { ProfileSidebar } from "../components/client/userprofile/ProfileSidebar";
import { MainLayout } from "./Layout";

interface ProfileLayoutProps {
  user: UserAccount;
  children: ReactNode;
}

export const ProfileLayout = ({ user, children }: ProfileLayoutProps) => {
  return (
    <MainLayout>
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <div className="">
              <ProfileSidebar user={user} />
            </div>
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
