/**
 * Types for the RAG Agent
 */

export interface PageSuggestion {
  title: string;
  href: string;
  description?: string;
}

export interface PerformanceMetrics {
  totalTimeMs: number;
  retrievalTimeMs?: number;
  modelTimeMs?: number;
}

export interface RAGQueryResult {
  answer: string;
  suggestedPages?: PageSuggestion[];
  sources?: Array<{
    content: string;
    metadata?: Record<string, unknown>;
  }>;
  performance?: PerformanceMetrics;
}

export interface RAGAgentConfig {
  model?: string;
  temperature?: number;
  topK?: number;
}

// Shared state for passing retrieval metrics
export const performanceState = {
  lastRetrievalTimeMs: 0,
};

