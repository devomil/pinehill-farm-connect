
import React from "react";
import { User, Announcement } from "@/types";
import { AdminAnnouncementForm } from "@/components/communication/AdminAnnouncementForm";

interface NewAnnouncementFormProps {
  allEmployees: User[];
  onSubmitSuccess: (formData: any) => void; // Updated to accept formData
  initialData?: Announcement;
}

export const NewAnnouncementForm: React.FC<NewAnnouncementFormProps> = ({
  allEmployees,
  onSubmitSuccess,
  initialData
}) => {
  const handleClose = () => {
    // This is an empty function as the parent dialog handles closing
  };

  return (
    <AdminAnnouncementForm
      allEmployees={allEmployees}
      onCreate={onSubmitSuccess}
      closeDialog={handleClose}
      initialData={initialData}
    />
  );
};
