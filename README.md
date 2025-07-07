
# Research Assistant Agent

## Agent Description and Purpose

The **Research Assistant Agent** is an AI-powered agent built with Mastra framework designed to assist users in generating research summaries and PDF reports for any academic or technical topic. It leverages the **Semantic Scholar API** to retrieve research papers and provides a detailed summary of relevant academic papers.

- **Purpose:** To help users quickly gather research data and generate structured reports.
- **Primary Tools Used:**
  - **Semantic Scholar API**: Retrieves research papers based on a user-defined topic.
  - **Report Builder**: Generates a detailed research report including a summary

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/codejutsu1/research-agent.git
cd research-agent
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set up environmental variables
The agent requires certain environment variables for configuration. These can be specified in the `.env` or `.env.docker` file.

**Required Environmental Variables**
- `SEMANTIC_SCHOLAR_API_KEY` :  (Optional) API key for accessing the Semantic Scholar API. If not provided, public access will be used, but with rate limits.
- `MODEL_NAME_AT_ENDPOINT` : The model you are using for your agent, e.g., qwen2.5:1.5b.
- `API_BASE_URL` : The URL of the model API, usually http://127.0.0.1:11434/api for local development or a Nosana endpoint in production.

Example `.env` file:

```bash
# For Production
# API_BASE_URL=https://<nosana-url-id>.node.k8s.prd.nos.ci/api
# MODEL_NAME_AT_ENDPOINT=qwen2.5:32b

#For Local development
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b


SEMANTIC_SCHOLAR_API_KEY=
```

### 4. Docker build and run commands
- **Build Docker Image** : Make sure you have Docker installed on your machine. Build the docker image by running: 

```bash
docker build -t research-agent .
```

- **Run Docker Container** : To run the docker locally: 

```bash
docker run -p 8080:8080 --env-file .env.docker research-agent
```

This will start the agent and expose it on port 8080.

### 5. Example Usage
Once the container is up and running, you can interact with the agent via HTTP requests. You can use Postman or cURL to test the agent.

- **Test the API Endpoint**

  Send a `POST` request to the agent:

    - **URL** - http://localhost:4111/api/agents/research-agent/generate
    - Body (JSON)

    ```bash
        {
            "query": "AI in Finance"
        }
    ```

