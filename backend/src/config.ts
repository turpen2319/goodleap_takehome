import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });


function get_env_string(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function get_env_int(name: string): number {
  const value = get_env_string(name);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got: ${value}`);
  }
  return parsed;
}

export const config = {
  port: get_env_int("PORT"),
  model: get_env_string("MODEL"),
  maxAgentTurns: get_env_int("MAX_AGENT_TURNS"),
  anthropicApiKey: get_env_string("ANTHROPIC_API_KEY"),
};
