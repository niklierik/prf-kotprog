import { faker } from '@faker-js/faker';
import { User } from './users/user.entity.js';
import { PermissionLevel } from './users/permission-level.js';
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
    const profilePic = await fetch(faker.image.urlPicsumPhotos());
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
      password,
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
      const color = faker.color.rgb();

      const label = await Label.create({
        name,
        color,
      });
      labels.push(label);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function generateArticleData() {
    const { _id } = faker.helpers.arrayElement(writers);
    const numberOfComments = faker.number.int({ min: 0, max: 3 });

    const title = faker.lorem.sentence();

    const comments: Comment[] = [];

    for (let i = 0; i < numberOfComments; i++) {
      const { email } = faker.helpers.arrayElement(users);
      const text = faker.lorem.paragraph();

      comments.push({
        author: email,
        text,
      });
    }

    const visible = faker.datatype.boolean(0.8);
    const articleLabels = faker.helpers.arrayElements(labels);

    return {
      author: _id,
      title,
      comments,
      visible,
      labels: articleLabels.map((l) => l._id),
    };
  }

  async function generateArticleContent(
    author: string,
    title: string | undefined,
    paragraphs: number = 10,
    imageChance: number = 0.2,
  ): Promise<string> {
    let content = '';
    if (title) {
      content += `# ${title}`;
      content += EOL;
      content += EOL;
    }

    for (let paragraph = 0; paragraph < paragraphs; paragraph++) {
      const paragraphTitle = faker.lorem.sentence(3);
      content += `## ${paragraphTitle}`;
      content += EOL;
      content += faker.lorem.paragraph({ min: 20, max: 40 });
      content += EOL;

      const generateImage = faker.datatype.boolean(imageChance);

      if (generateImage) {
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

        content += `![${name}](${url} "${name}")`;
      }
      content += EOL;
    }

    return content;
  }

  async function createOpenArticle(): Promise<void> {
    const articleData = generateArticleData();

    const content = await generateArticleContent(
      articleData.author,
      articleData.title,
      12,
    );

    await OpenArticle.create({
      type: 'open',
      content,
      ...articleData,
    });
  }

  async function createClosedArticle(): Promise<void> {
    const articleData = generateArticleData();

    const openContent = await generateArticleContent(
      articleData.author,
      articleData.title,
      3,
    );
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
    for (let i = 0; i < numberOfOpenArticles; i++) {
      await createOpenArticle();
    }

    for (let i = 0; i < numberOfClosedArticles; i++) {
      await createClosedArticle();
    }
  }

  console.log('Seeding DB');

  console.log('Dropping old DB data');
  await dropDb();

  console.log('Creating labels');
  await createLabels();
  console.log('Creating users');
  await createUsers();
  await createArticles();

  // header
  users.unshift({ email: 'Emails', password: 'Passwords' });

  const usersData = users
    .map(({ email, password }) => `${email.padEnd(50, ' ')}${password}${EOL}`)
    .join('');
  await writeFile('seeded-users.txt', usersData, { encoding: 'utf-8' });

  console.log('Seeded database successfully.');
}
