import { Component, OnInit } from "@angular/core";
import { Usuario } from "app/models/usuario";

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: "/dashboard", title: "Dashboard", icon: "dashboard", class: "" },
  { path: "/planes", title: "Planes", icon: "store", class: "" },
  { path: "/facturas", title: "Participación", icon: "assignment", class: "" },
  {
    path: "/table-list",
    title: "Estado Cuenta",
    icon: "content_paste",
    class: "",
  },
  // { path: "/icons", title: "Referidos", icon: "group_add", class: "" },
  {
    path: "/user-profile",
    title: "Perfil usuario",
    icon: "person",
    class: "active-pro",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  usr_name: string = "";

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    const usuario: Usuario = JSON.parse(localStorage.getItem("usr"));
    if (usuario && usuario.name) {
      this.usr_name = usuario.name;
    } else {
      this.usr_name = "Usuario desconocido";
    }
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
}
