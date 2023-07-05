import { ErrorHandled } from "./error_handled";
import { FacturaHeader } from "./factura_header";

export interface FacturaHeaderResponse {
  count: number;
  total_count: number;
  vta_fac_g: FacturaHeader[];
  errors: ErrorHandled[];
}
