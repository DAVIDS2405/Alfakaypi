import { ErrorHandled } from "./error_handled";
import { Pais } from "./pais";

export interface PaisResponse {
  count: number;
  total_coount: number;
  pai_m: Pais[];
  errors: ErrorHandled[];
}
