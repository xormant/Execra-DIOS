# Execra-DIOS

> database inspector / schema browser / data viewer

![Execra-DIOS banner](assets/execra-banner.svg)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Browser](https://img.shields.io/badge/runtime-browser-00C2FF?logo=google-chrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API)
[![CSV](https://img.shields.io/badge/export-CSV-34D399)](https://en.wikipedia.org/wiki/Comma-separated_values)
[![Theme](https://img.shields.io/badge/theme-dark%20%2F%20light-8B5CF6)](https://github.com/xormant/Execra-DIOS)

`status: online | schema ready | browser-driven`

Execra-DIOS is a lightweight browser interface for exploring database schema and table data from a structured in-memory payload. It surfaces tables, columns, values, filters, and export actions in a compact, readable view.

## Overview

Execra-DIOS is a compact database inspection interface built around a single in-memory payload. It renders tables, column metadata, and row-level data directly in the browser, with support for filtering, sorting, and CSV export.

The project reads `window.execraData`, displays the available tables and columns, and lets a user browse the data without a separate backend.

## Features

- Table overview with table counts and metadata
- Column inspection for schema details and null/key state
- Browser-style table view with row filtering
- Column-value breakdown with frequency counts
- CSV export for full table or focused column views
- Dark and light theme switching

## Interface flow

1. Load the page.
2. Provide `window.execraData`.
3. Render the table list.
4. Inspect columns or browse row data.
5. Filter, sort, and export as needed.

## Usage

The current implementation expects a browser page that loads `ex.js` and `ex.css`, then supplies structured data on `window.execraData`.

```html
<link rel="stylesheet" href="./ex.css" />
<script src="./ex.js"></script>

<script>
  window.execraData = {
    tables: [
      { name: "users", columnCount: 5 },
      { name: "orders", columnCount: 7 }
    ],
    columns: {
      users: [
        { name: "id", type: "INT", nullable: false, key: "PRIMARY" },
        { name: "email", type: "VARCHAR", nullable: false, key: "" }
      ]
    },
    tableData: {
      users: [
        { id: 1, email: "user@example.com" }
      ]
    },
    columnData: {
      users: {
        email: ["user@example.com", "admin@example.com"]
      }
    }
  };
</script>
```

This repository is the front-end presentation layer for the data payload; the JavaScript reads the structure and renders it into the UI automatically.

## Project structure

```text
Execra-DIOS/
├── ex.js
├── ex.css
├── README.md
├── assets/
│   └── execra-banner.svg
└── (other project files as needed)
```

- `ex.js` — UI logic, rendering, filters, sorting, and CSV export
- `ex.css` — styling and theme behavior
- `assets/execra-banner.svg` — local terminal-inspired banner for the project header

## Notes

The interface includes:

- dynamic table discovery from the payload
- schema browsing by table and column
- row browsing and dataset filtering
- export support to CSV
- theme switching for dark/light viewing modes

## License

This repository does not currently include a license file in the project root.

## Asset note

The banner asset is stored locally in `assets/execra-banner.svg` and is designed to match the repository's terminal/TUI aesthetic without introducing extra external dependencies.
