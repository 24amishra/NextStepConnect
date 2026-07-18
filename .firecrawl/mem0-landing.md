Backed by

![Y Combinator Logo](https://framerusercontent.com/images/kmUcBvmrLootEJToFtDARlMaVg.webp?width=1298&height=1298)

Y Combinator

# AI memory that persists across sessions and agents

Drop-in memory infrastructure for AI agents and apps. Context that persists. Built for production.

[home\_primary\_get-started\\
\\
Home\\
\\
Get Started\\
\\
![](https://framerusercontent.com/images/Nnv5zAtpCo7shRZ5lWIQesZNVc.svg?width=24&height=24)\\
\\
![](https://framerusercontent.com/images/nxdAQkhxdVTYs6LXo68uXTnwvE.svg?width=24&height=24)](https://app.mem0.ai/login)

Copy to ClipboardCopy to ClipboardCopied!

Setup for Agent

Home

home\_secondary\_agentsetup

SDK Integration

Agent Harness

Plugin

![](https://framerusercontent.com/images/zZQaBerDE26biNrcFDcrqlv3fbE.png?width=3840&height=3840)

Python

![](https://framerusercontent.com/images/Gk1LGPAGpTpTicoOix3UdwR02o.png?width=512&height=512)

node js

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23

# Step 1 — Install the SDK (run in your terminal, not in Python):#pip install mem0ai # Step 2 — Save this as mem0_quickstart.py and run with: python mem0_quickstart.pyimport osfrom mem0 import MemoryClient # Set your API key (get one at https://app.mem0.ai)client = MemoryClient(api_key=os.getenv("MEM0_API_KEY", "your-api-key-here")) # Add a memorymessages = [    {"role": "user", "content": "I'm a vegetarian and allergic to nuts."},    {"role": "assistant", "content": "Got it! I'll remember your dietary preferences."},]client.add(messages, user_id="user123") # Search memoriesresults = client.search(    "What are my dietary restrictions?",    user_id="user123",)print(results)
```

90,000+

90,000+

Developers build with Mem0

![](https://framerusercontent.com/images/edCK6KZ8c6CHIMNlR08BqO1KZI.png?width=400&height=92)

![](https://framerusercontent.com/images/9WyUDSSyZEBMVpacMpgg6KDKPsg.png?width=400&height=92)

![](https://framerusercontent.com/images/5yvnUmDGDNOKTHSyQfbdsJV1K8.png?width=400&height=92)

![](https://framerusercontent.com/images/2zp06BiuxCzpzrE18xs0VpNHwU.png?width=400&height=92)

![](https://framerusercontent.com/images/TkJ7W2V229Cp2zw88K34hdw1e00.png?width=400&height=92)

![](https://framerusercontent.com/images/ZMAkcKDuDU9zP3L2jsOsXn9YEOo.png?width=400&height=92)

![](https://framerusercontent.com/images/Ci9nGbKFMxyxAHLoEstQbsSwc.png?width=2880&height=2251)

### Built for <developers>who want proof,   not promises

Mem0 gives agents persistent memory without pipeline changes. Less redundant context, lower token costs, measurably faster responses.

Mem0

[Try Mem0 now](https://app.mem0.ai/login)

Efficiency

Visibility

Control

#### Memory Compression Engine

Automatically condenses chat history into compact memories that cut tokens and latency while keeping the right context.

### How it works

### Add anything. Mem0 learns

prefer

#### Add

Input data in seconds with

no config or boilerplate

#### Learn

Mem0 extracts and  updates memories

#### Retrieve

Mem0 retrieves key memories as users interact

### AI memory that adapts  to your domain

Mem0 helps AI remember what matters.

Healthcare

Education

E-commerce

Customer Support

Sales & CRM

#### Smart Patient Care Assistant

Remembers patient history, allergies, and treatment preferences across visits therefore providing personalized care that improves with every interaction.

#### Chronic Condition Companion

Learns what works (and what doesn’t) for the patient over time, offering thoughtful reminders and insights tailored to each patient’s journey.

#### Therapy Progress Tracker

Builds on previous sessions to deliver consistent, context-aware mental health support. Creates trust through conversations that remember what matters to each patient.

[home\_secondary\_healtcare\\
\\
Home\\
\\
Explore Mem0 for Healthcare](https://mem0.ai/usecase/healthcare)

New Algorithm

### Benchmarking Mem0

Single-pass hierarchical distillation. Multi-signal retrieval. Benchmarked across LoCoMo, LongMemEval, and BEAM.

[home\_primary\_research\\
\\
Home\\
\\
View Research\\
\\
![](https://framerusercontent.com/images/Nnv5zAtpCo7shRZ5lWIQesZNVc.svg?width=24&height=24)\\
\\
![](https://framerusercontent.com/images/nxdAQkhxdVTYs6LXo68uXTnwvE.svg?width=24&height=24)](https://mem0.ai/research)

![](https://framerusercontent.com/images/9qg74AawOPgEaoFTENpBSlrD9Q.webp?width=3386&height=1840)

### Built for enterprise  Designed for control

Memory at scale is infrastructure. Mem0 gives enterprise teams governance, reliability, and full observability so engineers spend time building, not recovering lost context.

#### Governance

SOC 2, HIPAA, BYOK, zero-trust. Your data stays yours.

#### Portable

Kubernetes, private cloud, or air-gapped. Same API everywhere.

#### Auditable

Every read and write logged. Know what, who, and when.

We take security and privacy seriously. Mem0 is SOC 2 (Type 1) and HIPAA compliant, ensuring your data is protected with industry-standard safeguards at every step.

![](https://framerusercontent.com/images/pwhyrZVM1NbIs9YnPqUJULdscmg.png?width=124&height=124)

![](https://framerusercontent.com/images/PYNyqGGRWMCxBkMzHdg2Nwy15Dk.png?width=204&height=116)

[home\_enterprise\_talk-to-team\\
\\
Home\\
\\
Talk to our team\\
\\
![](https://framerusercontent.com/images/Nnv5zAtpCo7shRZ5lWIQesZNVc.svg?width=24&height=24)\\
\\
![](https://framerusercontent.com/images/nxdAQkhxdVTYs6LXo68uXTnwvE.svg?width=24&height=24)](https://app.mem0.ai/enterprise)

Blogs

### Latest from the Mem0 Blog

[![How Perplexity-Style Memory Works?](https://framerusercontent.com/images/NYNEPYbW3fkCVkp3m5I4TdqbM.webp?width=2496&height=1248)\\
\\
**How Perplexity-Style Memory Works?**\\
\\
July 1, 2026\\
\\
·\\
\\
Miscellaneous](https://mem0.ai/blog/how-perplexity-style-memory-works-and-how-to-build-it-with-mem0)

[![Build an AI Companion App with Voice and Persistent Memory](https://framerusercontent.com/images/1bLHeYn3hMgBaCbGrFTcZRNwaU8.webp?width=2496&height=1248)\\
\\
**Build an AI Companion App with Voice and Persistent Memory**\\
\\
June 30, 2026\\
\\
·\\
\\
Engineering](https://mem0.ai/blog/build-an-ai-companion-app-with-voice-and-persistent-memory)

[![How to Build a Production AI Agent with LangGraph and Mem0](https://framerusercontent.com/images/Rs4SXgKb3cJq4AAO0EzgLnwnA.webp?width=2496&height=1248)\\
\\
**How to Build a Production AI Agent with LangGraph and Mem0**\\
\\
June 30, 2026\\
\\
·\\
\\
Miscellaneous](https://mem0.ai/blog/how-to-build-a-production-ai-agent-with-langgraph-and-mem0)

Cookie Settings

We use cookies to personalize content, run ads, and analyze traffic. Read our [Cookie Policy](https://mem0.ai/).