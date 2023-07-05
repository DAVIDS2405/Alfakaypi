import { useAnimation } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Cuenta } from "app/models/cuenta_header";
import { CuentaResponse } from "app/models/cuenta_header_response";
import { ErrorHandled } from "app/models/error_handled";
import { EstadoHeader } from "app/models/estado_header";
import { EstadoHeaderResponse } from "app/models/estado_header_response";
import { FacturaHeader } from "app/models/factura_header";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { PagoHeader } from "app/models/pagos_header";
import { PagoHeaderResponse } from "app/models/pagos_header_response";
import { RetiroDetail } from "app/models/retiro_detail";
import { RetiroDetailResponse } from "app/models/retiro_detail_response";
import { RetiroHeader } from "app/models/retiro_header";
import { RetiroHeaderResponse } from "app/models/retiro_header_response";
import { Usuario } from "app/models/usuario";
import { AccountService } from "app/services/account.service";
import { response } from "express";
import { Subject } from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: "app-table-list",
  templateUrl: "./table-list.component.html",
  styleUrls: ["./table-list.component.css"],
})
export class TableListComponent implements OnInit {
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings | any = {};
  EstadoList: EstadoHeader[] = [];
  PagoList: PagoHeader[] = [];
  PagoList2: PagoHeader[] = [];
  cuentaList: Cuenta[] = [];
  atributos: any[] = [];
  totalSeleccionado = 0;
  FacturaList: FacturaHeader[] = [];
  fechaActual: Date = new Date();
  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.getEstadoCuenta();
    this.fechaActual = new Date();
  }
  getEstadoCuenta() {
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
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.PagoList = response.com_ped_g;
          const today = new Date();
          const currentDay = today.getDate();
          if (currentDay >= 28) {
            const lastMonth1 = new Date(today.getFullYear(), today.getMonth() +1);
            this.PagoList = this.PagoList.filter(
              (pago) => pago.est === "P" && new Date(pago.fch) <= lastMonth1
            );
          } else {
            
            const lastMonth = new Date(
              today.getFullYear(),
              today.getMonth() +1, 
            );
            console.log(lastMonth);
            this.PagoList = this.PagoList.filter(
              (pago) => pago.est === "P" && new Date(pago.fch) <= lastMonth
            );
          }

          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
    });
    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.PagoList2 = response.com_ped_g;
          this.PagoList2 = this.PagoList2.filter(
            (pago) => pago.est === "S" || pago.est === "R"
          );
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
    });

    this.accountService.getCuentas(usuario.id).subscribe({
      next: (response: CuentaResponse) => {
        if (response.vto_cob_c) {
          this.cuentaList = response.vto_cob_c;
          this.cuentaList = this.cuentaList.filter(
            (cuenta) => cuenta.est === "C"
          );
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
  }
  enviarPagos() {
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    const pagosSeleccionados = this.PagoList.filter((pago) => pago.selected);
    if (pagosSeleccionados.length == 0) {
      Swal.fire({
        title: "Error!",
        text: "Seleccionar almenos un pago por favor",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar",
      });
    } else {
      const atributosPagos = [];
      pagosSeleccionados.forEach((pago) => {
        const atributos = {
          num_ped: pago.num_ped,
          id: pago.id,
          num_ped_prv: pago.num_ped_prv,
          fch: pago.fch,
          bas_gen: pago.bas_gen,
          est: pago.est,
          id_com_ped_lin: pago.id_com_ped_lin,
          id_plan: pago.id_plan,
          id_roi_usr: pago.id_roi_usr,
          vta_fac: pago.vta_fac,
        };
        atributosPagos.push(atributos);
        this.accountService
          .getHeaderRetiros(
            usuario.id,
            pago.id,
            atributos.id,
            atributos.id_plan,
            atributos.id_roi_usr,
            atributos.num_ped,
            atributos.fch
          )
          .subscribe({
            next: (response: RetiroHeaderResponse) => {
              if (response.com_fac_g) {
                if (response.com_fac_g.length > 0) {
                  const retiroheader: RetiroHeader = response.com_fac_g[0];
                  const retiroDetail: RetiroDetail = {
                    art: atributos.id_plan,
                    can: 1,
                    prv: usuario.id,
                    //emp: 1,
                    //emp_div: 1,
                    com_ped: atributos.id,
                    com_ped_lin: atributos.id_com_ped_lin,
                    pre: atributos.bas_gen,
                    com_fac: retiroheader.id,
                  };
                  console.log(retiroDetail);
                  setTimeout(() => {
                    this.accountService
                      .postDetailRetiro(retiroDetail)
                      .subscribe({
                        next: (response: RetiroDetailResponse) => {
                          if (response.mov_g) {
                            if (response.mov_g.length > 0) {
                              Swal.fire({
                                title: "Exito",
                                text: "Solicitud de retiro realizada",
                                icon: "success",
                                confirmButtonColor: "#3085d6",
                                confirmButtonText: "Aceptar",
                              });
                              this.router.navigate(["dashboard"]);
                            } else {
                              Swal.fire({
                                title: "Error!",
                                text: "Error interno al pagar",
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
                  }, 2000);
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
      });
    }
  }

  isFechaHabilitada(): boolean {
   const dia = this.fechaActual.getDate();
   return dia >= 28 && dia <= 30;
  }

  updateTotal() {
    let total = 0;
    for (const pago of this.PagoList) {
      if (pago.selected) {
        total += pago.bas_gen;
      }
    }
    this.totalSeleccionado = total;
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
