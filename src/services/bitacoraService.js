class BitacoraService {
  constructor() {
    this.bitacoras = JSON.parse(localStorage.getItem('bitacoras')) || [];
    this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  }

  // Bitácoras
  getBitacoras() {
    return this.bitacoras;
  }

  addBitacora(bitacora) {
    const newBitacora = {
      ...bitacora,
      id: Date.now(),
      fecha: new Date().toISOString()
    };
    this.bitacoras.push(newBitacora);
    localStorage.setItem('bitacoras', JSON.stringify(this.bitacoras));
    return newBitacora;
  }

  updateBitacora(id, bitacora) {
    const index = this.bitacoras.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bitacoras[index] = { ...bitacora, id };
      localStorage.setItem('bitacoras', JSON.stringify(this.bitacoras));
    }
  }

  deleteBitacora(id) {
    this.bitacoras = this.bitacoras.filter(b => b.id !== id);
    localStorage.setItem('bitacoras', JSON.stringify(this.bitacoras));
  }

  // Clientes
  getClientes() {
    return this.clientes;
  }

  addCliente(cliente) {
    const newCliente = {
      ...cliente,
      id: Date.now()
    };
    this.clientes.push(newCliente);
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
    return newCliente;
  }

  // Reportes
  getReporteMensual(mes, año) {
    const bitacoras = this.getBitacoras();
    return bitacoras.filter(b => {
      const fecha = new Date(b.fecha);
      return fecha.getMonth() === mes && fecha.getFullYear() === año;
    });
  }

  getFallosPorCliente(clienteId) {
    const bitacoras = this.getBitacoras();
    return bitacoras.filter(b => b.clienteId === clienteId && b.tipo === 'falla');
  }

  getEstadisticas() {
    const bitacoras = this.getBitacoras();
    const hoy = new Date();
    
    const esteMes = bitacoras.filter(b => {
      const fecha = new Date(b.fecha);
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;

    const esteAño = bitacoras.filter(b => {
      const fecha = new Date(b.fecha);
      return fecha.getFullYear() === hoy.getFullYear();
    }).length;

    return {
      total: bitacoras.length,
      esteMes,
      esteAño,
      instalaciones: bitacoras.filter(b => b.tipo === 'instalacion').length,
      mantenimientos: bitacoras.filter(b => b.tipo === 'mantenimiento').length,
      visitas: bitacoras.filter(b => b.tipo === 'visita').length,
      fallos: bitacoras.filter(b => b.tipo === 'falla').length
    };
  }
}

export default new BitacoraService();