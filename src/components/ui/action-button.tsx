
import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

interface ActionButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  confirmAction?: boolean;
  confirmMessage?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  loading,
  loadingText = "Loading...",
  icon,
  confirmAction,
  confirmMessage = "Are you sure you want to continue?",
  onClick,
  disabled,
  className,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmAction && !window.confirm(confirmMessage)) {
      return;
    }
    onClick?.(e);
  };

  return (
    <Button
      {...props}
      className={cn(className)}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? (
        <>
          <LoadingState variant="inline" className="w-4 h-4 mr-2" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
};
