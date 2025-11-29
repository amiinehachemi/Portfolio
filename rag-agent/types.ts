/**
 * Types for the RAG Agent
 */

export interface RAGQueryResult {
  answer: string;
  sources?: Array<{
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface RAGAgentConfig {
  model?: string;
  temperature?: number;
  topK?: number;
}

