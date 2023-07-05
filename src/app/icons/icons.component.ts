import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cuenta } from 'app/models/cuenta_header';
import { CuentaResponse } from 'app/models/cuenta_header_response';
import { ErrorHandled } from 'app/models/error_handled';
import { Usuario } from 'app/models/usuario';
import { UsuarioResponse } from 'app/models/usuario_response';
import { AccountService } from 'app/services/account.service';
import { Subject } from 'rxjs/internal/Subject';
import Swal from 'sweetalert2';

@Component({
  selector: "app-icons",
  templateUrl: "./icons.component.html",
  styleUrls: ["./icons.component.css"],
})
export class IconsComponent implements OnInit {
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings | any = {};
  usuarioList: Usuario[] = [];
  cuentaList: Cuenta[] = [];
  referidosList: Usuario[] = [];

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.getReferidos();
  }
  getReferidos() {
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

    this.accountService.getUsuarioName(usuario.id).subscribe({
      next: (response: UsuarioResponse) => {
        if (response.ent_m) {
          this.usuarioList = response.ent_m;
          this.dtTrigger.next("");
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
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
