import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PedidoHeader } from "app/models/pedido_header";
import { PedidoHeaderResponse } from "app/models/pedido_header_response";
import { ErrorHandled } from "app/models/error_handled";
import { Usuario } from "app/models/usuario";
import { QrHeader } from "app/models/qr_header";
import { AccountService } from "app/services/account.service";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import { Plan } from "app/models/plan";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { FacturaHeader } from "app/models/factura_header";
import { FacturaDetail } from "app/models/factura_detail";
import { FacturaDetailResponse } from "app/models/factura_detail_response";
import { QrHeaderResponse } from "app/models/qr_header_response";
import { PlanResponse } from "app/models/plan_response";
import { Cuenta } from "app/models/cuenta_header";

@Component({
  selector: "app-cuentas",
  templateUrl: "./cuentas.component.html",
  styleUrls: ["./cuentas.component.css"],
})
export class CuentasComponent implements OnInit {
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings | any = {};
  qrNames: unknown = "";
  QrList: QrHeader[] = [];
  planList: Plan[] = [];
  pedidoList: PedidoHeader[] = [];
  precio: number;
  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.getPedidos();
  }

  getPedidos() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      info: true,
      processing: true,
      ordering: true,
      responsive: true,
      retrieve: true,
      language: {
        url: "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json",
      },
      order: [[0, "asc"]],
      columnDefs: [
        {
          targets: [0, 1, 2, 3],
          orderable: false,
        },
        {
          targets: [1, 2, 3],
          className: "dt-body-right",
        },
      ],
    };
    const totalCells = document.querySelectorAll(".total");
    totalCells.forEach((cell) => {
      const total = cell.textContent.trim();
      console.log(total);
    });
    //Pedidos que posee el usuario Api
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
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
    //Codigo qr y wallet de la empresa
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
    //Planes
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
  }

  comprar(cuenta: Cuenta) {
    let qrNames = "";
    let numWallet = "";
    let precio = "";
    let planId = 0;
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    for (const qr of this.QrList) {
      qrNames += qr.qrcode;
      numWallet += qr.num_wal;
      break;
    }
    for (const pd of this.pedidoList) {
      precio += pd.tot_ped;
      break;
    }
    for (const id of this.planList) {
      planId += id.id;
      break;
    }
    console.log(planId);

    Swal.fire({
      title: "¿Desea adquirir el plan?",
      html:
        "<p>" +
        qrNames +
        "</p>" +
        "<p>" +
        numWallet +
        "</p>" +
        "Solo se aceptan USDT" +
        "<br/>Escanea el codigo QR",
      input: "number",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonColor: "#0275d8",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        //hidden: 'true'
      },
      inputValue: precio,
    }).then((result: any) => {
      if (result.value) {
        this.accountService.getHeaderFactura(usuario.id).subscribe({
          next: (response: FacturaHeaderResponse) => {
            if (response.vta_fac_g) {
              if (response.vta_fac_g.length > 0) {
                const facturaHeader: FacturaHeader = response.vta_fac_g[0];
                const facturaDetail: FacturaDetail = {
                  art: planId,
                  can: 1,
                  //emp: 1,
                  //emp_div: 1,
                  pre: result.value,
                  vta_fac: facturaHeader.id,
                };
                console.log(JSON.stringify(facturaDetail));
                this.accountService.postDetailFactura(facturaDetail).subscribe({
                  next: (response: FacturaDetailResponse) => {
                    if (response.mov_g) {
                      if (response.mov_g.length > 0) {
                        Swal.fire({
                          position: "center",
                          icon: "success",
                          title: "Éxito!",
                          text: "Compra realizada correctamente...",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                        this.router.navigate(["facturas"]);
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
}
