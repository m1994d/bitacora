// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import bitacoraService from '../../services/bitacoraService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({});
  const [tipoData, setTipoData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Cargar estadísticas
    const stats = bitacoraService.getEstadisticas();
    setEstadisticas(stats);
    
    // Datos para gráfico de tipos
    const tipoData = [
      { name: 'Instalaciones', value: stats.instalaciones },
      { name: 'Mantenimientos', value: stats.mantenimientos },
      { name: 'Visitas Técnicas', value: stats.visitas },
      { name: 'Fallos', value: stats.fallos }
    ];
    setTipoData(tipoData);

    // Datos para gráfico mensual (basado en datos reales)
    const bitacoras = bitacoraService.getBitacoras();
    const monthlyData = getMonthlyData(bitacoras);
    setMonthlyData(monthlyData);
  };

  const getMonthlyData = (bitacoras) => {
    // Inicializar array con todos los meses
    const months = Array.from({ length: 12 }, (_, i) => ({
      mes: format(new Date(2023, i), 'MMM', { locale: es }),
      actividades: 0
    }));

    // Contar actividades por mes
    bitacoras.forEach(bitacora => {
      const fecha = new Date(bitacora.fecha);
      const mesIndex = fecha.getMonth();
      if (mesIndex >= 0 && mesIndex < 12) {
        months[mesIndex].actividades += 1;
      }
    });

    return months;
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      instalacion: 'Instalaciones',
      mantenimiento: 'Mantenimientos',
      visita: 'Visitas Técnicas',
      falla: 'Fallos'
    };
    return tipos[tipo] || tipo;
  };

  // Refrescar datos cuando se agreguen nuevas bitácoras
  const handleRefresh = () => {
    loadData();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <button 
          onClick={handleRefresh}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Actualizar Datos
        </button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Actividades
              </Typography>
              <Typography variant="h4">{estadisticas.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Este Mes
              </Typography>
              <Typography variant="h4">{estadisticas.esteMes || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Este Año
              </Typography>
              <Typography variant="h4">{estadisticas.esteAño || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Fallos
              </Typography>
              <Typography variant="h4">{estadisticas.fallos || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clientes
              </Typography>
              <Typography variant="h4">{bitacoraService.getClientes().length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Actividades por Mes - Más grande */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">
                Actividades por Mes
              </Typography>
              <Box sx={{ height: 500, width: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Actividades']}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="actividades" 
                      fill="#8884d8" 
                      name="Actividades" 
                      animationDuration={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Tipos de Actividades - Más grande */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">
                Tipos de Actividades
              </Typography>
              <Box sx={{ height: 400, width: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tipoData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {tipoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Actividades']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}