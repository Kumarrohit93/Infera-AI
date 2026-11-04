
# Infera AI – Project Overview

## 1. Introduction
Infera AI is an AI-powered knowledge base that allows organisations
to upload documents and ask questions about their content.

It uses Retrieval-Augmented Generation (RAG) to retrieve relevant
information and generate answers with source references.

## 2. Problem Statement
Organisations often maintain large numbers of documents.
Finding specific information manually can be time-consuming.

## 3. Proposed Solution
Infera AI provides a centralised platform where admins upload
and organise documents and members ask questions through
an AI chat interface.

The system retrieves relevant information from permitted
documents and provides answers with document and page references.

## 4. User Roles

### Admin
- Upload and manage documents.
- Create folders.
- Invite members.
- Manage folder permissions.
- Monitor processing and feedback.

### Member
- Browse permitted documents.
- Ask questions through AI Chat.
- View answers and citations.
- Access previous conversations.
- Rate AI answers.

## 5. Supported Documents
- PDF
- DOCX
- TXT

## 6. Main Working Process

### Document Processing
1. Admin uploads a document.
2. Original file is stored.
3. Text is extracted.
4. Text is divided into chunks.
5. Embeddings are generated.
6. Chunks and embeddings are stored in PostgreSQL.

### Question Answering
1. Member asks a question.
2. System checks user permissions.
3. Question is converted into an embedding.
4. Relevant chunks are retrieved.
5. Retrieved content is sent to the LLM.
6. Answer and source citations are returned.

## 7. Proposed Technology Stack
- Backend: Node.js and Express
- Frontend: React and Vite
- Database: PostgreSQL
- Vector Search: pgvector
- Background Jobs: Redis and BullMQ
- AI: OpenAI API
- Version Control: Git and GitHub

## 8. Project Status
As of System Design Version 0.1, dated
4 November 2026, the basic Express backend skeleton
has been implemented. Other features are planned.
