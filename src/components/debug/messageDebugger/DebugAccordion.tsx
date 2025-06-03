
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';
import { NavigationState } from './types';

interface DebugAccordionProps {
  messages: Communication[];
  selectedEmployee: User | null;
  error?: any;
  navigationState?: NavigationState;
}

export function DebugAccordion({ messages, selectedEmployee, error, navigationState }: DebugAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="messages-data">
        <AccordionTrigger className="text-xs py-1">Messages Data Sample</AccordionTrigger>
        <AccordionContent>
          <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
            {messages && messages.length > 0 
              ? JSON.stringify(messages.slice(0, 2), null, 2) 
              : 'No messages available'}
          </pre>
        </AccordionContent>
      </AccordionItem>
      
      {selectedEmployee && (
        <AccordionItem value="selected-employee">
          <AccordionTrigger className="text-xs py-1">Selected Employee</AccordionTrigger>
          <AccordionContent>
            <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
              {JSON.stringify(selectedEmployee, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      )}
      
      {error && (
        <AccordionItem value="error-details">
          <AccordionTrigger className="text-xs py-1 text-destructive">Error Details</AccordionTrigger>
          <AccordionContent>
            <pre className="text-[10px] bg-destructive/10 p-2 rounded overflow-x-auto max-h-32 text-destructive">
              {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      )}
      
      {navigationState && (
        <AccordionItem value="navigation-state" defaultValue="navigation-state">
          <AccordionTrigger className="text-xs py-1">Navigation State</AccordionTrigger>
          <AccordionContent>
            <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
              {JSON.stringify(navigationState, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="url-breakdown">
        <AccordionTrigger className="text-xs py-1">URL Analysis</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <div>
              <strong>Current Path:</strong> {window.location.pathname}
            </div>
            <div>
              <strong>Search Params:</strong> {window.location.search || "(none)"}
            </div>
            <div>
              <strong>Tab Parameter:</strong> {new URLSearchParams(window.location.search).get('tab') || "(none)"}
            </div>
            <div>
              <strong>Recovery Mode:</strong> {new URLSearchParams(window.location.search).get('recovery') === 'true' ? "Yes" : "No"}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="possible-solutions">
        <AccordionTrigger className="text-xs py-1">Troubleshooting Steps</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <p className="font-medium">If you're getting kicked out of messages tab:</p>
            <ol className="list-decimal pl-4">
              <li>Use the "Fix Navigation Loop" button in the navigation bar</li>
              <li>Try adding "?recovery=true" to your URL</li>
              <li>Clear localStorage and browser cache</li>
              <li>Try a different browser</li>
              <li>Check console for specific errors</li>
            </ol>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
