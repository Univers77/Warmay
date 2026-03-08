# Manual Smart Contracts - WARMAY Protocol

Este directorio contiene la bóveda descentralizada y segura que hace efectivos los pagos a las madres beneficiarias a través de tecnología blockchain.

## 🔗 Rol en la Arquitectura
Los Smart Contracts (utilizando Hardhat y Solidity) se encargan de:
1. **Custodiar Fondos:** El contrato `SubsidyVault.sol` almacena los tokens ERC20 que se otorgarán como subsidio.
2. **Control de Acceso (RBAC):** La bóveda solo aprueba transacciones llamadas por una entidad que posea el `EXECUTOR_ROLE`. Esta entidad es el nodo/red de consenso de **Chainlink CRE**.
3. **Protección Sybil:** Verifica on-chain que el `nullifier_hash` (generado por World ID) no haya sido usado anteriormente para asegurar que se cobre solo 1 bono por persona.
4. **Liquidación:** Realizar el envío (transfer) final de los tokens a la wallet elegida de forma imparable y transparente.

## ⚙️ Configuración Requerida
Crea el archivo `.env` para Hardhat con tu RPC y Private Key:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
PRIVATE_KEY=tu_llave_privada_para_despliegue
ETHERSCAN_API_KEY=para_verificacion_opcional
```

## 🚀 Despliegue en Testnet (Sepolia)
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Compila los contratos de Solidity:
   ```bash
   npx hardhat compile
   ```
3. Ejecuta el script de despliegue principal:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

## 🔄 Dependencias Clave de Integración
Al finalizar el script de despliegue, obtendrás:
- La dirección del token (`MockMOMToken`).
- La dirección del Vault (`SubsidyVault`).
**Crucial:** Deberás tomar esa dirección del Vault e inyectarla en la configuración de **Chainlink CRE** para que sepa exactamente a qué contrato mandar la Data EvM tras el consenso validado.
