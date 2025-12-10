# Ejuem - Sistema de Gestión de Restaurante

Sistema completo de gestión de restaurante con React, Vite, TailwindCSS y Supabase.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Una cuenta de Supabase
- Git

## 🚀 Configuración

### 1. Instalar Node.js

Si no tienes Node.js instalado, descárgalo desde https://nodejs.org/

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos en Supabase

1. Ve a tu proyecto de Supabase: https://pkkmbugchvfbymbyetas.supabase.co
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `schema.sql`
4. Ejecuta el script

### 4. Configurar Autenticación en Supabase

1. Ve a **Authentication** > **Settings**
2. Habilita **Email Auth**
3. Desactiva "Confirm email" si quieres desarrollo rápido (opcional)

### 5. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 📚 Estructura del Proyecto

```
ejuem/
├── src/
│   ├── components/
│   │   └── admin/          # Componentes de administración
│   ├── contexts/           # Contextos de React (Auth)
│   ├── pages/              # Páginas principales
│   ├── services/           # Cliente de Supabase
│   ├── App.jsx             # Rutas principales
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── schema.sql              # Esquema de base de datos
└── package.json
```

## 🎯 Funcionalidades

### Para Clientes
- ✅ Ver menú público
- ✅ Agregar platos al carrito
- ✅ Realizar pedidos (para llevar, recoger, transporte)
- ✅ Ver estado de sus pedidos en tiempo real

### Para Meseros/Cocina
- ✅ Ver todos los pedidos
- ✅ Actualizar estado de pedidos
- ✅ Filtrar pedidos por estado

### Para Administradores
- ✅ Gestionar categorías
- ✅ Gestionar platos del menú
- ✅ Gestionar mesas
- ✅ Ver y administrar todos los pedidos
- ✅ Marcar platos como ofertas
- ✅ Activar/desactivar disponibilidad de platos

## 🔐 Roles de Usuario

Al registrarte, puedes elegir entre:
- **Cliente**: Ver menú y hacer pedidos
- **Mesero**: Gestionar pedidos
- **Admin**: Acceso completo al sistema

## 🛠️ Comandos Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de la build de producción
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework frontend
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework CSS
- **Supabase** - Backend (Base de datos + Auth)
- **React Router** - Navegación

## 📝 Notas

- La aplicación usa polling cada 5 segundos para actualizar pedidos en tiempo real
- Los pedidos se pueden filtrar por estado
- El carrito se maneja en el estado local (no se persiste)
"# anti" 
