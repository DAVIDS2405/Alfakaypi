import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Usuario } from "app/models/usuario";
import { PaisResponse } from "app/models/pais_response";
import { PlanResponse } from "app/models/plan_response";
import { ProvinciaResponse } from "app/models/provincia_response";
import { catchError, Observable, retry, throwError } from "rxjs";
import { UsuarioResponse } from "app/models/usuario_response";
import { environment } from "environments/environment";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { FacturaDetail } from "app/models/factura_detail";
import { FacturaDetailResponse } from "app/models/factura_detail_response";
import { CuentaResponse } from "app/models/cuenta_header_response";
import { Cuenta } from "app/models/cuenta_header";
import { PedidoHeaderResponse } from "app/models/pedido_header_response";
import { PedidoDetailResponse } from "app/models/pedido_detail_response";
import { PedidoDetail } from "app/models/pedido_detail";
import { QrHeaderResponse } from "app/models/qr_header_response";
import { DashboardHeaderResponse } from "app/models/dashoard_header_response";
import { EntregadoHeaderResponse } from "app/models/entregado_header_response";
import { PagoHeaderResponse } from "app/models/pagos_header_response";
import { CobroHeaderResponse } from "app/models/cobro_header_response";
import { CobroDetailResponse } from "app/models/cobro_detail_response";
import { CobroDetail } from "app/models/cobro_detail";
import { CobroHeader } from "app/models/cobro_heder";
import { AsientoHeaderResponse } from "app/models/asiento_header_response";
import { AsientoDetailResponse } from "app/models/asiento_detail_response";
import { AsientoDetail } from "app/models/asiento_detail";
import { EstadoHeader } from "app/models/estado_header";
import { EstadoHeaderResponse } from "app/models/estado_header_response";
import { RetiroHeaderResponse } from "app/models/retiro_header_response";
import { RetiroDetail } from "app/models/retiro_detail";
import { RetiroDetailResponse } from "app/models/retiro_detail_response";
import { PagoRealizadoHeaderResponse } from "app/models/pagos_realizados_header_response";
import { UsuarioRelacionaResponse } from "app/models/usuariorelacion_response";
import { UsuarioRelaciona } from "app/models/usuariorelacion";
import { coingeko } from "app/models/coingeko";


@Injectable({
  providedIn: "root",
})
export class AccountService {
  private url: string = environment.url;

  // Http Headers
  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  constructor(private httpClient: HttpClient) {}

