import { ErrorHandled } from "./error_handled";
import { FacturaDetail } from "./factura_detail";

export interface FacturaDetailResponse {
  count: number;
  total_count: number;
  mov_g: FacturaDetail[];
  errors: ErrorHandled[];
}
