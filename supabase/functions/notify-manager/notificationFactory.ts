
import { NotificationRequest, ManagerProfile } from "./notificationTypes.ts";

export function createNotifications(
  request: NotificationRequest, 
  managerProfiles: ManagerProfile[],
  isCC = false
) {
  switch (request.actionType) {
    case "shift_report":
      // If there's an assignedTo field, create notification specifically for that person
      if (request.assignedTo && request.assignedTo.id) {
        const assignedManager = managerProfiles.find(m => m.id === request.assignedTo?.id);
        if (assignedManager) {
          return [{
            user_id: assignedManager.id,
            type: request.actionType,
            message: `Employee ${request.actor.name} assigned you a ${request.details.priority || "high"} priority report.`,
            data: { actor: request.actor, details: request.details, assigned: true },
          }];
        }
      }
      
      // Default case: notify all managers
      return managerProfiles.map(manager => ({
        user_id: manager.id,
        type: request.actionType,
        message: `Employee ${request.actor.name} submitted a ${request.details.priority || "high"} priority report.`,
        data: { actor: request.actor, details: request.details },
      }));
      
    case "time_off_request":
      return managerProfiles.map(manager => ({
        user_id: manager.id,
        type: request.actionType,
        message: `Employee ${request.actor.name} requested time off.`,
        data: { actor: request.actor, details: request.details },
      }));
      
    case "event_created":
      const userIds = request.details.recipients === "all" 
        ? managerProfiles.map(m => m.id)
        : request.details.recipients;
        
      return userIds
        .filter(id => id !== request.actor.id)
        .map(userId => ({
          user_id: userId,
          type: request.actionType,
          message: `${request.actor.name} added a new event: ${request.details.event.title}`,
          data: { actor: request.actor, event: request.details.event },
        }));
        
    case "training_assigned":
      return request.details.assignedUserIds.map(userId => ({
        user_id: userId,
        type: request.actionType,
        message: `You've been assigned a new training: ${request.details.trainingTitle}`,
        data: { 
          actor: request.actor, 
          trainingId: request.details.trainingId,
          trainingTitle: request.details.trainingTitle
        },
      }));
      
    case "new_message":
      // For direct messages, create a notification for the assigned recipient
      if (request.assignedTo && request.assignedTo.id) {
        return [{
          user_id: request.assignedTo.id,
          type: request.actionType,
          message: `You have a new message from ${request.actor.name}.`,
          data: { 
            actor: request.actor, 
            message: request.details.message,
            communicationId: request.details.communicationId
          },
        }];
      }
      return [];
      
    case "shift_coverage_request":
      // For shift coverage requests, create a notification for the assigned recipient or CC
      if (request.assignedTo && request.assignedTo.id) {
        const messagePrefix = isCC ? `[CC] ${request.actor.name} requested shift coverage from ${request.assignedTo.name}.` : 
                                    `${request.actor.name} has requested shift coverage.`;
        return [{
          user_id: request.assignedTo.id,
          type: isCC ? `${request.actionType}_cc` : request.actionType,
          message: messagePrefix,
          data: { 
            actor: request.actor, 
            message: request.details.message,
            communicationId: request.details.communicationId,
            shiftDate: request.details.shift_date,
            shiftStart: request.details.shift_start,
            shiftEnd: request.details.shift_end,
            isCC: isCC
          },
        }];
      }
      return [];
    
    case "shift_coverage_response":
      // For shift coverage responses, create a notification for the original requester or CC
      if (request.assignedTo && request.assignedTo.id) {
        const responseStatus = request.details.response === 'accepted' ? 'accepted' : 'declined';
        const messagePrefix = isCC ? `[CC] ${request.actor.name} has ${responseStatus} a shift coverage request from ${request.assignedTo.name}.` : 
                                    `${request.actor.name} has ${responseStatus} your shift coverage request.`;
        return [{
          user_id: request.assignedTo.id,
          type: isCC ? `${request.actionType}_cc` : request.actionType,
          message: messagePrefix,
          data: { 
            actor: request.actor, 
            response: responseStatus,
            communicationId: request.details.communicationId,
            isCC: isCC
          },
        }];
      }
      return [];
    
    default:
      throw new Error(`Unhandled action type: ${request.actionType}`);
  }
}
