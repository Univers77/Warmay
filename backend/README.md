# WARMAY Backend

Este es el backend oficial para WARMAY, un protocolo descentralizado de salud materna en Bolivia. Actúa como un orquestador seguro entre el frontend, la validación biométrica de World ID, servicios externos (Twilio, DeepSeek AI) y el flujo de trabajo principal en la red descentralizada de Chainlink CRE y Smart Contracts.

## Stack Tecnológico

*   **Runtime:** Node.js >= 20
*   **Framework:** Express.js ^5.0.0
*   **Lenguaje:** TypeScript (con tipado estricto)
*   **Documentación:** Swagger UI (`swagger-ui-express`)
*   **Integraciones Clave:** 
    *   `ethers.js` v6 (Interacción con SubsidyVault en Sepolia)
    *   Chainlink CRE (Llamadas a Webhooks / HTTP Triggers y Simulación Local)
    *   World ID API v2 (Validación Zero-Knowledge en `/api/v2/verify`)
    *   DeepSeek AI (Asistente de Inteligencia Artificial para análisis de síntomas)
    *   Twilio SDK (Alertas SMS de emergencia)

## Estructura de Carpetas

```text
warmay_backend/
├── src/
│   ├── config/          # Variables de entorno (Zod) y def. Swagger
│   ├── controllers/     # Controladores para los Endpoints (incl. Mock CRE)
│   ├── routes/          # Enrutador principal de Express (API v1)
│   ├── services/        # Servicios (WorldId, CRE, Blockchain, AiService, SMS)
│   ├── store/           # Base de datos en memoria (Mocks de BD para demostración)
│   ├── types/           # Interfaces estrictas de TypeScript
│   └── index.ts         # Punto de entrada de la aplicación
├── .env.example         # Ejemplo de variables de entorno (proveedores reales)
├── package.json         # Dependencias y scripts
└── tsconfig.json        # Configuración del compilador TypeScript
```

## Configuración del Entorno

1.  **Clonar e Instalar:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd warmay_backend
    npm install
    ```

2.  **Configurar variables de entorno reales:**
    Copia el archivo `.env.example` a `.env` y rellena las variables de API keys reales para cada proveedor Web3 y Web2. Asegúrate de configurar la URL del Trigger local para las simulaciones de Chainlink CRE:
    ```bash
    cp .env.example .env
    ```
    *Nota:* El entorno requiere llaves para `DEEPSEEK_API_KEY`, contrato de Sepolia, World ID, etc.

## Scripts de Ejecución y Despliegue

*   **Modo Desarrollo (con auto-recarga):** `npm run dev`
*   **Compilar para Producción:** `npm run build`
*   **Modo Producción:** `npm run start` (Previamente requiere compilar)

Al iniciar, el servidor se desplegará en el puerto 3001 (por defecto) e indicará:
```text
🚀 WARMAY Backend running on port 3001
🌍 Environment: development
📖 Swagger API Docs: http://localhost:3001/api-docs
```

> **Swagger UI:** Con el servidor corriendo, visita la URL equivalente a `http://localhost:3001/api-docs` para visualizar e interactuar con la documentación oficial de la API de forma directa.

## Arquitectura de Endpoints (API v1)

El backend cuenta con **múltiples endpoints** bajo el prefijo `/api/v1/`:

1.  **`/world-id`**: Verificación de pruebas ZK on-server usando API de Worldcoin.
2.  **`/user`**: Perfil de la madre gestante y ubicación GPS.
3.  **`/controls`**: Validaciones prenatales delegadas a Chainlink CRE.
4.  **`/tokens`**: Balance e historial del *Warmay Token*.
5.  **`/trust-network`**: Administración de contactos de confianza.
6.  **`/blockchain`**: Consulta de transacciones en Sepolia.
7.  **`/cre`**: Triggers al *Chainlink Custom Compute Engine* y endpoint simulado de webhook de eventos (`/cre/simulate-webhook`).
8.  **`/claim`**: Reclamación de subsidios usando `SubsidyVault`.
9.  **`/emergency`**: Activación SOS y alertas usando *Twilio*.
10. **`/chat`**: Asistente virtual clínico interactivo impulsado por *DeepSeek AI*.

## Flujo de Validación Descentralizado (Simulación Hackathon)

Debido a que el acceso público al entorno Chainlink CRE Mainnet para nuevos desarrollos está en validación, el entorno integra un modo simulación para el Hackathon:
1. Autenticación Biométrica mediante la interfaz validada de World ID.
2. Validado el paciente, se procesa la llamada hacia el entorno simulado en `/cre/simulate-webhook`.
3. El webhook local emula con tiempo real el consenso de red (DON) y retorna éxito.
4. El Backend procesa el Payload y efectúa la inyección al ecosistema On-Chain hacia la testnet de Sepolia.

---
**Chainlink Block Magic Hackathon 2026**
