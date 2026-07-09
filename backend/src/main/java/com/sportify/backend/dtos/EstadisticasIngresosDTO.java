package com.sportify.backend.dtos;

import java.util.List;

/**
 * Estadísticas de ingresos para el panel del administrador. Se calcula sobre los
 * pagos en estado COMPLETADO del año seleccionado.
 */
public class EstadisticasIngresosDTO {

    /** False cuando el período elegido no tiene ningún pago (escenario "sin datos"). */
    private boolean hayDatos;

    /**
     * True cuando el año elegido todavía no llegó (es posterior al actual). Sirve
     * para distinguir el mensaje de "sin datos": un año futuro "todavía no tiene
     * datos", mientras que uno pasado o el actual sin pagos "no tiene estadísticas".
     */
    private boolean anioEsFuturo;

    private int anio;
    private List<Integer> aniosDisponibles;

    /** Disciplina por la que se filtró (null = todas). */
    private String disciplina;

    /** Ingreso por disciplina del año (sin filtrar — sirve de comparación). */
    private List<DisciplinaDTO> porDisciplina;

    // KPIs del período
    private double ingresoTotal;
    private int cantidadPagos;
    private double ticketPromedio;
    private String mejorMesNombre;
    private double mejorMesMonto;

    // Dona: ingreso por tipo
    private double ingresoIndividual;
    private double ingresoAbono;

    // Detalle mensual (12 meses), por si luego se agrega una línea de evolución
    private List<MesDTO> porMes;

    /** Cantidad de inscripciones por disciplina del año (comparación; no se filtra). */
    private List<InscripcionesDisciplinaDTO> inscripcionesPorDisciplina;

    /** Asistencia real (vía check-in) por día de la semana, lunes a viernes. Respeta el filtro de disciplina. */
    private List<AsistenciaDiaDTO> asistenciaPorDia;

    public static class DisciplinaDTO {
        private String disciplina;
        private double total;

        public DisciplinaDTO() {}

        public DisciplinaDTO(String disciplina, double total) {
            this.disciplina = disciplina;
            this.total = total;
        }

        public String getDisciplina() { return disciplina; }
        public void setDisciplina(String disciplina) { this.disciplina = disciplina; }
        public double getTotal() { return total; }
        public void setTotal(double total) { this.total = total; }
    }

    public static class MesDTO {
        private int mes;
        private String nombre;
        private double individual;
        private double abono;
        private double total;

        public MesDTO() {}

        public MesDTO(int mes, String nombre, double individual, double abono, double total) {
            this.mes = mes;
            this.nombre = nombre;
            this.individual = individual;
            this.abono = abono;
            this.total = total;
        }

        public int getMes() { return mes; }
        public void setMes(int mes) { this.mes = mes; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public double getIndividual() { return individual; }
        public void setIndividual(double individual) { this.individual = individual; }
        public double getAbono() { return abono; }
        public void setAbono(double abono) { this.abono = abono; }
        public double getTotal() { return total; }
        public void setTotal(double total) { this.total = total; }
    }

    public static class InscripcionesDisciplinaDTO {
        private String disciplina;
        private int cantidad;

        public InscripcionesDisciplinaDTO() {}

        public InscripcionesDisciplinaDTO(String disciplina, int cantidad) {
            this.disciplina = disciplina;
            this.cantidad = cantidad;
        }

        public String getDisciplina() { return disciplina; }
        public void setDisciplina(String disciplina) { this.disciplina = disciplina; }
        public int getCantidad() { return cantidad; }
        public void setCantidad(int cantidad) { this.cantidad = cantidad; }
    }

    public static class AsistenciaDiaDTO {
        private String dia;
        private int asistieron;
        private int faltaron;
        private double porcentajeAsistencia;

        public AsistenciaDiaDTO() {}

        public AsistenciaDiaDTO(String dia, int asistieron, int faltaron, double porcentajeAsistencia) {
            this.dia = dia;
            this.asistieron = asistieron;
            this.faltaron = faltaron;
            this.porcentajeAsistencia = porcentajeAsistencia;
        }

        public String getDia() { return dia; }
        public void setDia(String dia) { this.dia = dia; }
        public int getAsistieron() { return asistieron; }
        public void setAsistieron(int asistieron) { this.asistieron = asistieron; }
        public int getFaltaron() { return faltaron; }
        public void setFaltaron(int faltaron) { this.faltaron = faltaron; }
        public double getPorcentajeAsistencia() { return porcentajeAsistencia; }
        public void setPorcentajeAsistencia(double porcentajeAsistencia) { this.porcentajeAsistencia = porcentajeAsistencia; }
    }

    public boolean isHayDatos() { return hayDatos; }
    public void setHayDatos(boolean hayDatos) { this.hayDatos = hayDatos; }

    public boolean isAnioEsFuturo() { return anioEsFuturo; }
    public void setAnioEsFuturo(boolean anioEsFuturo) { this.anioEsFuturo = anioEsFuturo; }

    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }

    public List<Integer> getAniosDisponibles() { return aniosDisponibles; }
    public void setAniosDisponibles(List<Integer> aniosDisponibles) { this.aniosDisponibles = aniosDisponibles; }

    public String getDisciplina() { return disciplina; }
    public void setDisciplina(String disciplina) { this.disciplina = disciplina; }

    public List<DisciplinaDTO> getPorDisciplina() { return porDisciplina; }
    public void setPorDisciplina(List<DisciplinaDTO> porDisciplina) { this.porDisciplina = porDisciplina; }

    public double getIngresoTotal() { return ingresoTotal; }
    public void setIngresoTotal(double ingresoTotal) { this.ingresoTotal = ingresoTotal; }

    public int getCantidadPagos() { return cantidadPagos; }
    public void setCantidadPagos(int cantidadPagos) { this.cantidadPagos = cantidadPagos; }

    public double getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(double ticketPromedio) { this.ticketPromedio = ticketPromedio; }

    public String getMejorMesNombre() { return mejorMesNombre; }
    public void setMejorMesNombre(String mejorMesNombre) { this.mejorMesNombre = mejorMesNombre; }

    public double getMejorMesMonto() { return mejorMesMonto; }
    public void setMejorMesMonto(double mejorMesMonto) { this.mejorMesMonto = mejorMesMonto; }

    public double getIngresoIndividual() { return ingresoIndividual; }
    public void setIngresoIndividual(double ingresoIndividual) { this.ingresoIndividual = ingresoIndividual; }

    public double getIngresoAbono() { return ingresoAbono; }
    public void setIngresoAbono(double ingresoAbono) { this.ingresoAbono = ingresoAbono; }

    public List<MesDTO> getPorMes() { return porMes; }
    public void setPorMes(List<MesDTO> porMes) { this.porMes = porMes; }

    public List<InscripcionesDisciplinaDTO> getInscripcionesPorDisciplina() { return inscripcionesPorDisciplina; }
    public void setInscripcionesPorDisciplina(List<InscripcionesDisciplinaDTO> inscripcionesPorDisciplina) { this.inscripcionesPorDisciplina = inscripcionesPorDisciplina; }

    public List<AsistenciaDiaDTO> getAsistenciaPorDia() { return asistenciaPorDia; }
    public void setAsistenciaPorDia(List<AsistenciaDiaDTO> asistenciaPorDia) { this.asistenciaPorDia = asistenciaPorDia; }
}
