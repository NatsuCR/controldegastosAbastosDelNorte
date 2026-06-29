# Abastos del Norte

Aplicacion Expo/React Native para control local de ventas, compras, gastos,
inventario, IVA y reportes de un pequeno negocio.

## Requisitos

- Node.js compatible con Expo SDK 56.
- Android Studio o un telefono Android con depuracion USB.
- npm.

## Instalar dependencias

```bash
npm install
```

## Correr en desarrollo

```bash
npm run android
```

La app usa SQLite local mediante `expo-sqlite`; los datos quedan en el
dispositivo. No requiere backend ni internet para operar.

## Funcionalidades principales

- Productos genericos por categoria y marca.
- IVA configurable por producto.
- Montos en colones enteros, sin centimos.
- Ventas con efectivo o SINPE Movil.
- Celular obligatorio del cliente cuando la venta es por SINPE Movil.
- Compras a proveedor con entrada automatica de inventario.
- Gastos operativos separados de compras.
- Dashboard con resumen fiscal.
- Reportes por periodo y exportacion PDF.
- Historial de precios de venta y costo.

## Generar APK o AAB

Para builds finales se recomienda EAS Build:

```bash
npm install -g eas-cli
eas build -p android
```

Para un APK de prueba local con Android configurado:

```bash
npx expo run:android
```

## IVA

Al crear o editar productos, usar `IVA %`:

- `1` para productos de canasta basica cuando aplique.
- `13` para tarifa general.

Ver referencia interna en `docs/criterios-iva.md`.
