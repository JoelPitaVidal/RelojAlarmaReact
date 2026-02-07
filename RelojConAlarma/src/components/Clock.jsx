import { useEffect, useMemo, useRef, useState } from "react";
import { useClock } from "../hooks/useClock";
import { formatDate } from "../utils/time";

function parseAlarmTime(value) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return { hours, minutes };
}

function getNextAlarmDate(time, now) {
  const parsedTime = parseAlarmTime(time);

  if (!parsedTime) {
    return null;
  }

  const nextAlarmDate = new Date(now);
  nextAlarmDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

  if (nextAlarmDate <= now) {
    nextAlarmDate.setDate(nextAlarmDate.getDate() + 1);
  }

  return nextAlarmDate;
}

export function Clock() {
  const currentDateTime = useClock();
  const [alarmInput, setAlarmInput] = useState("");
  const [alarmDate, setAlarmDate] = useState(null);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  const alarmLabel = useMemo(() => {
    if (!alarmDate) {
      return "Sin alarma";
    }

    return alarmDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [alarmDate]);

  function playBeep() {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }

    const context = audioContextRef.current;
    context.resume();

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.15;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  }

  function startAlarmSound() {
    if (alarmIntervalRef.current) {
      return;
    }

    playBeep();
    alarmIntervalRef.current = window.setInterval(playBeep, 700);
  }

  function stopAlarmSound() {
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }

  function handleSetAlarm() {
    const nextAlarmDate = getNextAlarmDate(alarmInput, new Date());

    if (!nextAlarmDate) {
      setErrorMessage("Selecciona una hora válida para la alarma.");
      return;
    }

    stopAlarmSound();
    setErrorMessage("");
    setAlarmTriggered(false);
    setAlarmDate(nextAlarmDate);
  }

  function handleClearAlarm() {
    stopAlarmSound();
    setAlarmDate(null);
    setAlarmInput("");
    setAlarmTriggered(false);
    setErrorMessage("");
  }

  useEffect(() => {
    if (!alarmDate || alarmTriggered) {
      return;
    }

    if (currentDateTime < alarmDate) {
      return;
    }

    setAlarmTriggered(true);
    startAlarmSound();
  }, [alarmDate, alarmTriggered, currentDateTime]);

  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  return (
    <section>
      <h3>{formatDate(currentDateTime)}</h3>
      <p>Alarma: {alarmLabel}</p>

      <label htmlFor="alarm-time">Selecciona una hora:</label>{" "}
      <input
        id="alarm-time"
        type="time"
        value={alarmInput}
        onChange={(event) => setAlarmInput(event.target.value)}
      />

      <button onClick={handleSetAlarm}>Activar alarma</button>{" "}
      <button onClick={handleClearAlarm}>Quitar alarma</button>{" "}
      {alarmTriggered && <button onClick={stopAlarmSound}>Detener sonido</button>}

      {errorMessage && <p>{errorMessage}</p>}
      {alarmTriggered && <p>⏰ ¡Hora de tu alarma!</p>}
    </section>
  );
}
