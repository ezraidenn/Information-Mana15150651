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
exports.Log = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
let Log = class Log {
    id;
    usuario_id;
    accion;
    entidad;
    entidad_id;
    descripcion;
    ip_address;
    user_agent;
    // Relaciones
    usuario;
    timestamp;
    // Método de utilidad para obtener el color de la acción
    get color_accion() {
        const colores = {
            'crear': '#10B981', // Verde
            'editar': '#3B82F6', // Azul
            'eliminar': '#EF4444', // Rojo
            'login': '#8B5CF6', // Púrpura
            'logout': '#6B7280', // Gris
            'backup': '#F59E0B', // Amarillo
            'exportar': '#06B6D4' // Cian
        };
        return colores[this.accion] || '#6B7280';
    }
    get icono_accion() {
        const iconos = {
            'crear': '➕',
            'editar': '✏️',
            'eliminar': '🗑️',
            'login': '🔐',
            'logout': '🚪',
            'backup': '💾',
            'exportar': '📤'
        };
        return iconos[this.accion] || '📝';
    }
};
exports.Log = Log;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Log.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Log.prototype, "usuario_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        enum: ['crear', 'editar', 'eliminar', 'login', 'logout', 'backup', 'exportar']
    }),
    __metadata("design:type", String)
], Log.prototype, "accion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        enum: ['extintores', 'tipos_extintores', 'usuarios', 'ubicaciones', 'sedes', 'mantenimientos', 'sistema']
    }),
    __metadata("design:type", String)
], Log.prototype, "entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Log.prototype, "entidad_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, usuario => usuario.logs),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Usuario_1.Usuario)
], Log.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Log.prototype, "timestamp", void 0);
exports.Log = Log = __decorate([
    (0, typeorm_1.Entity)('logs')
], Log);
//# sourceMappingURL=Log.js.map