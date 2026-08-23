import { query, initDatabase } from './database.js';
import { parseResume } from '../services/parserService.js';

export const SEED_JOBS = [
  {
    id: 'job_fullstack_sr',
    title: 'Senior Full Stack Engineer',
    department: 'Core Platform Engineering',
    experience_level: 'Senior Level',
    min_years_experience: 5,
    required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'REST API', 'System Design'],
    nice_to_have_skills: ['Next.js', 'GraphQL', 'Kubernetes', 'Redis', 'Tailwind CSS', 'CI/CD'],
    responsibilities: 'Architect, build and scale high-throughput web applications. Lead technical design reviews and mentor junior developers. Collaborate with product managers to deliver resilient full-stack features.',
    education_requirement: "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.",
    description: 'We are seeking a seasoned Senior Full Stack Engineer to lead the development of our high-volume cloud services. The ideal candidate has deep mastery of modern TypeScript ecosystems (React + Node.js), robust relational database design, distributed architecture, and cloud deployment pipelines on AWS.'
  },
  {
    id: 'job_aiml_lead',
    title: 'AI / ML & LLM Solutions Specialist',
    department: 'Applied AI & Research',
    experience_level: 'Mid-Senior Level',
    min_years_experience: 3,
    required_skills: ['Python', 'PyTorch', 'Large Language Models', 'NLP', 'LangChain', 'RAG', 'Vector Databases', 'FastAPI'],
    nice_to_have_skills: ['Hugging Face', 'Fine-Tuning', 'Docker', 'Transformers', 'Prompt Engineering', 'PostgreSQL'],
    responsibilities: 'Design and deploy state-of-the-art Generative AI and RAG pipelines. Optimize vector indexing, semantic search, and prompt engineering frameworks. Benchmark LLM latency and accuracy.',
    education_requirement: "Master's or Ph.D. in Computer Science, Artificial Intelligence, Data Science, or related STEM field.",
    description: 'Join our Applied AI team to build next-generation intelligent agents, semantic matching engines, and enterprise RAG systems. You will work directly with foundation models, vector embeddings, and production inference pipelines.'
  },
  {
    id: 'job_devops_sr',
    title: 'Lead Cloud & DevOps Engineer',
    department: 'Infrastructure & Security',
    experience_level: 'Lead / Staff Level',
    min_years_experience: 6,
    required_skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Prometheus', 'Grafana'],
    nice_to_have_skills: ['Python', 'Golang', 'Helm', 'Ansible', 'Security', 'System Design'],
    responsibilities: 'Own global multi-region cloud infrastructure on AWS. Drive infrastructure as code (IaC) with Terraform. Implement zero-downtime CI/CD automation and 24/7 observability.',
    education_requirement: "Bachelor's degree in Computer Science, Engineering, or equivalent industry experience.",
    description: 'We are looking for an experienced DevOps and Infrastructure Leader to oversee our cloud infrastructure, Kubernetes clusters, and automated continuous deployment workflows.'
  },
  {
    id: 'job_pm_technical',
    title: 'Senior Technical Product Manager',
    department: 'Product & Growth',
    experience_level: 'Senior Level',
    min_years_experience: 4,
    required_skills: ['Leadership', 'Agile', 'Scrum', 'Stakeholder Management', 'Communication', 'System Design', 'SQL'],
    nice_to_have_skills: ['Python', 'Data Science', 'Problem Solving', 'Jira', 'UI/UX'],
    responsibilities: 'Define product roadmap, prioritize feature backlogs, and bridge engineering teams with business stakeholders. Conduct user research and track key product telemetry metrics.',
    education_requirement: "Bachelor's degree in Engineering, Business, or related discipline; MBA preferred.",
    description: 'Drive high-impact product roadmaps across our developer tool suite. Translate complex user needs into actionable PRDs and work closely with engineering squads.'
  }
];

