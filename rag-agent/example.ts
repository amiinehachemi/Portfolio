/**
 * Example usage of the RAG Agent
 * This file demonstrates how to use the RAG agent
 */

import { queryRAGAgent, streamRAGAgent } from './index';

/**
 * Example: Simple query
 */
export async function exampleSimpleQuery() {
  try {
    const result = await queryRAGAgent('What is artificial intelligence?');
    console.log('Answer:', result.answer);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Streaming response
 */
export async function exampleStreamingQuery() {
  try {
    console.log('Streaming response:');
    for await (const chunk of streamRAGAgent('Explain machine learning')) {
      process.stdout.write(chunk);
    }
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Custom configuration
 */
export async function exampleCustomConfig() {
  try {
    const result = await queryRAGAgent('What is deep learning?', {
      model: 'gpt-4o-mini',
      temperature: 0.5,
      topK: 10,
    });
    console.log('Answer:', result.answer);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run examples:
//exampleSimpleQuery();
// exampleStreamingQuery();
// exampleCustomConfig();

