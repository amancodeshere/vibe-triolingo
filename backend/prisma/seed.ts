import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.achievement.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.language.deleteMany();
  await prisma.session.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create languages
  const languages = await Promise.all([
    prisma.language.create({
      data: {
        name: 'Spanish',
        code: 'es',
        flag: '🇪🇸',
        description: 'Learn Spanish - one of the most spoken languages in the world'
      }
    }),
    prisma.language.create({
      data: {
        name: 'French',
        code: 'fr',
        flag: '🇫🇷',
        description: 'Master French - the language of love and diplomacy'
      }
    }),
    prisma.language.create({
      data: {
        name: 'German',
        code: 'de',
        flag: '🇩🇪',
        description: 'Discover German - a key language in Europe and business'
      }
    }),
    prisma.language.create({
      data: {
        name: 'Italian',
        code: 'it',
        flag: '🇮🇹',
        description: 'Learn Italian - the language of art, music, and culture'
      }
    }),
    prisma.language.create({
      data: {
        name: 'Portuguese',
        code: 'pt',
        flag: '🇵🇹',
        description: 'Master Portuguese - spoken across multiple continents'
      }
    })
  ]);

  console.log('🌍 Created languages:', languages.map(l => l.name).join(', '));

  // Create lessons for Spanish
  const spanishLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        languageId: languages[0].id,
        title: 'Basic Greetings',
        description: 'Learn essential greetings and introductions in Spanish',
        order: 1,
        difficulty: 'beginner'
      }
    }),
    prisma.lesson.create({
      data: {
        languageId: languages[0].id,
        title: 'Numbers 1-20',
        description: 'Master counting from 1 to 20 in Spanish',
        order: 2,
        difficulty: 'beginner'
      }
    }),
    prisma.lesson.create({
      data: {
        languageId: languages[0].id,
        title: 'Colors',
        description: 'Learn the names of colors in Spanish',
        order: 3,
        difficulty: 'beginner'
      }
    }),
    prisma.lesson.create({
      data: {
        languageId: languages[0].id,
        title: 'Family Members',
        description: 'Learn vocabulary for family relationships',
        order: 4,
        difficulty: 'beginner'
      }
    }),
    prisma.lesson.create({
      data: {
        languageId: languages[0].id,
        title: 'Food and Drinks',
        description: 'Essential vocabulary for ordering food and drinks',
        order: 5,
        difficulty: 'intermediate'
      }
    })
  ]);

  console.log('📚 Created Spanish lessons');

  // Create exercises for Basic Greetings lesson
  const greetingExercises = await Promise.all([
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[0].id,
        type: 'multiple_choice',
        question: 'How do you say "Hello" in Spanish?',
        correctAnswer: 'Hola',
        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        explanation: '"Hola" is the standard greeting in Spanish, equivalent to "Hello" in English.',
        order: 1,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[0].id,
        type: 'multiple_choice',
        question: 'What does "Buenos días" mean?',
        correctAnswer: 'Good morning',
        options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
        explanation: '"Buenos días" literally means "good days" and is used to say "good morning".',
        order: 2,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[0].id,
        type: 'fill_blank',
        question: 'Complete: "¿Cómo te _____?" (How are you?)',
        correctAnswer: 'llamas',
        explanation: '"¿Cómo te llamas?" means "What is your name?" or literally "How do you call yourself?"',
        order: 3,
        points: 15
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[0].id,
        type: 'translation',
        question: 'Translate "Nice to meet you" to Spanish',
        correctAnswer: 'Mucho gusto',
        explanation: '"Mucho gusto" is the standard way to say "Nice to meet you" in Spanish.',
        order: 4,
        points: 15
      }
    })
  ]);

  // Create exercises for Numbers lesson
  const numberExercises = await Promise.all([
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[1].id,
        type: 'multiple_choice',
        question: 'What is "cinco" in English?',
        correctAnswer: '5',
        options: ['3', '4', '5', '6'],
        explanation: '"Cinco" is the Spanish word for the number 5.',
        order: 1,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[1].id,
        type: 'fill_blank',
        question: 'Complete: "diez" = _____',
        correctAnswer: '10',
        explanation: '"Diez" is the Spanish word for the number 10.',
        order: 2,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[1].id,
        type: 'translation',
        question: 'Translate "fifteen" to Spanish',
        correctAnswer: 'quince',
        explanation: '"Quince" is the Spanish word for the number 15.',
        order: 3,
        points: 15
      }
    })
  ]);

  // Create exercises for Colors lesson
  const colorExercises = await Promise.all([
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[2].id,
        type: 'multiple_choice',
        question: 'What color is "rojo"?',
        correctAnswer: 'Red',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        explanation: '"Rojo" is the Spanish word for the color red.',
        order: 1,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[2].id,
        type: 'multiple_choice',
        question: 'How do you say "blue" in Spanish?',
        correctAnswer: 'azul',
        options: ['verde', 'azul', 'amarillo', 'blanco'],
        explanation: '"Azul" is the Spanish word for the color blue.',
        order: 2,
        points: 10
      }
    })
  ]);

  // Create exercises for Family Members lesson
  const familyExercises = await Promise.all([
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[3].id,
        type: 'multiple_choice',
        question: 'What does "madre" mean?',
        correctAnswer: 'Mother',
        options: ['Father', 'Mother', 'Sister', 'Brother'],
        explanation: '"Madre" is the Spanish word for mother.',
        order: 1,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[3].id,
        type: 'translation',
        question: 'Translate "father" to Spanish',
        correctAnswer: 'padre',
        explanation: '"Padre" is the Spanish word for father.',
        order: 2,
        points: 15
      }
    })
  ]);

  // Create exercises for Food and Drinks lesson
  const foodExercises = await Promise.all([
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[4].id,
        type: 'multiple_choice',
        question: 'What does "agua" mean?',
        correctAnswer: 'Water',
        options: ['Milk', 'Water', 'Coffee', 'Juice'],
        explanation: '"Agua" is the Spanish word for water.',
        order: 1,
        points: 10
      }
    }),
    prisma.exercise.create({
      data: {
        lessonId: spanishLessons[4].id,
        type: 'multiple_choice',
        question: 'How do you say "bread" in Spanish?',
        correctAnswer: 'pan',
        options: ['pan', 'leche', 'café', 'queso'],
        explanation: '"Pan" is the Spanish word for bread.',
        order: 2,
        points: 10
      }
    })
  ]);

  console.log('✅ Created exercises for all lessons');

  // Create a sample user
  const sampleUser = await prisma.user.create({
    data: {
      email: 'demo@vibetriolingo.com',
      username: 'demo_user',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // password: demo123
      firstName: 'Demo',
      lastName: 'User',
      level: 1,
      experience: 0,
      streak: 0
    }
  });

  console.log('👤 Created sample user:', sampleUser.username);

  // Create sample enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: sampleUser.id,
      languageId: languages[0].id, // Spanish
      level: 1,
      isActive: true
    }
  });

  console.log('📝 Created sample enrollment');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Sample data created:');
  console.log(`- ${languages.length} languages`);
  console.log(`- ${spanishLessons.length} Spanish lessons`);
  console.log(`- ${greetingExercises.length + numberExercises.length + colorExercises.length + familyExercises.length + foodExercises.length} exercises`);
  console.log(`- 1 sample user (${sampleUser.username})`);
  console.log(`- 1 sample enrollment`);
  console.log('\n🔑 Sample user credentials:');
  console.log('Email: demo@vibetriolingo.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
