package com.sportify.backend.services;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.sportify.backend.dtos.PagoRequest;
import com.sportify.backend.dtos.PagoResponse;
import com.sportify.backend.entities.Pago;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MercadoPagoService {

    @Value("${mercadopago.token-acceso}")
    private String tokenAcceso;

    @Autowired
    private PagoService pagoService;

    public PagoResponse procesarPago(Pago pago, PagoRequest solicitud) {
        try {
            MercadoPagoConfig.setAccessToken(tokenAcceso);

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Clase Sportify")
                    .quantity(1)
                    .unitPrice(BigDecimal.valueOf(pago.getValor()))
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:5173/pago/verificar")
                    .failure("http://localhost:5173/pago/fallido")
                    .pending("http://localhost:5173/pago/verificar")
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(request);

            String idPreferencia = preference.getId();
            //String urlPago = preference.getInitPoint();
            String urlPago = preference.getSandboxInitPoint();

            
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
                    "Redirigiendo a Mercado Pago",
                    urlPago
            );

        } catch (MPApiException e) {
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.FALLIDO, null);
            throw new RuntimeException("Error en Mercado Pago: " + e.getApiResponse().getContent());
        } catch (Exception e) {
            pagoService.actualizarEstadoPago(pago.getIdPago(), Pago.EstadoPago.FALLIDO, null);
            throw new RuntimeException("Error en Mercado Pago: " + e.getMessage());
        }
    }

    public void verificarEstadoPago(String idPago) {
        try {
            MercadoPagoConfig.setAccessToken(tokenAcceso);

            PaymentClient client = new PaymentClient();
            Payment payment = client.get(Long.parseLong(idPago));

            if ("approved".equals(payment.getStatus())) {
                pagoService.actualizarEstadoPago(
                        Integer.parseInt(idPago),
                        Pago.EstadoPago.COMPLETADO,
                        idPago
                );
            } else if ("rejected".equals(payment.getStatus())) {
                pagoService.actualizarEstadoPago(
                        Integer.parseInt(idPago),
                        Pago.EstadoPago.FALLIDO,
                        idPago
                );
            }

        } catch (Exception e) {
            throw new RuntimeException("Error verificando pago: " + e.getMessage());
        }
    }
}