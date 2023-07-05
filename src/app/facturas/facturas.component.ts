import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Cuenta } from "app/models/cuenta_header";
import { CuentaResponse } from "app/models/cuenta_header_response";
import { ErrorHandled } from "app/models/error_handled";
import { FacturaHeader } from "app/models/factura_header";
import { FacturaHeaderResponse } from "app/models/factura_header_response";
import { Usuario } from "app/models/usuario";
import { AccountService } from "app/services/account.service";
import { Subject } from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: "app-facturas",
  templateUrl: "./facturas.component.html",
  styleUrls: ["./facturas.component.css"],
})
export class FacturasComponent implements OnInit {
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings | any = {};

  cuentaList: Cuenta[] = [];
  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.getFacturas();
  }

  getFacturas() {
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
    this.accountService.getCuentas(usuario.id).subscribe({
      next: (response: CuentaResponse) => {
        if (response.vto_cob_c) {
          this.cuentaList = response.vto_cob_c;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
  }

  errorObserver(err: any) {
    let errorMessage = "";
    if (err.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = err.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${err.status}\nMessage: ${err.message}`;
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
