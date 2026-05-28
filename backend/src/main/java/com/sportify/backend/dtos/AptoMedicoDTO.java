package com.sportify.backend.dtos;

import com.sportify.backend.entities.AptoMedico;

import java.time.LocalDate;

public class AptoMedicoDTO {
    private int idAptoMedico;
    private LocalDate fechaDeVencimiento;
    private String url;

    public AptoMedicoDTO() {
    }

    public AptoMedicoDTO(int idAptoMedico, LocalDate fechaDeVencimiento, String url) {
        this.idAptoMedico = idAptoMedico;
        this.fechaDeVencimiento = fechaDeVencimiento;
        this.url = url;
    }

    public static AptoMedicoDTO fromEntity(AptoMedico aptoMedico) {
        return new AptoMedicoDTO(
                aptoMedico.getIdAptoMedico(),
                aptoMedico.getFechaDeVencimiento(),
                aptoMedico.getUrl()
        );
    }

    public int getIdAptoMedico() {
        return idAptoMedico;
    }

    public void setIdAptoMedico(int idAptoMedico) {
        this.idAptoMedico = idAptoMedico;
    }

    public LocalDate getFechaDeVencimiento() {
        return fechaDeVencimiento;
    }

    public void setFechaDeVencimiento(LocalDate fechaDeVencimiento) {
        this.fechaDeVencimiento = fechaDeVencimiento;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}