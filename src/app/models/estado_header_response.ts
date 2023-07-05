import { ErrorHandled } from "./error_handled";
import { EstadoHeader } from "./estado_header";
export interface EstadoHeaderResponse {
  count: number;
  total_count: number;
  com_ped_g: EstadoHeader[];
  errors: ErrorHandled[];
}
