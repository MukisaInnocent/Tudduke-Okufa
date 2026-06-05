require('dotenv').config();
const { sequelize, Sermon, WeeklyLesson, MemoryVerse, ChildrenSermon, QuizQuestion, User, TeacherResource, ClassEvent, SabbathSchoolClass } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (conditional based on environment)
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);
    console.log(`✅ Database synced (${process.env.NODE_ENV || 'development'} mode)`);

    // Check if data already exists
    const sermonCount = await Sermon.count();
    const lessonCount = await WeeklyLesson.count();
    const verseCount = await MemoryVerse.count();
    const childrenSermonCount = await ChildrenSermon.count();
    const quizCount = await QuizQuestion.count();

    const userCount = await User.count();

    if (userCount > 0 || sermonCount > 0 || lessonCount > 0 || verseCount > 0 || childrenSermonCount > 0 || quizCount > 0) {
      console.log('⚠️  Data already exists. Skipping seed.');
      // console.log ...
      process.exit(0);
    }

    // Seed Users (Admin/Teacher)
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      fullname: 'Admin User',
      email: 'admin@tudduke.com',
      password: hashedPassword,
      roles: 'admin',
      isVerified: true,
      phoneNumber: '1234567890'
    });

    const teacherUser = await User.create({
      fullname: 'Teacher Sarah',
      email: 'teacher@tudduke.com',
      password: hashedPassword,
      roles: 'teacher',
      isVerified: true,
      phoneNumber: '0987654321'
    });

    // Create a Class for the teacher
    const defaultClass = await SabbathSchoolClass.create({
      name: 'Primary Class',
      ageGroup: '6-9',
      teacherId: teacherUser.userid
    });
    console.log('✅ Users & Classes seeded');

    // Seed Sermons
    console.log('📖 Seeding sermons...');
    await Sermon.bulkCreate([
      {
        topic: 'Faith',
        title: 'Walking by Faith',
        scripture: 'Hebrews 11:1',
        explanation: 'Faith is the assurance of things hoped for, the conviction of things not seen. We must trust in God even when we cannot see the outcome.',
        examples: 'Abraham trusted God when called to leave his homeland. Noah built the ark before seeing rain. We too must trust God\'s promises.',
        authorid: adminUser.userid,
        entrytime: new Date()
      },
      {
        topic: 'Love',
        title: 'God\'s Unconditional Love',
        scripture: 'John 3:16',
        explanation: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
        examples: 'God\'s love is not based on our performance. He loves us despite our sins. We should love others as God loves us.',
        authorid: adminUser.userid,
        entrytime: new Date()
      },
      {
        topic: 'Hope',
        title: 'Hope in Christ',
        scripture: 'Romans 15:13',
        explanation: 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.',
        examples: 'Even in difficult times, we have hope because Christ has overcome the world. Our hope is not in circumstances but in God.',
        authorid: adminUser.userid,
        entrytime: new Date()
      }
    ]);
    console.log('✅ Sermons seeded');

    // Seed Weekly Lessons
    console.log('📚 Seeding weekly lessons...');
    await WeeklyLesson.bulkCreate([
      {
        title: 'God Loves Us',
        scripture: 'John 3:16',
        bibleReading: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        lessonMessage: 'God loves every child very much. He showed His love by sending Jesus to save us. When we believe in Jesus, we become God\'s children.',
        keyPoints: 'God loves me\nJesus is my Savior\nI should love others',
        weekNumber: 1,
        createdAt: new Date()
      },
      {
        title: 'Trusting God',
        scripture: 'Proverbs 3:5',
        bibleReading: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.',
        lessonMessage: 'We can trust God in all situations because He knows what is best for us. Even when things are hard, God is with us.',
        keyPoints: 'God knows what is best\nI can trust God\nGod is always with me',
        weekNumber: 2,
        createdAt: new Date()
      }
    ]);
    console.log('✅ Weekly lessons seeded');

    // Seed Memory Verses
    console.log('💭 Seeding memory verses...');
    await MemoryVerse.bulkCreate([
      {
        text: 'Jesus wept.',
        reference: 'John 11:35',
        dayOfWeek: 'Monday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'Be kind to one another.',
        reference: 'Ephesians 4:32',
        dayOfWeek: 'Tuesday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'Trust in the Lord with all your heart.',
        reference: 'Proverbs 3:5',
        dayOfWeek: 'Wednesday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'The Lord is good to all.',
        reference: 'Psalm 145:9',
        dayOfWeek: 'Thursday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'Let the little children come to Me.',
        reference: 'Matthew 19:14',
        dayOfWeek: 'Friday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'For God so loved the world.',
        reference: 'John 3:16',
        dayOfWeek: 'Saturday',
        isActive: true,
        createdAt: new Date()
      },
      {
        text: 'I can do all things through Christ.',
        reference: 'Philippians 4:13',
        dayOfWeek: 'Sunday',
        isActive: true,
        createdAt: new Date()
      }
    ]);
    console.log('✅ Memory verses seeded');

    // Seed Children Sermons
    console.log('👶 Seeding children sermons...');
    await ChildrenSermon.bulkCreate([
      {
        title: 'Jesus Loves Me',
        description: 'Teaching children about God\'s unconditional love.',
        content: 'God loves you very much! He loves you when you\'re happy, when you\'re sad, and even when you make mistakes. God showed His love by sending Jesus to save us. Jesus came to Earth because God loves us so much. Remember, no matter what happens, God will always love you!',
        scripture: 'John 3:16',
        createdAt: new Date()
      },
      {
        title: 'Obeying God',
        description: 'Learning why obedience brings blessings.',
        content: 'When we obey God, we show that we love Him. God gave us rules to keep us safe and happy. When we obey our parents and teachers, we are also obeying God. Obedience brings blessings and makes God happy!',
        scripture: 'Ephesians 6:1',
        createdAt: new Date()
      },
      {
        title: 'Trusting God',
        description: 'Encouraging children to trust God in all situations.',
        content: 'Sometimes things can be scary or difficult. But we can trust God! God knows everything and He will take care of us. Just like a child trusts their parents, we can trust God. He will never leave us alone.',
        scripture: 'Proverbs 3:5',
        createdAt: new Date()
      },
      {
        title: 'Being Kind',
        description: 'Showing kindness as Jesus taught us.',
        content: 'Jesus was always kind to everyone. He helped people who were sick, fed people who were hungry, and loved everyone. We should be kind too! When we are kind to others, we show God\'s love. Kindness makes the world a better place!',
        scripture: 'Ephesians 4:32',
        createdAt: new Date()
      }
    ]);
    console.log('✅ Children sermons seeded');

    // Seed Quiz Questions
    console.log('❓ Seeding quiz questions...');
    await QuizQuestion.bulkCreate([
      {
        question: 'Who built the ark?',
        option1: 'Moses',
        option2: 'Noah',
        option3: 'David',
        correctAnswer: 2,
        isActive: true,
        createdAt: new Date()
      },
      {
        question: 'Who was swallowed by a big fish?',
        option1: 'Jonah',
        option2: 'Peter',
        option3: 'Paul',
        correctAnswer: 1,
        isActive: true,
        createdAt: new Date()
      },
      {
        question: 'Who was Jesus\' mother?',
        option1: 'Martha',
        option2: 'Mary',
        option3: 'Elizabeth',
        correctAnswer: 2,
        isActive: true,
        createdAt: new Date()
      },
      {
        question: 'How many days did God take to create the world?',
        option1: '5',
        option2: '6',
        option3: '7',
        correctAnswer: 2,
        isActive: true,
        createdAt: new Date()
      },
      {
        question: 'Who defeated Goliath?',
        option1: 'Saul',
        option2: 'David',
        option3: 'Solomon',
        correctAnswer: 2,
        isActive: true,
        createdAt: new Date()
      },
      {
        question: 'What is the shortest verse in the Bible?',
        option1: 'God is love',
        option2: 'Jesus wept',
        option3: 'Love one another',
        correctAnswer: 2,
        isActive: true,
        createdAt: new Date()
      }
    ]);
    console.log('✅ Quiz questions seeded');

    // Seed Teacher Resources
    console.log('📂 Seeding teacher resources...');
    await TeacherResource.bulkCreate([
      {
        title: 'Creation Coloring Page',
        type: 'pdf',
        description: 'A fun coloring page for the story of creation.',
        fileUrl: '', // In a real app, this would be a URL
        uploadedBy: teacherUser.userid,
        status: 'approved',
        createdAt: new Date()
      },
      {
        title: 'Bible Heroes Lesson Plan',
        type: 'doc',
        description: 'Lesson plan for teaching about David and Goliath.',
        fileUrl: '',
        uploadedBy: teacherUser.userid,
        status: 'approved',
        createdAt: new Date()
      }
    ]);
    console.log('✅ Teacher resources seeded');

    // Seed Class Events (Schedule)
    console.log('📅 Seeding class events...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await ClassEvent.bulkCreate([
      {
        title: 'Sabbath School Picnic',
        description: 'Join us for fun and games at the park!',
        eventDate: tomorrow,
        createdBy: teacherUser.userid,
        status: 'approved',
        classId: defaultClass.id
      },
      {
        title: 'Bible Trivia Night',
        description: 'Test your knowledge and win prizes.',
        eventDate: nextWeek,
        createdBy: teacherUser.userid,
        status: 'approved',
        classId: defaultClass.id
      }
    ]);
    console.log('✅ Class events seeded');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
