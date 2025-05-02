
import React from 'react';
import { User } from '@/types';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UserTableProps {
  employees: User[];
  loading: boolean;
  error: string | Error | null;
  onUpdate: (id: string, user: Partial<User>) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

export function UserTable({ 
  employees, 
  loading,
  error,
  onUpdate,
  onDelete,
  onRetry
}: UserTableProps) {
  // Update the handleEdit function to call onUpdate with the employee data
  const handleEdit = (employee: User) => {
    console.log('Edit employee:', employee);
    onUpdate(employee.id, employee);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex justify-between w-full items-center">
          <span>
            {typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error loading employees'}
          </span>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{employee.name}</span>
                  {employee.employeeId && (
                    <span className="text-xs text-muted-foreground">#{employee.employeeId}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.department || "-"}</TableCell>
              <TableCell>{employee.position || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(employee)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(employee.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
