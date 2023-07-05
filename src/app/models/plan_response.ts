import { ErrorHandled } from "./error_handled";
import { Plan } from "./plan";

export interface PlanResponse {
  count: number;
  total_count: number;
  art_m: Plan[];
  errors: ErrorHandled[];
}
