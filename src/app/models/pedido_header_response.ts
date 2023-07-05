import { ErrorHandled } from "./error_handled";
import { PedidoHeader } from "./pedido_header";

export interface PedidoHeaderResponse {
  count: number;
  total_count: number;
  vta_ped_g: PedidoHeader[];
  errors: ErrorHandled[];
}
