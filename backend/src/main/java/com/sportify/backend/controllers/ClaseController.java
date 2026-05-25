package com.sportify.backend.controllers;

import com.sportify.backend.services.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ClaseController {

    @Autowired
    private PagoService pagoService;



}
