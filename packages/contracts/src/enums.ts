/*
 * Domain enums shared by the API and the web client. Declared as `as const`
 * arrays so the same value drives type-checking, API validation, and UI dropdowns.
 */

export const DRONE_MODELS = ['PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE'] as const;
export type DroneModel = (typeof DRONE_MODELS)[number];

export const DRONE_STATUSES = ['AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED'] as const;
export type DroneStatus = (typeof DRONE_STATUSES)[number];

export const MISSION_TYPES = [
  'WIND_TURBINE_INSPECTION',
  'SOLAR_PANEL_SURVEY',
  'POWER_LINE_PATROL',
] as const;
export type MissionType = (typeof MISSION_TYPES)[number];

export const MISSION_STATUSES = [
  'PLANNED',
  'PRE_FLIGHT_CHECK',
  'IN_PROGRESS',
  'COMPLETED',
  'ABORTED',
] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export const MAINTENANCE_TYPES = [
  'ROUTINE_CHECK',
  'BATTERY_REPLACEMENT',
  'MOTOR_REPAIR',
  'FIRMWARE_UPDATE',
  'FULL_OVERHAUL',
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];
