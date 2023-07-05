import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorHandled } from "app/models/error_handled";
import { Pais } from "app/models/pais";
import { PaisResponse } from "app/models/pais_response";
import { Provincia } from "app/models/provincia";
import { ProvinciaResponse } from "app/models/provincia_response";
import { Usuario } from "app/models/usuario";
import { UsuarioResponse } from "app/models/usuario_response";
import { AccountService } from "app/services/account.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { query } from "chartist";
import { response } from "express";
import { Subject, firstValueFrom } from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  paisList: Pais[] = [];
  usuarioList: Usuario[] = [];

  selectedPais: number;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings= {};
  selectedProvincia: number;
  linkDeshabilitado = true;
  provinciaList: Provincia[] = [];

  num_plan_adq: number = 0;
  serlo: number = 0;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private clipboard: Clipboard
  ) {}
  ngOnInit(): void {
    this.getPaises();
    this.getProvincias();
    this.getReferidos();
    this.asypreviewlink();
  }

  getPaises() {
    this.accountService.getPaises().subscribe({
      next: (response: PaisResponse) => {
        if (response.pai_m) {
          this.paisList = response.pai_m;
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
  }
  copyHeroName() {
    let activebutton = document.getElementsByClassName(
      "copy-button"
    ) as unknown as HTMLButtonElement[];
    if (activebutton && activebutton.length > 0) {
      activebutton[0].classList.add("active");
      setTimeout(() => {
        activebutton[0].classList.remove("active");
      }, 2000);
    }
    let linkReference = document.getElementById(
      "copylink"
    ) as HTMLTextAreaElement;
    if (linkReference) {
      this.clipboard.copy(linkReference.innerHTML);
    }
  }

  getProvincias() {
    this.accountService.getProvincias().subscribe({
      next: (response: ProvinciaResponse) => {
        if (response.pro_m) {
          this.provinciaList = response.pro_m;
        }
        if (response.errors) {
          this.showErrors(response.errors);
        }
      },
      error: (err: any) => this.errorObserver(err),
    });
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
  }

  UpdateUser() {
    const user_web = document.getElementById("usr_web") as HTMLInputElement;
    const email = document.getElementById("email") as HTMLInputElement;
    const name = document.getElementById("name") as HTMLInputElement;
    //const last_name = document.getElementById("last_name") as HTMLInputElement;
    const adress = document.getElementById("adress") as HTMLInputElement;
    const wallet = document.getElementById(
      "wallet_usuario"
    ) as HTMLInputElement;
    const county = this.selectedPais;
    const province = this.selectedProvincia;
    if (
      !email.value ||
      !name.value ||
      //!last_name.value ||
      !adress.value ||
      !county ||
      !wallet
    ) {
      Swal.fire({
        title: "Error!",
        html: "llene todos los campos",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar",
      });
    } else if (county == 59 && !province) {
      Swal.fire({
        title: "Error!",
        html: "Llene la provincia",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar",
      });
    } else if (wallet.value.length !== 34) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "error",
        text: "Error, wallet incorrecta.",
        showConfirmButton: true,
      });
    } else {
      console.log(county);
      const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
      this.accountService
        .UpdateUser(
          email.value,
          county,
          name.value,
          province,
          usuario.id,
          adress.value,
          wallet.value
        )
        .subscribe({
          next: (response: UsuarioResponse) => {
            if (response.ent_m) {
              if (response.ent_m.length > 0) {
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Éxito!",
                  text: "Actualizacion realizada correctamente...",
                  showConfirmButton: false,
                  timer: 1500,
                });
                this.router.navigate(["dashboard"]);
              } else {
                Swal.fire({
                  title: "Error!",
                  text: "Error interno al actualizar",
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
  }
  changePais(paisId: number) {
    this.selectedPais = paisId;
    if (paisId == 59) {
      this.getProvincias();
    }
  }
  changeProvincia(provinciaId: number) {
    this.selectedProvincia = provinciaId;
  }
  asypreviewlink() {
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    this.accountService.getUsuarioName(usuario.id).subscribe({
      next: (response: UsuarioResponse) => {
        if (response.ent_m) {
          this.num_plan_adq = response.ent_m[0].num_plan_adq;
          this.serlo = 0;
          this.linkDeshabilitado = this.num_plan_adq <= this.serlo;
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
  

  

  
  

