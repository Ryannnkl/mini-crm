import { getCompaniesForUser } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";
import { Metadata } from "next";
import { getUserData } from "@/app/actions/user";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getUserData();

  const companiesData = user ? await getCompaniesForUser(user.id) : [];

  return <DashboardClient companiesData={companiesData} />;
}
