import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Box
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import bitacoraService from '../../services/bitacoraService';

export default function Bitacora() {
  const [bitacoras, setBitacoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBitacora, setEditingBitacora] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '',
    clienteId: '',
    descripcion: '',
    fecha: '',
    tecnico: '',
    observaciones: ''
  });

  useEffect(() => {
    loadBitacoras();
    loadClientes();
  }, []);

  const loadBitacoras = () => {
    const data = bitacoraService.getBitacoras();
    setBitacoras(data);
  };

  const loadClientes = () => {
    const data = bitacoraService.getClientes();
    setClientes(data);
  };

  const handleOpenDialog = (bitacora = null) => {
    if (bitacora) {
      setEditingBitacora(bitacora);
      setFormData({
        tipo: bitacora.tipo,
        clienteId: bitacora.clienteId,
        descripcion: bitacora.descripcion,
        fecha: bitacora.fecha,
        tecnico: bitacora.tecnico,
        observaciones: bitacora.observaciones || ''
      });
    } else {
      setEditingBitacora(null);
      setFormData({
        tipo: '',
        clienteId: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        tecnico: '',
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBitacora(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBitacora) {
      bitacoraService.updateBitacora(editingBitacora.id, formData);
    } else {
      bitacoraService.addBitacora(formData);
    }
    loadBitacoras();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta entrada?')) {
      bitacoraService.deleteBitacora(id);
      loadBitacoras();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Bitácora Técnica
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Entrada
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bitacoras.map((bitacora) => (
                  <TableRow key={bitacora.id}>
                    <TableCell>
                      {format(new Date(bitacora.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{getTipoLabel(bitacora.tipo)}</TableCell>
                    <TableCell>
                      {clientes.find(c => c.id === bitacora.clienteId)?.nombre || 'Cliente no encontrado'}
                    </TableCell>
                    <TableCell>{bitacora.tecnico}</TableCell>
                    <TableCell>{bitacora.descripcion}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(bitacora)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(bitacora.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBitacora ? 'Editar Entrada' : 'Nueva Entrada'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Actividad</InputLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="instalacion">Instalación</MenuItem>
                    <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                    <MenuItem value="visita">Visita Técnica</MenuItem>
                    <MenuItem value="falla">Falla</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="clienteId"
                    value={formData.clienteId}
                    onChange={handleChange}
                    required
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Técnico"
                  name="tecnico"
                  value={formData.tecnico}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}