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
@AllArgsConstructor
@NoArgsConstructor
public class Profesor extends Usuario{

    @JsonIgnore
    @OneToMany(mappedBy = "profesor")
    private List<Clase> clasesDictadas;

    @ManyToOne(optional = false)
    @JoinColumn(name = "actividad_id", nullable = false)
    private Actividad actividad;

}
