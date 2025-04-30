
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeDirectory } from './useEmployeeDirectory';
import { useState } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';

const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
});

type EventFormValues = z.infer<typeof eventFormSchema>

export const useTeamCalendarEventForm = (onSuccess?: () => void) => {
  const [addedPeople, setAddedPeople] = useState<User[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  // Add missing properties
  const [sendNotifications, setSendNotifications] = useState(true);
  const [notifyAll, setNotifyAll] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { employees } = useEmployeeDirectory();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startTime: new Date(),
      endTime: new Date(),
    },
  });

  const handleAddPeople = (person: User) => {
    // Ensure person has required fields
    const personWithRequiredFields = {
      id: person.id,
      name: person.name || person.email?.split('@')[0] || 'Unknown',
      email: person.email || ''
    };

    if (!addedPeople.find((p) => p.id === personWithRequiredFields.id)) {
      setAddedPeople([...addedPeople, personWithRequiredFields]);
    }
  };

  const handleRemovePerson = (person: User) => {
    // Ensure person has required fields
    const personWithRequiredFields = {
      id: person.id,
      name: person.name || person.email?.split('@')[0] || 'Unknown',
      email: person.email || ''
    };

    setAddedPeople(addedPeople.filter((p) => p.id !== personWithRequiredFields.id));
  };

  const onSubmit = async (data: EventFormValues) => {
    setIsSaving(true);
    try {
      // We need to check which table exists in our database
      // Since 'team_calendar' table doesn't exist, let's use 'company_events'
      const { error } = await supabase
        .from('company_events')
        .insert({
          title: data.title,
          description: data.description || '',
          location: data.location || '',
          start_date: data.startTime.toISOString(),
          end_date: data.endTime.toISOString(),
          created_by: addedPeople[0]?.id || '', // Just use the first person as creator for now
          attendance_type: 'required'
        });

      if (error) {
        toast.error("Failed to create event");
        console.error("Error creating event:", error);
      } else {
        toast.success("Event created successfully!");
        form.reset();
        setAddedPeople([]);
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to create event");
      console.error("Error creating event:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    onSubmit,
    addedPeople,
    handleAddPeople,
    handleRemovePerson,
    availablePeople: employees,
    isSaving,
    // Add the missing properties to the return object
    loading: isSaving, // Alias isSaving as loading for backward compatibility
    sendNotifications,
    setSendNotifications,
    notifyAll,
    setNotifyAll,
    selectedUserIds,
    setSelectedUserIds
  };
};
