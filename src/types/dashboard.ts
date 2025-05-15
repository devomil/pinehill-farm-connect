
import React from "react";

export interface WidgetDefinition {
  id: string;
  title: string;
  columnSpan: number;
  component: React.ReactNode;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
  isBounded?: boolean;
}

export interface GridConfig {
  breakpoints: { lg: number; md: number; sm: number; xs: number; xxs: number };
  cols: { lg: number; md: number; sm: number; xs: number; xxs: number };
}

export interface WidgetConfig {
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}
