package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.services.ClaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/alumnos")
@CrossOrigin(origins = "http://localhost:5173")
public class AlumnoController {

    @Autowired
    private ClaseService claseService;

    @GetMapping("/{id}/clases")
    public List<ClaseCalendarioDTO> listarClasesDelAlumno(@PathVariable Integer id) {
        return claseService.listForAlumno(id).stream()
                .map(ClaseCalendarioDTO::fromEntity)
                .toList();
    }
}
