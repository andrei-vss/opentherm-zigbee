// Zigbee2MQTT external converter for the OpenTherm Zigbee bridge (ESPHome firmware).
// Maps the pinned ESPHome endpoints to named, read-only values.
import * as exposes from "zigbee-herdsman-converters/lib/exposes";

const e = exposes.presets;
const ea = exposes.access;

// [endpoint, property, description, unit, decimals, diagnostic]
// Decimals follow the ESPHome OpenTherm schema; the OT version keeps one so 2.2 stays 2.2.
const NUMERIC = [
    [1, "chip_temperature", "ESP32 chip temperature", "°C", 1, true],
    [2, "flow_temperature", "Boiler flow water temperature", "°C", 2, false],
    [3, "return_temperature", "Return water temperature", "°C", 2, false],
    [4, "dhw_temperature", "Domestic hot water temperature", "°C", 2, false],
    [5, "outside_temperature", "Outside temperature", "°C", 2, false],
    [6, "exhaust_temperature", "Boiler exhaust temperature", "°C", 0, false],
    [7, "solar_storage_temperature", "Solar storage temperature", "°C", 2, false],
    [8, "solar_collector_temperature", "Solar collector temperature", "°C", 0, false],
    [9, "flow_temperature_ch2", "Flow water temperature, second heating circuit", "°C", 2, false],
    [10, "dhw2_temperature", "Second domestic hot water temperature", "°C", 2, false],
    [11, "modulation", "Relative modulation level", "%", 2, false],
    [12, "ch_pressure", "Water pressure in the heating circuit", "bar", 2, false],
    [13, "dhw_flow_rate", "Domestic hot water flow rate", "L/min", 2, false],
    [14, "fan_speed", "Boiler fan speed", "rpm", 0, false],
    [15, "fan_speed_setpoint", "Boiler fan speed setpoint", "rpm", 0, false],
    [16, "flame_current", "Boiler flame current", "µA", 0, false],
    [17, "burner_starts", "Number of burner starts", undefined, 0, false],
    [18, "ch_pump_starts", "Number of heating pump starts", undefined, 0, false],
    [19, "dhw_pump_starts", "Number of domestic hot water pump/valve starts", undefined, 0, false],
    [20, "dhw_burner_starts", "Number of burner starts in hot water mode", undefined, 0, false],
    [21, "burner_hours", "Burner operation hours", "h", 0, false],
    [22, "ch_pump_hours", "Heating pump operation hours", "h", 0, false],
    [23, "dhw_pump_hours", "Domestic hot water pump/valve operation hours", "h", 0, false],
    [24, "dhw_burner_hours", "Burner operation hours in hot water mode", "h", 0, false],
    [25, "dhw_setpoint", "Domestic hot water setpoint", "°C", 2, false],
    [26, "dhw_setpoint_max", "Upper bound of the hot water setpoint", "°C", 0, true],
    [27, "dhw_setpoint_min", "Lower bound of the hot water setpoint", "°C", 0, true],
    [28, "max_ch_setpoint", "Maximum allowed heating flow setpoint", "°C", 2, true],
    [29, "max_ch_setpoint_upper", "Upper bound of the maximum heating setpoint", "°C", 0, true],
    [30, "max_ch_setpoint_lower", "Lower bound of the maximum heating setpoint", "°C", 0, true],
    [31, "oem_fault_code", "Boiler manufacturer fault code", undefined, 0, true],
    [32, "oem_diagnostic_code", "Boiler manufacturer diagnostic code", undefined, 0, true],
    [33, "max_capacity", "Maximum boiler capacity", "kW", 0, true],
    [34, "min_modulation", "Minimum modulation level", "%", 0, true],
    [35, "opentherm_version", "OpenTherm version of the boiler", undefined, 1, true],
    [36, "device_type", "Boiler product type", undefined, 0, true],
    [37, "device_version", "Boiler product version", undefined, 0, true],
    [38, "device_id", "Boiler ID code", undefined, 0, true],
    [39, "otc_curve_max", "Upper bound of the heating curve ratio", undefined, 0, true],
    [40, "otc_curve_min", "Lower bound of the heating curve ratio", undefined, 0, true],
];

