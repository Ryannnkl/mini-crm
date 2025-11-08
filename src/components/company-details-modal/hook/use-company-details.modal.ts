"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCompany, updateCompanyStatus } from "@/app/actions/company";
import { createInteraction, getInteractions } from "@/app/actions/interaction";
import { getUserData } from "@/app/actions/user";
import type { CompanyStatus } from "@/type/company.type";
import type { User } from "better-auth";
import type { companies, interactions as interactionsTable } from "@/db/schema";

type Company = typeof companies.$inferSelect;
type Interaction = typeof interactionsTable.$inferSelect;

export function useCompanyDetailsModal(
  company: Company | null,
  onDelete: (id: number) => void,
  onStatusChange: (id: number, status: CompanyStatus) => void
) {
  const [isPending, setIsPending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newInteractionContent, setNewInteractionContent] = useState("");
  const [user, setUser] = useState<User>();

  // fetch data
  useEffect(() => {
    if (!company) return;
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [interactionRes, userData] = await Promise.all([
          getInteractions(company.id),
          getUserData(),
        ]);
        if (!mounted) return;
        if (interactionRes.error) toast.error(interactionRes.error);
        else setInteractions(interactionRes.interactions || []);
        setUser(userData);
      } catch {
        toast.error("Failed to load data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [company]);

  async function handleAddInteraction() {
    if (!company || !newInteractionContent.trim()) return;
    setIsPending(true);
    const res = await createInteraction(company.id, newInteractionContent);
    if (res.error) toast.error(res.error);
    else if (res.interaction) {
      setInteractions((prev) => [res.interaction!, ...prev]);
      toast.success(res.success);
      setNewInteractionContent("");
    }
    setIsPending(false);
  }

  async function handleDeleteCompany() {
    if (!company) return;
    setIsPending(true);
    const res = await deleteCompany(company.id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success);
      onDelete(company.id);
    }
    setIsPending(false);
  }

  async function handleStatusChange(status: CompanyStatus) {
    if (!company || status === company.status) return;
    setIsUpdatingStatus(true);
    const res = await updateCompanyStatus(company.id, status);
    setIsUpdatingStatus(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Status updated successfully");
      onStatusChange(company.id, status);
    }
  }

  return {
    isPending,
    isUpdatingStatus,
    isLoading,
    user,
    interactions,
    newInteractionContent,
    setNewInteractionContent,
    handleAddInteraction,
    handleDeleteCompany,
    handleStatusChange,
  };
}
