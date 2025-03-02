import { readFile } from 'fs/promises';

export interface Config {
  app: {
    port: number;
  };
  db: {
    url: string;
  };
  auth: {
    salt: number;
    secret: string;
    tokenExpiresIn: string;
    superadmin: {
      username: string;
      password: string;
    };
  };
}

async function loadConfig(): Promise<Config> {
  const configContent = await readFile('env.json', 'utf-8');
  const config: Config = JSON.parse(configContent);
  return config;
}

const config = await loadConfig();
export { config };
