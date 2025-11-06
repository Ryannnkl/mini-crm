"use client";

import { ProgressKanban } from "@/components/progress-kanban";
import { CreateCompanyModal } from "@/components/create-company-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col w-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Company</Button>
      </div>

      <CreateCompanyModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />

      <ProgressKanban />
    </div>
  );
}
