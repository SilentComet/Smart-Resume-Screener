import os

def create_simple_pdf(filename, title, lines):
    # Minimal pure Python PDF generator (no external dependencies required)
    content_stream = f"BT\n/F1 16 Tf\n50 750 Td\n({title}) Tj\n/F1 10 Tf\n0 -20 Td\n"
    y_offset = -14
    for line in lines:
        safe_line = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        content_stream += f"0 {y_offset} Td\n({safe_line}) Tj\n"
    content_stream += "ET"

    content_bytes = content_stream.encode('latin1')
    length = len(content_bytes)

    pdf = bytearray()
    pdf.extend(b"%PDF-1.4\n")
    
    offsets = []
    
    # Object 1: Catalog
    offsets.append(len(pdf))
    pdf.extend(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    
    # Object 2: Pages
    offsets.append(len(pdf))
    pdf.extend(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    
    # Object 3: Page
    offsets.append(len(pdf))
    pdf.extend(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    
    # Object 4: Stream
    offsets.append(len(pdf))
    pdf.extend(f"4 0 obj\n<< /Length {length} >>\nstream\n".encode('latin1'))
    pdf.extend(content_bytes)
    pdf.extend(b"\nendstream\nendobj\n")
    
    # Object 5: Font
    offsets.append(len(pdf))
    pdf.extend(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    
    # XRef
    xref_offset = len(pdf)
    pdf.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for off in offsets:
        pdf.extend(f"{off:010d} 00000 n \n".encode('latin1'))
        
    pdf.extend(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF".encode('latin1'))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(pdf)
    print(f"Generated PDF: {filename}")

if __name__ == '__main__':
    out_dir = r"c:\Users\fs885\Desktop\asgnmt\data\sample_resumes"
    
    # 1. Alex Chen
    create_simple_pdf(
        os.path.join(out_dir, "Alex_Chen_Senior_FullStack.pdf"),
        "Alex Chen - Senior Full Stack Engineer",
        [
            "San Francisco, CA | alex.chen@techmail.io | (415) 892-3491",
            "LinkedIn: linkedin.com/in/alexchen-dev | GitHub: github.com/alexchen-dev",
            "",
            "PROFESSIONAL SUMMARY:",
            "Senior Full Stack Engineer with 7+ years of experience designing and scaling",
            "distributed web applications. Expert in React, TypeScript, Node.js, AWS, and PostgreSQL.",
            "",
            "WORK EXPERIENCE:",
            "Staff / Senior Full Stack Engineer | CloudFlow Tech | 2021 - Present",
            "- Architected enterprise SaaS dashboard using React, TypeScript, Next.js, and Tailwind CSS.",
            "- Built resilient microservices with Node.js, Express, PostgreSQL, Redis, and Kafka.",
            "- Containerized workflows using Docker and managed cloud deployments on AWS (ECS, RDS, S3).",
            "",
            "Full Stack Software Engineer | Horizon Fintech | 2018 - 2021",
            "- Developed real-time trading dashboards in React, Redux, and WebSockets.",
            "- Implemented secure RESTful and GraphQL APIs with Node.js and PostgreSQL.",
            "",
            "EDUCATION:",
            "Bachelor of Science in Computer Science | UC Berkeley | 2014 - 2018",
            "",
            "TECHNICAL SKILLS:",
            "React, TypeScript, Node.js, Next.js, PostgreSQL, AWS, Docker, GraphQL, Redis, System Design"
        ]
    )

    # 2. Sophia Martinez
    create_simple_pdf(
        os.path.join(out_dir, "Dr_Sophia_Martinez_AI_Specialist.pdf"),
        "Dr. Sophia Martinez - AI & Machine Learning Specialist",
        [
            "New York, NY | sophia.martinez@ai-research.org | (212) 555-0198",
            "LinkedIn: linkedin.com/in/dr-sophia-martinez | GitHub: github.com/smartinez-ai",
            "",
            "SUMMARY:",
            "Senior AI/ML Research Engineer with 5+ years specializing in NLP, LLMs, and RAG architectures.",
            "Published papers at NeurIPS on transformer efficiency and semantic embeddings.",
            "",
            "EXPERIENCE:",
            "Lead ML Engineer | DeepCognition Labs | 2022 - Present",
            "- Designed and deployed end-to-end RAG pipelines using LangChain, Pinecone, and Gemini/OpenAI.",
            "- Developed scalable FastAPI microservices to serve LLM inference containerized with Docker.",
            "- Fine-tuned Llama and Mistral models using PyTorch and Hugging Face Transformers.",
            "",
            "EDUCATION:",
            "Ph.D. in Computer Science (Artificial Intelligence) | Stanford University | 2016 - 2020",
            "Master of Science in Data Science | Columbia University | 2014 - 2016",
            "",
            "SKILLS:",
            "Python, PyTorch, Large Language Models, NLP, LangChain, RAG, Vector Databases, FastAPI, Docker"
        ]
    )

    # 3. Marcus Reynolds
    create_simple_pdf(
        os.path.join(out_dir, "Marcus_Reynolds_Lead_DevOps.pdf"),
        "Marcus Reynolds - Lead Cloud & DevOps Engineer",
        [
            "Austin, TX | marcus.reynolds@cloudops.net | (512) 441-9982",
            "",
            "SUMMARY:",
            "Lead Cloud & DevOps Engineer with 8+ years of expertise in AWS, Kubernetes, Terraform, and CI/CD.",
            "",
            "EXPERIENCE:",
            "Staff DevOps Engineer | ScaleForge Systems | 2020 - Present",
            "- Architected enterprise Kubernetes (EKS) clusters hosting 120+ microservices on AWS.",
            "- Automated infrastructure provisioning using Terraform and built CI/CD with GitHub Actions.",
            "- Configured Prometheus and Grafana for full observability.",
            "",
            "EDUCATION:",
            "Bachelor of Science in Software Engineering | UT Austin | 2013 - 2017",
            "",
            "SKILLS:",
            "AWS, Kubernetes, Terraform, Docker, CI/CD, Linux, Prometheus, Grafana, Python, Golang"
        ]
    )
