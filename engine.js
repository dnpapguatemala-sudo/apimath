// ==========================================
// 1. VARIABLES GLOBALES DE JUEGO
// ==========================================
let estrellasGanadas = 0; 
let perfilActual = null;
let ejercicioActual = null;
let puntosXP = 0;
let vidas = 3;
let respuestaSeleccionadaPeque = null; // Para el modo de 4 años

// Variables para el control de rachas, monedas e inventario
let retosCompletados = 0;
let monedasTotales = 0;
let misColecciones = [];

// Variables para el temporizador global de juego
let tiempoSegundosRestantes = 2400; // 40 minutos de partido
let tiempoBloqueado = false;
let controlTiempoIntervalo = null; // 👈 Declarada correctamente para evitar fallos


// ==========================================
// 2. CONTROL DE PERFILES Y FLUJO
// ==========================================
function seleccionarPerfil(perfil) {
    perfilActual = perfil;
    puntosXP = 0;
    vidas = 3;
    retosCompletados = 0; // Iniciar racha en limpio
    
    document.getElementById('puntos-xp').innerText = puntosXP;
    document.getElementById('corazones').innerText = "❤️❤️❤️";
    
    // 🌟 Cargar y actualizar interfaz de estrellas guardadas
    actualizarInterfazTesoros();
    
    // Resetear barra de progreso visualmente
    const barraProgreso = document.getElementById('barra-progreso-llenado');
    const textoProgreso = document.getElementById('texto-progreso');
    if (barraProgreso) barraProgreso.style.width = '0%';
    if (textoProgreso) textoProgreso.innerText = "Reto: 0 / 10";
    
    const areaTrabajo = document.getElementById('area-de-trabajo');
    if (perfil === 'niña_8') {
        areaTrabajo.classList.add('modo-zurdo');
    } else {
        areaTrabajo.classList.remove('modo-zurdo');
    }
    
    document.getElementById('pantalla-perfiles').classList.add('ocultar');
    document.getElementById('pantalla-juego').classList.remove('ocultar');
    
    // Iniciar el temporizador silencioso al elegir perfil
    iniciarTemporizadorJuego();
    cargarNuevoEjercicio();

    // 🪙 Mostrar las monedas actuales en la pantalla de la tienda
    const elementoMonedas = document.getElementById('monedas-tienda');
    if (elementoMonedas) elementoMonedas.innerText = monedasTotales;
}

function cargarNuevoEjercicio() {
    // Esconder letreros anteriores
    document.getElementById('feedback-visual').classList.add('ocultar');
    
    const inputRespuesta = document.getElementById('respuesta-usuario');
    const tarjetaK = document.getElementById('tarjeta-matematica');
    const bloqueConcreto = document.getElementById('bloque-concreto');
    const opcionesMultiples = document.getElementById('opciones-multiples');
    const btnSiguiente = document.getElementById('btn-siguiente');
    
    if (inputRespuesta) inputRespuesta.value = "";
    respuestaSeleccionadaPeque = null;
    
    let tipoOperacion = 'suma';
    let nivelDificultad = 1;
    
    // Configurar visibilidad según la edad
    if (perfilActual === 'chico_4') {
        if (tarjetaK) tarjetaK.classList.add('ocultar');                 // Escondemos tarjeta de texto
        if (bloqueConcreto) bloqueConcreto.classList.remove('ocultar');   // Mostramos manzanas
        if (opcionesMultiples) opcionesMultiples.classList.remove('ocultar'); // Mostramos botones grandes
        if (btnSiguiente) btnSiguiente.classList.add('ocultar');         // Avanza al hacer clic directo
        
        tipoOperacion = 'suma';
        nivelDificultad = 1; 
    } else {
        if (tarjetaK) tarjetaK.classList.remove('ocultar');
        if (bloqueConcreto) bloqueConcreto.classList.add('ocultar');
        if (opcionesMultiples) opcionesMultiples.classList.add('ocultar');
        if (btnSiguiente) btnSiguiente.classList.remove('ocultar');
        
        if (perfilActual === 'niña_8') {
            const operaciones = ['suma', 'resta', 'multiplicacion'];
            tipoOperacion = operationsRandom(operaciones);
            nivelDificultad = 2;
        } else if (perfilActual === 'chico_12') {
            const operaciones = ['suma', 'resta', 'multiplicacion', 'division'];
            tipoOperacion = operationsRandom(operaciones);
            nivelDificultad = 4;
        }
    }
    
    ejercicioActual = MathGameLogic.generarEjercicio(tipoOperacion, nivelDificultad);
    
    // Si es el de 4 años, pintamos manzanas en lugar de números abstractos
    if (perfilActual === 'chico_4') {
        pintarModoPreescolar(ejercicioActual.pregunta.num1, ejercicioActual.pregunta.num2, ejercicioActual.respuestaCorrecta);
    } else {
        document.getElementById('num1').innerText = ejercicioActual.pregunta.num1;
        document.getElementById('num2').innerText = ejercicioActual.pregunta.num2;
        document.getElementById('operador').innerText = ejercicioActual.pregunta.operador;
        if (inputRespuesta) inputRespuesta.focus();
    }
}

function operationsRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


// ==========================================
// 3. MODO PREESCOLAR (4 AÑOS)
// ==========================================
function pintarModoPreescolar(n1, n2, correcto) {
    const bloque = document.getElementById('bloque-concreto');
    let manzanas1 = "🍎".repeat(n1);
    let manzanas2 = "🍎".repeat(n2);
    
    bloque.innerHTML = `
        <div class="grupo-objetos">${manzanas1} <span style="font-size:1.5rem; color:#4364F7">(${n1})</span></div>
        <div style="font-size:2rem; color:#4364F7; font-weight:bold">+</div>
        <div class="grupo-objetos">${manzanas2} <span style="font-size:1.5rem; color:#4364F7">(${n2})</span></div>
    `;
    
    const contenedorOpciones = document.getElementById('opciones-multiples');
    contenedorOpciones.innerHTML = "";
    
    let opciones = [correcto, correcto + 1, correcto - 1].filter(n => n > 0);
    opciones.sort(() => Math.random() - 0.5);
    opciones = [...new Set(opciones)];
    
    opciones.forEach(opc => {
        const btn = document.createElement('button');
        btn.className = 'btn-opcion';
        btn.innerText = opc;
        btn.onclick = () => verificarRespuestaPreescolar(opc);
        contenedorOpciones.appendChild(btn);
    });
}

function verificarRespuestaPreescolar(valor) {
    respuestaSeleccionadaPeque = valor;
    procesarResultado(valor === ejercicioActual.respuestaCorrecta);
}

function verificarRespuesta() {
    const inputUser = document.getElementById('respuesta-usuario');
    if (!inputUser) return;
    const respuestaUsuario = parseInt(inputUser.value);
    if (isNaN(respuestaUsuario)) return;
    procesarResultado(respuestaUsuario === ejercicioActual.respuestaCorrecta);
}


// ==========================================
// 4. PROCESAMIENTO Y FEEDBACK DE RESULTADOS
// ==========================================
function procesarResultado(esCorrecto) {
    const feedback = document.getElementById('feedback-visual');
    const icono = document.getElementById('feedback-icono');
    const texto = document.getElementById('feedback-texto');
    const subtexto = document.getElementById('feedback-subtexto');
    
    const botAvatar = document.getElementById('pablobot-avatar');
    const botDialogo = document.getElementById('pablobot-dialogo');
    
    feedback.classList.remove('ocultar');
    
    if (esCorrecto) {
        reproducirSonido('acierto');
        puntosXP += 10;
        document.getElementById('puntos-xp').innerText = puntosXP;

        // 🪙 ¡Ganar 5 monedas por acierto!
        monedasTotales += 5;
        const elementoMonedas = document.getElementById('monedas-tienda');
        if (elementoMonedas) elementoMonedas.innerText = monedasTotales;

        // Aumentar contador de racha
        retosCompletados++;

        // Mover la barra de progreso
        const barraProgreso = document.getElementById('barra-progreso-llenado');
        const textoProgreso = document.getElementById('texto-progreso');
        if (barraProgreso) barraProgreso.style.width = (retosCompletados * 10) + '%';
        if (textoProgreso) textoProgreso.innerText = `Reto: ${retosCompletados} / 10`;

        icono.innerText = "✅";
        texto.innerText = "¡Excelente!";
        subtexto.innerText = "+10 XP";
        subtexto.style.color = "#2ECC71";

        botAvatar.innerText = "🚀✨";
        botAvatar.className = "pablobot-celebrando";
        botDialogo.innerText = "¡Sabía que podías hacerlo! Eres increíble.";

        // 🌟 Validar si llegó a la meta de los 10 retos y sumar estrella
        if (retosCompletados >= 10) {
            let estrellasAcumuladas = parseInt(localStorage.getItem('estrellas_apimath')) || 0;
            let monedasTesoros = parseInt(localStorage.getItem('monedas_tesoro_apimath')) || 0;

            estrellasAcumuladas++;
            let ganoMoneda = false;

            if (estrellasAcumuladas >= 10) {
                monedasTesoros += 1;
                estrellasAcumuladas = 0; 
                ganoMoneda = true;
            }

            localStorage.setItem('estrellas_apimath', estrellasAcumuladas);
            localStorage.setItem('monedas_tesoro_apimath', monedasTesoros);

            actualizarInterfazTesoros();

            setTimeout(() => {
                if (ganoMoneda) {
                    alert(`🎁 ¡INCREÍBLE! Completaste tus 10 estrellas. ¡El Cofre del Tesoro se ha abierto y has ganado 1 Moneda de Oro! 🪙📦`);
                } else {
                    alert(`🤖 ¡Felicidades! Completaste los 10 retos. ¡Has ganado tu estrella número ${estrellasAcumuladas}! ⭐`);
                }
                retosCompletados = 0; 
                volverAMenu();
            }, 500);
            return; 
        }
    } else {
        reproducirSonido('error');
        vidas--;
        actualizarVidasVisuales();
        
        icono.innerText = "❌";
        texto.innerText = "Casi cerca...";
        subtexto.innerText = `Era: ${ejercicioActual.respuestaCorrecta}`;
        subtexto.style.color = "#E74C3C";
        
        botAvatar.innerText = "🧐💡";
        botAvatar.className = "pablobot-pensando";
        botDialogo.innerText = "¡No pasa nada! El error nos ayuda a aprender. ¡Vamos por otra!";
    }
    
    // Temporizador para pasar al siguiente ejercicio o finalizar por vidas
    setTimeout(() => {
        if (vidas <= 0) {
            alert("¡Oh no! Te quedaste sin vidas. ¡A practicar de nuevo con APIMATH!");
            retosCompletados = 0;
            volverAMenu();
        } else {
            // Regresar a PabloBot a su estado normal
            botAvatar.innerText = "🤖";
            botAvatar.className = "pablobot-neutral";
            botDialogo.innerText = "¡Listo para el siguiente reto!";
            cargarNuevoEjercicio();
        }
    }, 2500); 
} 

