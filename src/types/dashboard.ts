
import React from "react";

export interface WidgetDefinition {
  id: string;
  title: string;
  columnSpan: number;
  component: React.ReactNode;
  minHeight?: number;
  minWidth?: number;
  maxHeight?: number;
  maxWidth?: number;
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
  minW?: number;
  minH?: number;
  maxW?: number; 
  maxH?: number;
}

export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ResizableWidgetProps {
  id: string;
  width: number;
  height: number;
  onResize?: (id: string, size: { width: number; height: number }) => void;
  children: React.ReactNode;
}
