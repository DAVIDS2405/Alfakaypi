import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Usuario } from "app/models/usuario";
import { Pais } from "app/models/pais";
import { PaisResponse } from "app/models/pais_response";
import { Provincia } from "app/models/provincia";
import { ProvinciaResponse } from "app/models/provincia_response";
import { AccountService } from "app/services/account.service";
import { sha3_256 } from "js-sha3";
import { UsuarioResponse } from "app/models/usuario_response";
import Swal from "sweetalert2";
import { ErrorHandled } from "app/models/error_handled";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { UsuarioRelaciona } from "app/models/usuariorelacion";
import { UsuarioRelacionaResponse } from "app/models/usuariorelacion_response";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  myValue: string = "alfakaypi";
  paisList: Pais[] = [];
  provinciaList: Provincia[] = [];
  UsuarioRelacionado: UsuarioRelaciona[] = [];

  registerForm: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    name: new UntypedFormControl(null, [Validators.required]),
    cif: new UntypedFormControl(null, [Validators.required]),
    tlf: new UntypedFormControl(null, [Validators.required]),
    eml: new UntypedFormControl(null, [Validators.required, Validators.email]),
    dir: new UntypedFormControl(null, [Validators.required]),
    pai: new UntypedFormControl(null, [Validators.required]),
    pro: new UntypedFormControl(null, [Validators.required]),
    ent_rel: new UntypedFormControl(null, [Validators.required]),
    ent_rel_usr_web: new UntypedFormControl(null, [Validators.required]),
    ent_rel_name: new UntypedFormControl(null),
    nom_ent_rel: new UntypedFormControl(null),
    
    usr_web: new UntypedFormControl(null, [Validators.required]),
    pwd_web: new UntypedFormControl(null, [Validators.required]),
    off: new UntypedFormControl(false, [Validators.required]),
  });

  hide = true;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getPaises();
    this.getProvincias();
    this.registerForm.controls["pro"].disable();
    const ref = this.route.snapshot.queryParamMap.get("ref");
    if (ref) {
      this.myValue = ref;
    }
  }
  getValue() {
    console.log(this.myValue);
  }
  register(registerFormValue) {
    if (this.registerForm.valid) {
      const usuario: Usuario = {
        dir: registerFormValue.dir,
        eml: registerFormValue.eml,
        ent_rel: registerFormValue.ent_rel,
        ent_rel_name: registerFormValue.ent_rel_name,
        id: 0,
        name: registerFormValue.name,
        cif: registerFormValue.cif,
        nom_fis: registerFormValue.name,
        nom_com: registerFormValue.name,
        emp: "1",
        emp_div: "1",
        nom_ent_rel: registerFormValue.nom_ent_rel,
        off: registerFormValue.off,
        pai: registerFormValue.pai,
        pro: registerFormValue.pro,
        pwd_web: registerFormValue.pwd_web,
        tlf: registerFormValue.tlf,
        usr_web: registerFormValue.usr_web,
        pgc_clt: registerFormValue.pgc_clt,
        aux_clt: registerFormValue.aux_clt,
        num_plan_adq: 0,
      };
      usuario.pwd_web = sha3_256(registerFormValue.pwd_web);

      console.log(JSON.stringify(usuario));
      if (this.validarCedula(usuario.cif) == true) {
        this.accountService.postUsuario(usuario).subscribe({
          next: (response: UsuarioResponse) => {
            if (response.ent_m) {
              if (response.ent_m.length > 0) {
                this.accountService.getUsuario(usuario.usr_web).subscribe({
                  next: (response: UsuarioResponse) => {
                    if (response.ent_m) {
                      const idUsuario = response.ent_m[0].id;
                      const usuariorelacion: UsuarioRelaciona = {
                        ent: idUsuario,
                        rel_tip: 1,
                        ent_rel: usuario.ent_rel,
                      };

                      this.accountService
                        .postUsuarioRelacionado(usuariorelacion)
                        .subscribe({
                          next: (response: UsuarioRelacionaResponse) => {
                            if (response.ent_rel_m) {
                              Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "Éxito!",
                                text: "Registro realizado correctamente...",
                                showConfirmButton: false,
                                timer: 1500,
                              });
                              this.router.navigate(["login"]);
                            }
                          },
                        });
                    }
                  },
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
  }

  validarCedula(cedula: string): boolean {
    // Limpiar la cédula de espacios en blanco y guiones
    const cleanCedula = cedula.replace(/\s|-/g, "");

    // Comprobar que la cédula tiene 10 dígitos
    if (cleanCedula.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cédula debe tener 10 dígitos",
      });
      return false;
    }

    // Obtener el código de provincia de la cédula
    const codigoProvincia = parseInt(cleanCedula.slice(0, 2));
    if (codigoProvincia < 1 || codigoProvincia > 24) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El código de provincia de la cédula es inválido",
      });
      return false;
    }

    // Obtener los primeros 9 dígitos de la cédula
    const cedulaSinDigitoVerificador = cleanCedula.slice(0, 9);

    // Realizar el cálculo de verificación
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedulaSinDigitoVerificador[i]);
      valor *= i % 2 === 0 ? 2 : 1;
      if (valor >= 10) {
        valor -= 9;
      }
      suma += valor;
    }
    const digitosVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);

    // Comparar el dígito verificador calculado con los últimos 3 dígitos de la cédula
    if (digitosVerificador !== parseInt(cleanCedula.slice(9, 12))) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cédula ingresada es inválida",
      });
      return false;
    }

    return true;
  }
  searchUser() {
    if (this.registerForm.controls["ent_rel_usr_web"].valid) {
      this.accountService
        .getUsuario(this.registerForm.controls["ent_rel_usr_web"].value)
        .subscribe({
          next: (response: UsuarioResponse) => {
            if (response.ent_m) {
              if (response.ent_m.length > 0) {
                const usuario: Usuario = response.ent_m[0];

                if (usuario.pai == 59) {
                  this.getProvincias();
                }
                if(usuario.num_plan_adq <= 0){
                  Swal.fire({
                    title: "Error!",
                    text: "Este usuario no esta habilitado",
                    icon: "error",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "Aceptar",
                  });

                  this.registerForm.controls["ent_rel"].setValue("");
                   this.registerForm.controls["ent_rel_name"].setValue(
                     ""
                   );
                    this.registerForm.controls["nom_ent_rel"].setValue(
                      ""
                    );
                }
                if(usuario.num_plan_adq >= 1){
                  this.registerForm.controls["ent_rel"].setValue(usuario.id);
                  this.registerForm.controls["ent_rel_name"].setValue(
                    usuario.name
                  );

                  this.registerForm.controls["nom_ent_rel"].setValue(
                    usuario.nom_fis
                  );
                }
                
              } else {
                this.registerForm.controls["ent_rel_usr_web"].setErrors({
                  incorrect: true,
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

  changePais(id: number) {
    if (id == 59) {
      this.registerForm.controls["pro"].setValue(null);
      this.registerForm.controls["pro"].enable();
    } else {
      this.registerForm.controls["pro"].setValue(null);
      this.registerForm.controls["pro"].disable();
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

  hasError(controlName: string, errorName: string) {
    return this.registerForm.controls[controlName].hasError(errorName);
  }

  showErrors(errors: ErrorHandled[]) {
    let errorList: string = "";
    for (let index = 0; index < errors.length; index++) {
      const errorMessage = errors[index].message;
      if (errorMessage.includes("Se ha producido el error 3 - Error alta")) {
        errorList = "El nombre usuario ya está registrado en el sistema.";
        break;
      }
      errorList += errorMessage + "<br>";
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