export const SEED_RESUMES = [
  {
    name: 'Alex Chen',
    rawText: `Alex Chen
San Francisco, CA • alex.chen@techmail.io • (415) 892-3491 • linkedin.com/in/alexchen-dev • github.com/alexchen-dev

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 7+ years of experience designing and scaling distributed web applications and cloud architectures. Expert in React, TypeScript, Node.js, AWS, and relational databases. Proven track record leading agile squads and improving system throughput by 45%.

WORK EXPERIENCE
Staff / Senior Full Stack Engineer | CloudFlow Technologies | 2021 - Present
- Architected enterprise SaaS dashboard using React, TypeScript, Next.js, and Tailwind CSS serving 300,000+ daily active users.
- Built resilient microservices with Node.js, Express, and PostgreSQL, backed by Redis caching and Kafka message queues.
- Containerized workflows using Docker and managed cloud deployments on AWS (ECS, Lambda, RDS, S3, CloudFront).
- Reduced API p99 response times from 420ms to 95ms through query optimization and index tuning.
- Mentored team of 6 engineers, conducted technical architecture reviews, and enforced automated CI/CD via GitHub Actions.

Full Stack Software Engineer | Horizon Fintech Systems | 2018 - 2021
- Developed real-time trading dashboards in React, Redux, and WebSockets with strict low-latency requirements.
- Implemented secure RESTful and GraphQL APIs with Node.js and PostgreSQL.
- Authored unit and integration test suites using Jest and Cypress, achieving 88% test coverage.

EDUCATION
Bachelor of Science (B.S.) in Computer Science | University of California, Berkeley | 2014 - 2018
- Honors & Dean's List. Coursework: Distributed Systems, Database Management, Algorithms, Web Engineering.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frontend: React, Next.js, Redux, Tailwind CSS, Vite, GraphQL
- Backend: Node.js, Express, REST APIs, Microservices, WebSockets, Kafka
- Databases & Cloud: PostgreSQL, Redis, MongoDB, AWS (ECS, RDS, S3), Docker, CI/CD, GitHub Actions, System Design`
  },
  {
    name: 'Dr. Sophia Martinez',
    rawText: `Dr. Sophia Martinez, Ph.D.
New York, NY • sophia.martinez@ai-research.org • (212) 555-0198 • linkedin.com/in/dr-sophia-martinez • github.com/smartinez-ai

SUMMARY
Senior AI/ML Research Engineer with 5+ years specializing in Natural Language Processing (NLP), Large Language Models (LLMs), RAG architectures, and vector embeddings. Published 4 peer-reviewed papers at NeurIPS and ACL on transformer efficiency and semantic alignment.

EXPERIENCE
Lead Machine Learning Engineer | DeepCognition Labs | 2022 - Present
- Designed and deployed end-to-end Retrieval-Augmented Generation (RAG) pipeline leveraging LangChain, Pinecone vector database, and OpenAI / Gemini foundation models.
- Developed scalable FastAPI microservices to serve low-latency LLM inference models containerized with Docker.
- Implemented parameter-efficient fine-tuning (LoRA, QLoRA) for open-source Llama and Mistral models using PyTorch and Hugging Face Transformers.
- Reduced hallucination rates by 38% using structured prompt engineering and automated semantic evaluation benchmarks.

Applied AI Research Scientist | Stanford AI Institute | 2020 - 2022
- Conducted research on transformer attention optimization and vector embeddings for semantic code search.
- Built Python and PyTorch data processing pipelines handling 100M+ multi-modal document corpora.

EDUCATION
Ph.D. in Computer Science (Artificial Intelligence & Machine Learning) | Stanford University | 2016 - 2020
Master of Science (M.S.) in Data Science | Columbia University | 2014 - 2016
Bachelor of Science (B.S.) in Mathematics & Computing | MIT | 2010 - 2014

SKILLS
- Core AI/ML: PyTorch, TensorFlow, Transformers, Hugging Face, Scikit-Learn, Deep Learning, NLP, Computer Vision
- Generative AI: Large Language Models, LangChain, LlamaIndex, RAG, Prompt Engineering, Fine-Tuning, Vector Databases, Pinecone, ChromaDB
- Engineering: Python, FastAPI, Docker, PostgreSQL, REST APIs, Linux, Git`
  },
  {
    name: 'Marcus Reynolds',
    rawText: `Marcus Reynolds
Austin, TX • marcus.reynolds@cloudops.net • (512) 441-9982 • linkedin.com/in/mreynolds-devops • github.com/mreynolds-cloud

SUMMARY
Lead Cloud & DevOps Engineer with 8+ years of expertise in AWS, Kubernetes orchestration, Terraform IaC, and zero-downtime CI/CD automation. Passionate about site reliability, infrastructure security, and distributed systems observability.

EXPERIENCE
Staff Infrastructure & DevOps Engineer | ScaleForge Systems | 2020 - Present
- Architected enterprise Kubernetes (EKS) clusters hosting 120+ microservices on AWS across 3 availability zones.
- Automated 100% of infrastructure provisioning using Terraform and Ansible modules, eliminating configuration drift.
- Built resilient CI/CD pipelines with GitHub Actions and GitLab CI, reducing release cycle time from 3 hours to 12 minutes.
- Configured full-stack observability with Prometheus, Grafana, and ELK stack with automated PagerDuty alerting.

Senior DevOps Engineer | Austin Cloud Solutions | 2017 - 2020
- Managed multi-account AWS architectures (VPC, IAM, EC2, ECS, S3, RDS, CloudTrail, Route53).
- Implemented Docker container security scanning and Helm chart packaging for production deployments.

EDUCATION
Bachelor of Science (B.S.) in Software Engineering | University of Texas at Austin | 2013 - 2017

SKILLS
- Cloud Platforms: AWS (EKS, ECS, EC2, S3, RDS, Lambda, CloudFront), Google Cloud (GCP)
- Containers & Orchestration: Docker, Kubernetes, Helm, Microservices
- IaC & Automation: Terraform, Ansible, Shell, Bash, Python, Golang
- CI/CD & Monitoring: GitHub Actions, Jenkins, GitLab CI, Prometheus, Grafana, Linux, System Design`
  },
  {
    name: 'Elena Rostova',
    rawText: `Elena Rostova
Seattle, WA • elena.rostova@webdev.co • (206) 882-1923 • linkedin.com/in/elena-rostova • github.com/erostova

SUMMARY
Frontend Developer with 3+ years of experience crafting responsive, accessible, and high-performance web applications using React, JavaScript, HTML5, CSS3, and Tailwind CSS. Dedicated to pixel-perfect UI/UX design and smooth user interfaces.

EXPERIENCE
Frontend Web Developer | PixelCraft Studio | 2022 - Present
- Built 15+ responsive client web applications using React, Tailwind CSS, and Vite.
- Implemented accessible UI component libraries following WCAG 2.1 AA standards.
- Integrated frontend state with third-party REST APIs and client-side form validation.

Junior UI Developer | Apex Digital Media | 2021 - 2022
- Developed mobile-friendly landing pages and marketing sites using HTML, CSS, JavaScript, and Bootstrap.
- Collaborated with UI/UX designers in Figma to turn design prototypes into clean frontend code.

EDUCATION
Bachelor of Arts (B.A.) in Graphic Design & Web Development | University of Washington | 2017 - 2021

SKILLS
- Frontend: React, JavaScript, HTML5, CSS3, Tailwind CSS, Bootstrap, Responsive Design, Vite
- Tools: Git, GitHub, Figma, Webpack, NPM, Jest`
  },
  {
    name: 'David Kim',
    rawText: `David Kim
Chicago, IL • david.kim@freshcoder.me • (312) 773-4029 • linkedin.com/in/davidkim-dev • github.com/davidkim-junior

OBJECTIVE
Motivated Junior Web Developer looking for entry-level opportunities to contribute frontend coding skills and learn full-stack development best practices.

EXPERIENCE
Junior Web Development Intern | Local Solutions Tech | 2023 - 2024
- Assisted in maintaining static web pages using HTML, CSS, and basic JavaScript.
- Fixed minor UI styling bugs and updated contact forms.

EDUCATION
Coding Bootcamp Graduate | General Assembly Full Stack Immersive | 2023
Associate Degree in Business Administration | Chicago City College | 2020 - 2022

SKILLS
- HTML, CSS, Basic JavaScript, React Basics, Git, GitHub`
  },
  {
    name: 'Rachel Vance',
    rawText: `Rachel Vance
Boston, MA • rachel.vance@productlead.io • (617) 932-8411 • linkedin.com/in/rachelvance-pm

SUMMARY
Senior Technical Product Manager with 6+ years leading cross-functional engineering and design squads in agile environments. Proven track record driving product lifecycle from ideation to scale.

EXPERIENCE
Senior Product Manager | Omnivue Software | 2021 - Present
- Spearheaded product strategy and roadmap for SaaS developer platform, generating $4.2M in ARR growth.
- Authored technical PRDs, user stories, and acceptance criteria; managed sprint planning in Jira with Scrum methodology.
- Utilized SQL and data analytics to optimize user onboarding funnels, increasing feature adoption by 34%.

Technical Product Owner | Boston FinTech Labs | 2018 - 2021
- Led cross-functional team of 10 engineers and 2 UX designers delivering core banking API integrations.
- Coordinated stakeholder management and executive communications across C-level leadership.

EDUCATION
Master of Business Administration (MBA) | Harvard Business School | 2016 - 2018
Bachelor of Science (B.S.) in Industrial & Systems Engineering | Cornell University | 2012 - 2016

SKILLS
- Product Strategy, Agile, Scrum, Kanban, Sprint Planning, Leadership, Stakeholder Management, User Research
- Technical: SQL, Python Basics, System Design, Jira, Figma, API Concepts, Data Science`
  }
];

