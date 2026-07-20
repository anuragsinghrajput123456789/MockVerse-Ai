/**
 * paperController.js
 * Facade / Barrel file re-exporting feature-based paper controllers.
 * Keeps backwards compatibility for any modules importing from paperController.js directly.
 */

export { generatePaper } from './generatePaperController.js';
export { evaluateAnswers } from './evaluatePaperController.js';
export { generateSolutions } from './solutionController.js';
export { chatbot } from './chatController.js';
export { getPapers } from './historyController.js';
export { getPaperById, deletePaper } from './paperCrudController.js';
