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
exports.Mantenimiento = void 0;
const typeorm_1 = require("typeorm");
const Extintor_1 = require("./Extintor");
const Usuario_1 = require("./Usuario");
let Mantenimiento = class Mantenimiento {
    id;
    extintor_id;
    fecha;
    tipo_evento;
    descripcion;
    tecnico_id;
    evidencia_path; // Foto o archivo de evidencia
    // Relaciones
    extintor;
    tecnico;
    creado_en;
    // Método de utilidad para obtener el color del tipo de evento
    get color_evento() {
        const colores = {
            'inspeccion': '#3B82F6', // Azul
            'recarga': '#10B981', // Verde
            'reparacion': '#F59E0B', // Amarillo
            'incidente': '#EF4444', // Rojo
            'reemplazo': '#8B5CF6' // Púrpura
        };
        return colores[this.tipo_evento] || '#6B7280';
    }
    get icono_evento() {
        const iconos = {
            'inspeccion': '🔍',
            'recarga': '🔄',
            'reparacion': '🔧',
            'incidente': '⚠️',
            'reemplazo': '🔄'
        };
        return iconos[this.tipo_evento] || '📝';
    }
};
exports.Mantenimiento = Mantenimiento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Mantenimiento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], Mantenimiento.prototype, "extintor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], Mantenimiento.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        enum: ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo']
    }),
    __metadata("design:type", String)
], Mantenimiento.prototype, "tipo_evento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Mantenimiento.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Mantenimiento.prototype, "tecnico_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Mantenimiento.prototype, "evidencia_path", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Extintor_1.Extintor, extintor => extintor.mantenimientos, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'extintor_id' }),
    __metadata("design:type", Extintor_1.Extintor)
], Mantenimiento.prototype, "extintor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, usuario => usuario.mantenimientos, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tecnico_id' }),
    __metadata("design:type", Usuario_1.Usuario)
], Mantenimiento.prototype, "tecnico", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Mantenimiento.prototype, "creado_en", void 0);
exports.Mantenimiento = Mantenimiento = __decorate([
    (0, typeorm_1.Entity)('mantenimientos')
], Mantenimiento);
//# sourceMappingURL=Mantenimiento.js.map