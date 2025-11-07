import { getUserData } from "@/app/actions/user";
import { AccountForm } from "@/components/account-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function AccountPage() {
  const user = await getUserData();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <AccountForm user={user} />
    </div>
  );
}
