package com.sportify.backend.controllers;

import com.sportify.backend.dtos.InscripcionRequest;
import com.sportify.backend.dtos.InscripcionResponse;
import com.sportify.backend.services.InscripcionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inscripciones")
@CrossOrigin(origins = "http://localhost:5173")
public class InscripcionController {
    private final InscripcionService inscripcionService;
    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarInscripcion(@RequestBody InscripcionRequest request) {
        try{
            InscripcionResponse inscripcionResponse= inscripcionService.iniciarInscripcion(request);
            return ResponseEntity.ok(inscripcionResponse);
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("El backend responde");
    }
}