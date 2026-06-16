package com.sportify.backend.dtos;

import java.util.List;

/**
 * Resultado de crear una serie: id de la plantilla y cuántas instancias se
 * generaron / fallaron (mismo criterio "best-effort" que tenía el front).
 */
public class ClaseSerieResponse {

    private Integer idPlantilla;
    private int creadas;
    private int fallidas;
    private List<String> errores;

    public ClaseSerieResponse() {}

    public ClaseSerieResponse(Integer idPlantilla, int creadas, int fallidas, List<String> errores) {
        this.idPlantilla = idPlantilla;
        this.creadas = creadas;
        this.fallidas = fallidas;
        this.errores = errores;
    }

    public Integer getIdPlantilla() { return idPlantilla; }
    public void setIdPlantilla(Integer idPlantilla) { this.idPlantilla = idPlantilla; }

    public int getCreadas() { return creadas; }
    public void setCreadas(int creadas) { this.creadas = creadas; }

    public int getFallidas() { return fallidas; }
    public void setFallidas(int fallidas) { this.fallidas = fallidas; }

    public List<String> getErrores() { return errores; }
    public void setErrores(List<String> errores) { this.errores = errores; }
}
