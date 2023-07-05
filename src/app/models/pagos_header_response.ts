import { ErrorHandled } from "./error_handled";
import { PagoHeader } from "./pagos_header";

export interface PagoHeaderResponse {
  count: number;
  total_count: number;
  com_ped_g: PagoHeader[];
  errors: ErrorHandled[];
}
