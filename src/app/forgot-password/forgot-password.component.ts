import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { UsuarioResponse } from "app/models/usuario_response";
import { Router } from "@angular/router";
import { Usuario } from "app/models/usuario";
import { sha3_256, sha3_512 } from "js-sha3";
import { AccountService } from "app/services/account.service";
import { ErrorHandled } from "app/models/error_handled";
import Swal from "sweetalert2";
import { response } from "express";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
})
export class ForgotPasswordComponent implements OnInit {
  hide = true;

  constructor(private accountService: AccountService, private router: Router) {}

  forgotPasswordForm: UntypedFormGroup = new UntypedFormGroup({
    usr_web: new UntypedFormControl(null, [Validators.required]),
    eml: new UntypedFormControl(null, [Validators.required, Validators.email]),
  });

  usuario: Usuario;

  ngOnInit(): void {}

  recoverPassword(forgotPasswordForm) {
    if (this.forgotPasswordForm.valid) {
      this.accountService.getUsuario(forgotPasswordForm.usr_web).subscribe({
        next: (response: UsuarioResponse) => {
          if (response.ent_m) {
            if (response.ent_m.length > 0) {
              const usuario = response?.ent_m?.[0];
              let eml = forgotPasswordForm.eml;
              if (usuario?.eml === eml) {
                Swal.fire({
                  title: "Ingrese clave nueva",
                  html:
                    '<input id="password1" class="swal2-input" type="password" placeholder="Ingrese la nueva contraseña"></br>' +
                    "<br> Confirmacion de contraseña" +
                    '<input id="password2" class="swal2-input" type="password" placeholder="Ingrese nuevamente la contraseña">',
                  focusConfirm: false,
                  preConfirm: () => {
                    const password1 = (<HTMLInputElement>(
                      document.getElementById("password1")
                    )).value;
                    const password2 = (<HTMLInputElement>(
                      document.getElementById("password2")
                    )).value;

                    if (!password1 && !password2) {
                      Swal.showValidationMessage(
                        "Por favor, llene los dos campos."
                      );
                    }
                    
                    else if (
                      (usuario?.pwd_web) == sha3_256(password1) &&
                      (usuario?.pwd_web) == sha3_256(password2)
                    ) {
                      Swal.showValidationMessage(
                        "Por favor, la contraseña no puede ser igual a la anterior"
                      );
                    } else if (password1 != password2) {
                      Swal.showValidationMessage(
                        "Por favor, las contraseñas deben de ser iguales"
                      );
                    } else if (password1.length < 8 && password2.length < 8) {
                      if (password1.length < 8) {
                        Swal.showValidationMessage(
                          "Por favor, la contraseña deben de tener entro 8 a mas caracteres."
                        );
                      } else {
                        Swal.showValidationMessage(
                          "Por favor, la contraseña deben de tener entro 8 a mas caracteres."
                        );
                      }
                    }
                      return {
                        password1: password1,
                        password2: password2,
                      };
                  },
                  showCancelButton: true,
                  showConfirmButton: true,
                  confirmButtonText: "Aceptar",
                  cancelButtonColor: "#0275d8",
                  cancelButtonText: "Cancelar",
                }).then((result) => {
                  if (result.isConfirmed) {
                    if (
                      result.value.password1 === result.value.password2 &&
                      result.value.password1.length >= 8 &&
                      result.value.password2.length >= 8 &&
                      (usuario?.pwd_web) !=
                      sha3_256(result.value.password1)
                    ) {
                      this.accountService
                        .UpdatePassword(
                          result.value.password1,
                          eml,
                          usuario?.usr_web
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
                                this.router.navigate(["login"]);
                              } else {
                                Swal.fire({
                                  title: "Error!",
                                  text: "Error interno al cambiar contraseña",
                                  icon: "error",
                                  confirmButtonColor: "#3085d6",
                                  confirmButtonText: "Aceptar",
                                });
                              }
                              if (response.errors) {
                                this.showErrors(response.errors);
                              }
                            }
                          },
                          error: (err: any) => this.errorObserver(err),
                        });
                    }
                    
                  }
                });
              } else {
                this.forgotPasswordForm.controls["eml"].setErrors({
                  incorrect: true,
                });
              }
            } else {
              this.forgotPasswordForm.controls["usr_web"].setErrors({
                incorrect: true,
              });
            }
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
      errorMessage = `Error Code: ${err.status}\nMessage:Ups tenemos un problema vuelve intentarlo en unos minutos`;
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
    return this.forgotPasswordForm.controls[controlName].hasError(errorName);
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
