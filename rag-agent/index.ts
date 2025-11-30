/**
 * Main RAG Agent
 * Simple RAG agent that retrieves information from Pinecone and answers questions
 */

import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createRetrievalTool } from './retrieval-tool';
import { ragConfig } from './config';
import type { RAGQueryResult, RAGAgentConfig } from './types';
import { performanceState } from './types';
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
6. Highlight Amine's relevant expertise, achievements, and technologies when appropriate

FORMATTING RULES (IMPORTANT):
- Always format your responses using Markdown syntax
- Use **bold** for emphasis on key terms, skills, or achievements
- Use bullet points (- or *) for lists
- Use ### for section headers when organizing information
- Use \`backticks\` for technical terms, technologies, and code
- Use > for notable quotes or highlights
- Keep paragraphs short and scannable
- Example format:
  ### Skills
  - **Backend**: \`Node.js\`, \`TypeScript\`, microservices
  - **AI/ML**: RAG, vector databases, LLM integrations`,
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
    // Start timing total query
    const totalStart = performance.now();
    
    // Reset retrieval time tracking
    performanceState.lastRetrievalTimeMs = 0;

    console.log(`\n🚀 [PERFORMANCE] Starting RAG query: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);

    const agent = await initializeRAGAgent(config);
    const initTime = performance.now() - totalStart;
    console.log(`⏱️  [PERFORMANCE] Agent Init Time: ${initTime.toFixed(2)}ms`);

    const invokeStart = performance.now();
    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });
    const invokeTime = performance.now() - invokeStart;

    // Calculate total time
    const totalTimeMs = performance.now() - totalStart;
    const retrievalTimeMs = performanceState.lastRetrievalTimeMs;
    const modelTimeMs = invokeTime - retrievalTimeMs;

    // Log performance summary
    console.log(`\n📊 ========== PERFORMANCE SUMMARY ==========`);
    console.log(`⏱️  Total Time:       ${totalTimeMs.toFixed(2)}ms`);
    console.log(`🔍 Retrieval Time:   ${retrievalTimeMs.toFixed(2)}ms (${((retrievalTimeMs / totalTimeMs) * 100).toFixed(1)}%)`);
    console.log(`🤖 Model Time:       ${modelTimeMs.toFixed(2)}ms (${((modelTimeMs / totalTimeMs) * 100).toFixed(1)}%)`);
    console.log(`📊 ==========================================\n`);

    // Extract the final answer from the messages
    const lastMessage = result.messages[result.messages.length - 1];
    const answer = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);

    // Suggest relevant pages based on the query
    const suggestedPages = suggestPages(question);

    const queryResult: RAGQueryResult = {
      answer,
      performance: {
        totalTimeMs: Math.round(totalTimeMs),
        retrievalTimeMs: Math.round(retrievalTimeMs),
        modelTimeMs: Math.round(modelTimeMs),
      },
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
    // Start timing
    const streamStart = performance.now();
    performanceState.lastRetrievalTimeMs = 0;
    let firstChunkTime: number | null = null;

    console.log(`\n🚀 [PERFORMANCE] Starting RAG stream: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);

    const agent = await initializeRAGAgent(config);

    // Use streamEvents to get proper token-by-token streaming
    const eventStream = agent.streamEvents(
      {
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      },
      { version: 'v2' }
    );

    for await (const event of eventStream) {
      // Stream tokens from the chat model
      if (event.event === 'on_chat_model_stream') {
        const chunk = event.data?.chunk;
        if (chunk?.content) {
          if (firstChunkTime === null) {
            firstChunkTime = performance.now() - streamStart;
            console.log(`⏱️  [PERFORMANCE] Time to First Chunk: ${firstChunkTime.toFixed(2)}ms`);
          }
          
          const content = typeof chunk.content === 'string' 
            ? chunk.content 
            : JSON.stringify(chunk.content);
          
          if (content) {
            yield content;
          }
        }
      }
    }

    // Log performance summary after stream completes
    const totalStreamTime = performance.now() - streamStart;
    const retrievalTimeMs = performanceState.lastRetrievalTimeMs;
    
    console.log(`\n📊 ========== STREAM PERFORMANCE SUMMARY ==========`);
    console.log(`⏱️  Total Stream Time:    ${totalStreamTime.toFixed(2)}ms`);
    console.log(`🔍 Retrieval Time:        ${retrievalTimeMs.toFixed(2)}ms`);
    console.log(`⚡ Time to First Chunk:   ${firstChunkTime?.toFixed(2) || 'N/A'}ms`);
    console.log(`📊 ==================================================\n`);
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

