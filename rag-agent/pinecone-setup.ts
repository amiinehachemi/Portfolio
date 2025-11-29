/**
 * Pinecone vector store setup
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ragConfig } from './config';

let pineconeClient: Pinecone | null = null;
let vectorStore: PineconeStore | null = null;

/**
 * Initialize Pinecone client
 */
export async function initializePinecone(): Promise<Pinecone> {
  if (pineconeClient) {
    return pineconeClient;
  }

  if (!ragConfig.pinecone.apiKey) {
    throw new Error('PINECONE_API_KEY is not set in environment variables');
  }

  pineconeClient = new Pinecone({
    apiKey: ragConfig.pinecone.apiKey,
  });

  return pineconeClient;
}

/**
 * Get or create Pinecone vector store
 */
export async function getVectorStore(): Promise<PineconeStore> {
  if (vectorStore) {
    return vectorStore;
  }

  const client = await initializePinecone();
  
  if (!ragConfig.pinecone.indexName) {
    throw new Error('PINECONE_INDEX_NAME is not set in environment variables');
  }

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: ragConfig.model.apiKey,
  });

  const index = client.Index(ragConfig.pinecone.indexName);

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  return vectorStore;
}

