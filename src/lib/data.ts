
// This file is being deprecated in favor of individual data model files.
// For now, we export types from their new locations for compatibility.

export type { ServiceOrderItem, InvoiceItem, ExpenditureItem as CostItem, Project, ApprovalStage } from './projects';
export { portfolios, subPortfolios, servicesBySubPortfolio } from './projects';
export type { Service } from './projects';
