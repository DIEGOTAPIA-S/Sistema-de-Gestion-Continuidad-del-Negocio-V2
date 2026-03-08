import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleTimer — Detecta inactividad del usuario y llama a una función de alerta/logout.
 *
 * Funciona detectando eventos del navegador: clicks, movimiento del mouse, teclado, scroll.
 * Si el usuario no hace nada en IDLE_MINUTES → muestra aviso con tiempo de cuenta regresiva.
 * Si en WARNING_MINUTES adicionales tampoco responde → ejecuta onLogout.
 *
 * @param {Function} onLogout - Función a ejecutar al vencer el tiempo
 * @param {Function} onWarning - Función a ejecutar para mostrar el aviso previo
 * @param {number} idleMinutes - Minutos de inactividad antes del aviso (default: 28)
 * @param {number} warningMinutes - Minutos del aviso antes del logout (default: 2)
 */
const useIdleTimer = ({ onLogout, onWarning, idleMinutes = 28, warningMinutes = 2 }) => {
    const idleTimerRef = useRef(null);
    const warningTimerRef = useRef(null);

    const resetTimer = useCallback(() => {
        // Limpiar temporizadores anteriores
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

        // Iniciar el temporizador de inactividad
        idleTimerRef.current = setTimeout(() => {
            // Después de idleMinutes sin actividad → mostrar aviso
            if (onWarning) onWarning();

            // Dar warningMinutes más antes de cerrar sesión
            warningTimerRef.current = setTimeout(() => {
                if (onLogout) onLogout();
            }, warningMinutes * 60 * 1000);

        }, idleMinutes * 60 * 1000);
    }, [onLogout, onWarning, idleMinutes, warningMinutes]);

    useEffect(() => {
        // Eventos que se consideran "actividad del usuario"
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Iniciar el temporizador al montar el componente
        resetTimer();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, [resetTimer]);
};

export default useIdleTimer;
