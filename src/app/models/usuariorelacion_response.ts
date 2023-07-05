import { ErrorHandled } from "./error_handled";
import { UsuarioRelaciona } from "./usuariorelacion";

export interface UsuarioRelacionaResponse {
  count: number;
  total_count: number;
  ent_rel_m: UsuarioRelaciona[];
  errors: ErrorHandled[];
}
