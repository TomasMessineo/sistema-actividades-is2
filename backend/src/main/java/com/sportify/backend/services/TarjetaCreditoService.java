package com.sportify.backend.services;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import com.sportify.backend.entities.Pago;

@Service
public class TarjetaCreditoService {

    // Números de tarjeta que existen (no inexistentes)
    private static final Set<String> NUMEROS_VALIDOS = Set.of(
        "4000000000000119",
        "4242424242424242",
        "4111111111111111",
        "4000000000000002"
    );

    // Clave: "numero|MM/AA|cvv"  →  escenario
    private static final Map<String, String> TARJETAS_ESCENARIO = Map.of(
        "4000000000000119|09/29|789", "ERROR_CONEXION",
        "4242424242424242|06/31|000", "CVV_INCORRECTO",
        "4242424242424242|04/24|123", "VENCIDA",
        "1234567890123456|07/30|258", "INEXISTENTE",
        "4111111111111111|08/28|647", "EXITOSO",
        "4000000000000002|06/27|321", "FONDOS",
        "4111111111111111|11/28|111", "EXITOSO",
        "4111111111111111|10/28|222", "EXITOSO"
    );

    @Autowired
    private PagoService pagoService;

    public PagoResponse procesarPago(Pago pago, PagoRequest solicitud) {
        try {
            String idTransaccion = procesarConEscenario(solicitud);
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.COMPLETADO, idTransaccion);
            return new PagoResponse(
                    pago.getIdPago(),
                    Pago.EstadoPago.COMPLETADO,
                    idTransaccion,
                    pago.getValor(),
                    "Pago con tarjeta procesado correctamente",
                    null);
        } catch (Exception e) {
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.FALLIDO, null);
            throw new RuntimeException(e.getMessage());
        }
    }

    private String procesarConEscenario(PagoRequest solicitud) {
        String numero = solicitud.getNumeroTarjeta() == null ? "" : solicitud.getNumeroTarjeta().replaceAll("\\s+", "");
        String fecha  = solicitud.getFechaVencimiento() == null ? "" : solicitud.getFechaVencimiento().trim();
        String cvv    = solicitud.getCvv() == null ? "" : solicitud.getCvv().trim();

        String clave = numero + "|" + fecha + "|" + cvv;
        String escenario = TARJETAS_ESCENARIO.get(clave);

        if (escenario == null) {
            if (!NUMEROS_VALIDOS.contains(numero)) {
                escenario = "INEXISTENTE";
            } else if (esFechaVencida(fecha)) {
                escenario = "VENCIDA";
            } else {
                escenario = "CVV_INCORRECTO";
            }
        }

        if (escenario.equals("ERROR_CONEXION")) throw new RuntimeException("Conexión no establecida");
        if (escenario.equals("CVV_INCORRECTO")) throw new RuntimeException("CVV inválido");
        if (escenario.equals("VENCIDA"))        throw new RuntimeException("Tarjeta de crédito vencida");
        if (escenario.equals("INEXISTENTE"))    throw new RuntimeException("Número de tarjeta inexistente");
        if (escenario.equals("FONDOS"))         throw new RuntimeException("Fondos insuficientes");

        return "TARJETA_" + UUID.randomUUID().toString();
    }

    private boolean esFechaVencida(String fecha) {
        try {
            int mes = Integer.parseInt(fecha.substring(0, 2));
            int anio = Integer.parseInt(fecha.substring(3, 5));
            LocalDate hoy = LocalDate.now();
            int anioActual = hoy.getYear() % 100;
            int mesActual = hoy.getMonthValue();
            return anio < anioActual || (anio == anioActual && mes < mesActual);
        } catch (Exception e) {
            return false;
        }
    }
}