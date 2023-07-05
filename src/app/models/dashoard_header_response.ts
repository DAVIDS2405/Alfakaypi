import { ErrorHandled } from "./error_handled";
import { DashboardHeader } from "./dashboard_header";

export interface DashboardHeaderResponse {
  count: number;
  total_count: number;
  est_clt_g: DashboardHeader[];
  errors: ErrorHandled[];
}
