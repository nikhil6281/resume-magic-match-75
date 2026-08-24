# Resume Match Engine

"Build a clean, modern, dark-mode Smart Resume Screener application.

Key Features & Requirements:

UI/UX Design: Clean dashboard layout using Tailwind CSS and shadcn/ui components with a sidebar navigation, header metrics, and modern file drag-and-drop zones.

Dual Input Section:

Resume Upload: File dropzone supporting PDF and TXT parsing.

Job Description: Rich text box for entering job descriptions, required skills, and role criteria.

AI Parsing & Match Engine:

Extract candidate details (Full Name, Skills, Years of Experience, Education) from uploaded resumes.

Perform semantic evaluation between the resume and job description using an LLM.

Generate a match score from 1 to 10 along with a detailed written justification breakdown.

Candidate Dashboard Table:

Interactive sorting and filtering table displaying candidate name, extracted skills tags, experience, match score badge (color-coded: high/medium/low), and a button to view the full justification report.

Database Integration:

Connect to Supabase to save uploaded resumes, parsed candidate data, job descriptions, and match scores.

Implement Row-Level Security (RLS) policies."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://resume-magic-match-75.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f273621e-a44f-4243-b668-1880747697e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
