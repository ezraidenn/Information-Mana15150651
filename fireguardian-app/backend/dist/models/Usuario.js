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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const Extintor_1 = require("./Extintor");
const Mantenimiento_1 = require("./Mantenimiento");
const Log_1 = require("./Log");
let Usuario = class Usuario {
    id;
    nombre;
    email;
    password;
    rol;
    activo;
    ultimo_acceso;
    extintores_responsable;
    mantenimientos;
    logs;
    creado_en;
    actualizado_en;
    // Método para ocultar password en JSON
    toJSON() {
        const { password, ...result } = this;
        return result;
    }
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true, nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        enum: ['admin', 'tecnico', 'consulta']
    }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Usuario.prototype, "ultimo_acceso", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Extintor_1.Extintor, extintor => extintor.responsable),
    __metadata("design:type", Array)
], Usuario.prototype, "extintores_responsable", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Mantenimiento_1.Mantenimiento, mantenimiento => mantenimiento.tecnico),
    __metadata("design:type", Array)
], Usuario.prototype, "mantenimientos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Log_1.Log, log => log.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "logs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Usuario.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Usuario.prototype, "actualizado_en", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)('usuarios')
], Usuario);
//# sourceMappingURL=Usuario.js.map