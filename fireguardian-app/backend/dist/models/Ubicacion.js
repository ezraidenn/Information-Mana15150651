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
exports.Ubicacion = void 0;
const typeorm_1 = require("typeorm");
const Sede_1 = require("./Sede");
const Extintor_1 = require("./Extintor");
let Ubicacion = class Ubicacion {
    id;
    nombre_area;
    descripcion;
    sede_id;
    sede;
    extintores;
    creado_en;
    actualizado_en;
};
exports.Ubicacion = Ubicacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ubicacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Ubicacion.prototype, "nombre_area", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ubicacion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], Ubicacion.prototype, "sede_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sede_1.Sede, sede => sede.ubicaciones, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sede_id' }),
    __metadata("design:type", Sede_1.Sede)
], Ubicacion.prototype, "sede", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Extintor_1.Extintor, extintor => extintor.ubicacion),
    __metadata("design:type", Array)
], Ubicacion.prototype, "extintores", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ubicacion.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ubicacion.prototype, "actualizado_en", void 0);
exports.Ubicacion = Ubicacion = __decorate([
    (0, typeorm_1.Entity)('ubicaciones')
], Ubicacion);
//# sourceMappingURL=Ubicacion.js.map