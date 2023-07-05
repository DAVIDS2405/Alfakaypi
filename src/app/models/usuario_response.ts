import { Usuario } from "./usuario";
import { ErrorHandled } from "./error_handled";

export interface UsuarioResponse {
  count: number;
  total_count: number;
  ent_m: Usuario[];
  errors: ErrorHandled[];
}
