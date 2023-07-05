import { ErrorHandled } from "./error_handled";
import { Provincia } from "./provincia";

export interface ProvinciaResponse {
  count: number;
  total_count: number;
  pro_m: Provincia[];
  errors: ErrorHandled[];
}
