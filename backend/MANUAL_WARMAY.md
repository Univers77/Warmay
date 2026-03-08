# Manual Backend - WARMAY Protocol

El servidor Express (Node.js/Bun) funciona como el núcleo integrador entre Web2 (el Frontend local de la usuaria) y Web3 (Red de Chainlink CRE y los Smart Contracts).

## 🔗 Rol en la Arquitectura
El Backend se encarga de:
1. **Validación Segura:** Generar firmas dinámicas de Relying Party y validar los parámetros antes de que el frontend ejecute World ID.
2. **Orquestación:** Recibir el intento de reclamo junto a la prueba ZK de World ID y pasarlo como entrada validada al flujo de **Chainlink CRE**.
3. **Simulaciones Externas:** Contiene la lógica para simular (o en un futuro conectar) la API del Hospital (para validar consultas prenatales) que Chainlink leerá antes de liquidar el pago.

## ⚙️ Configuración Requerida
Crea un archivo `.env` en esta carpeta:
```env
PORT=3001
WORLD_APP_ID=app_xxxxxxxxxxxxxxxxxxxxx
WORLD_RP_ID=rp_xxxxxxxxxxxxxxxxxxxxxx
RP_SIGNING_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
```

## 🚀 Despliegue Local
1. Instala dependencias:
   ```bash
   npm install
   # o bun install
   ```
2. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   # o bun run src/index.ts
   ```
3. Verifica que la consola indique que corre de forma segura en `http://localhost:3001`.

## 🔄 Dependencias Clave de Integración
- **Rutas de la API:** 
  - `POST /api/v1/rp-signature`: Devuelve el contexto criptográfico al Front.
  - `POST /api/v1/claim`: Recibe el Proof y se comunica con Chainlink CRE.
- Cuando utilices la CLI de **Chainlink CRE**, este se encargará de consultar tu Backend (y a su vez a servicios de IA) y finalmente enviar la transacción a la blockchain.
