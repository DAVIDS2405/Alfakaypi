import { ErrorHandled } from "./error_handled";
import { PagoRealizadoHeader } from "./pagos_realizados_header";

export interface PagoRealizadoHeaderResponse {
  count: number;
  total_count: number;
  pag_c: PagoRealizadoHeader[];
  errors: ErrorHandled[];
}
