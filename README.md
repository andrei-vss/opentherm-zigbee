# OpenTherm Zigbee Bridge

> 🚧 **Work in progress** — not tested on a real boiler yet. Do not use it to control your heating.

A small Zigbee device that talks OpenTherm to a boiler and exposes it to Home Assistant through
Zigbee2MQTT: read the boiler's flow and return temperatures, modulation, flame and status, and set
the central heating flow temperature from your own automations.

---

## Features

- OpenTherm master on one side, Zigbee router on the other
- Reads flow, return and domestic hot water temperatures, modulation level, flame, CH/DHW activity and fault
- Writable central heating flow setpoint
- Zigbee2MQTT external converter included

## Hardware

- ESP32-C6 development board (built on a nanoESP32-C6, ESP32-C6-N4)
- [OpenTherm Adapter](http://ihormelnyk.com/opentherm_adapter) by Ihor Melnyk
- Shielded twisted-pair cable from the adapter to the boiler's OpenTherm terminals

## Motivation

Most OpenTherm bridges for Home Assistant run over Wi-Fi. This one lives on the Zigbee network, 
and lets a heating controller set the boiler's flow temperature instead of only switching it on and off.

## Credits

The OpenTherm adapter - the work of [Ihor Melnyk](http://ihormelnyk.com/opentherm_adapter). 
## Compliance & Contributions

- Minimal time is invested in its development.
- Suggestions and improvements are welcome! Feel free to fork or submit a pull request.
