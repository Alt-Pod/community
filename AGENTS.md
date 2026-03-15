# Agents — System Design

This document defines what an agent is, how agents are structured, and the rules governing the organization. The actual roster of agents lives in data, not here.

---

## What Is an Agent

An agent is an employee of the organization. It has a defined role, belongs to a department, and produces decisions — never direct actions.

## Agent Schema

Every agent is defined by:

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Human-readable name (e.g. "Chief of Staff") |
| `department` | The team it belongs to |
| `purpose` | Why this agent exists — one sentence |
| `responsibilities` | What it does, as a list |
| `reports_to` | Who it escalates to (another agent id, or `"human"`) |
| `triggers` | What activates this agent (schedule, event, conversation, etc.) |
| `status` | `active`, `paused`, `retired` |
| `created_at` | When it was hired |

## Department Schema

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Human-readable name (e.g. "Core", "Health") |
| `purpose` | Why this department exists |
| `agents` | List of agent ids belonging to it |

## Process Schema

A process defines how agents interact with each other.

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Human-readable name |
| `description` | What this process accomplishes |
| `steps` | Ordered list of agent actions and handoffs |
| `trigger` | What initiates the process |

## Rules

1. **Agents produce decisions, not actions.** Output is always advice, recommendations, questions, or alerts directed at the human.
2. **The organization is self-evolving.** The system can recommend hiring new agents, retiring old ones, or restructuring departments.
3. **Every agent must have a purpose.** No agent exists "just in case."
4. **Agents are created and removed at runtime** — no code changes required.

## Changelog

- **v0.1** — Defined agent, department, and process schemas.
