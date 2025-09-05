import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon, Description as ExcelIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bitacoraService from '../../services/bitacoraService';

export default function Reportes() {
  const [reporteTipo, setReporteTipo] = useState('mensual');
  const [mes, setMes] = useState(new Date().getMonth());
  const [año, setAño] = useState(new Date().getFullYear());
  const [clienteId, setClienteId] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = () => {
    const data = bitacoraService.getClientes();
    setClientes(data);
  };

  const generarReporte = () => {
    let data = [];
    
    if (reporteTipo === 'mensual') {
      data = bitacoraService.getReporteMensual(mes, año);
    } else if (reporteTipo === 'cliente') {
      data = bitacoraService.getFallosPorCliente(clienteId);
    }
    
    setReporteData(data);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reporteData.map(item => ({
      'Fecha': format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es }),
      'Tipo': getTipoLabel(item.tipo),
      'Cliente': clientes.find(c => c.id === item.clienteId)?.nombre || '',
      'Técnico': item.tecnico,
      'Descripción': item.descripcion
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_${reporteTipo}_${new Date().getTime()}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.text('Reporte de Bitácora', 14, 15);
    
    const data = reporteData.map(item => [
      format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es }),
      getTipoLabel(item.tipo),
      clientes.find(c => c.id === item.clienteId)?.nombre || '',
      item.tecnico,
      item.descripcion
    ]);
    
    doc.autoTable({
      head: [['Fecha', 'Tipo', 'Cliente', 'Técnico', 'Descripción']],
      body: data,
      startY: 25
    });
    
    doc.save(`reporte_${reporteTipo}_${new Date().getTime()}.pdf`);
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      instalacion: 'Instalación',
      mantenimiento: 'Mantenimiento',
      visita: 'Visita Técnica',
      falla: 'Falla'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reportes
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={reporteTipo}
                  onChange={(e) => setReporteTipo(e.target.value)}
                >
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="cliente">Por Cliente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {reporteTipo === 'mensual' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Mes</InputLabel>
                    <Select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i} value={i}>
                          {format(new Date(2023, i), 'MMMM', { locale: es })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Año"
                    type="number"
                    value={año}
                    onChange={(e) => setAño(e.target.value)}
                  />
                </Grid>
              </>
            )}

            {reporteTipo === 'cliente' && (
              <Grid item xs={12} sm={6} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={generarReporte}
                sx={{ height: '100%' }}
              >
                Generar Reporte
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reporteData.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<ExcelIcon />}
              onClick={exportarExcel}
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={exportarPDF}
            >
              Exportar PDF
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resultados del Reporte ({reporteData.length} registros)
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Técnico</TableCell>
                      <TableCell>Descripción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reporteData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{getTipoLabel(item.tipo)}</TableCell>
                        <TableCell>
                          {clientes.find(c => c.id === item.clienteId)?.nombre || ''}
                        </TableCell>
                        <TableCell>{item.tecnico}</TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}