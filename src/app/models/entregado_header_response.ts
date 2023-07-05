import { ErrorHandled } from "./error_handled";
import { EntregadoHeader } from "./entregado_header";

export interface EntregadoHeaderResponse {
  count: number;
  total_count: number;
  vta_pag_c: EntregadoHeader[];
  errors: ErrorHandled[];
}
