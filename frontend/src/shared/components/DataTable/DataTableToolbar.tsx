import { useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ListItem from "@mui/material/ListItem";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { DataTableToolbarProps } from "./types";
import styles from "./DataTableToolbar.module.scss";

export function DataTableToolbar({
  totalCount,
  page,
  pageSize,
  searchValue,
  searchMode,
  onSearchChange,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  toolbarActions,
  exportFilename,
  rows,
  visibleColumns,
  selectable,
  selectedCount,
  allServerSelected,
  onSelectAllServer,
  onClearSelection,
  showSelectAllServerButton,
  selectedIds,
}: DataTableToolbarProps) {
  const searchId = useId();

  // Column visibility popover
  const [colAnchorEl, setColAnchorEl] = useState<HTMLButtonElement | null>(null);
  const colPopoverOpen = Boolean(colAnchorEl);

  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLButtonElement | null>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Export error notification
  const [exportError, setExportError] = useState<string | null>(null);

  const colButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  // Pagination display: "Mostrando X–Y de Z"
  const from = totalCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);
  const countLabel =
    totalCount === 0 ? "Sin resultados" : `Mostrando ${from}–${to} de ${totalCount}`;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Column visibility toggle
  const handleColumnToggle = (field: string, checked: boolean) => {
    onColumnVisibilityChange({ ...columnVisibility, [field]: checked });
  };

  // Column order — move up/down
  const moveColumn = (field: string, direction: "up" | "down") => {
    const idx = columnOrder.indexOf(field);
    if (idx === -1) return;
    const newOrder = [...columnOrder];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    onColumnOrderChange(newOrder);
  };

  // --- Export helpers ---

  /**
   * Prevents formula injection attacks (CSV/Excel injection).
   * If a value starts with a formula trigger character, prefix it with a
   * single quote so spreadsheet apps treat it as literal text.
   */
  function sanitizeCellValue(val: string): string {
    if (/^[=+\-@\t\r]/.test(val)) return `'${val}`;
    return val;
  }

  const buildExportData = (): { headers: string[]; data: string[][]; note?: string } => {
    const exportColumns = visibleColumns.filter((col) => col.field !== "__expand__");

    const headers = exportColumns.map((col) =>
      typeof col.headerName === "string" && col.headerName ? col.headerName : col.field,
    );

    // Determine which rows to export based on selection state
    let sourceRows = rows as Record<string, unknown>[];
    let note: string | undefined;

    if (selectedIds.length > 0 && !allServerSelected) {
      // Export only the selected rows
      const selectedSet = new Set(selectedIds);
      sourceRows = sourceRows.filter((row) => {
        const id = (row as { id?: string | number }).id;
        return id !== undefined && selectedSet.has(id);
      });
    } else if (allServerSelected) {
      // Cannot fetch server rows from the client — export visible rows with a note
      note =
        "Nota: exportación parcial - solo filas cargadas (se seleccionaron todas las filas del servidor)";
    }

    const data = sourceRows.map((row) =>
      exportColumns.map((col) => {
        const val = row[col.field];
        const raw = val != null ? String(val) : "";
        return sanitizeCellValue(raw);
      }),
    );

    return { headers, data, note };
  };

  const exportExcel = async () => {
    try {
      const ExcelJS = await import("exceljs");
      const { headers, data, note } = buildExportData();

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Datos");

      // Add header row with bold styling
      sheet.addRow(headers);
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.commit();

      // Add data rows; append note rows when a partial-export warning is present
      data.forEach((row) => sheet.addRow(row));
      if (note) {
        sheet.addRow([]);
        sheet.addRow([note]);
      }

      // Auto-fit column widths (capped at 60 chars)
      sheet.columns.forEach((col) => {
        let maxLen = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > maxLen) maxLen = len;
        });
        col.width = Math.min(maxLen + 2, 60);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportFilename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportAnchorEl(null);
    } catch {
      setExportError("No se pudo exportar el archivo Excel. Intente nuevamente.");
      setExportAnchorEl(null);
    }
  };

  const exportCsv = async () => {
    try {
      const { headers, data, note } = buildExportData();
      const rows_to_write = note ? [headers, ...data, [], [note]] : [headers, ...data];

      // RFC 4180 — quote cells that contain commas, double-quotes, or newlines
      const csv = rows_to_write
        .map((row) =>
          row
            .map((val) => {
              const s = val ?? "";
              return /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
            })
            .join(","),
        )
        .join("\n");

      // BOM prefix ensures Excel on Windows renders UTF-8 correctly
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportFilename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportAnchorEl(null);
    } catch {
      setExportError("No se pudo exportar el archivo CSV. Intente nuevamente.");
      setExportAnchorEl(null);
    }
  };

  const exportPdf = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");
      const { headers, data, note } = buildExportData();
      const doc = new jsPDF({ orientation: "landscape" });
      autoTable(doc, {
        head: [headers],
        body: note ? [...data, [note]] : data,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [11, 31, 58] }, // $primary-main
      });
      doc.save(`${exportFilename}.pdf`);
      setExportAnchorEl(null);
    } catch {
      setExportError("No se pudo exportar el archivo PDF. Intente nuevamente.");
      setExportAnchorEl(null);
    }
  };

  const searchPlaceholder = searchMode === "server" ? "Buscar en el servidor..." : "Buscar...";

  const selectionLabel = allServerSelected
    ? `Todas las ${totalCount} filas seleccionadas`
    : `${selectedCount} ${selectedCount === 1 ? "fila seleccionada" : "filas seleccionadas"}`;

  const hasSelection = selectable && (selectedCount > 0 || allServerSelected);

  return (
    <Box className={styles.root}>
      {/* Left: custom slot */}
      {toolbarActions && <Box className={styles.actions}>{toolbarActions}</Box>}

      {/* Selection chip + select-all-server button */}
      {hasSelection && (
        <Box className={styles.selectionSection}>
          <Chip
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            label={selectionLabel}
            onDelete={onClearSelection}
            size="small"
            color="primary"
            className={styles.selectionChip}
          />
          {showSelectAllServerButton && !allServerSelected && (
            <Button
              variant="text"
              size="small"
              className={styles.selectAllServerButton}
              onClick={onSelectAllServer}
            >
              {`Seleccionar las ${totalCount} filas (incluyendo las no visibles)`}
            </Button>
          )}
        </Box>
      )}

      {/* Spacer */}
      <Box className={styles.spacer} />

      {/* Counter */}
      <Typography variant="body2" className={styles.counter}>
        {countLabel}
      </Typography>

      {/* Search */}
      <TextField
        id={searchId}
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={handleSearchChange}
        className={styles.search}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Column visibility button */}
      <Tooltip title="Columnas">
        <IconButton
          ref={colButtonRef}
          size="small"
          onClick={() => setColAnchorEl(colButtonRef.current)}
          aria-label="Configurar columnas"
        >
          <ViewColumnIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={colPopoverOpen}
        anchorEl={colAnchorEl}
        onClose={() => setColAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box className={styles.colPopover}>
          <Typography variant="subtitle2" className={styles.colPopoverTitle}>
            Columnas visibles
          </Typography>
          {columnOrder.map((field, idx) => {
            const col = columns.find((c) => c.field === field);
            if (!col || field === "__expand__") return null;
            const isVisible = columnVisibility[field] !== false;
            return (
              <ListItem key={field} disablePadding className={styles.colRow}>
                <FormControlLabel
                  className={styles.colLabel}
                  control={
                    <Checkbox
                      size="small"
                      checked={isVisible}
                      onChange={(e) => handleColumnToggle(field, e.target.checked)}
                    />
                  }
                  label={col.headerName ?? field}
                />
                <Box className={styles.colOrderButtons}>
                  <IconButton
                    size="small"
                    disabled={idx === 0}
                    onClick={() => moveColumn(field, "up")}
                    aria-label={`Mover ${col.headerName ?? field} arriba`}
                  >
                    <ArrowUpwardIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={idx === columnOrder.length - 1}
                    onClick={() => moveColumn(field, "down")}
                    aria-label={`Mover ${col.headerName ?? field} abajo`}
                  >
                    <ArrowDownwardIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </ListItem>
            );
          })}
        </Box>
      </Popover>

      {/* Export button */}
      <Tooltip title="Exportar">
        <IconButton
          ref={exportButtonRef}
          size="small"
          onClick={() => setExportAnchorEl(exportButtonRef.current)}
          aria-label="Exportar datos"
        >
          <FileDownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        open={exportMenuOpen}
        anchorEl={exportAnchorEl}
        onClose={() => setExportAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={exportExcel}>Exportar como Excel (.xlsx)</MenuItem>
        <MenuItem onClick={exportCsv}>Exportar como CSV (.csv)</MenuItem>
        <MenuItem onClick={exportPdf}>Exportar como PDF (.pdf)</MenuItem>
      </Menu>

      <Snackbar
        open={exportError !== null}
        autoHideDuration={4000}
        onClose={() => setExportError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
