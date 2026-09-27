// Public content only. Keep application materials and transcripts outside this site.
export const site = {
  name: "Yibin Fan",
  email: "yfan29@ncsu.edu",
  github: "https://github.com/Yibin-Fan",
  cv: "assets/Yibin_Fan_CV.pdf",
};

const file = (content) => ({ type: "text", content });
const directory = (children) => ({ type: "directory", children });

export const filesystem = directory({
  "about.md": file(`YIBIN FAN

I am a master's student in Computer Science at North Carolina State University.
My research interests include reinforcement learning, decision-making under
partial observability, multimodal reasoning, and embodied AI.

I am interested in agents that can gather useful information, reason under
uncertainty, and adapt their behavior through interaction.

Email   yfan29@ncsu.edu
GitHub  https://github.com/Yibin-Fan`),

  research: directory({
    "interests.md": file(`RESEARCH INTERESTS

Reinforcement learning · Decision-making under partial observability
Multimodal reasoning · Embodied AI

My current focus is how agents can decide when to gather information and
how to use what they learn to act in uncertain environments.`),

    "equivariant-rl.md": file(`EQUIVARIANT REINFORCEMENT LEARNING
Research Intern · Worcester Polytechnic Institute · Jun–Aug 2026

Studied sequential decision-making in controlled GridWorld environments
with hidden, episode-dependent transition configurations. Developed an
equivariant reinforcement learning framework using active system
identification to recover task-relevant context for adaptive policies.

Value-of-information analysis examined when targeted information gathering
can improve decisions under a limited interaction budget.

Related manuscript: see publications/probe-exploit.md`),

    "rna-localization.md": file(`RNA SUBCELLULAR LOCALIZATION
Graduate Research Assistant · NC State University · Sep 2025–Jan 2026

Developed deep learning models to predict changes in RNA subcellular
localization across biological conditions and time points using sequence
and structural features. Built a reproducible data processing, training,
and evaluation pipeline.`),

    "medical-segmentation.md": file(`MEDICAL IMAGE SEGMENTATION
Undergraduate Research Assistant · Chengdu University of Technology
Jul–Oct 2024

Investigated deep learning approaches to medical image segmentation,
including data preprocessing, model development, and evaluation across
experimental settings.`),
  }),

  education: directory({
    "nc-state.md": file(`NORTH CAROLINA STATE UNIVERSITY
M.S. in Computer Science · Raleigh, North Carolina
Aug 2025–May 2027 (expected) · GPA: 4.0/4.0`),

    "cdut.md": file(`CHENGDU UNIVERSITY OF TECHNOLOGY
B.Eng. in Computer Science · Chengdu, China
Sep 2021–Jun 2025 · GPA: 3.6/5.0 · Top 10%`),
  }),

  publications: directory({
    "probe-exploit.md": file(`MANUSCRIPT UNDER REVIEW

Yibin Fan and Qi Zhang.
“Probe--Exploit: When and How to Recover Hidden Symmetry Breaker in Equivariant RL.”
Under review at NeurReps 2026 (NeurIPS Workshop).
`),
  }),

  resume: directory({
    "README.md": file(`CURRICULUM VITAE

English academic CV.
Use "open cv.pdf" to view or download the PDF.`),
    "cv.pdf": { type: "pdf", href: site.cv, label: "Yibin Fan — Curriculum Vitae" },
  }),

  "contact.md": file(`GET IN TOUCH

Email   yfan29@ncsu.edu
GitHub  https://github.com/Yibin-Fan`),
});
