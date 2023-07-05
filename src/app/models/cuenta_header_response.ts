import { Cuenta } from "./cuenta_header";
import { ErrorHandled } from "./error_handled";

export interface CuentaResponse {
  count: number;
  total_count: number;
  vto_cob_c: Cuenta[];
  errors: ErrorHandled[];
}
