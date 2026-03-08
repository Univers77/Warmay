# Proyecto Warmay

## Descripción del Proyecto

Warmay es un sistema innovador diseñado para proporcionar subsidios prenatales, asegurando un apoyo crucial a las futuras madres. Este proyecto se distingue por su enfoque en la transparencia, la seguridad y la automatización, utilizando tecnologías blockchain y de inteligencia artificial para garantizar la elegibilidad y la distribución eficiente de los subsidios.

El nombre "Warmay" proviene del quechua, que significa "niño" o "niña", reflejando el propósito central del proyecto de proteger y apoyar a la infancia desde sus primeras etapas.

## Arquitectura y Stack Tecnológico

La arquitectura de Warmay se compone de tres módulos principales que interactúan para ofrecer una solución robusta y descentralizada:

1.  **Backend (Node.js/TypeScript)**: Actúa como el orquestador central, manejando las solicitudes de los usuarios, interactuando con los servicios externos y la blockchain.
2.  **Chainlink CRE Workflow**: Un flujo de automatización crucial para determinar la elegibilidad de los beneficiarios, integrando datos on-chain y off-chain.
3.  **Smart Contracts (Solidity)**: Gestionan la lógica de los subsidios y la emisión de tokens en la blockchain.

**Stack Tecnológico Clave:**

*   **Blockchain**: Ethereum (red de prueba Sepolia).
*   **Identidad Descentralizada**: World ID para la verificación de identidad humana.
*   **Orquestación y Automatización**: Chainlink Functions (anteriormente Chainlink External Adapters) y Chainlink Automation (anteriormente Chainlink Keepers) para el workflow de CRE.
*   **Inteligencia Artificial**: Integración con modelos de IA (Anthropic/Claude) para la evaluación de datos clínicos.
*   **Notificaciones**: Servicio de SMS para comunicación con los beneficiarios.
*   **Lenguajes**: TypeScript (Backend), Solidity (Smart Contracts).

## Workflow de Chainlink CRE

El corazón de la elegibilidad de Warmay reside en su workflow de Chainlink CRE (Chainlink Automation y Functions), que sigue los siguientes pasos:

1.  **Verificación de World ID**: Se verifica la identidad única del solicitante a través de World ID para asegurar que es un ser humano real y evitar fraudes.
2.  **Consulta de Datos Clínicos**: Se realiza una consulta a una API externa (simulada como "Hospital API") para obtener datos clínicos relevantes del solicitante.
3.  **Evaluación con IA**: Los datos clínicos son procesados por un modelo de IA (Anthropic/Claude) para evaluar la elegibilidad del solicitante basándose en criterios predefinidos.
4.  **Comprobación Anti-Sybil On-chain**: Antes de la aprobación final, se realiza una verificación en la blockchain para detectar posibles ataques Sybil y asegurar la unicidad del beneficiario.
5.  **Autorización de Reclamo**: Si todas las verificaciones son exitosas, el workflow autoriza el reclamo del subsidio en el Smart Contract `SubsidyVault`.

Este workflow garantiza que los subsidios lleguen a las personas adecuadas de manera segura y eficiente.

## Archivos Clave y Enlaces

A continuación, se listan los archivos más relevantes para cada componente del proyecto, especialmente aquellos que utilizan Chainlink o son fundamentales para el workflow de CRE:

### Backend

*   `backend/src/controllers/creController.ts`: Controlador principal para la interacción con el workflow de CRE.
*   `backend/src/controllers/worldIdController.ts`: Controlador para la verificación de World ID.
*   `backend/src/services/blockchainService.ts`: Servicio que interactúa con los Smart Contracts.
*   `backend/src/services/creService.ts`: Servicio que orquesta las llamadas al workflow de Chainlink CRE.
*   `backend/src/services/aiService.ts`: Servicio para la integración con la IA (Anthropic/Claude).
*   `backend/src/services/smsService.ts`: Servicio para el envío de notificaciones SMS.
*   `backend/src/contracts/mom_token.json`: ABI del token MOM.
*   `backend/src/contracts/subsidy_vault.json`: ABI de la bóveda de subsidios.

### Chainlink CRE Workflow

*   `cre-workflow/main/workflow.yaml`: Definición del workflow de automatización de Chainlink CRE.
*   `cre-workflow/main/main.ts`: Lógica principal del workflow de CRE, incluyendo las llamadas a World ID, API externa y IA.
*   `cre-workflow/project.yaml`: Archivo de configuración del proyecto CRE.
*   `cre-workflow/secrets.yaml`: Archivo para la gestión de secretos del workflow (ej. API keys).

### Smart Contracts

*   `contracts/contracts/MockMOMToken.sol`: Contrato del token MOM (ERC-20 de prueba).
*   `contracts/contracts/SubsidyVault.sol`: Contrato de la bóveda de subsidios, donde se gestionan los fondos y los reclamos.

## Simulación del Workflow CRE (CLI)

Para simular el workflow de Chainlink CRE, se puede utilizar la CLI de Chainlink. Los pasos detallados para la configuración y ejecución de la simulación se encuentran en el archivo `cre-workflow/main/README.md` y `cre-workflow/README.md`.

Se requiere configurar las variables de entorno necesarias (ej. `WORLD_ID_APP_ID`, `ANTHROPIC_API_KEY`, `HOSPITAL_API_URL`) y ejecutar los comandos de simulación provistos en la documentación de Chainlink CRE.

## Requisitos Mínimos de la Hackathon

Este repositorio cumple con los siguientes requisitos mínimos de la hackathon:

*   **Descripción del Proyecto**: Cubre el caso de uso y la arquitectura/stack.
*   **Video (Enlace Externo)**: Se proporcionará un enlace al video de 3-5 minutos que muestra el workflow en acción.
*   **Código Fuente Público**: Este repositorio será público en GitHub.
*   **README**: Incluye enlaces a todos los archivos que usan Chainlink.
*   **Workflow CRE**: Se ha construido un workflow CRE que integra blockchain con una API externa (Hospital API), un sistema de identidad (World ID) y un agente de IA (Anthropic/Claude), demostrando una simulación exitosa (vía CLI) o un despliegue en la red CRE.

---

**Nota**: Este README es una base. Se recomienda añadir diagramas de arquitectura visuales, instrucciones de instalación y despliegue más detalladas, y ejemplos de uso para cada componente.
