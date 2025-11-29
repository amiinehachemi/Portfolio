# RAG Agent

A simple RAG (Retrieval-Augmented Generation) agent built with LangChain and Pinecone.

## Overview

This RAG agent retrieves information from a Pinecone vector database and uses an LLM to answer questions based on the retrieved context.

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_environment  # Optional, depends on your Pinecone setup

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
LLM_MODEL_NAME=gpt-4o  # Optional, defaults to gpt-4o
LLM_TEMPERATURE=0.7    # Optional, defaults to 0.7

# Retrieval Configuration
RETRIEVAL_TOP_K=5      # Optional, defaults to 5
```

## Usage

### Basic Query

```typescript
import { queryRAGAgent } from '@/rag-agent';

const result = await queryRAGAgent('What is machine learning?');
console.log(result.answer);
```

### Streaming Response

```typescript
import { streamRAGAgent } from '@/rag-agent';

for await (const chunk of streamRAGAgent('Explain neural networks')) {
  process.stdout.write(chunk);
}
```

### Custom Configuration

```typescript
import { queryRAGAgent } from '@/rag-agent';

const result = await queryRAGAgent('What is AI?', {
  model: 'gpt-4o-mini',
  temperature: 0.5,
  topK: 10,
});
```

## Architecture

- **`config.ts`**: Configuration management
- **`types.ts`**: TypeScript type definitions
- **`pinecone-setup.ts`**: Pinecone client and vector store initialization
- **`retrieval-tool.ts`**: LangChain tool for retrieving documents from Pinecone
- **`index.ts`**: Main agent initialization and query functions

## How It Works

1. User asks a question
2. Agent uses the `search_knowledge_base` tool to retrieve relevant documents from Pinecone
3. Agent uses the retrieved context to generate an answer
4. Answer is returned to the user

The agent follows the ReAct pattern, reasoning about when to use the retrieval tool and how to synthesize the information into a coherent answer.

