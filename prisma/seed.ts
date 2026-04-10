import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Product",
  "Data Science",
  "DevOps",
  "Customer Support",
  "Human Resources",
  "Legal",
];

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "REMOTE"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Consulting",
];

async function main() {
  await prisma.notification.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Employer accounts with companies
  const employers = [];
  for (let i = 0; i < 8; i++) {
    const user = await prisma.user.create({
      data: {
        email: `employer${i + 1}@example.com`,
        passwordHash,
        name: faker.person.fullName(),
        role: "EMPLOYER",
        bio: faker.person.bio(),
      },
    });
    const company = await prisma.company.create({
      data: {
        ownerId: user.id,
        name: faker.company.name(),
        description: faker.company.catchPhrase() + ". " + faker.lorem.paragraph(),
        website: faker.internet.url(),
        industry: faker.helpers.arrayElement(INDUSTRIES),
        size: faker.helpers.arrayElement(COMPANY_SIZES),
      },
    });
    employers.push({ user, company });
  }

  // Job seeker accounts
  const seekers = [];
  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: `seeker${i + 1}@example.com`,
        passwordHash,
        name: faker.person.fullName(),
        role: "JOB_SEEKER",
        bio: faker.person.bio(),
      },
    });
    await prisma.profile.create({
      data: {
        userId: user.id,
        skills: JSON.stringify(
          faker.helpers.arrayElements(
            ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Figma", "Go", "Rust", "Java", "C++", "GraphQL", "Kubernetes"],
            { min: 3, max: 7 }
          )
        ),
        experience: faker.helpers.arrayElement(["Entry Level", "Mid Level", "Senior", "Lead", "Director"]),
        location: faker.location.city() + ", " + faker.location.state({ abbreviated: true }),
        phone: faker.phone.number(),
      },
    });
    seekers.push(user);
  }

  // Jobs
  const jobs = [];
  for (const { company } of employers) {
    const numJobs = faker.number.int({ min: 3, max: 8 });
    for (let j = 0; j < numJobs; j++) {
      const salaryMin = faker.number.int({ min: 40, max: 120 }) * 1000;
      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          title: faker.person.jobTitle(),
          description: [
            `## About the Role\n\n${faker.lorem.paragraphs(2)}`,
            `## Requirements\n\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
            `## Benefits\n\n- Competitive salary\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- Remote-friendly`,
          ].join("\n\n"),
          location: faker.location.city() + ", " + faker.location.state({ abbreviated: true }),
          type: faker.helpers.arrayElement(JOB_TYPES),
          salaryMin,
          salaryMax: salaryMin + faker.number.int({ min: 10, max: 60 }) * 1000,
          category: faker.helpers.arrayElement(JOB_CATEGORIES),
          status: faker.helpers.weightedArrayElement([
            { value: "OPEN", weight: 8 },
            { value: "CLOSED", weight: 1 },
            { value: "DRAFT", weight: 1 },
          ]),
          postedAt: faker.date.recent({ days: 30 }),
          expiresAt: faker.date.future({ years: 0.25 }),
        },
      });
      jobs.push(job);
    }
  }

  // Applications
  const openJobs = jobs.filter((j) => j.status === "OPEN");
  for (const seeker of seekers) {
    const applyTo = faker.helpers.arrayElements(openJobs, { min: 1, max: 5 });
    for (const job of applyTo) {
      await prisma.application.create({
        data: {
          jobId: job.id,
          userId: seeker.id,
          coverLetter: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(["PENDING", "REVIEWED", "INTERVIEW", "OFFERED", "REJECTED"]),
          appliedAt: faker.date.recent({ days: 14 }),
        },
      });
    }
  }

  // Saved jobs
  for (const seeker of seekers.slice(0, 8)) {
    const toSave = faker.helpers.arrayElements(openJobs, { min: 1, max: 4 });
    for (const job of toSave) {
      await prisma.savedJob.upsert({
        where: { userId_jobId: { userId: seeker.id, jobId: job.id } },
        create: { userId: seeker.id, jobId: job.id },
        update: {},
      });
    }
  }

  // Notifications
  for (const seeker of seekers.slice(0, 5)) {
    for (let n = 0; n < 3; n++) {
      await prisma.notification.create({
        data: {
          userId: seeker.id,
          type: faker.helpers.arrayElement(["APPLICATION_UPDATE", "NEW_JOB", "SYSTEM"]),
          message: faker.lorem.sentence(),
          read: faker.datatype.boolean(),
          link: "/dashboard/applications",
        },
      });
    }
  }

  const totalJobs = await prisma.job.count();
  const totalUsers = await prisma.user.count();
  const totalApps = await prisma.application.count();
  console.log(`Seeded: ${totalUsers} users, ${totalJobs} jobs, ${totalApps} applications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
