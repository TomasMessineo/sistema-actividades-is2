package com.sportify.backend.controllers;

import com.sportify.backend.dtos.ListaEsperaRequest;
import com.sportify.backend.dtos.ListaEsperaResponse;
import com.sportify.backend.services.ListaEsperaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lista-espera")
@CrossOrigin(origins = "http://localhost:5173")
public class ListaEsperaController {

    private final ListaEsperaService listaEsperaService;

    public ListaEsperaController(ListaEsperaService listaEsperaService) {
        this.listaEsperaService = listaEsperaService;
    }

    @PostMapping("/inscribir")
    public ResponseEntity<?> inscribir(@RequestBody ListaEsperaRequest request) {
        try {
            ListaEsperaResponse response = listaEsperaService.inscribir(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
