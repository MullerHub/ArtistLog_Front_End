import { contractsCoreService } from "@/services/contracts-core-service";
import { proposalsService } from "@/services/proposals-service";
import { messagesService } from "@/services/messages-service";
import { auditService } from "@/services/audit-service";
import { signatureService } from "@/services/signature-service";

export const contractsService = {
  list: contractsCoreService.list,
  getById: contractsCoreService.getById,
  updateStatus: contractsCoreService.updateStatus,
  listProposals: proposalsService.list,
  createProposal: proposalsService.create,
  acceptProposal: proposalsService.accept,
  rejectProposal: proposalsService.reject,
  listMessages: messagesService.list,
  sendMessage: messagesService.send,
  markAsRead: messagesService.markAsRead,
  getUnreadCount: messagesService.getUnreadCount,
  getAudit: auditService.list,
  getTemplates: signatureService.getTemplates,
};

export { contractsCoreService, proposalsService, messagesService, auditService, signatureService };
