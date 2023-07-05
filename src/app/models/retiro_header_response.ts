
import { ErrorHandled } from "./error_handled";
import { RetiroHeader } from "./retiro_header";

export interface RetiroHeaderResponse {
  count: number;
  total_count: number;
  com_fac_g: RetiroHeader[];
  errors: ErrorHandled[];
}
