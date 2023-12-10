import { ContentObserver } from "@angular/cdk/observers";
import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { AsientoDetail } from "app/models/asiento_detail";
import { AsientoDetailResponse } from "app/models/asiento_detail_response";
import { AsientoHeader } from "app/models/asiento_header";
import { AsientoHeaderResponse } from "app/models/asiento_header_response";
import { CobroDetail } from "app/models/cobro_detail";
import { CobroDetailResponse } from "app/models/cobro_detail_response";
import { CobroHeaderResponse } from "app/models/cobro_header_response";
import { CobroHeader } from "app/models/cobro_heder";
import { Cuenta } from "app/models/cuenta_header";
import { CuentaResponse } from "app/models/cuenta_header_response";
import { ErrorHandled } from "app/models/error_handled";
import { FacturaDetail } from "app/models/factura_detail";
import { FacturaDetailResponse } from "app/models/factura_detail_response";
import { FacturaHeader } from "app/models/factura_header";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { PedidoDetail } from "app/models/pedido_detail";
import { PedidoDetailResponse } from "app/models/pedido_detail_response";
import { PedidoHeader } from "app/models/pedido_header";
import { PedidoHeaderResponse } from "app/models/pedido_header_response";

import { Plan } from "app/models/plan";
import { PlanResponse } from "app/models/plan_response";
import { QrHeader } from "app/models/qr_header";
import { QrHeaderResponse } from "app/models/qr_header_response";
import { Usuario } from "app/models/usuario";
import { AccountService } from "app/services/account.service";
import { userInfo } from "os";
import { Subject, catchError, map, min, of, switchMap } from "rxjs";
import { blob } from "stream/consumers";
import Swal from "sweetalert2";

