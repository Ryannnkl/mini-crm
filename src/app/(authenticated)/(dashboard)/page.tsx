import { cookies } from "next/headers";
import { getCompaniesForUser } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  const companiesData = sessionToken
    ? await getCompaniesForUser(sessionToken)
    : [];

  return <DashboardClient companiesData={companiesData} />;
}
