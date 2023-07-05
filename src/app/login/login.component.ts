import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Usuario } from "app/models/usuario";
import { AccountService } from "app/services/account.service";
import { throwError } from "rxjs";
import { sha3_256 } from "js-sha3";
import { Router } from "@angular/router";
import { UsuarioResponse } from "app/models/usuario_response";
import { ErrorHandled } from "app/models/error_handled";

import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  hide = true;

  loginForm: UntypedFormGroup = new UntypedFormGroup({
    usr_web: new UntypedFormControl(null, [Validators.required]),
    pwd_web: new UntypedFormControl(null, [Validators.required]),
  });

  usuario: Usuario;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {}

  login(loginFormValue) {
    if (this.loginForm.valid) {
      this.accountService.getUsuario(loginFormValue.usr_web).subscribe({
        next: (response: UsuarioResponse) => {
          if (response.ent_m) {
            if (response.ent_m.length > 0) {
              this.usuario = response.ent_m[0];
              let pwd_web = sha3_256(loginFormValue.pwd_web);
              if (this.usuario.pwd_web === pwd_web) {
                this.router.navigate(["dashboard"]);
                localStorage.setItem("usr", JSON.stringify(this.usuario));
              } else {
                this.loginForm.controls["pwd_web"].setErrors({
                  incorrect: true,
                });
              }
            } else {
              this.loginForm.controls["usr_web"].setErrors({ incorrect: true });
            }
          }
          if (response.errors) {
            this.showErrors(response.errors);
          }
        },
        error: (err: any) => this.showErrors(err),
      });
    }
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

  hasError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  };

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
