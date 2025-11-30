/**
 * Retrieval tool for the RAG agent
 */

import * as z from 'zod';
import { tool } from 'langchain';
import { getVectorStore } from './pinecone-setup';
import { ragConfig } from './config';
import { performanceState } from './types';

/**
 * Creates a retrieval tool that searches the Pinecone vector store
 */
export async function createRetrievalTool() {
  const vectorStore = await getVectorStore();

  return tool(
    async ({ query }) => {
      try {
        // Start timing retrieval
        const retrievalStart = performance.now();

        // Perform similarity search
        const results = await vectorStore.similaritySearch(
          query,
          ragConfig.retrieval.topK
        );

        // Calculate retrieval time
        const retrievalTimeMs = performance.now() - retrievalStart;
        performanceState.lastRetrievalTimeMs = retrievalTimeMs;

        console.log(`\n📊 [PERFORMANCE] Pinecone Retrieval Time: ${retrievalTimeMs.toFixed(2)}ms`);
        console.log(`📊 [PERFORMANCE] Documents Retrieved: ${results.length}`);

        // Format results for the agent
        if (results.length === 0) {
          return 'No relevant information found in the knowledge base.';
        }

        const formattedResults = results
          .map((doc, index) => {
            const content = doc.pageContent;
            const metadata = doc.metadata;
            return `[Source ${index + 1}]\n${content}\n${metadata ? `Metadata: ${JSON.stringify(metadata)}` : ''}`;
          })
          .join('\n\n---\n\n');

        console.log('Retrieval results:', formattedResults);

        return `Retrieved ${results.length} relevant document(s):\n\n${formattedResults}`;
      } catch (error) {
        console.error('Retrieval error:', error);
        return `Error retrieving information: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
    {
      name: 'search_knowledge_base',
      description: 'Search the knowledge base for relevant information to answer user questions. Use this tool when you need to find specific information from the stored documents.',
      schema: z.object({
        query: z.string().describe('The search query to find relevant information'),
      }),
    }
  );
}