@Component({
  selector: "app-planes",
  templateUrl: "./planes.component.html",
  styleUrls: ["./planes.component.css"],
})
export class PlanesComponent implements OnInit {
  planList: Plan[] = [];
  cuentaList: CobroHeader[] = [];
  facList: FacturaHeader[] = [];
  QrList: QrHeader[] = [];
  pedidoList: PedidoHeader[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  constructor(
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
    this.getPlanes();
  }

  getPlanes() {
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    this.accountService.getPlanes().subscribe({
      next: (response: PlanResponse) => {
        if (response.art_m) {
          for (var item of response.art_m) {
            if (item.ord_pla > 0) {
              this.planList.push(item);
            }
          }

          this.planList.sort((a, b) => {
            return a.ord_pla - b.ord_pla;
          });
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });

    //Qr imagen y codigo
    this.accountService.getQR().subscribe({
      next: (response: QrHeaderResponse) => {
        if (response.fpg_m) {
          for (var item of response.fpg_m) {
            if (item.id > 0) {
              this.QrList.push(item);
            }
          }
          this.QrList.sort((a, b) => {
            return a.id - b.id;
          });
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    // Pedido datos

    this.accountService.getPedido(usuario.id).subscribe({
      next: (response: PedidoHeaderResponse) => {
        if (response.vta_ped_g) {
          this.pedidoList = response.vta_ped_g;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    // Cuentas
    this.accountService.getCobro(usuario.id).subscribe({
      next: (response: CobroHeaderResponse) => {
        if (response.vto_cob_c) {
          for (var item of response.vto_cob_c) {
            if (item.id > 0) {
              this.cuentaList.push(item);
            }
          }

          this.planList.sort((a, b) => {
            return a.ord_pla - b.ord_pla;
          });
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
  }

  comprar(plan: Plan) {
    let qrNames = "";
    let numWallet = "";
    let id_vtocob = "";
    let ultimoObjeto;
    for (const qr of this.QrList) {
      qrNames += qr.qrcode;
      numWallet += qr.num_wal;
      break;
    }
    Swal.fire({
      title: "Terminos y condiciones",
      html: `<div > <textarea name="" id="" cols="45" rows="10" style="color: black; text-align: justify;" readonly>
            SOLICITUD DE APERTURA DE CUENTA

                INSTRUCCIONES PARA REALIZAR 
                              LA SOLICITUD DE 
                        APERTURA DE CUENTA

Antes de enviar la solicitud, lea atentamente y asegúrese de que comprende toda la información correspondiente a su cuenta, incluidas las Condiciones comerciales generales, las Condiciones de negocio para el mercado de valores, las Condiciones generales para gestión y las Condiciones generales para la transferencia internacional de fondos.

Con vistas a cumplir la normativa en materia de prevención del blanqueo de capitales, Alfakaypi Investments  está obligada por mandato legal a obtener la siguiente documentación. Asimismo, Alfakaypi Investments se reserva el derecho a solicitar documentación adicional durante el proceso de aprobación de cuenta.

                              DOCUMENTACIÓN

Le recordamos que la información utilizada debe de estar actualizada.

                          PRUEBA DE IDENTIDAD

      Tipos de documento aceptables:
      •	Pasaporte válido (es obligatorio que incluya la página donde figuran los datos de identificación y la firma)
      •	Carné de conducir válido
      •	Carné de identidad válido	

Los documentos de identidad deben ser actuales y  válidos, haber sido expedidos por un organismo oficial e incluir los siguientes datos:	

      •	Nombre completo	
      •	Número de identificación personal	
      •	Fecha y lugar de nacimiento	
      •	Fotografía claramente visible que identifique a la persona
      •	Firma

              PRUEBA DE DOMICILIO PERMANENTE

Este documento debe ser válido e incluir la dirección de residencia actual del titular, además de haber sido emitido por un organismo oficial.

    Tipos de documento aceptables:
           • Carné de identidad válido	
    • Tarjeta sanitaria valida emitida por un organismo oficial	
     • Informe fiscal (emitido en los últimos 6 meses)	
     
                        EVIDENCIA DE INGRESOS

      •	Estados de cuenta de al menos 3 meses
    •Actividad comercial o laboral que genero los recursos de inversión.

Información debe de venir emitida por una entidad bancaria o legal, debidamente firmada o sellada.

Envíe la solicitud realizada, junto con la documentación arriba mencionada, directamente a Alfakaypi Investments:

Correo electrónico: Escanee la solicitud junto con la documentación y envíela por correo electrónico a: info@alfakaypi.com. 

Para preguntas relativas a este formulario o a los documentos requeridos, contáctenos al +1(408)690-8479 o por e-mail a servicioalcliente@alfakaypi.com.</textarea></div>`,
      icon: "warning",
      input: "checkbox",
      inputPlaceholder: "Acepto los términos y condiciones",
      confirmButtonText: "Aceptar",
      cancelButtonColor: "#0275d8",
      cancelButtonText: "Cancelar",
      inputValidator: (result) => {
        if (!result) {
          return "Debe aceptar los términos y condiciones";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
        Swal.fire({
          title: "¿Desea adquirir el plan?",
          html: "Ingrese la cantidad de su participación </br>y <b>Aceptar</b> para continuar.",
          input: "number",
          inputPlaceholder: "Valor de participacion",
          showCancelButton: true,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0275d8",
          cancelButtonText: "Cancelar",

          inputValidator: (value) => {
            if (!value) {
              return "Digite una valor!";
            }
            const precio = parseFloat(value);
            if (precio < plan.pvp_des || precio > plan.pvp_has) {
              return `El precio debe estar entre $ ${plan.pvp_des} y $ ${plan.pvp_has}`;
            }
          },
        }).then((result: any) => {
          if (result.value) {
            this.accountService.getHeaderPedido(usuario.id).subscribe({
              next: (response: PedidoHeaderResponse) => {
                if (response.vta_ped_g) {
                  if (response.vta_ped_g.length > 0) {
                    const pedidoHeader: PedidoHeader = response.vta_ped_g[0];
                    const pedidoDetail: PedidoDetail = {
                      art: plan.id,
                      clt: usuario.id,
                      pre: result.value,
                      vta_ped: pedidoHeader.id,
                    };
                    this.accountService
                      .postDetailPedido(pedidoDetail)
                      .subscribe({
                        next: (response: PedidoDetailResponse) => {
                          if (response.vta_ped_lin_g) {
                            if (response.vta_ped_lin_g.length > 0) {
                              Swal.fire({
                                title: "¿Desea adquirir el plan?",
                                html:
                                  "<p>" +
                                  qrNames +
                                  "</p>" +
                                  "<p>" +
                                  numWallet +
                                  "</p>" +
                                  "Solo se aceptan USDT red TRC20" +
                                  "<br/>Escanea el codigo QR",
                                input: "number",
                                showCancelButton: true,
                                showConfirmButton: true,
                                confirmButtonText: "Aceptar",
                                cancelButtonColor: "#0275d8",
                                cancelButtonText: "Cancelar",
                                inputAttributes: {
                                  hidden: "true",
                                },
                                inputValue: result.value,
                              }).then((result: any) => {
                                if (result.value) {
                                  this.accountService
                                    .getHeaderFactura(usuario.id)
                                    .subscribe({
                                      next: (
                                        response: FacturaHeaderResponse
                                      ) => {
                                        if (response.vta_fac_g) {
                                          if (response.vta_fac_g.length > 0) {
                                            const facturaHeader: FacturaHeader =
                                              response.vta_fac_g[0];
                                            const facturaDetail: FacturaDetail =
                                              {
                                                art: plan.id,
                                                can: 1,

                                                //emp: 1,
                                                //emp_div: 1,
                                                pre: result.value,
                                                vta_fac: facturaHeader.id,
                                              };

                                            this.accountService
                                              .postDetailFactura(facturaDetail)
                                              .subscribe({
                                                next: (
                                                  response: FacturaDetailResponse
                                                ) => {
                                                  if (response.mov_g) {
                                                    if (
                                                      response.mov_g.length > 0
                                                    ) {
                                                      Swal.fire({
                                                        title:
                                                          "Comprobantes de transaccion",
                                                        html:
                                                          '<input id="wallet" class="swal2-input" placeholder="Ingrese su wallet"></br>' +
                                                          "<br><p>O</p>" +
                                                          '<input id="transaccion" class="swal2-input" placeholder="ingrese id de transaccion"></br>' +
                                                          "<br><p>Opcional</p>" +
                                                          '<input id="image" class="swal2-file" type="file" accept="image/*">',

                                                        focusConfirm: false,

                                                        preConfirm:
                                                          async () => {
                                                            const wallet = (<
                                                              HTMLInputElement
                                                            >document.getElementById(
                                                              "wallet"
                                                            )).value;
                                                            const transaccion =
                                                              (<
                                                                HTMLInputElement
                                                              >document.getElementById(
                                                                "transaccion"
                                                              )).value;
                                                            const image = <
                                                              HTMLInputElement
                                                            >document.getElementById(
                                                              "image"
                                                            );
                                                            let base64Image =
                                                              "";

                                                            if (
                                                              !transaccion &&
                                                              !wallet
                                                            ) {
                                                              Swal.showValidationMessage(
                                                                "Por favor, llene 2 de alguna de las opciones."
                                                              );
                                                            } else if (
                                                              (transaccion &&
                                                                transaccion.length !==
                                                                  64) ||
                                                              (wallet &&
                                                                wallet.length !==
                                                                  34)
                                                            ) {
                                                              if (
                                                                transaccion &&
                                                                transaccion.length !==
                                                                  64
                                                              ) {
                                                                Swal.showValidationMessage(
                                                                  "Error, transacción incorrecta."
                                                                );
                                                              } else {
                                                                Swal.showValidationMessage(
                                                                  "Error, wallet incorrecta."
                                                                );
                                                              }
                                                            } else if (
                                                              (transaccion &&
                                                                transaccion.length ==
                                                                  64 &&
                                                                image.value !=
                                                                  "" &&
                                                                wallet &&
                                                                wallet.length ==
                                                                  34) ||
                                                              (transaccion &&
                                                                transaccion.length ==
                                                                  64 &&
                                                                image.value !=
                                                                  "" &&
                                                                !wallet) ||
                                                              (transaccion &&
                                                                transaccion.length ==
                                                                  64 &&
                                                                wallet &&
                                                                wallet.length ==
                                                                  34 &&
                                                                !image.value) ||
                                                              (wallet &&
                                                                wallet.length ==
                                                                  34 &&
                                                                image.value !=
                                                                  "" &&
                                                                !transaccion) ||
                                                              (wallet &&
                                                                wallet.length ==
                                                                  34 &&
                                                                transaccion &&
                                                                transaccion.length ==
                                                                  64 &&
                                                                !image.value) ||
                                                              (image.value !=
                                                                "" &&
                                                                wallet &&
                                                                wallet.length ==
                                                                  34 &&
                                                                !transaccion) ||
                                                              (image.value !=
                                                                "" &&
                                                                transaccion &&
                                                                transaccion.length ==
                                                                  64 &&
                                                                !wallet)
                                                            ) {
                                                              // al menos dos de los tres campos están llenos
                                                            } else {
                                                              Swal.showValidationMessage(
                                                                "Error, por favor llenar al menos dos de los tres campos."
                                                              );
                                                            }

                                                            const fileInput =
                                                              image;
                                                            const file =
                                                              fileInput
                                                                .files[0];

                                                            if (file) {
                                                              base64Image =
                                                                await new Promise(
                                                                  (resolve) => {
                                                                    const reader =
                                                                      new FileReader();
                                                                    reader.readAsArrayBuffer(
                                                                      file
                                                                    );
                                                                    reader.onload =
                                                                      () => {
                                                                        const base64 =
                                                                          window.btoa(
                                                                            new Uint8Array(
                                                                              reader.result as ArrayBuffer
                                                                            ).reduce(
                                                                              (
                                                                                data,
                                                                                byte
                                                                              ) =>
                                                                                data +
                                                                                String.fromCharCode(
                                                                                  byte
                                                                                ),
                                                                              ""
                                                                            )
                                                                          );
                                                                        resolve(
                                                                          base64
                                                                        );
                                                                      };
                                                                  }
                                                                );
                                                            }

                                                            return {
                                                              wallet: wallet,
                                                              transaccion:
                                                                transaccion,
                                                              image:
                                                                base64Image,
                                                            };
                                                          },
                                                        showCancelButton: true,
                                                        showConfirmButton: true,
                                                        confirmButtonText:
                                                          "Aceptar",
                                                        cancelButtonColor:
                                                          "#0275d8",
                                                        cancelButtonText:
                                                          "Cancelar",
                                                      }).then((result) => {
                                                        if (
                                                          result.isConfirmed
                                                        ) {
                                                          if (
                                                            (result.value.wallet
                                                              .length == 34 &&
                                                              result.value
                                                                .transaccion
                                                                .length ==
                                                                64) ||
                                                            (result.value.wallet
                                                              .length == 34 &&
                                                              result.value
                                                                .image) ||
                                                            (result.value
                                                              .transaccion
                                                              .length == 64 &&
                                                              result.value
                                                                .image)
                                                          ) {
                                                            Swal.fire({
                                                              title:
                                                                "Realizando proceso de participación",
                                                              text: "No salga hasta que se complete compra",
                                                              allowOutsideClick:
                                                                false,
                                                              allowEscapeKey:
                                                                false,
                                                              icon: "info",
                                                              timer: 7000,
                                                              timerProgressBar:
                                                                true,
                                                              showConfirmButton:
                                                                false,
                                                            });
                                                            const cobroDetail: CobroDetail =
                                                              {
                                                                aux: usuario.aux_clt,
                                                                img: result
                                                                  .value.image,
                                                                vta_fac:
                                                                  facturaHeader.id,
                                                                num_doc_cob:
                                                                  result.value
                                                                    .wallet,
                                                                id_tra:
                                                                  result.value
                                                                    .transaccion,
                                                                est: "P",
                                                                imp_nom:
                                                                  facturaDetail.pre,
                                                              };

                                                            this.accountService

                                                              .postDetailCobro(
                                                                cobroDetail
                                                              )

                                                              .pipe(
                                                                switchMap(
                                                                  (
                                                                    response: CobroDetailResponse
                                                                  ) => {
                                                                    if (
                                                                      response.vto_cob_c &&
                                                                      response
                                                                        .vto_cob_c
                                                                        .length >
                                                                        0
                                                                    ) {
                                                                      const idcobro =
                                                                        response
                                                                          .vto_cob_c[0]
                                                                          .id;
                                                                      return this.accountService
                                                                        .getCobro(
                                                                          usuario.id
                                                                        )
                                                                        .pipe(
                                                                          map(
                                                                            (
                                                                              response: CobroHeaderResponse
                                                                            ) => {
                                                                              if (
                                                                                response.vto_cob_c
                                                                              ) {
                                                                                for (var item of response.vto_cob_c) {
                                                                                  if (
                                                                                    item.id >
                                                                                    0
                                                                                  ) {
                                                                                    this.cuentaList.push(
                                                                                      item
                                                                                    );
                                                                                  }
                                                                                }
                                                                                this.planList.sort(
                                                                                  (
                                                                                    a,
                                                                                    b
                                                                                  ) => {
                                                                                    return (
                                                                                      a.ord_pla -
                                                                                      b.ord_pla
                                                                                    );
                                                                                  }
                                                                                );
                                                                              }
                                                                              if (
                                                                                response.errors
                                                                              ) {
                                                                                this.showErrors(
                                                                                  response.errors
                                                                                );
                                                                              }
                                                                              return idcobro;
                                                                            }
                                                                          ),
                                                                          catchError(
                                                                            (
                                                                              err
                                                                            ) => {
                                                                              this.errorObserver(
                                                                                err
                                                                              );
                                                                              return of(
                                                                                undefined
                                                                              );
                                                                            }
                                                                          )
                                                                        );
                                                                    } else {
                                                                      return of(
                                                                        undefined
                                                                      );
                                                                    }
                                                                  }
                                                                ),
                                                                catchError(
                                                                  (err) => {
                                                                    return of(
                                                                      undefined
                                                                    );
                                                                  }
                                                                )
                                                              )
                                                              .subscribe(
                                                                (
                                                                  idcobro:
                                                                    | number
                                                                    | undefined
                                                                ) => {
                                                                  if (idcobro) {
                                                                    this.accountService
                                                                      .UpdateCobro(
                                                                        usuario.id,
                                                                        facturaDetail.id,
                                                                        idcobro,
                                                                        facturaHeader.num_fac,
                                                                        result
                                                                          .value
                                                                          .wallet,
                                                                        result
                                                                          .value
                                                                          .transaccion
                                                                      )
                                                                      .subscribe(
                                                                        {
                                                                          next: (
                                                                            response: CobroHeaderResponse
                                                                          ) => {
                                                                            if (
                                                                              response.vto_cob_c
                                                                            ) {
                                                                              if (
                                                                                response
                                                                                  .vto_cob_c
                                                                                  .length >
                                                                                0
                                                                              ) {
                                                                                Swal.fire(
                                                                                  {
                                                                                    title:
                                                                                      "Exito",
                                                                                    text: "Envio realizado exitosamente",
                                                                                    icon: "success",
                                                                                    confirmButtonColor:
                                                                                      "#3085d6",
                                                                                    confirmButtonText:
                                                                                      "Aceptar",
                                                                                  }
                                                                                );
                                                                                this.router.navigate(
                                                                                  [
                                                                                    "facturas",
                                                                                  ]
                                                                                );
                                                                              }
                                                                            }
                                                                          },
                                                                          error:
                                                                            (
                                                                              err: any
                                                                            ) =>
                                                                              this.errorObserver(
                                                                                err
                                                                              ),
                                                                        }
                                                                      );
                                                                  }
                                                                }
                                                              );
                                                          }
                                                        }
                                                      });
                                                    } else {
                                                      Swal.fire({
                                                        title: "Error!",
                                                        text: "Error interno del servidor. Contáctese con el administrador",
                                                        icon: "error",
                                                        confirmButtonColor:
                                                          "#3085d6",
                                                        confirmButtonText:
                                                          "Aceptar",
                                                      });
                                                    }
                                                  }
                                                  if (response.errors) {
                                                    this.showErrors(
                                                      response.errors
                                                    );
                                                  }
                                                },
                                                error: (err: any) =>
                                                  this.errorObserver(err),
                                              });
                                          } else {
                                            Swal.fire({
                                              title: "Error!",
                                              text: "Error interno del servidor. Contáctese con el administrador",
                                              icon: "error",
                                              confirmButtonColor: "#3085d6",
                                              confirmButtonText: "Aceptar",
                                            });
                                          }
                                        }
                                        if (response.errors) {
                                          this.showErrors(response.errors);
                                        }
                                      },
                                      error: (err: any) =>
                                        this.errorObserver(err),
                                    });
                                }
                              });
                            } else {
                              Swal.fire({
                                title: "Error!",
                                text: "Error interno del servidor. Contáctese con el administrador",
                                icon: "error",
                                confirmButtonColor: "#3085d6",
                                confirmButtonText: "Aceptar",
                              });
                            }
                          }
                          if (response.errors) {
                            this.showErrors(response.errors);
                          }
                        },
                        error: (err: any) => this.errorObserver(err),
                      });
                  } else {
                    Swal.fire({
                      title: "Error!",
                      text: "Error interno del servidor. Contáctese con el administrador",
                      icon: "error",
                      confirmButtonColor: "#3085d6",
                      confirmButtonText: "Aceptar",
                    });
                  }
                }
                if (response.errors) {
                  this.showErrors(response.errors);
                }
              },
              error: (err: any) => this.errorObserver(err),
            });
          }
        });
      }
    });
  }

  errorObserver(err: any) {
    let errorMessage = "";
    if (err.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = err.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${err.status}\nMessage: Ups tenemos un problema vuelve intentarlo en unos minutos`;
    }
    Swal.fire({
      title: "Error!",
      text: "Error interno del servidor. " + errorMessage,
      icon: "error",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Aceptar",
    });
  }

  showErrors(errors: ErrorHandled[]) {
    let errorList: string = "";
    for (let index = 0; index < errors.length; index++) {
      errorList += errors[index].message + "<br>";
    }
    Swal.fire({
      title: "Error!",
      html: errorList,
      icon: "error",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Aceptar",
    });
  }

  /**
   * Método que convierte un string(base64) en imagen
   * @param img
   * @returns
   */
  convertirBase64_Img(img: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      "data:image/jpg;base64," + img
    );
  }
}
