/**
 * Main RAG Agent
 * Simple RAG agent that retrieves information from Pinecone and answers questions
 */

import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createRetrievalTool } from './retrieval-tool';
import { ragConfig } from './config';
import type { RAGQueryResult, RAGAgentConfig } from './types';
import { suggestPages } from '@/lib/page-suggestions';

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
    systemPrompt: `You are an AI assistant for Amine Hachemi's portfolio website. You help visitors such as CEOs, HR professionals, recruiters, and collaborators learn about Amine's background, skills, and experience.

About Amine:
- Tech Lead and Software Engineer at Intelswift
- Specializes in AI integrations, backend systems, microservices, and multi channel communication platforms
- Experienced with RAG, AI agents, vector databases, and scalable system design
- Strong background in Node.js, TypeScript, React, Next.js, and cloud technologies

Your role:
1. Use the search_knowledge_base tool to find relevant information about Amine
2. Provide answers that are clear, concise, and business friendly
3. Offer summaries when helpful and keep responses shorter than a full paragraph
4. Give detailed information, but in compact form using short sentences or bullet points
5. If information is missing from the knowledge base, say so politely and guide the user to explore the portfolio pages
6. Highlight Amine's relevant expertise, achievements, and technologies when appropriate`,
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

    // Suggest relevant pages based on the query
    const suggestedPages = suggestPages(question);

    const queryResult: RAGQueryResult = {
      answer,
    };

    if (suggestedPages.length > 0) {
      queryResult.suggestedPages = suggestedPages;
    }

    return queryResult;
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
      const chunkContent = (chunk as any).content;
      if (chunkContent) {
        const content = typeof chunkContent === 'string' 
          ? chunkContent 
          : JSON.stringify(chunkContent);
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

