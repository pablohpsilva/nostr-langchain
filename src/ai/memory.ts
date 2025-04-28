import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { BufferMemory } from "langchain/memory";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import { AIMessage } from "@langchain/core/messages";
import { TavilySearch } from "@langchain/tavily";
import { createRetrieverTool } from "langchain/tools/retriever";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createInterface } from "readline";

import { createCheerioVectorStore } from "./vector-store";

dotenv.config();

export async function memorySimpleSample(
  input: string,
  pourpose = "You are an AI assistant"
) {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
      ${pourpose}
      History: {history}
      {input}`);

  const memory = new BufferMemory({
    memoryKey: "history",
  });

  const chain = new ConversationChain({
    llm: model,
    prompt,
    memory,
  });

  return await chain.invoke({ input });
}

export async function agentWithToolsAndHistoryAndRetrieversSample({
  disableChat = false,
}: {
  disableChat: boolean;
}) {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are a helpful assistant called Max."),
    new MessagesPlaceholder("chat_history"),
    new HumanMessage("{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const vectorStore = await createCheerioVectorStore();

  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  // get API KEY https://app.tavily.com/home
  // TAVILY_API_KEY
  const onlineSearchTool = new TavilySearch();
  const retrieverTool = createRetrieverTool(retriever, {
    name: "lcel_search",
    description:
      "Use this tools when searching information about Langchain Expression Language (LCEL)",
  });
  const tools = [onlineSearchTool, retrieverTool];

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools,
  });

  const agentExecutor = new AgentExecutor({ agent, tools });

  const response = await agentExecutor.invoke({
    input: "What is the current weather in west of Zimbabwe?",
  });

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const chatHistory: BaseMessage[] = [];
  if (!disableChat) {
    function askQuestion() {
      rl.question("User: ", async (input) => {
        if (input.toLowerCase() === "exit") {
          rl.close();
          return;
        }

        const response = await agentExecutor.invoke({
          input,
          chat_history: chatHistory,
        });

        chatHistory.push(new HumanMessage(input));
        chatHistory.push(new AIMessage(response.output));

        askQuestion();
      });
    }

    askQuestion();
  }
}
