import { AsientoDetail } from "./asiento_detail";
import { ErrorHandled } from "./error_handled";

export interface AsientoDetailResponse {
  count: number;
  total_count: number;
  cob_c: AsientoDetail[];
  errors: ErrorHandled[];
}
