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
  const { employees } = useEmployeeDirectory();
  const [isSaving, setIsSaving] = useState(false);

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
      const { error } = await supabase
        .from('team_calendar')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          start_time: data.startTime.toISOString(),
          end_time: data.endTime.toISOString(),
          people: addedPeople.map((person) => person.id),
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
    isSaving
  };
};
