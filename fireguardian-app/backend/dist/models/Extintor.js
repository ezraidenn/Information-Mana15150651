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
exports.Extintor = void 0;
const typeorm_1 = require("typeorm");
const TipoExtintor_1 = require("./TipoExtintor");
const Ubicacion_1 = require("./Ubicacion");
const Usuario_1 = require("./Usuario");
const Mantenimiento_1 = require("./Mantenimiento");
let Extintor = class Extintor {
    id;
    codigo_interno; // Código físico/etiqueta opcional
    tipo_id;
    descripcion;
    ubicacion_id;
    responsable_id;
    fecha_vencimiento;
    fecha_mantenimiento; // Última revisión
    imagen_path;
    estado; // ACTIVO, MANTENIMIENTO, VENCIDO, BAJA
    // Relaciones
    tipo;
    ubicacion;
    responsable;
    mantenimientos;
    creado_en;
    actualizado_en;
    // Métodos de utilidad
    get dias_para_vencimiento() {
        const hoy = new Date();
        const vencimiento = new Date(this.fecha_vencimiento);
        const diferencia = vencimiento.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24));
    }
    get estado_vencimiento() {
        const dias = this.dias_para_vencimiento;
        if (dias < 0)
            return 'vencido';
        if (dias <= 30)
            return 'por_vencer';
        return 'vigente';
    }
    get requiere_mantenimiento() {
        if (!this.fecha_mantenimiento)
            return true;
        const hoy = new Date();
        const ultimoMantenimiento = new Date(this.fecha_mantenimiento);
        const diferencia = hoy.getTime() - ultimoMantenimiento.getTime();
        const diasSinMantenimiento = Math.ceil(diferencia / (1000 * 3600 * 24));
        return diasSinMantenimiento > 365; // Más de un año sin mantenimiento
    }
};
exports.Extintor = Extintor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Extintor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true, nullable: true }),
    __metadata("design:type", String)
], Extintor.prototype, "codigo_interno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Extintor.prototype, "tipo_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Extintor.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], Extintor.prototype, "ubicacion_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Extintor.prototype, "responsable_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], Extintor.prototype, "fecha_vencimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Extintor.prototype, "fecha_mantenimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Extintor.prototype, "imagen_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, default: 'ACTIVO' }),
    __metadata("design:type", String)
], Extintor.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoExtintor_1.TipoExtintor, tipo => tipo.extintores, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tipo_id' }),
    __metadata("design:type", TipoExtintor_1.TipoExtintor)
], Extintor.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Ubicacion_1.Ubicacion, ubicacion => ubicacion.extintores, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ubicacion_id' }),
    __metadata("design:type", Ubicacion_1.Ubicacion)
], Extintor.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, usuario => usuario.extintores_responsable, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'responsable_id' }),
    __metadata("design:type", Usuario_1.Usuario)
], Extintor.prototype, "responsable", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Mantenimiento_1.Mantenimiento, mantenimiento => mantenimiento.extintor),
    __metadata("design:type", Array)
], Extintor.prototype, "mantenimientos", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Extintor.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Extintor.prototype, "actualizado_en", void 0);
exports.Extintor = Extintor = __decorate([
    (0, typeorm_1.Entity)('extintores')
], Extintor);
//# sourceMappingURL=Extintor.js.map