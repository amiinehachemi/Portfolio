'use server';

import { exampleSimpleQuery } from '@/rag-agent/example';

export async function runRAGExampleServerAction() {
  try {
    await exampleSimpleQuery();
    return { success: true };
  } catch (error) {
    console.error('RAG Example Error:', error);
    return { success: false, error: String(error) };
  }
}

