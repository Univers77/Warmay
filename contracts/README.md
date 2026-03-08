# WARMAY Protocol - Smart Contracts

Este proyecto contiene los contratos inteligentes para **WARMAY**, un protocolo descentralizado de salud materna en Bolivia. Utiliza Chainlink CRE como orquestador off-chain y World ID para la prevención de Sybil.

## Estructura del Proyecto

- `contracts/MockMOMToken.sol`: Token ERC20 "Maternal Health Token" (MOM) para los subsidios.
- `contracts/SubsidyVault.sol`: Bóveda principal que gestiona los pagos de subsidios.
- `scripts/deploy.ts`: Script de despliegue para Hardhat.
- `hardhat.config.ts`: Configuración de Hardhat para Ethereum Sepolia.

## Requisitos

- Node.js y npm
- Una clave de API de Alchemy o Infura para Sepolia.
- Una clave privada de una wallet con fondos en Sepolia (faucet).

## Instalación

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno:
   Copia el archivo `.env.example` a `.env` y completa los valores:
   ```bash
   cp .env.example .env
   ```

## Compilación

Para compilar los contratos:
```bash
npx hardhat compile
```

## Despliegue

Para desplegar en la red local de Hardhat:
```bash
npx hardhat run scripts/deploy.ts
```

Para desplegar en Ethereum Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Seguridad y Roles

El contrato `SubsidyVault` utiliza `AccessControl` de OpenZeppelin con los siguientes roles:

- **DEFAULT_ADMIN_ROLE**: Administrador del contrato.
- **EXECUTOR_ROLE**: Único rol autorizado para ejecutar pagos (Chainlink CRE).
- **FUNDER_ROLE**: Autorizado para depositar tokens MOM en la bóveda.
- **PAUSER_ROLE**: Autorizado para pausar el contrato en emergencias.

## Lógica de Subsidios

Los montos están predefinidos en el contrato:
- `PRENATAL`: 20 MOM
- `PARTO`: 50 MOM
- `POSTPARTO`: 30 MOM

El contrato garantiza que cada `nullifierHash` de World ID solo pueda cobrar un subsidio una vez.
