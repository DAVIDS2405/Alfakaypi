import { ErrorHandled } from "./error_handled";
import { PedidoDetail } from "./pedido_detail";

export interface PedidoDetailResponse {
  count: number;
  total_count: number;
  vta_ped_lin_g: PedidoDetail[];
  errors: ErrorHandled[];
}
