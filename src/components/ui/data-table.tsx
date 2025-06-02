
import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | Error | null;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
  rowKey?: keyof T | ((item: T) => string | number);
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading,
  error,
  emptyMessage = "No data available",
  onRetry,
  className,
  rowKey = "id",
  onRowClick
}: DataTableProps<T>) {
  const getRowKey = (item: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(item);
    }
    return item[rowKey] || index;
  };

  if (loading) {
    return <LoadingState variant="table" lines={5} className={className} />;
  }

  if (error) {
    return (
      <ErrorState
        message={typeof error === "string" ? error : error.message}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        className={className}
      />
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={getRowKey(item, index)}
              className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render 
                    ? column.render(item[column.key], item, index)
                    : item[column.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
