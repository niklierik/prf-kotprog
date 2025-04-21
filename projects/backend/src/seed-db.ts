import { faker } from '@faker-js/faker';
import { seedSuperAdmin, User } from './users/user.entity.js';
import { PermissionLevel } from '@kotprog/common';
import { File } from './files/file.entity.js';
import { Label } from './labels/label.entity.js';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import {
  Article,
  ClosedArticle,
  Comment,
  OpenArticle,
} from './articles/article.entity.js';
import { env } from 'process';
import { existsSync } from 'fs';
import { config } from './config/config.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function shouldSeedDb(): Promise<boolean> {
  if (env['NODE_ENV'] === 'production') {
    return false;
  }

  const lockFileExist = existsSync('.seeded-db');

  if (lockFileExist) {
    return false;
  }

  await writeFile('.seeded-db', '', {
    encoding: 'utf-8',
  });

  return true;
}

export async function seedDb(): Promise<void> {
  const numberOfReaders = 10;
  const numberOfWriters = 4;
  const numberOfAdmins = 1;

  const numberOfOpenArticles = 60;
  const numberOfClosedArticles = 20;

  const labelNames = [
    'Sport',
    'IT',
    'Politics',
    'Economics',
    'Gastronomy',
    'World',
    'Environment',
    'Science',
    'Art',
  ];

  const users: { email: string; password: string }[] = [];

  const writers: User[] = [];
  const labels: Label[] = [];

  async function dropDb(): Promise<void> {
    await Article.deleteMany();
    await User.deleteMany();
    await File.deleteMany();
    await Label.deleteMany();
  }

  async function getRandomImage(): Promise<{
    data: ArrayBuffer;
    mimeType: string;
  }> {
    const profilePic = await fetch(
      faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
    );
    const data = Buffer.from(await profilePic.arrayBuffer());
    const mimeType = profilePic.headers.get('Content-Type') ?? 'image/png';
    return { data, mimeType };
  }

  async function getAvatar(): Promise<{ data: ArrayBuffer; mimeType: string }> {
    const profilePic = await fetch(faker.image.avatar());
    const data = Buffer.from(await profilePic.arrayBuffer());
    const mimeType = profilePic.headers.get('Content-Type') ?? 'image/png';
    return { data, mimeType };
  }

  async function createUser(permissionLevel: PermissionLevel): Promise<User> {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const name = `${firstName} ${lastName}`;

    const email = faker.internet.email({ firstName, lastName });
    const password = faker.internet.password({ memorable: true });
    const passwordHashed = await bcrypt.hash(password, config.auth.salt);

    const { data, mimeType } = await getAvatar();

    const profilePic = await File.create({
      data,
      name: 'avatar',
      mimeType,
      size: Buffer.byteLength(data),
      owner: email,
    });

    const user = await User.create({
      _id: email,
      password: passwordHashed,
      name,
      permissionLevel,
      profilePicture: profilePic._id,
    });

    users.push({ email, password });
    return user;
  }

  async function createUsers(): Promise<void> {
    for (let i = 0; i < numberOfReaders; i++) {
      await createUser(PermissionLevel.USER);
    }

    for (let i = 0; i < numberOfWriters; i++) {
      const user = await createUser(PermissionLevel.WRITER);
      writers.push(user);
    }

    for (let i = 0; i < numberOfAdmins; i++) {
      await createUser(PermissionLevel.ADMIN);
    }
  }

  async function createLabels(): Promise<void> {
    for (const name of labelNames) {
      const color = faker.color.rgb({ prefix: '' });
      const r = Number(`0x${color.substring(0, 2)}`);
      const g = Number(`0x${color.substring(2, 4)}`);
      const b = Number(`0x${color.substring(4, 6)}`);

      let textColor = '#000000';

      const brightness = r * 0.299 + g * 0.587 + b * 0.114;
      if (brightness < 186) {
        textColor = '#ffffff';
      }

      const label = await Label.create({
        name,
        textColor,
        backgroundColor: `#${color}`,
      });
      labels.push(label);
    }
  }

  async function generateImage(
    author: string,
  ): Promise<{ url: string; name: string }> {
    const { data, mimeType } = await getRandomImage();
    const name = faker.lorem.sentence(2);

    const { _id } = await File.create({
      data,
      mimeType,
      name,
      size: Buffer.byteLength(data),
      owner: author,
    });

    const url = `${config.app.url}/api/file/${_id.toHexString()}`;

    return { url, name };
  }

  async function generateArticleData() {
    const { _id } = faker.helpers.arrayElement(writers);
    const numberOfComments = faker.number.int({ min: 0, max: 3 });

    const title = faker.lorem.sentence();

    const { url } = await generateImage(_id);

    const comments: Comment[] = [];

    const createdAt = faker.date.past();
    let updatedAt = createdAt;

    const to = new Date();

    if (faker.datatype.boolean(0.1)) {
      updatedAt = faker.date.between({ from: createdAt, to });
    }

    for (let i = 0; i < numberOfComments; i++) {
      const { email } = faker.helpers.arrayElement(users);
      const text = faker.lorem.paragraph();

      const commentCreatedAt = faker.date.between({ from: createdAt, to });
      const commentUpdatedAt = createdAt;

      comments.push({
        _id: new ObjectId(),
        author: email,
        text,
        createdAt: commentCreatedAt,
        updatedAt: commentUpdatedAt,
      });
    }

    const visible = faker.datatype.boolean(0.8);
    const articleLabels = faker.helpers.arrayElements(labels);

    const views = faker.number.int({ min: 0, max: 500 });

    return {
      author: _id,
      title,
      comments,
      visible,
      labels: articleLabels.map((l) => l._id),
      mainImage: url,
      createdAt,
      updatedAt,
      views,
    };
  }

  async function generateArticleContent(
    author: string,
    paragraphs: number = 10,
    imageChance: number = 0.2,
  ): Promise<string> {
    let content = '';

    for (let paragraph = 0; paragraph < paragraphs; paragraph++) {
      const paragraphTitle = faker.lorem.sentence(3);
      content += `## ${paragraphTitle}`;
      content += EOL;
      content += EOL;
      content += faker.lorem.paragraph({ min: 20, max: 40 });
      content += EOL;
      content += EOL;

      const shouldGenImage = faker.datatype.boolean(imageChance);

      if (shouldGenImage && paragraph < paragraphs - 1) {
        const { name, url } = await generateImage(author);
        content += `![${name}](${url} "${name}")`;
      }
      content += EOL;
      content += EOL;
      content += EOL;
    }

    return content;
  }

  async function createOpenArticle(): Promise<void> {
    const articleData = await generateArticleData();

    const content = await generateArticleContent(articleData.author, 12);

    await OpenArticle.create({
      type: 'open',
      content,
      ...articleData,
    });
  }

  async function createClosedArticle(): Promise<void> {
    const articleData = await generateArticleData();

    const openContent = await generateArticleContent(articleData.author, 3);
    const closedContent = await generateArticleContent(
      articleData.author,
      undefined,
      8,
    );

    await ClosedArticle.create({
      type: 'closed',
      openContent,
      closedContent,
      ...articleData,
    });
  }

  async function createArticles(): Promise<void> {
    // const promises: Promise<void>[] = [];

    for (let i = 0; i < numberOfOpenArticles; i++) {
      await createOpenArticle();
      //  promises.push(createOpenArticle());
    }

    for (let i = 0; i < numberOfClosedArticles; i++) {
      await createClosedArticle();
      //  promises.push(createClosedArticle());
    }
  }

  console.log('Seeding DB');

  console.log('Dropping old DB data');
  await dropDb();

  console.log('Creating labels');
  await createLabels();
  console.log('Creating users');
  await seedSuperAdmin();
  await createUsers();
  console.log('Creating articles');
  await createArticles();

  // header
  users.unshift({ email: 'Emails', password: 'Passwords' });

  const usersData = users
    .map(({ email, password }) => `${email.padEnd(50, ' ')}${password}${EOL}`)
    .join('');
  await writeFile('seeded-users.txt', usersData, { encoding: 'utf-8' });

  console.log('Seeded database successfully.');
}
