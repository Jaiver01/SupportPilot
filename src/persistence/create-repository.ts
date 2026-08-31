import type { AppConfig } from "../config.js";
import { InMemoryExecutionRepository } from "./in-memory-repository.js";
import type { ExecutionRepository } from "./repository.js";
import { SupabaseExecutionRepository } from "./supabase-repository.js";

export function createExecutionRepository(config: AppConfig): ExecutionRepository {
  if (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY) {
    return new SupabaseExecutionRepository(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
  }

  return new InMemoryExecutionRepository();
}