function actualizarVidasVisuales() {
    const contenedor = document.getElementById('corazones');
    if (!contenedor) return;
    if (vidas === 3) contenedor.innerText = "❤️❤️❤️";
    if (vidas === 2) contenedor.innerText = "❤️❤️💔";
    if (vidas === 1) contenedor.innerText = "❤️💔💔";
    if (vidas <= 0) contenedor.innerText = "💔💔💔";
}

function volverAMenu() {
    document.getElementById('pantalla-juego').classList.add('ocultar');
    document.getElementById('pantalla-perfiles').classList.remove('ocultar');
}


// ==========================================
// 5. CONTROL DE TIEMPO (PARTIDO DE 40 MIN)
// ==========================================
function iniciarTemporizadorJuego() {
    if (controlTiempoIntervalo) clearInterval(controlTiempoIntervalo);
    if (tiempoBloqueado) {
        bloquearPorTiempoAgotado();
        return;
    }

    controlTiempoIntervalo = setInterval(() => {
        tiempoSegundosRestantes--;

        // Formatear tiempo en MM:SS y pintarlo en el marcador de partido
        const min = Math.floor(tiempoSegundosRestantes / 60);
        const seg = tiempoSegundosRestantes % 60;
        const elemTiempo = document.getElementById('tiempo-restante');
        if (elemTiempo) {
            elemTiempo.innerText = `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
        }

        if (tiempoSegundosRestantes === 1200) {
            const botDialogo = document.getElementById('pablobot-dialogo');
            if (botDialogo) {
                botDialogo.innerText = "🤖 ¡Llegamos al medio tiempo! Llevas 20 minutos jugando un gran partido matemático. ¡Vamos con todo por los 40 minutos! ⚽🔥";
            }
            const botAvatar = document.getElementById('pablobot-avatar');
            if (botAvatar) botAvatar.innerText = "🚀✨";
        }

        if (tiempoSegundosRestantes <= 0) {
            clearInterval(controlTiempoIntervalo);
            tiempoBloqueado = true;
            bloquearPorTiempoAgotado();
        }
    }, 1000);
}

function bloquearPorTiempoAgotado() {
    document.getElementById('pantalla-juego').classList.add('ocultar');
    document.getElementById('pantalla-tienda').classList.add('ocultar');
    document.getElementById('pantalla-victoria').classList.add('ocultar');
    document.getElementById('pantalla-perfiles').classList.remove('ocultar');
    
    alert("🤖 🔔 ¡PIIIII, PIIIII! ¡Silbatazo final de Pablobot! Completaste los 40 minutos del partido de hoy. ¡Qué tremendo partidazo matemático jugaste! Es hora de ir a descansar los ojos, tomar agua y estirar las piernas. ¡Mañana volvemos a la cancha! 🏆⚽");
}


// ==========================================
// 6. MOTOR DE AUDIO SINTETIZADO INTERNO
// ==========================================
function reproducirSonido(tipo) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tipo === 'acierto') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); 
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } 
    else if (tipo === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); 
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } 
    else if (tipo === 'compra') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); 
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.07); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }
}


// ==========================================
// 7. SISTEMA DE DIBUJO DE ESTRELLAS Y TESOROS
// ==========================================
function actualizarInterfazTesoros() {
    const estrellas = parseInt(localStorage.getItem('estrellas_apimath')) || 0;
    const monedas = parseInt(localStorage.getItem('monedas_tesoro_apimath')) || 0;

    const elementoEstrellas = document.getElementById('contador-estrellas-juego');
    if (elementoEstrellas) {
        elementoEstrellas.innerText = estrellas > 0 ? "⭐".repeat(estrellas) : "Ninguna";
    }

    const elementoCaja = document.getElementById('caja-tesoro');
    if (elementoCaja) {
        if (monedas > 0) {
            elementoCaja.innerHTML = `🎁 Cofre: <span id="monedas-tesoro" style="color: #F1C40F; font-weight: bold;">${monedas}</span> 🪙`;
        } else {
            elementoCaja.innerHTML = `📦 Cofre: <span id="monedas-tesoro">0</span> 🪙`;
        }
    }
}