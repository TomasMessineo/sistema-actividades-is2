package com.sportify.backend.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "actividad_gen")
    @SequenceGenerator(name = "actividad_gen", sequenceName = "actividad_seq", allocationSize = 1)
    private Integer idActividad;

    private String tipo;

    private Double precio;

    // Baja lógica: false = disciplina eliminada, deja de poder elegirse pero se
    // conserva la fila para no romper las FK de Clase/ClasePlantilla/Pago que
    // ya la referencian (mismo patrón que Alumno.activo / Profesor.activo).
    @Column(nullable = false)
    private Boolean activa = true;

    @JsonIgnore
    @OneToMany(mappedBy = "actividad")
    private List<Clase> clases;

    @PrePersist
    public void prePersist() {
        if (this.activa == null) {
            this.activa = true;
        }
    }

}
