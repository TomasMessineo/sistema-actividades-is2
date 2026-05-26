package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ClaseCalendarioDTO;
import com.sportify.backend.services.ClaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clases")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaseController {

    @Autowired
    private ClaseService claseService;

    @GetMapping
    public List<ClaseCalendarioDTO> listar(@RequestParam(value = "alumnoId", required = false) Integer alumnoId) {
        return claseService.listAvailableForAlumno(alumnoId).stream()
                .map(ClaseCalendarioDTO::fromEntity)
                .toList();
    }
}