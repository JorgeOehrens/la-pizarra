# Integración con Wearables y Apps de Salud

> Obtener datos de rendimiento físico (frecuencia cardíaca, distancia, calorías, sueño) desde los relojes y apps de salud de los jugadores.

---

## Plataformas objetivo

### Apple Health / HealthKit (iOS)
- **API:** HealthKit (nativa iOS) + Health Records API
- **Acceso desde web:** No directo. Requiere app nativa iOS o shortcut de automatización.
- **Opción viable:** [Apple Health Export](https://support.apple.com/es-es/111808) (XML) + parser en LaPizarra, o app companion iOS que lee HealthKit y envía al backend.
- **Datos disponibles:** pasos, distancia caminada/corrida, FC activa/en reposo, calorías activas, HRV, sueño, workouts con GPS.

### Google Health Connect (Android)
- **API:** [Health Connect API](https://developer.android.com/health-and-fitness/guides/health-connect)
- **Acceso desde web:** Tampoco directo. Requiere app Android o PWA con permisos especiales.
- **Opción viable:** App companion Android → endpoint LaPizarra.
- **Datos disponibles:** pasos, distancia, FC, workouts, sueño, calorías.

### Garmin Connect
- **API:** [Garmin Health API](https://developer.garmin.com/health-api/overview/) (OAuth2, REST)
- **Acceso desde web:** Sí, OAuth2 desde servidor.
- **Requiere:** Garmin Developer account + aprobación del programa Health API.
- **Datos disponibles:** actividades con GPS, FC media/máx, carga de entrenamiento, EPOC, sueño.

### Fitbit / Google Fit (legacy)
- **API:** [Fitbit Web API](https://dev.fitbit.com/build/reference/web-api/) (OAuth2)
- **Acceso desde web:** Sí, OAuth2.
- **Nota:** Google Fit se depreca en favor de Health Connect. Fitbit mantiene su API.

---

## Datos más relevantes para fútbol amateur

| Métrica | Utilidad en LaPizarra | Fuente |
|---------|----------------------|--------|
| Frecuencia cardíaca media (partido) | Intensidad del partido | Apple Health, Garmin, Fitbit |
| FC máxima (partido) | Esfuerzo pico | Apple Health, Garmin |
| Distancia recorrida | Volumen físico | Garmin, Apple Watch (workout) |
| Calorías activas | Carga total | Todas |
| Tiempo activo / movimiento | Participación real | Apple Health, Health Connect |
| Sueño noche anterior | Recuperación | Apple Health, Garmin, Fitbit |
| HRV (variabilidad FC) | Estado de recuperación | Apple Health, Garmin |

---

## Arquitectura propuesta

```
Jugador (móvil)
  └─► App wearable (Apple Watch / Garmin / etc.)
        └─► Plataforma salud (HealthKit / Garmin Connect)
              └─► OAuth2 / Export
                    └─► LaPizarra API (endpoint /integrations/health)
                          └─► Tabla: player_health_metrics
                                └─► Cruzar con match_attendance (fecha/hora partido)
```

### Flujo OAuth (Garmin / Fitbit)
1. Jugador va a Perfil → Integraciones → "Conectar Garmin"
2. Redirect a OAuth del proveedor
3. Callback guarda `access_token` + `refresh_token` en tabla `player_integrations`
4. Job (cron o on-demand) importa métricas de la ventana temporal del partido
5. Stats del partido se enriquecen con datos físicos

### Flujo export manual (Apple Health)
1. Jugador exporta datos desde app Salud de iPhone (Settings → Export)
2. Sube el ZIP en LaPizarra
3. Parser en servidor extrae workouts del rango de fecha del partido
4. Alternativa futura: Shortcut de iOS que envía datos automáticamente al API

---

## Modelo de datos tentativo

```sql
-- Tabla de integraciones conectadas por jugador
CREATE TABLE player_integrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider      text NOT NULL,  -- 'garmin' | 'fitbit' | 'apple_export'
  access_token  text,
  refresh_token text,
  token_expires_at timestamptz,
  connected_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- Métricas de salud por partido
CREATE TABLE player_health_metrics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
  match_id        uuid REFERENCES matches(id) ON DELETE CASCADE,
  provider        text NOT NULL,
  heart_rate_avg  int,
  heart_rate_max  int,
  distance_meters int,
  calories_active int,
  active_minutes  int,
  hrv             numeric,
  raw_data        jsonb,  -- payload completo del proveedor
  imported_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, match_id, provider)
);
```

---

## Consideraciones de privacidad

- Los datos de salud son **datos sensibles** — requieren consentimiento explícito en onboarding de integración.
- Opciones de visibilidad: solo yo / capitán / todo el equipo.
- Nunca exponer tokens de terceros al cliente.
- Cumplir con políticas de uso de cada proveedor (Garmin y Fitbit tienen restricciones sobre compartir con terceros).

---

## Decisiones abiertas

- [ ] ¿Empezar con Garmin (OAuth directo desde web) o Apple Health (mayor adopción pero requiere app)?
- [ ] ¿Importación automática (cron post-partido) o manual (jugador dispara la importación)?
- [ ] ¿Mostrar métricas físicas en perfil del jugador o solo en detalle de partido?
- [ ] ¿Las métricas físicas afectan algún ranking/stat visible en equipo?

---

*Sección: Integraciones → Wearables y Salud*
