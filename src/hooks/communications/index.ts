
// Re-export communication hooks for easier imports
export * from './useGetCommunications';
export * from './useSendMessage';
export * from './useRespondToShiftRequest';
export * from './useUnreadMessages';
export * from './useRefreshMessages';
export * from './useMessageReadingManager';
// We're not exporting useMessageRefreshManager directly, since it's already exported via useRefreshMessages
export * from './useMessageValidation';
export * from './useMessageSendOperations';
export * from './utils/notificationUtils';
export * from './services/messageSendingService';