  getUsuario(usr_web: string): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url + "ent_m?filter%5Busr_web%5D=" + usr_web + "&api_key=5PXgrTcR"
    );
  }
  getReference(idUsuario: number): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url + "ent_m?filter%5Bent_rel%5D=" + idUsuario + "&api_key=5PXgrTcR"
    );
  }
  getUsuarioName(idUsuario: number): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url + "ent_m?filter%5Bid%5D=" + idUsuario + "&api_key=5PXgrTcR"
    );
  }
  getUsuarioUserWeb(idUsuario: number): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url + "ent_m?filter%5Bid%5D=" + idUsuario + "&api_key=5PXgrTcR"
    );
  }

  postUsuario(usuario: Usuario): Observable<UsuarioResponse> {
    const body = JSON.stringify(usuario);
    return this.httpClient.post<UsuarioResponse>(
      this.url + "ent_m?api_key=5PXgrTcR",
      body,
      this.httpOptions
    );
  }
  postUsuarioRelacionado(usuario:UsuarioRelaciona): Observable<UsuarioRelacionaResponse>{
    const body = JSON.stringify(usuario);
    return this.httpClient.post<UsuarioRelacionaResponse>(
      this.url + "ent_rel_m?&api_key=sxXmNxwF",
      body,
      this.httpOptions
    );

  }
  // Coingeko(){
  //   return this.httpClient.get<coingeko[]>(
  //     "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en"
  //   );
  // }

  UpdatePassword(
    password: string,
    email: string,
    user_web: string
  ): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url +
        "_process/rec_pwd_web?param%5Busr_web%5D=" +
        user_web +
        "&param%5Beml%5D=" +
        email +
        "&param%5Bpwd_web%5D=" +
        password +
        "&api_key=5PXgrTcR"
    );
  }
  UpdateUser(
    email: string,
    county: number,
    name: string,
    province: number,
    iduser: number,
    addres: string,
    wallet: string,
  ): Observable<UsuarioResponse> {
    return this.httpClient.get<UsuarioResponse>(
      this.url +
        "_process/upt_ent_web?param%5Bid%5D=" +
        iduser +
        "&param%5Beml%5D=" +
        email +
        "&param%5Bdir%5D=" +
        addres +
        "&param%5Bpai%5D=" +
        1 +
        "&param%5Bpro%5D=" +
        province +
        "&param%5Bnom_com%5D=" +
        name +
        "&param%5Bnom_fis%5D=" +
        name +
        "&param%5Bname%5D=" +
        name +
        "&param%5Bwal_usr_web%5D=" +
        wallet+
        "&param%5Bemp%5D=1&param%5Bemp_div%5D=1&api_key=5PXgrTcR"
    );
  }
  getProvincias(): Observable<ProvinciaResponse> {
    return this.httpClient.get<ProvinciaResponse>(
      this.url + "pro_m?filter%5Bpai%5D=59&api_key=6VlZviyX"
    );
  }

  getPaises(): Observable<PaisResponse> {
    return this.httpClient.get<PaisResponse>(
      this.url + "pai_m?api_key=mvYWqEiK"
    );
  }
  //Planes
  getPlanes(): Observable<PlanResponse> {
    return this.httpClient.get<PlanResponse>(
      this.url + "art_m?api_key=cbPk5v1y"
    );
  }
  //Facturas
  getFacturas(idUsuario: number): Observable<FacturaHeaderResponse> {
    return this.httpClient.get<FacturaHeaderResponse>(
      this.url + "vta_fac_g?filter%5Bclt%5D=" + idUsuario + "&api_key=PN3CisJ6"
    );
  }

  getHeaderFactura(idUsuario: number): Observable<FacturaHeaderResponse> {
    return this.httpClient.get<FacturaHeaderResponse>(
      this.url +
        "_process/vta_fac_g_nue?param%5Bclt%5D=" +
        idUsuario +
        "&param%5Bfac_est%5D=1&param%5Bfpg%5D=7&api_key=PN3CisJ6"
    );
  }

  postDetailFactura(
    facturaDetail: FacturaDetail
  ): Observable<FacturaDetailResponse> {
    const body = JSON.stringify(facturaDetail);
    return this.httpClient.post<FacturaDetailResponse>(
      this.url + "mov_g?api_key=sN7DjpYD",
      body,
      this.httpOptions
    );
  }

  postDetailRetiro(
    retiroDetail: RetiroDetail
  ): Observable<RetiroDetailResponse> {
    const body = JSON.stringify(retiroDetail);
    return this.httpClient.post<RetiroDetailResponse>(
      this.url +
        "mov_g?param%5Bprv%5D=" +
        retiroDetail.prv +
        "&api_key=sN7DjpYD",
      body,
      this.httpOptions
    );
  }

  //Cuenta activa
  getCuentas(idUsuario: number): Observable<CuentaResponse> {
    return this.httpClient.get<CuentaResponse>(
      this.url + "vto_cob_c?filter%5Bter%5D=" + idUsuario + "&api_key=bwQ94KII"
    );
  }
  //Pagos entregados
  getPagos(idUsuario: number): Observable<PagoRealizadoHeaderResponse> {
    return this.httpClient.get<PagoRealizadoHeaderResponse>(
      this.url + "pag_c?filter%5Bter%5D=" + idUsuario + "&api_key=gGBpvMRE"
    );
  }
  // Solicitudes
  getPedido(idUsuario: number): Observable<PedidoHeaderResponse> {
    return this.httpClient.get<PedidoHeaderResponse>(
      this.url + "vta_ped_g?filter%5Bclt%5D=" + idUsuario + "&api_key=G4ECKX78"
    );
  }

  getHeaderPedido(idUsuario: number): Observable<PedidoHeaderResponse> {
    return this.httpClient.get<PedidoHeaderResponse>(
      this.url +
        "_process/vta_ped_g_nue?param%5Bclt%5D=" +
        idUsuario +
        "&param%5Bfac_est%5D=1&param%5Bfpg%5D=7&api_key=G4ECKX78"
    );
  }

  postDetailPedido(
    pedidoDetail: PedidoDetail
  ): Observable<PedidoDetailResponse> {
    const body = JSON.stringify(pedidoDetail);
    return this.httpClient.post<PedidoDetailResponse>(
      this.url + "vta_ped_lin_g?api_key=j4HGtLkG",
      body,
      this.httpOptions
    );
  }
  //QR
  getQR(): Observable<QrHeaderResponse> {
    return this.httpClient.get<QrHeaderResponse>(
      this.url + "fpg_m?&api_key=wDTNkAxx"
    );
  }
  //Dasboard
  getEstadisticasAdquisicion(
    idUsuario: number
  ): Observable<DashboardHeaderResponse> {
    return this.httpClient.get<DashboardHeaderResponse>(
      this.url +
        "_process/est_clt_g?filter%5Bclt%5D=" +
        idUsuario +
        "&api_key=dzZP0Wve"
    );
  }
  getEstadisiticaInversionTotal(idUsuario: number) {
    return this.httpClient.get(
      this.url +
        "_process/est_clt_g_web?param%5Bid%5D=" +
        idUsuario +
        "&api_key=dzZP0Wve"
    );
  }
  getEstadisiticaPagaTotal(idUsuario: number) {
    return this.httpClient.get(
      this.url +
        "_process/est_prv_g_web?param%5Bid%5D=" +
        idUsuario +
        "&api_key=dzZP0Wve"
    );
  }

  //Estado de cuenta
  getEstadoCuenta(idUsuario: number): Observable<CuentaResponse> {
    return this.httpClient.get<CuentaResponse>(
      this.url + "vto_cob_c?filter%5Bter%5D=" + idUsuario + "&api_key=bwQ94KII"
    );
  }
  //Pagos
  getPagosEstadoCuenta(idUsuario: number): Observable<PagoHeaderResponse> {
    return this.httpClient.get<PagoHeaderResponse>(
      this.url + "com_ped_g?filter%5Bprv%5D=" + idUsuario + "&api_key=kx0hzlqS"
    );
  }
  getHeaderRetiros(
    idUsuario: number,
    idPedido: number,
    idcomped: number,
    id_plan: number,
    id_roi_usr: number,
    num_doc_ped: number,
    FechaEnvio: string
  ): Observable<RetiroHeaderResponse> {
    return this.httpClient.get<RetiroHeaderResponse>(
      this.url +
        "_process/com_fac_g_nue?param%5Bid_com_ped%5D=" +
        idcomped +
        "&param%5Bnum_fac_prv%5D=" +
        idPedido +
        "&param%5Bid_plan%5D=" +
        id_plan +
        "&param%5Bid_roi_usr%5D=" +
        id_roi_usr +
        "&param%5Bfac%5D=0&param%5Bfch%5D=" +
        FechaEnvio +
        "&param%5Bfpg%5D=1&param%5Bprv%5D=" +
        idUsuario +
        "&param%5Bnum_doc_ped%5D=" +
        num_doc_ped +
        "&api_key=alNAaSWA"
    );
  }

  //Cobros
  getCobro(idUsuario: number): Observable<CobroHeaderResponse> {
    return this.httpClient.get<CobroHeaderResponse>(
      this.url + "vto_cob_c?filter%5Bter%5D=" + idUsuario + "&api_key=bwQ94KII"
    );
  }
  getCobroid(
    idUsuario: number,
    idcobro: number
  ): Observable<CobroHeaderResponse> {
    return this.httpClient.get<CobroHeaderResponse>(
      this.url +
        "vto_cob_c?filter%5Bter%5D=" +
        idUsuario +
        "&filter%5Bid%5D=" +
        idcobro +
        "&api_key=bwQ94KII"
    );
  }
  postDetailCobro(cobroDetail: CobroDetail): Observable<CobroDetailResponse> {
    const body = JSON.stringify(cobroDetail);
    return this.httpClient.post<CobroDetailResponse>(
      this.url + "vto_cob_c?&api_key=bwQ94KII",
      body,
      this.httpOptions
    );
  }

  //UPDATE VELNEO COBROS wallet
  UpdateCobro(
    idUsuario: number,
    idfactura: number,
    idcobro: number,
    facturaname: string,
    numerodocumento: string,
    idtransaccion: string
  ): Observable<CobroHeaderResponse> {
    return this.httpClient.get<CobroHeaderResponse>(
      this.url +
        "_process/vta_fac_g_mod_vto_cob?param%5Bter%5D=" +
        idUsuario +
        "&param%5Bpgc%5D=120&param%5Bdoc_tip%5D=2P8YCS&param%5Bnum_doc%5D=" +
        facturaname +
        "&param%5Bvta_fac%5D=" +
        idfactura +
        "&param%5Bid%5D=" +
        idcobro +
        "&param%5Bnum_doc_cob%5D=" +
        numerodocumento +
        "&param%5Bid_tra%5D=" +
        idtransaccion +
        "&api_key=bwQ94KII"
    );
  }
  //Asiento
  getAsiento(idUsuario: number): Observable<AsientoHeaderResponse> {
    return this.httpClient.get<AsientoHeaderResponse>(
      this.url + "cob_c?filter%5Bter%5D=" + idUsuario + "&api_key=kVunYD3C"
    );
  }
  getHeaderAsiento(
    idUsuario: number,
    idfactura: number
  ): Observable<AsientoHeaderResponse> {
    return this.httpClient.get<AsientoHeaderResponse>(
      this.url +
        "_process/cob_c_asi_web?param%5Bter%5D=" +
        idUsuario +
        "&param%5Bvta_fac%5D=" +
        idfactura +
        "&api_key=kVunYD3C"
    );
  }

  postDetailAsiento(
    asientoDetail: AsientoDetail
  ): Observable<AsientoDetailResponse> {
    const body = JSON.stringify(asientoDetail);
    return this.httpClient.post<AsientoDetailResponse>(
      this.url + "cob_c?api_key=kVunYD3C",
      body,
      this.httpOptions
    );
  }
}
