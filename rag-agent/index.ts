/**
 * Main RAG Agent
 * Simple RAG agent that retrieves information from Pinecone and answers questions
 */

import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createRetrievalTool } from './retrieval-tool';
import { ragConfig } from './config';
import type { RAGQueryResult, RAGAgentConfig } from './types';

let agentInstance: Awaited<ReturnType<typeof createAgent>> | null = null;

/**
 * Initialize the RAG agent
 */
export async function initializeRAGAgent(config?: RAGAgentConfig) {
  if (agentInstance) {
    return agentInstance;
  }

  // Validate configuration
  if (!ragConfig.model.apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  // Initialize model
  const model = new ChatOpenAI({
    model: config?.model || ragConfig.model.modelName,
    temperature: config?.temperature ?? ragConfig.model.temperature,
    openAIApiKey: ragConfig.model.apiKey,
  });

  // Create retrieval tool
  const retrievalTool = await createRetrievalTool();

  // Create agent with retrieval tool
  agentInstance = createAgent({
    model,
    tools: [retrievalTool],
    systemPrompt: `You are a helpful assistant that answers questions based on information retrieved from a knowledge base. 
    
When answering questions:
1. Use the search_knowledge_base tool to find relevant information
2. Base your answers strictly on the retrieved information
3. If the retrieved information doesn't contain the answer, say so clearly
4. Cite sources when possible
5. Be concise and accurate`,
  });

  return agentInstance;
}

/**
 * Query the RAG agent with a question
 */
export async function queryRAGAgent(
  question: string,
  config?: RAGAgentConfig
): Promise<RAGQueryResult> {
  try {
    const agent = await initializeRAGAgent(config);

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    // Extract the final answer from the messages
    const lastMessage = result.messages[result.messages.length - 1];
    const answer = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);

    return {
      answer,
    };
  } catch (error) {
    console.error('RAG Agent query error:', error);
    throw new Error(
      `Failed to query RAG agent: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Stream responses from the RAG agent
 */
export async function* streamRAGAgent(
  question: string,
  config?: RAGAgentConfig
): AsyncGenerator<string, void, unknown> {
  try {
    const agent = await initializeRAGAgent(config);

    const stream = await agent.stream(
      {
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      },
      { streamMode: 'messages' }
    );

    for await (const chunk of stream) {
      if (chunk.content) {
        const content = typeof chunk.content === 'string' 
          ? chunk.content 
          : JSON.stringify(chunk.content);
        yield content;
      }
    }
  } catch (error) {
    console.error('RAG Agent stream error:', error);
    throw new Error(
      `Failed to stream RAG agent: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Reset the agent instance (useful for testing or reconfiguration)
 */
export function resetRAGAgent() {
  agentInstance = null;
}

