import { CobroDetail } from "./cobro_detail";
import { ErrorHandled } from "./error_handled";

export interface CobroDetailResponse {
  count: number;
  total_count: number;
  vto_cob_c: CobroDetail[];
  errors: ErrorHandled[];
}
