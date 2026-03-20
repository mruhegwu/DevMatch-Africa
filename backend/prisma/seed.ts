import { PrismaClient } from '@prisma/client';

// Seed the database with sample tasks for demo purposes
const prisma = new PrismaClient();

const sampleTasks = [
  {
    title: 'Build a REST API with Node.js',
    description:
      'Create a production-ready REST API with authentication, rate limiting, and comprehensive documentation.',
    budget: 500,
    skillsRequired: ['Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'React Dashboard UI',
    description:
      'Design and implement a responsive analytics dashboard with charts, tables, and real-time data.',
    budget: 800,
    skillsRequired: ['React', 'TypeScript', 'CSS'],
  },
  {
    title: 'Smart Contract Development',
    description:
      'Develop and audit ERC-20 smart contracts for a DeFi protocol on Ethereum.',
    budget: 1500,
    skillsRequired: ['Solidity', 'Web3.js', 'JavaScript'],
  },
  {
    title: 'Mobile App (React Native)',
    description:
      'Build a cross-platform mobile app for task management with offline support.',
    budget: 1200,
    skillsRequired: ['React Native', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Python Data Pipeline',
    description:
      'Build an ETL data pipeline to process and visualize large datasets from multiple sources.',
    budget: 700,
    skillsRequired: ['Python', 'SQL', 'Pandas'],
  },
  {
    title: 'DevOps CI/CD Setup',
    description:
      'Set up GitHub Actions CI/CD pipelines, Docker containers, and Kubernetes deployment.',
    budget: 600,
    skillsRequired: ['Docker', 'Kubernetes', 'GitHub Actions'],
  },
];

async function main() {
  console.log('Seeding database with sample tasks...');

  // Use createMany with skipDuplicates to avoid re-seeding
  const result = await prisma.task.createMany({
    data: sampleTasks,
    skipDuplicates: false, // always insert fresh on first run
  });

  console.log(`Seeded ${result.count} sample tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
