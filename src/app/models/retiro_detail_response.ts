import { ErrorHandled } from "./error_handled";
import { RetiroDetail } from "./retiro_detail";

export interface RetiroDetailResponse {
  count: number;
  total_count: number;
  mov_g: RetiroDetail[];
  errors: ErrorHandled[];
}
