# Sistema de Cobros y Pagos - Documentación

## Descripción General

El sistema de cobros y pagos permite gestionar los presupuestos de tratamientos y llevar un registro detallado de los pagos realizados por cada paciente.

## Características

- **Crear Presupuestos**: Registrar nuevos tratamientos con su costo total
- **Seguimiento de Pagos**: Registrar cada pago realizado con fecha y método
- **Resumen Financiero**: Ver cuánto debe, cuánto pagó y cuánto le queda
- **Historial Completo**: Acceso al historial de todos los pagos realizados
- **Eliminar Registros**: Opción para eliminar presupuestos y pagos individuales

## Estructura de Base de Datos

### Tabla: `treatment_budget`
```sql
- id: Identificador único
- patient_id: ID del paciente (FK)
- treatment: Nombre del tratamiento
- total: Monto total del tratamiento
- pending: Monto pendiente de pago
- is_active: Estado del presupuesto (1 = activo, 0 = inactivo)
```

### Tabla: `payments`
```sql
- id: Identificador único
- treatment_budget_id: ID del presupuesto (FK)
- payment_date: Fecha del pago
- amount_paid: Monto pagado
- payment_method: Método de pago (Efectivo, Tarjeta, etc.)
```

## API Endpoints

### Presupuestos de Tratamiento

#### GET `/api/treatment-budgets/:patientId`
Obtiene todos los presupuestos de un paciente.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 123,
      "treatment": "Limpieza",
      "total": 150.00,
      "pending": 50.00,
      "is_active": 1,
      "total_paid": 100.00,
      "remaining": 50.00,
      "payments": [...]
    }
  ]
}
```

#### POST `/api/treatment-budgets/:patientId`
Crea un nuevo presupuesto.

**Body:**
```json
{
  "treatment": "Extracción",
  "total": 200.00
}
```

#### GET `/api/treatment-budgets/:patientId/:budgetId`
Obtiene un presupuesto específico con todos sus pagos.

#### PUT `/api/treatment-budgets/:patientId/:budgetId`
Actualiza un presupuesto existente.

#### DELETE `/api/treatment-budgets/:patientId/:budgetId`
Elimina un presupuesto y todos sus pagos asociados.

### Pagos

#### GET `/api/treatment-budgets/:patientId/:budgetId/payments`
Obtiene todos los pagos de un presupuesto.

#### POST `/api/treatment-budgets/:patientId/:budgetId/payments`
Crea un nuevo pago.

**Body:**
```json
{
  "amount_paid": 50.00,
  "payment_method": "Tarjeta de Crédito",
  "payment_date": "2025-02-06"
}
```

#### PUT `/api/treatment-budgets/:patientId/:budgetId/payments/:paymentId`
Actualiza un pago existente.

#### DELETE `/api/treatment-budgets/:patientId/:budgetId/payments/:paymentId`
Elimina un pago específico.

## Componentes Frontend

### PaymentSection.jsx
Componente React principal que maneja toda la interfaz de cobros y pagos.

**Props:**
- `patientId` (required): ID del paciente

**Características:**
- Formulario para crear nuevos presupuestos
- Tarjetas de presupuestos con resumen financiero
- Historial de pagos con tabla
- Formulario para agregar nuevos pagos
- Manejo de errores y validaciones

## Servicios Frontend

### treatmentBudgetService.js
Gestiona las peticiones API para presupuestos.

**Funciones disponibles:**
- `getTreatmentBudgets(patientId)` - Obtiene todos los presupuestos
- `getTreatmentBudget(patientId, budgetId)` - Obtiene un presupuesto
- `createTreatmentBudget(patientId, budgetData)` - Crea presupuesto
- `updateTreatmentBudget(patientId, budgetId, budgetData)` - Actualiza presupuesto
- `deleteTreatmentBudget(patientId, budgetId)` - Elimina presupuesto

### paymentsService.js
Gestiona las peticiones API para pagos.

**Funciones disponibles:**
- `getPayments(patientId, budgetId)` - Obtiene pagos
- `getPayment(patientId, budgetId, paymentId)` - Obtiene un pago
- `createPayment(patientId, budgetId, paymentData)` - Crea pago
- `updatePayment(patientId, budgetId, paymentId, paymentData)` - Actualiza pago
- `deletePayment(patientId, budgetId, paymentId)` - Elimina pago

## Integración en la Aplicación

### 1. Importar el componente
```jsx
import PaymentSection from '../components/PaymentSection';
```

### 2. Usarlo en tu página
```jsx
<PaymentSection patientId={patientId} />
```

### 3. Asegúrate de que exista el archivo de estilos
El archivo `src/styles/PaymentSection.css` debe estar presente.

## Validaciones Implementadas

- **Presupuestos**: Requieren tratamiento y monto total
- **Pagos**: 
  - Requieren monto, método y fecha
  - El monto total pagado no puede exceder el presupuesto
  - Se valida antes de crear o actualizar el pago
- **Autenticación**: Todos los endpoints requieren token JWT válido
- **Autorización**: Los usuarios solo pueden ver/modificar sus propios pacientes

## Métodos de Pago Disponibles

- Efectivo
- Tarjeta de Crédito
- Tarjeta de Débito
- Transferencia
- Cheque

## Tipos de Tratamiento Predefinidos

- Limpieza
- Extracción
- Empaste
- Endodoncia
- Corona
- Puente
- Implante
- Ortodoncia
- Blanqueamiento
- Otro

## Cálculos Automáticos

El sistema calcula automáticamente:
- **Total Pagado**: Suma de todos los pagos del presupuesto
- **Monto Pendiente**: Total del presupuesto menos total pagado
- **Monto Restante**: Muestra cuánto falta por pagar

## Notas de Implementación

- Los pagos se registran en orden cronológico (más recientes primero)
- Eliminar un presupuesto elimina automáticamente todos sus pagos (cascada)
- El campo `pending` se actualiza automáticamente con cada pago
- Todos los montos se redondean a 2 decimales
- Las fechas se formatean según la localización (es-AR para argentino)

## Ejemplos de Uso

### Crear un presupuesto
1. Click en "Crear Nuevo Cobro"
2. Seleccionar tratamiento del menú desplegable
3. Ingresar costo total
4. Click en "Crear"

### Agregar un pago
1. En la tarjeta del presupuesto, click en "+ Agregar Pago"
2. Ingresar monto, método y fecha
3. Click en "Agregar Pago"

### Ver resumen
- Debe: Monto total del tratamiento
- Pagó: Suma de todos los pagos realizados
- Le Queda: Monto pendiente de pago

## Solución de Problemas

### Los presupuestos no cargan
- Verificar que el usuario esté autenticado
- Verificar que el patientId sea correcto
- Revisar la consola del navegador para mensajes de error

### Errores al crear pagos
- Asegurarse de que el monto no exceda lo pendiente
- Verificar que todos los campos estén completos
- Revisar que la fecha sea válida

### Problemas de autenticación
- Verificar que el token JWT sea válido
- Comprobar que las variables de entorno estén configuradas
- Revisar que el usuario tenga permisos para el paciente
