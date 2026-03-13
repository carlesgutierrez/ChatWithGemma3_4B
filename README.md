# GEMA: Tu Asistente de Enfoque Artístico (Local & Privado)

Este proyecto es una herramienta diseñada para ayudar a creadores y artistas a mantenerse enfocados en sus proyectos creativos. Utiliza un modelo de lenguaje **Gemma 3 (4B)** de Google ejecutado localmente a través de **LMStudio**, lo que permite tener un asistente inteligente personalizado ("una GEM de Gemini") sin costes de tokens, de forma privada y sin depender de servidores externos.

## 🚀 Propósito del Proyecto

GEMA ha sido programada por **Carles Gutiérrez** en copilotaje con **Gemini 3** en el entorno **Antigravity**.

Su misión principal es:
- **Guiar a artistas:** Ofrecer consejos basados en mindfulness y coaching creativo.
- **Evitar distracciones:** Detectar cuando el usuario intenta evadirse hablando de redes sociales, series o películas, y redirigirlo amablemente hacia su trabajo artístico.
- **Ejemplo didáctico:** Mostrar cómo integrar un LLM local en una aplicación web sencilla (HTML/JS/CSS) de forma rápida y efectiva.

---

## 🛠️ Requisitos Previos

Para poner en marcha este proyecto, necesitas preparar tu entorno local siguiendo estos pasos:

1.  **Descargar LM Studio:** Es la herramienta de escritorio que permite cargar y servir modelos de IA localmente. Puedes bajarlo en [lmstudio.ai](https://lmstudio.ai/).
2.  **Descargar el Modelo:** Dentro de LM Studio, busca y descarga el modelo `Gemma 3 4B` (o una variante similar que soporte tu equipo).
3.  **Seleccionar el Modelo:** Ve a la sección de "Chat" (icono del invasor/robot) y selecciona el modelo para que se active en memoria.
4.  **Iniciar el Servidor Local:**
    - Dirígete a la sección de **Developer** (icono de consola `<>`).
    - Haz clic en **Start Server**.
    - Asegúrate de que el estado sea **"Running"** y que la dirección sea `http://127.0.0.1:1234`.

---

## 💻 Instalación y Uso

Una vez que LM Studio está sirviendo el modelo, sigue estos pasos para lanzar la interfaz web:

1.  **Clona o descarga** este repositorio en tu ordenador.
2.  **Configura el prompt (opcional):** El archivo `config.txt` contiene las instrucciones de personalidad de GEMA. Puedes editarlo para que se adapte mejor a tus necesidades.
3.  **Abre el terminal** en la carpeta del proyecto.
4.  **Lanza un servidor web local:** Puedes usar `npx serve` para previsualizar la web correctamente:
    ```bash
    npx serve
    ```
5.  **¡Interactúa!** Abre la dirección que te indique el terminal (normalmente `http://localhost:3000`) y empieza a chatear con GEMA.

---

## 🎨 Estética y Funcionalidad

La herramienta cuenta con una interfaz con estética **Cyberpunk/Gamer**:
- **Robot Animado:** Una animación central hecha en p5.js que reacciona cuando GEMA está pensando o hablando.
- **Historial de Chat:** Dividido en mensajes de usuario (izquierda) y respuestas del bot (derecha).
- **Personalidad GEMA:** Configurada para ser empática pero firme con tus objetivos creativos.

---

## 📄 Licencia

Desarrollado con fines didácticos por Carles Gutiérrez. Siente libre de usarlo, modificarlo y aprender de cómo conectar la IA local con la web.
