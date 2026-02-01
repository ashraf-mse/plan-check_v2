// @ts-nocheck
import { PlanService } from "./plan-service";

export function parseExplainText(text: string) {
  try {
    const planService = new PlanService();
    const plan = planService.fromSource(text);

    return {
      ok: true,
      plan,
      metadata: {
        parser: 'pev2',
        format: 'text',
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Parse failed',
    };
  }
}
