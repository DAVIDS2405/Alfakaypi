import { CobroHeader } from "./cobro_heder";
import { ErrorHandled } from "./error_handled";

export interface CobroHeaderResponse {
  count: number;
  total_count: number;
  vto_cob_c: CobroHeader[];
  errors: ErrorHandled[];
}
