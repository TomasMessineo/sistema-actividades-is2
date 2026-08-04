package com.sportify.backend.dtos;

/**
 * Ocupación de una clase para el panel del administrador.
 * pagados: alumnos inscriptos que ya pagaron (están en la lista de asistencia).
 * reservadosSinPagar: alumnos con el lugar guardado por renovación que todavía
 * no pagaron el abono del mes (reservas PENDIENTES de la serie en ese mes).
 */
public class OcupacionClaseDTO {

    private int pagados;
    private int reservadosSinPagar;

    public OcupacionClaseDTO() {}

    public OcupacionClaseDTO(int pagados, int reservadosSinPagar) {
        this.pagados = pagados;
        this.reservadosSinPagar = reservadosSinPagar;
    }

    public int getPagados() { return pagados; }
    public void setPagados(int pagados) { this.pagados = pagados; }

    public int getReservadosSinPagar() { return reservadosSinPagar; }
    public void setReservadosSinPagar(int reservadosSinPagar) { this.reservadosSinPagar = reservadosSinPagar; }
}
