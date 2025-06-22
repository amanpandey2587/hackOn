from langchain.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint
from dotenv import load_dotenv
import os

load_dotenv()

llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mistral-7B-Instruct-v0.2",
    temperature=0.7,
    max_new_tokens=100,
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)

prompt = PromptTemplate(
    input_variables=["mood", "streaming_service"],
    template="Suggest a good movie to watch on {streaming_service} when feeling {mood}."
)

chain = prompt | llm

response = chain.invoke({
    "mood": "happy",
    "streaming_service": "Netflix"
})

print("✅ HuggingFace LLM Response:\n", response)
