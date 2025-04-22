
import { useState } from "react";
import { User as UserType } from "@/types";

export function useEmployeeModal() {
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openModal = (employee: UserType) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEmployee(null);
  };

  return {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal,
  };
}