export async function seedDatabase() {
  await initDatabase();

  // 1. Seed Jobs
  for (const job of SEED_JOBS) {
    const existing = await query.get('SELECT id FROM jobs WHERE id = ?', [job.id]);
    if (!existing) {
      await query.run(`
        INSERT INTO jobs (
          id, title, department, experience_level, min_years_experience,
          required_skills, nice_to_have_skills, responsibilities,
          education_requirement, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        job.id,
        job.title,
        job.department,
        job.experience_level,
        job.min_years_experience,
        JSON.stringify(job.required_skills),
        JSON.stringify(job.nice_to_have_skills),
        job.responsibilities,
        job.education_requirement,
        job.description
      ]);
    }
  }

  // 2. Seed Sample Candidates
  for (const item of SEED_RESUMES) {
    const existing = await query.get('SELECT id FROM candidates WHERE name = ?', [item.name]);
    if (!existing) {
      const parsed = await parseResume(item.rawText, { originalName: `${item.name.replace(/\s+/g, '_')}_Resume.txt` });
      parsed.name = item.name;
      const id = 'cand_' + item.name.toLowerCase().replace(/[^a-z]/g, '') + '_' + Date.now().toString(36);

      await query.run(`
        INSERT INTO candidates (
          id, name, email, phone, location, linkedin, github, summary,
          total_years_experience, skills, skills_by_category, experience,
          education, certifications, raw_text, file_name, file_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        parsed.name,
        parsed.email,
        parsed.phone,
        parsed.location,
        parsed.linkedin,
        parsed.github,
        parsed.summary,
        parsed.totalYearsExperience,
        JSON.stringify(parsed.skills),
        JSON.stringify(parsed.skillsByCategory),
        JSON.stringify(parsed.experience),
        JSON.stringify(parsed.education),
        JSON.stringify(parsed.certifications),
        parsed.rawText,
        parsed.fileName,
        'text/plain'
      ]);
    }
  }

  console.log('✅ Database seeded with default Jobs and diverse Candidate Resumes.');
}

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('🌱 Seeding complete.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
