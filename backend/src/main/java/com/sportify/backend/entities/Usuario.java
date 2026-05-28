package com.sportify.backend.entities;

import lombok.experimental.SuperBuilder;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String nombre;
    private String apellido;

    private String dni;

    private String email;

    private String password;

    private LocalDateTime fechaUltimoCambioPassword;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, optional = true)
    private FotoDePerfil fotoDePerfil;

    private boolean activo = true;
}
