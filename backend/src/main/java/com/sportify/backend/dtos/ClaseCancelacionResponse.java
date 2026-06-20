package com.sportify.backend.dtos;

/**
 * Resultado de cancelar una o varias instancias (cancelación individual,
 * rango o "a partir de"). alumnosAcreditados es la cantidad de alumnos a los
 * que se les acreditó un crédito por la cancelación.
 */
public class ClaseCancelacionResponse {

    private int canceladas;
    private int totalEnRango;
    private int alumnosAcreditados;

    public ClaseCancelacionResponse() {}

    public ClaseCancelacionResponse(int canceladas, int totalEnRango, int alumnosAcreditados) {
        this.canceladas = canceladas;
        this.totalEnRango = totalEnRango;
        this.alumnosAcreditados = alumnosAcreditados;
    }

    public int getCanceladas() { return canceladas; }
    public void setCanceladas(int canceladas) { this.canceladas = canceladas; }

    public int getTotalEnRango() { return totalEnRango; }
    public void setTotalEnRango(int totalEnRango) { this.totalEnRango = totalEnRango; }

    public int getAlumnosAcreditados() { return alumnosAcreditados; }
    public void setAlumnosAcreditados(int alumnosAcreditados) { this.alumnosAcreditados = alumnosAcreditados; }
}
