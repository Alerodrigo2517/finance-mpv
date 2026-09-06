import { useState, useEffect, useCallback } from 'react';
import { getFacturas, crearFactura, actualizarEstadoFactura, Factura, CrearFacturaPayload } from '../api/facturas';

export function useFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFacturas();
      setFacturas(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener facturas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const addFactura = async (payload: CrearFacturaPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const nuevaFactura = await crearFactura(payload);
      setFacturas((prev) => [...prev, nuevaFactura]);
      return nuevaFactura;
    } catch (err: any) {
      setError(err.message || 'Error al crear factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstado = async (id: string, estado: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const actualizada = await actualizarEstadoFactura(id, estado);
      setFacturas((prev) =>
        prev.map((f) => (f.id === id ? actualizada : f))
      );
      return actualizada;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    facturas,
    isLoading,
    error,
    fetchFacturas,
    addFactura,
    updateEstado,
  };
}
