import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wigac.com' },
    update: {},
    create: {
      email: 'admin@wigac.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@wigac.com' },
    update: {},
    create: {
      email: 'user@wigac.com',
      password: userPassword,
      name: 'Usuario Demo',
      role: 'USER',
    },
  });

  console.log('Created regular user:', user);

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Proyecto Web App',
      description: 'Desarrollo de aplicación web principal',
      status: 'ACTIVE',
      color: '#007aff',
      userId: admin.id,
    },
  });

  console.log('Created project:', project);

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Implementar autenticación',
      description: 'Desarrollar sistema de login y registro',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      department: 'Backend',
      projectId: project.id,
      assignedUserId: user.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Diseñar interfaz de usuario',
      description: 'Crear mockups y prototipos',
      status: 'TODO',
      priority: 'MEDIUM',
      department: 'Frontend',
      projectId: project.id,
      assignedUserId: user.id,
    },
  });

  console.log('Created tasks:', { task1, task2 });

  // Create sample activity
  const activity = await prisma.activity.create({
    data: {
      date: new Date(),
      hours: 3.5,
      description: 'Implementación de JWT y guards',
      taskId: task1.id,
      userId: user.id,
    },
  });

  console.log('Created activity:', activity);

  // Create sample wiki page
  const wikiPage = await prisma.wikiPage.create({
    data: {
      title: 'Guía de Inicio',
      content: '# Guía de Inicio\n\nEste es un documento de ejemplo.\n\n## Instalación\n\n```bash\nnpm install\n```',
      projectId: project.id,
    },
  });

  console.log('Created wiki page:', wikiPage);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
