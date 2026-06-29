---
title: Projects
---

## Projects

# [Unity Physics Lab](https://github.com/ONEoo7/unity_physics_lab)
> Visualize physics experiments
> - Chladni Plate (A Chladni plate is a device used to visualize sound vibrations, where sand is spread on a metal plate that vibrates at specific frequencies, creating distinct patterns known as Chladni figures. These patterns illustrate the standing waves and nodal lines formed during resonance, helping to demonstrate the principles of acoustics)

![Chladni patterns 1](/content/images/unity_physics_lab/chladni-1.png) ![Chladni patterns 2](/content/images/unity_physics_lab/chladni-2.png) ![Chladni patterns 3](/content/images/unity_physics_lab/chladni-3.png)

# [Unity Mobile Application](https://github.com/ONEoo7/unity_app_example)
> Playground application for testing unity features  
> - Firebase integrated

# [CallMind](https://github.com/ONEoo7/ai_tools_callmind)
> Record user microphone and desktop audio and use Speech-to-text model (ex: whisper) to transcribe live
> - Can save recording to .wav
> - Can try to answer question asked by either callers using LLM
> - Can select different inference providers (local: LM Studio, cloud: OpenAI/Anthropic)

![CallMind 1](/content/images/callmind/callmind_1.png) ![CallMind 2](/content/images/callmind/callmind_2.png)

# [Local Speech-To-Text](https://github.com/ONEoo7/ai_tools_whisper_speech_to_text)
> Run locally OpenAI Whisper models for speech-to-text
> - tested on RTX 5090 laptop GPU using experimental PyTorch cu128
> - works with CallMind application

# BrainsAI
> AI chat interface for separate Agents
> - frontend: Electron, Copilotkit, React, Next.js
> - backend: Agent orchestration (CrewAI), Observability (Langfuse), LLM Gateway (LiteLLM Proxy Server), Embeddings Database (qdrant), Knowledge Graph (neo4j), Document Processing (Docling)
> - Requirements Engineering Assistant based on ASPICE v4
> - PDF import wizard, complete with cleanup, VLM image to text, Table conversion to markdown/json and original document formatting preservation
> - Requirements tasks like: ambiguity, contradiction, rules base analysis (INCOSE), decomposition to system level req, function and domain further decomposition and assignment (ex: sw, hw and mechanical)

![Brains AI 1](/content/images/brains_ai/brains_ai_1.png) ![Brains AI 2](/content/images/brains_ai/brains_ai_2.png) ![Brains AI 3](/content/images/brains_ai/brains_ai_3.png) ![Brains AI 4](/content/images/brains_ai/brains_ai_4.png)

# [DFMEA Inspector](https://github.com/ONEoo7/dev_tools_dfmea)
> Import an APIS IQ export (MSR FMEA 2.1.2) and explore the structure tree and failure net.

![DFMEA Inspector 1](/content/images/dfmea_inspector/dfmea_inspector_1.png)

# [neo4j Graph Explorer](https://github.com/ONEoo7/dev_tools_neo4j_graph_explorer)
> Web app for visualizing neo4j graphs

![neo4j Graph Explorer 1](/content/images/neo4j_graph_explorer/neo4j_graph_explorer_1.png)

# [Dev Tools Best Practices](https://github.com/ONEoo7/dev_tools_best_practices)
> Best Practices for different programming languages and standards
> C
> C++
> Java
> Python
> Rust
> C#
> html
> css
> javascript
> typescript

# [AI Tools Evals](https://github.com/ONEoo7/ai_tools_evals)
> Evaluate context window degradation for local (LM Studio) and cloud-based inference (OpenAI, Anthropic)
>
> **Scenarios**
> - Factual Recall
> - Reasoning
> - Instruction Following
> - Tool Calling
>
> **Phases**
> - **Phase 1**: parallel batching with one question + one answer
> - **Phase 1 (serial)**: same setup as Phase 1, but executed serially
> - **Phase 2**: one question + one answer as the conversation grows
>
> **Validation**
> - LLM-as-a-Judge for correctness checking
>
> **Agentic AI**
> - TODO