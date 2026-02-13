## Live Demo

https://your-project-name.vercel.app


Name:
Deterministic AI UI Generator

Description:
Deterministic AI UI Generator is a multi-step AI-powered system that converts natural language UI descriptions into structured, deterministic React interfaces using a fixed component library.

The system uses a structured agent pipeline:
1.Planner → Converts user intent into strict JSON UI plan
2.Validator → Ensures whitelist compliance and structural correctness
3.Generator → Deterministically converts JSON into JSX
4.Explainer → Justifies design and component decisions
NOTE: I'm currently using Gemini API Key and it is a paid service, so after a trial of 20, the output results in an AI Generated Error.

This project was built as part of the Ryze AI Full-Stack Assignment.


Visuals:
Chat Interface

(Insert screenshot here)

Generated UI Preview

(Insert screenshot here)

Version History & Rollback

(Insert screenshot here)

Installation:
Requirements-
Node.js 18+
npm or yarn
Gemini API key



Usage:
1. Generate UI from Prompt

Example prompt:
Landing page hero with CTA button

Expected output:
-Structured UI plan (JSON)
-Deterministic React JSX
-Live rendered preview
-Explanation of design decisions

2. Modify Existing UI

Example prompt:
Add another card below the first one

System behavior:
-Preserves previous components
-Modifies only necessary elements
-Creates a new version
-Allows rollback

3. Rollback
Use version selector to switch between previous UI generations.
Each version stores:
type Version = {
  plan: UIPlan;
  code: string;
  explanation: string;
  timestamp: number;
};



Support:
For questions or issues:
Open a GitHub Issue
Contact via repository discussion
Email: mihikasoni@gmail.com

Roadmap:
Future improvements may include:

More deterministic components (Table, Modal, Sidebar)
JSON schema validation using Zod
Diff visualization between version
Persistent version storage (database)
Streaming AI responses
Authentication layer

Contributing:
Contributions are welcome.
To contribute:

Fork the repository
Create a new branch
Make changes
Run locally to verify functionality
Submit a Pull Request

Before submitting:

-Ensure code compiles
-Run:
npm run build

-Verify no TypeScript errors
-Test version history and rollback manually

Authors and Acknowledgment

Developed by Mihika S
Built as part of the Ryze AI Full-Stack Evaluation.

Special acknowledgment to:
Next.js team
Google Gemini API
Open-source contributors

License:
MIT License

Project Status
Active — Assignment Submission Version
Core functionality complete:

Deterministic agent pipeline
Version history
Incremental updates
Explanation system
Whitelist enforcement
Validation layer

Further enhancements may be added post-evaluation.
