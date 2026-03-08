# Manual de Integración Frontend - WARMAY Backend

Este documento detalla cómo el frontend de WARMAY (basado en React) debe interactuar con los endpoints del backend. Todos los endpoints están prefijados con `/api/v1`.

## 1. Generación de Firma World ID

Este endpoint es utilizado para obtener una firma necesaria para la validación con World ID. El frontend debe llamar a este endpoint antes de iniciar el flujo de World ID.

*   **Método:** `POST`
*   **URL:** `/api/v1/worldid/rp-signature`
*   **Request Body:** `Ninguno`

*   **Ejemplo de Request (JavaScript/Fetch):**
    ```javascript
    fetch("/api/v1/worldid/rp-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log("Firma World ID:", data);
      // Usar 'data.sig', 'data.nonce', etc. para el SDK de World ID
    })
    .catch(error => console.error("Error al obtener firma World ID:", error));
    ```

*   **Ejemplo de Response:**
    ```json
    {
      "sig": "0x...",
      "nonce": "...",
      "created_at": "2023-10-27T10:00:00.000Z",
      "expires_at": "2023-10-27T11:00:00.000Z",
      "action": "warmay-claim"
    }
    ```

## 2. Inicio del Flujo de Subsidio (Chainlink CRE Proxy)

Después de que el usuario haya completado la verificación con World ID en el frontend, la respuesta de IDKit debe enviarse a este endpoint junto con la dirección de la billetera del beneficiario. El backend se encargará de preparar la inyección para Chainlink CRE.

*   **Método:** `POST`
*   **URL:** `/api/v1/claim`
*   **Request Body:**
    ```json
    {
      "beneficiary": "0xWalletAddress", // Dirección de la billetera del beneficiario
      "idkitResponse": { 
        // Objeto de respuesta completo de World ID
        // Ejemplo: { merkle_root: "0x...", nullifier_hash: "0x...", proof: "0x...", ... }
      }
    }
    ```

*   **Ejemplo de Request (JavaScript/Fetch):**
    ```javascript
    const beneficiaryAddress = "0x123...abc"; // Reemplazar con la dirección real
    const idkitVerificationResult = { /* ... resultado de la verificación de World ID ... */ };

    fetch("/api/v1/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        beneficiary: beneficiaryAddress,
        idkitResponse: idkitVerificationResult,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Flujo de subsidio iniciado:", data);
      // Mostrar confirmación al usuario
    })
    .catch(error => console.error("Error al iniciar flujo de subsidio:", error));
    ```

*   **Ejemplo de Response:**
    ```json
    {
      "status": "success",
      "cre_payload": {
        "rp_id": "rp_xxxxxxxxxxxxxxxxxxxxxx",
        "idkitResponse": { /* Objeto de respuesta completo de World ID */ },
        "beneficiary": "0xWalletAddress",
        "timestamp": "2023-10-27T10:00:00.000Z"
      }
    }
    ```

## 3. Botón de Pánico / Emergencia

Este endpoint debe ser llamado cuando el usuario activa el botón de pánico. El frontend debe recopilar la ubicación actual y los síntomas, así como una lista de contactos de emergencia.

*   **Método:** `POST`
*   **URL:** `/api/v1/emergency`
*   **Request Body:**
    ```json
    {
      "lat": 12.345,             // Latitud de la ubicación actual
      "lng": 67.890,             // Longitud de la ubicación actual
      "symptom": "Sangrado abundante", // Descripción del síntoma de emergencia
      "contacts": ["+59170012345", "+59170054321"] // Array de números de teléfono
    }
    ```

*   **Ejemplo de Request (JavaScript/Fetch):**
    ```javascript
    const emergencyData = {
      lat: 12.345,
      lng: 67.890,
      symptom: "Dolor abdominal severo",
      contacts: ["+591700112233", "+591700445566"]
    };

    fetch("/api/v1/emergency", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emergencyData),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Alerta de emergencia enviada:", data);
      // Mostrar estado de la alerta al usuario
    })
    .catch(error => console.error("Error al enviar alerta de emergencia:", error));
    ```

*   **Ejemplo de Response:**
    ```json
    {
      "alertId": "uuid-generado-aleatoriamente",
      "status": "dispatched",
      "estimatedResponseTime": "5 mins"
    }
    ```

## 4. Chat de Consejería IA

Este endpoint permite al frontend enviar mensajes de chat a un servicio de IA para obtener consejería. Es importante que el frontend maneje la respuesta, especialmente si se detecta un riesgo.

*   **Método:** `POST`
*   **URL:** `/api/v1/chat`
*   **Request Body:**
    ```json
    {
      "message": "Me siento un poco mal, tengo un leve sangrado.", // Mensaje del usuario
      "language": "es" // Opcional: "es" (Español), "qu" (Quechua) o "ay" (Aymara)
    }
    ```

*   **Ejemplo de Request (JavaScript/Fetch):**
    ```javascript
    const chatMessage = {
      message: "Tengo algunas dudas sobre mi embarazo.",
      language: "es"
    };

    fetch("/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatMessage),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Respuesta del chat IA:", data);
      if (data.riskDetected) {
        alert(data.response); // Mostrar alerta si hay riesgo
      }
      // Mostrar la respuesta del chat al usuario
    })
    .catch(error => console.error("Error en el chat IA:", error));
    ```

*   **Ejemplo de Response:**
    ```json
    {
      "response": "[Claude Mock] Entiendo tu mensaje: \"Tengo algunas dudas sobre mi embarazo.\". Todo parece estar bien, pero sigue monitoreando tus síntomas.",
      "riskDetected": false
    }
    ```
    O si se detecta riesgo:
    ```json
    {
      "response": "⚠️ Se ha detectado un síntoma de riesgo. Por favor, presiona el BOTÓN DE PÁNICO inmediatamente.",
      "riskDetected": true
    }
    ```

---

**Autor:** Manus AI
**Fecha:** 7 de marzo de 2026

## 5. Documentación de la API (Swagger UI)

Para explorar todos los endpoints disponibles, sus parámetros y modelos de respuesta de forma interactiva, puedes acceder a la interfaz de Swagger UI una vez que el backend esté corriendo.

*   **URL:** `http://localhost:3001/api-docs` (asumiendo que el backend corre en el puerto 3001)

Esta interfaz te permitirá probar los endpoints directamente desde el navegador.
