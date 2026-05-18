package com.sportify.backend.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import com.sportify.backend.entities.Pago;

@Service
public class MercadoPagoService {

    @Value("${mercadopago.token-acceso}")
    private String tokenAcceso;

    @Value("${mercadopago.clave-publica}")
    private String clavePublica;

    @Autowired
    private PagoService pagoService;

    public PagoResponse procesarPago(Pago pago, PagoRequest solicitud) {
        try {
            String idPreferencia = generarPreferenciaMercadoPago(pago, solicitud);
            String urlPago = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + idPreferencia;

            pagoService.actualizarEstadoPago(
                    pago.getIdPago(),
                    Pago.EstadoPago.PENDIENTE,
                    idPreferencia
            ); 

            return new PagoResponse(
                    pago.getIdPago(),
                    Pago.EstadoPago.PENDIENTE,
                    idPreferencia,
                    pago.getValor(),
                    "Abre Mercado Pago para completar el pago",
                    urlPago
            );

        } catch (Exception e) {
            pagoService.actualizarEstadoPago(
                    pago.getIdPago(),
                    Pago.EstadoPago.FALLIDO,
                    null
            );
            throw new RuntimeException("Error en Mercado Pago: " + e.getMessage());
        }
    }

    private String generarPreferenciaMercadoPago(Pago pago, PagoRequest solicitud) {
        return "PREF_" + UUID.randomUUID().toString();
    }

    public void verificarEstadoPago(String idPreferencia) {
        // Integración con API de Mercado Pago
    }
}