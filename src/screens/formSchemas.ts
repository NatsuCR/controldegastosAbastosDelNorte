import { z } from 'zod';

import { esPagoSinpe, esTelefonoClienteValido } from '../utils/telefono';

const montoEntero = z.number().int('Solo se permiten montos enteros en colones');

export const ventaSchema = z.object({
  productoId: z.number().int().positive('Selecciona un producto'),
  cantidad: z.number().positive('La cantidad debe ser mayor a cero'),
  metodoPago: z.enum(['Efectivo', 'SINPE Móvil']),
  clienteTelefono: z.string().optional(),
  nota: z.string().optional(),
}).superRefine((data, ctx) => {
  if (esPagoSinpe(data.metodoPago) && !esTelefonoClienteValido(data.clienteTelefono ?? '')) {
    ctx.addIssue({
      code: 'custom',
      message: 'El celular del cliente debe tener 8 digitos',
      path: ['clienteTelefono'],
    });
  }
});

export const compraSchema = z.object({
  proveedorId: z.number().int().positive('Selecciona un proveedor'),
  productoId: z.number().int().positive('Selecciona un producto'),
  cantidad: z.number().positive('La cantidad debe ser mayor a cero'),
  costoUnitario: montoEntero.positive('El costo debe ser mayor a cero'),
  metodoPago: z.enum(['Efectivo', 'SINPE Móvil']),
  actualizarCostoVigente: z.boolean(),
  nota: z.string().optional(),
  imagenFactura: z.string().optional(),
});

export const productoSchema = z.object({
  categoriaId: z.number().int().positive('Selecciona una categoria'),
  nombre: z.string().trim().min(2, 'El producto es obligatorio'),
  sku: z.string().optional(),
  marca: z.string().optional(),
  unidadMedida: z.string().trim().min(1, 'La unidad es obligatoria'),
  cantidadPorPresentacion: z.number().positive('La presentacion debe ser mayor a cero'),
  precioVentaActual: montoEntero.positive('El precio debe ser mayor a cero'),
  costoCompraActual: montoEntero.min(0, 'El costo no puede ser negativo'),
  stockInicial: z.number().min(0, 'La cantidad no puede ser negativa'),
  tasaIvaPorcentaje: z.number().min(0, 'El IVA no puede ser negativo').max(13, 'El IVA maximo es 13'),
  umbralStockBajo: z.number().min(0, 'El umbral no puede ser negativo'),
});

export const gastoSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa formato YYYY-MM-DD'),
  categoria: z.string().trim().min(2, 'La categoria es obligatoria'),
  descripcion: z.string().trim().min(2, 'La descripcion es obligatoria'),
  monto: montoEntero.positive('El monto debe ser mayor a cero'),
  nota: z.string().optional(),
  imagenFactura: z.string().optional(),
});

export type VentaForm = z.infer<typeof ventaSchema>;
export type CompraForm = z.infer<typeof compraSchema>;
export type ProductoForm = z.infer<typeof productoSchema>;
export type GastoForm = z.infer<typeof gastoSchema>;
