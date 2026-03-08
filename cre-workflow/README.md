# WARMAY - Chainlink Custom Runtime Environment (CRE)

Bienvenido a la integración de **Chainlink CRE** para el proyecto **WARMAY** (Gestación Segura Asistida por IA y Blockchain).

Este espacio de trabajo contiene la configuración del proyecto de Chainlink Custom Runtime Environment, el cual funge como la **capa de orquestación (Orquestador Base)** que evalúa off-chain los datos médicos y biométricos de las gestantes antes de interactuar con los contratos inteligentes en la blockchain.

## 🏗️ Arquitectura del Sistema

WARMAY se beneficia de Chainlink CRE para crear un flujo sin interrupciones (Webhook Off-Chain a Smart Contract On-Chain). El servicio se encarga de:

1. **Recibir** la solicitud desde el Backend de WARMAY.
2. **Consultar** a Worldcoin (World ID) vía API para garantizar prueba de humanidad (PoP).
3. **Extraer** los registros médicos del hospital regional (ESSALUD/MINSA).
4. **Evaluar** clínicamente con un Agente IA (Anthropic/Claude) si cumple las reglas de salud prenatal.
5. **Verificar** a nivel On-Chain en Sepolia que el beneficiario no intente un ataque Sybil.
6. **Autorizar** el subsidio y devolver los parámetros de éxito para la función `claim()`.

## 📁 Estructura del Directorio

```text
warmay_cre/
├── main/                   # Código base del workflow en TypeScript
│   ├── main.ts             # La lógica orquestadora e interacciones (API, IA, RPC)
│   ├── workflow.yaml       # Configuración para el motor Chainlink CRE
│   └── README.md           # Instrucciones detalladas de compilación
├── .env                    # Variables de entorno (Private Key y Target de despliegue)
├── project.yaml            # Configuración de los nodos RPC (Sepolia) y Targets
└── README.md               # Este archivo
```

## 🚀 Instalación y Simulación Local (Requerimiento del Hackathon)

Para cumplir con la validación **End-to-End** del proyecto, podemos simular la red completa de oráculos (DON) desde la terminal:

1. Configura tus claves en `.env` (Basado en `.env.example` o instrucciones).
2. Ve al directorio interno `main` e instala las dependencias:
   ```bash
   cd main
   npm install
   npm run build
   ```
3. Regresa a esta carpeta principal (`warmay_cre`) y simula una petición irrefutable (con payload de prueba) inyectada al nodo de Chainlink:
   ```bash
   cre workflow simulate main --target staging-settings --http-payload '{"beneficiary":"0x9999999999999999999999999999999999999999", "rp_id":"app_27fe5301affa50a0abf058d1125bc7ea", "idkitResponse":{"nullifierHash":"0x12345"}}'
   ```

El CLI procesará en tiempo real todos los triggers definidos (Web2 -> IA -> EVM) y retornará el resultado. Es el modelo perfecto para demostrar capacidades productivas inmediatas en el contexto de demostración.

## ☁️ Despliegue Público a futuro

Una vez obtenida la admisión del Wallet en los sistemas de Chainlink Labs para su capa productiva:

```bash
cre workflow deploy main --target staging-settings
```
Esto arrojará un Webhook HTTP (`CRE_WORKFLOW_TRIGGER_URL`) listo para integrarse permanentemente al `.env` del Backend.