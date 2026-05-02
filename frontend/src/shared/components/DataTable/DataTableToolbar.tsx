import { useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
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
}: DataTableToolbarProps) {
  const searchId = useId();

  // Column visibility popover
  const [colAnchorEl, setColAnchorEl] = useState<HTMLButtonElement | null>(null);
  const colPopoverOpen = Boolean(colAnchorEl);

  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLButtonElement | null>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

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

  const buildExportData = (): { headers: string[]; data: string[][] } => {
    const headers = visibleColumns
      .filter((col) => col.field !== "__expand__")
      .map((col) =>
        typeof col.headerName === "string" && col.headerName ? col.headerName : col.field,
      );

    const data = (rows as Record<string, unknown>[]).map((row) =>
      visibleColumns
        .filter((col) => col.field !== "__expand__")
        .map((col) => {
          const val = row[col.field];
          return val != null ? String(val) : "";
        }),
    );

    return { headers, data };
  };

  const exportExcel = async () => {
    const { utils, writeFile } = await import("xlsx");
    const { headers, data } = buildExportData();
    const ws = utils.aoa_to_sheet([headers, ...data]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Datos");
    writeFile(wb, `${exportFilename}.xlsx`);
    setExportAnchorEl(null);
  };

  const exportCsv = async () => {
    const { utils, writeFile } = await import("xlsx");
    const { headers, data } = buildExportData();
    const ws = utils.aoa_to_sheet([headers, ...data]);
    writeFile(utils.book_new(), `${exportFilename}.csv`, { bookType: "csv" });
    // Use sheet_to_csv and download as blob for reliability
    const csv = utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchorEl(null);
  };

  const exportPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { autoTable } = await import("jspdf-autotable");
    const { headers, data } = buildExportData();
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [headers],
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [11, 31, 58] }, // $primary-main
    });
    doc.save(`${exportFilename}.pdf`);
    setExportAnchorEl(null);
  };

  const searchPlaceholder = searchMode === "server" ? "Buscar en el servidor..." : "Buscar...";

  return (
    <Box className={styles.root}>
      {/* Left: custom slot */}
      {toolbarActions && <Box className={styles.actions}>{toolbarActions}</Box>}

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
    </Box>
  );
}