// [endpoint, property, description, diagnostic]
const BINARY = [
    [1, "fault", "Boiler reports a fault", false],
    [2, "ch_active", "Central heating active", false],
    [3, "dhw_active", "Domestic hot water active", false],
    [4, "flame", "Flame on", false],
    [5, "cooling_active", "Cooling active", false],
    [6, "ch2_active", "Second heating circuit active", false],
    [7, "diagnostic", "Diagnostic event", false],
    [8, "electricity_production", "Electricity production", false],
    [9, "dhw_present", "Boiler has domestic hot water", true],
    [10, "control_on_off", "Boiler control type is on/off", true],
    [11, "cooling_supported", "Cooling supported", true],
    [12, "dhw_storage_tank", "Hot water from a storage tank", true],
    [13, "pump_control_allowed", "Controller may control the pump", true],
    [14, "ch2_present", "Second heating circuit present", true],
    [15, "remote_water_filling", "Remote water filling", true],
    [16, "heat_mode", "Heating (on) or cooling (off) mode", true],
    [17, "dhw_setpoint_transfer", "Hot water setpoint transfer enabled", true],
    [18, "max_ch_setpoint_transfer", "Maximum heating setpoint transfer enabled", true],
    [19, "dhw_setpoint_rw", "Hot water setpoint is writable", true],
    [20, "max_ch_setpoint_rw", "Maximum heating setpoint is writable", true],
    [21, "service_request", "Service required", false],
    [22, "lockout_reset", "Lockout reset", false],
    [23, "low_water_pressure", "Low water pressure fault", false],
    [24, "flame_fault", "Flame fault", false],
    [25, "air_pressure_fault", "Air pressure fault", false],
    [26, "water_over_temperature", "Water over-temperature fault", false],
];

const numericByEndpoint = new Map(NUMERIC.map(([ep, name, , , decimals]) => [ep, {name, decimals}]));
const binaryByEndpoint = new Map(BINARY.map(([ep, name]) => [ep, name]));
const readTarget = new Map([
    ...NUMERIC.map(([ep, name]) => [name, {ep, cluster: "genAnalogInput"}]),
    ...BINARY.map(([ep, name]) => [name, {ep, cluster: "genBinaryInput"}]),
]);

const round = (value, decimals) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

const fzAnalog = {
    cluster: "genAnalogInput",
    type: ["attributeReport", "readResponse"],
    convert: (model, msg) => {
        const target = numericByEndpoint.get(msg.endpoint.ID);
        const value = msg.data.presentValue;
        if (!target || value === undefined) return;
        // ESPHome sends NaN while the boiler has not answered.
        return {[target.name]: Number.isFinite(value) ? round(value, target.decimals) : null};
    },
};

const fzBinary = {
    cluster: "genBinaryInput",
    type: ["attributeReport", "readResponse"],
    convert: (model, msg) => {
        const name = binaryByEndpoint.get(msg.endpoint.ID);
        const value = msg.data.presentValue;
        if (!name || value === undefined) return;
        return {[name]: Boolean(value)};
    },
};

const tzRead = {
    key: [...readTarget.keys()],
    convertGet: async (entity, key, meta) => {
        const target = readTarget.get(key);
        await meta.device.getEndpoint(target.ep).read(target.cluster, ["presentValue"]);
    },
};

const numericExposes = NUMERIC.map(([, name, description, unit, , diagnostic]) => {
    let expose = e.numeric(name, ea.STATE_GET).withDescription(description);
    if (unit) expose = expose.withUnit(unit);
    if (diagnostic) expose = expose.withCategory("diagnostic");
    return expose;
});

const binaryExposes = BINARY.map(([, name, description, diagnostic]) => {
    let expose = e.binary(name, ea.STATE_GET, true, false).withDescription(description);
    if (diagnostic) expose = expose.withCategory("diagnostic");
    return expose;
});

export default {
    zigbeeModel: ["opentherm-zigbee"],
    model: "opentherm-zigbee",
    vendor: "esphome",
    description: "OpenTherm to Zigbee bridge (ESPHome)",
    fromZigbee: [fzAnalog, fzBinary],
    toZigbee: [tzRead],
    exposes: [...numericExposes, ...binaryExposes],
};
