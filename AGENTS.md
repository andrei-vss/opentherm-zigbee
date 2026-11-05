# AGENTS.md

> Rules every **AI agent** (and every dev) follows when working in this repository — the hard lines,
> the "why", and the conventions. Overview in [README.md](README.md).

---
## How the agent works here

- **Do exactly what was asked, then stop.** No refactors, renames or "while I was there" cleanups
  without a yes first. "Look at X" means X only. Answer, then end — don't pitch the next piece of work.
- **The agent is an executor, nothing more.** It does what it is told. When in doubt, it says so and
  waits. It never decides on its own.
- **Don't decide alone.** Names, pins, endpoints, cluster choices, libraries, tools — put the options
  and their cost in front of whoever asked, and wait. Announcing a decision is not asking for it.
- **Don't invent numbers.** A setpoint limit, a timeout, a poll interval, a pin: it comes from the
  boiler's manual, the OpenTherm specification, a datasheet, measured data or the person asking.
  Never from judgement — say where a number came from in the same sentence you quote it.
- **Use the documentation of the exact part.** The boiler model, the board, the adapter — never a
  sibling model's manual, never a guess from a similar product.
- **Read every file you are pointed at, in full**, before designing against it.
- **Short answers.** Lead with the answer or the decision needed; one question at the end.
- **Hardware is never touched without an explicit yes.** No flashing, no opening a serial port, no
  installing toolchains, and never asking the user to wire anything to a boiler, without asking first.
- **Don't auto-run builds — ask first**; when you do, report the **real** output.
- No secrets or credentials committed. **Don't commit or push without an explicit ask.**
- **Never modify a `.md` file without showing the change in chat first and getting an explicit
  "yes".** Approved changes are written into the text as if they had always been there — no
  "update:", "now", "changed to".
- **Nobody writes anything into `CLAUDE.md`.** It points here and does nothing else.
- **Every task is sliced, however small.** After each slice, stop and remind the user to review it,
  commit it on its own and open a pull request for it.
- **Nothing reaches `main` except through a pull request.**
- Docs and code comments are written in English. Comments are two lines, maximum.

## 0. What this is

A Zigbee device built on an ESP32-C6 that acts as the OpenTherm master for any OpenTherm boiler and
exposes it to Zigbee2MQTT. The firmware knows the protocol, what a boiler supports is discovered at
runtime, and what an installation needs is set from Zigbee2MQTT. Boilers that have been tried are
listed in the README.

## 1. Boiler safety (hard lines)

- **Connected to a boiler, this device controls it.** OpenTherm has one master; the boiler obeys
  it. Nothing is connected to a real boiler without an explicit yes from the owner.
- **What the firmware does when it loses its controller** (Zigbee down, no setpoint for a while) is
  a decision made by the owner and written here once made — never a default picked in code.
- **Every boiler-facing limit has a source** — the boiler's manual, the OpenTherm specification, or
  the owner. A value that is not sourced does not ship.
