package com.sportify.backend.controllers;

import com.sportify.backend.dtos.EstadisticasIngresosDTO;
import com.sportify.backend.services.EstadisticasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/estadisticas")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/ingresos")
    public ResponseEntity<EstadisticasIngresosDTO> ingresos(
            @RequestParam(value = "anio", required = false) Integer anio,
            @RequestParam(value = "disciplina", required = false) String disciplina) {
        return ResponseEntity.ok(estadisticasService.ingresos(anio, disciplina));
    }
}
