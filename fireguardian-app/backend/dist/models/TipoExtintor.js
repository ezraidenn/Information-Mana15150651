"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoExtintor = void 0;
const typeorm_1 = require("typeorm");
const Extintor_1 = require("./Extintor");
let TipoExtintor = class TipoExtintor {
    id; // ABC, CO2, H2O, etc.
    nombre;
    descripcion;
    uso_recomendado;
    color_hex; // Para visualización en tarjetas
    clase_fuego; // Clases de fuego aplicables (A, B, C, D, K)
    icono_path; // Rutas a los íconos de clases de fuego
    extintores;
    creado_en;
    actualizado_en;
};
exports.TipoExtintor = TipoExtintor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], TipoExtintor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], TipoExtintor.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TipoExtintor.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TipoExtintor.prototype, "uso_recomendado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TipoExtintor.prototype, "color_hex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], TipoExtintor.prototype, "clase_fuego", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], TipoExtintor.prototype, "icono_path", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Extintor_1.Extintor, extintor => extintor.tipo),
    __metadata("design:type", Array)
], TipoExtintor.prototype, "extintores", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TipoExtintor.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TipoExtintor.prototype, "actualizado_en", void 0);
exports.TipoExtintor = TipoExtintor = __decorate([
    (0, typeorm_1.Entity)('tipos_extintores')
], TipoExtintor);
//# sourceMappingURL=TipoExtintor.js.map