# WARMAY - Chainlink CRE Workflow

Este directorio contiene el oráculo y el flujo de trabajo (Workflow) de **Chainlink Custom Runtime Environment (CRE)** diseñado como capa de orquestación para el protocolo WARMAY.

## ¿Qué hace este Workflow?

Este Workflow de Chainlink es un **HTTP Webhook Trigger** que conecta la Web2 con Web3. Recibe la petición del usuario (vía el Backend) y actúa como un nodo coordinador ultra seguro:
1. **World ID Web2:** Llama a la API externa de Developer Worldcoin y valida la prueba biométrica.
2. **Sistema Público Externo:** Consulta al mock de MINSA/ESSALUD para validar si la madre tiene controles prenatales vigentes.
3. **IA Agent (Claude AI):** Le envía la data paramétrica a un LLM (Anthropic) para recibir una evaluación clínica definitiva de `APPROVE` o `REJECT`.
4. **On-Chain Check (Sepolia):** Ejecuta un RPC Call nativo al contrato inteligente en Ethereum (Sepolia Testnet) para verificar ataques anti-sybil (`isNullifierUsed`).
5. **Decisión y Ejecución:** Retorna el veredicto final.

## Preparación

### 1. Variables de entorno `.env` 

En la raíz `/warmay_cre/.env`, asegúrate de tener una Private Key válida de Sepolia (o usa una de prueba si corres en modo sin broadcast). El `.env` debe incluir tu RPC a la Testnet:

```env
CRE_ETH_PRIVATE_KEY=your_private_key
CRE_TARGET=staging-settings
```

### 2. Instalar dependencias 
*(Debido a las estrictas reglas de CRE SDK v1.1.4, se usa tsc para validar)*

```bash
cd main
npm install
npm run build
```

## Demostración y Simulación de CRE (Para Hackathon Evaluators)

Dado que las redes desplegadas públicas del CRE pueden tomar de 1 a 2 días en ser activadas por los administradores de Chainlink Labs, los requerimientos del Hackathon permiten simular el ambiente de red (DON) en base al CLI local que compila a WebAssembly.

Chainlink CRE te permite ejecutar e inyectar el Payload HTTP exacto que procesará:

### Cómo realizar la simulación (para el Video de Pitch):

Asegúrate de estar en el directorio de nivel superior `warmay_cre`, y ejecuta:

```bash
cre workflow simulate main --target staging-settings --http-payload '{"beneficiary":"0x9999999999999999999999999999999999999999", "rp_id":"app_27fe5301affa50a0abf058d1125bc7ea", "idkitResponse":{"nullifierHash":"0x0000000000000000000000000000000000000000000000000000000000000123"}}'
```

Al hacer esto, la terminal de comando mostrará en tiempo real cómo el Oráculo simulado transita por la validación:
 `Web2 API` -> `IA Agent` -> `Sepolia EVM RPC` -> `Webhook Output`

## Para Despliegue Real en Producción

Una vez aprobado tu acceso a la nube pública de desarrolladores:

```bash
cre workflow deploy main --target staging-settings
```
