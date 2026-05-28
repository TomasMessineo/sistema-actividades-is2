package com.sportify.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
                    .externalReference(String.valueOf(pago.getIdPago()))
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(request);

            String idPreferencia = preference.getId();
            String urlPago = preference.getInitPoint();

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

    public Pago.EstadoPago verificarPorPreferencia(String idPreferencia, int idPago) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + tokenAcceso);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = "https://api.mercadopago.com/v1/payments/search?external_reference=" + idPago + "&sort=date_created&criteria=desc";
            String respuesta = restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode results = mapper.readTree(respuesta).get("results");

            if (results != null && results.isArray() && results.size() > 0) {
                for (JsonNode payment : results) {
                    String status = payment.get("status").asText();
                    if ("approved".equals(status)) {
                        return Pago.EstadoPago.COMPLETADO;
                    } else if ("rejected".equals(status) || "cancelled".equals(status)) {
                        return Pago.EstadoPago.FALLIDO;
                    }
                }
            }

            return Pago.EstadoPago.PENDIENTE;

        } catch (Exception e) {
            return Pago.EstadoPago.PENDIENTE;
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