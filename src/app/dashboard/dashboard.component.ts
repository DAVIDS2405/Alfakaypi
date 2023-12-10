import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AccountService } from "app/services/account.service";
import { ErrorHandled } from "app/models/error_handled";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import * as Chartist from "chartist";
import { Usuario } from "app/models/usuario";
import { DashboardHeaderResponse } from "app/models/dashoard_header_response";
import { DashboardHeader } from "app/models/dashboard_header";
import { UsuarioResponse } from "app/models/usuario_response";
import { stringify } from "querystring";
import { PagoHeader } from "app/models/pagos_header";
import { PagoHeaderResponse } from "app/models/pagos_header_response";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { coingeko } from "app/models/coingeko";
import { FacturaHeader } from "app/models/factura_header";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  constructor(private accountService: AccountService, private router: Router) {}
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings | any = {};
  referidosList: Usuario[] = [];
  comisionesList: Usuario[] = [];
  comisionesMensualList: PagoHeader[] = [];
  rendimientomensualList: PagoHeader[] = [];
  totalPedidos: number;
  rendimientoTotalPagado: PagoHeader[] = [];
  totalMensual: number;
  totalInversion: number = 0;
  totalFactura: number = 0;
  packparticipacion: number;
  // coingeko: coingeko[] = [];
  facturaList: FacturaHeader[] = [];
  totalComisionesMensuales: number = 0;
  RendimientoTotal: number = 0;
  totalRoi: number = 0;
  totalPagado:number = 0;
  rendimientoList: PagoHeader[] = [];
  estadisticaInversionList: any = [];
  estadisticaPagoList: any = [];

  getEstadisticas() {
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
    this.accountService.getReference(usuario.id).subscribe({
      next: (response: UsuarioResponse) => {
        if (response.ent_m) {
          this.referidosList = response.ent_m;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    //JSON
    this.accountService.getEstadisiticaInversionTotal(usuario.id).subscribe({
      next: (response) => {
        if (response) {
          this.estadisticaInversionList = response;
          this.totalInversion = this.estadisticaInversionList.reduce(
            (total, estadistica) => total + estadistica.IMP_TOT,
            0
          );
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    this.accountService.getEstadisiticaPagaTotal(usuario.id).subscribe({
      next: (response) => {
        if (response) {
          this.estadisticaPagoList = response;
          this.RendimientoTotal = this.estadisticaPagoList.reduce(
            (total, estadistica) => total + estadistica.IMP_TOT,
            0
          );
          console.log(this.RendimientoTotal);
        }
      },
    });

    this.accountService.getUsuarioName(usuario.id).subscribe({
      next: (response: UsuarioResponse) => {
        if (response) {
          this.comisionesList = response.ent_m;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });

    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.rendimientoList = response.com_ped_g;
          let totalPedidos = 0; // Inicializas la variable totalPedidos en cero
          const today = new Date();
          const currentDay = today.getDate();
          const lastMonth1 = new Date(
            today.getFullYear(),
            today.getMonth() + 1
          );
          this.rendimientoList = this.rendimientoList.filter((pago) => {
            if (pago.est === "P" && new Date(pago.fch) <= lastMonth1) {
              totalPedidos += pago.bas_gen; // Acumulas el valor de bas_gen en la variable totalPedidos
              return true; // Retornas true para incluir el pago en la lista filtrada
            }
            return false; // Retornas false para excluir el pago de la lista filtrada
          });
          this.totalPedidos = totalPedidos; // Asignas el valor acumulado a la variable this.totalPedidos para mostrarlo en la vista
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.rendimientoTotalPagado = response.com_ped_g;
          let totalPagado = 0; // Inicializas la variable totalPedidos en cero
          this.rendimientoTotalPagado = this.rendimientoTotalPagado.filter(
            (pago) => {
              if (pago.est === "S" && pago.pag_com_ref == false) {
                totalPagado += pago.bas_gen; // Acumulas el valor de bas_gen en la variable totalPedidos
                return true; // Retornas true para incluir el pago en la lista filtrada
              }
              return false; // Retornas false para excluir el pago de la lista filtrada
            }
          );
          this.totalPagado = totalPagado; // Asignas el valor acumulado a la variable this.totalPedidos para mostrarlo en la vista
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });

    this.accountService.getFacturas(usuario.id).subscribe({
      next: (response: FacturaHeaderResponse) => {
        if (response.vta_fac_g) {
          this.facturaList = response.vta_fac_g;
          let totalFactura = 0;
          this.facturaList = this.facturaList.filter((factura) => {
            if (factura.fac == "2") {
              totalFactura += factura.tot_fac;
            }
          });
          this.totalFactura = totalFactura;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.rendimientomensualList = response.com_ped_g;
          let totalMensual = 0; // Inicializas la variable totalPedidos en cero
          const today = new Date();
          this.rendimientomensualList = this.rendimientomensualList.filter(
            (pago) => {
              const pagoDate = new Date(pago.fch);
              const currentYear = today.getFullYear();
              const currentMonth = today.getMonth();
              if (
                pago.est === "P" &&
                pago.pag_com_ref == false &&
                pagoDate.getFullYear() === currentYear &&
                pagoDate.getMonth() === currentMonth
              ) {
                totalMensual += pago.bas_gen; // Acumulas el valor de bas_gen en la variable totalPedidos
                return true; // Retornas true para incluir el pago en la lista filtrada
              }
              return false; // Retornas false para excluir el pago de la lista filtrada
            }
          );
          this.totalMensual = totalMensual; // Asignas el valor acumulado a la variable this.totalPedidos para mostrarlo en la vista
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    this.accountService.getPagosEstadoCuenta(usuario.id).subscribe({
      next: (response: PagoHeaderResponse) => {
        if (response.com_ped_g) {
          this.comisionesMensualList = response.com_ped_g;
          let totalMensualComisiones = 0; // Inicializas la variable totalPedidos en cero
          const today = new Date();
          this.comisionesMensualList = this.comisionesMensualList.filter(
            (pago) => {
              const pagoDate = new Date(pago.fch);
              const currentYear = today.getFullYear();
              const currentMonth = today.getMonth();
              if (
                pago.est === "P" &&
                pago.pag_com_ref === true &&
                pagoDate.getFullYear() === currentYear &&
                pagoDate.getMonth() === currentMonth
              ) {
                totalMensualComisiones += pago.bas_gen; // Acumulas el valor de bas_gen en la variable totalPedidos
                return true; // Retornas true para incluir el pago en la lista filtrada
              }
              return false; // Retornas false para excluir el pago de la lista filtrada
            }
          );
          this.totalComisionesMensuales = totalMensualComisiones; // Asignas el valor acumulado a la variable this.totalPedidos para mostrarlo en la vista
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
    // this.accountService.Coingeko().subscribe({
    //   next:(response) =>{
    //     if(response){
    //       this.coingeko = response;
    //       console.log(this.coingeko)
    //     }
    //   }
    // })
  }

  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on("draw", function (data) {
      if (data.type === "line" || data.type === "area") {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path
              .clone()
              .scale(1, 0)
              .translate(0, data.chartRect.height())
              .stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint,
          },
        });
      } else if (data.type === "point") {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq = 0;
  }
  startAnimationForBarChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on("draw", function (data) {
      if (data.type === "bar") {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq2 = 0;
  }
  ngOnInit() {
    this.getEstadisticas();
    /* ----------==========     ROI diarios Chart initialization For Documentation    ==========---------- */

    const dataDailySalesChart: any = {
      labels: ["L", "M", "M", "J", "V"],
      series: [[22, 28, 17, 5, 3]],
    };

    const optionsDailySalesChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
      }),
      low: 0,
      high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    var dailySalesChart = new Chartist.Line(
      "#dailySalesChart",
      dataDailySalesChart,
      optionsDailySalesChart
    );

    this.startAnimationForLineChart(dailySalesChart);

    /* ----------==========     Volumen ventas Chart initialization    ==========------

      const dataCompletedTasksChart: any = {
          labels: ['N1', 'N2', 'N3', 'N4', 'N5'],
          series: [
              [1230, 2750, 1450, 4300, 2280]
          ]
      };

     const optionsCompletedTasksChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 3000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
      }

      var completedTasksChart = new Chartist.Pie('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // start animation for the Completed Tasks Chart - Line Chart
      this.startAnimationForLineChart(completedTasksChart); - */

    /* ----------==========     Volumen ventas Chart initialization    ==========--------- */
    var data = {
      series: [2, 3, 5, 3, 4],
    };

    var sum = function (a, b) {
      return a + b;
    };

    new Chartist.Pie("#completedTasksChart", data, {
      labelInterpolationFnc: function (value) {
        return Math.round((value / data.series.reduce(sum)) * 100) + "%";
      },
    });

    /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

    var datawebsiteViewsChart = {
      labels: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      series: [[390, 800, 400, 100, 800, 453, 326, 1800, 568, 1610, 756, 3895]],
    };
    var optionswebsiteViewsChart = {
      axisX: {
        showGrid: false,
      },
      low: 0,
      high: 1000,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0 },
    };
    var responsiveOptions: any[] = [
      [
        "screen and (max-width: 640px)",
        {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            },
          },
        },
      ],
    ];
    var websiteViewsChart = new Chartist.Bar(
      "#websiteViewsChart",
      datawebsiteViewsChart,
      optionswebsiteViewsChart,
      responsiveOptions
    );

    //start animation for the Emails Subscription Chart
    this.startAnimationForBarChart(websiteViewsChart);
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
    console.log(errorList)
    if (errorList == "undefined<br>") {
      errorList = "Algo salido mal inténtalo en unos minutos";
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
