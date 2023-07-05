import { ErrorHandled } from "./error_handled";
import { QrHeader } from "./qr_header";

export interface QrHeaderResponse {
  count: number;
  total_count: number;
  fpg_m: QrHeader[];
  errors: ErrorHandled[];
}
