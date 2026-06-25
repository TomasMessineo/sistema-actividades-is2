package com.sportify.backend.services;

import com.sportify.backend.dtos.EstadisticasIngresosDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.DisciplinaDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.MesDTO;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.repositories.ActividadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class EstadisticasService {

    private static final String[] MESES = {
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    };

    private final PagoRepository pagoRepository;
    private final ActividadRepository actividadRepository;

    public EstadisticasService(PagoRepository pagoRepository, ActividadRepository actividadRepository) {
        this.pagoRepository = pagoRepository;
        this.actividadRepository = actividadRepository;
    }

    // Disciplina (TipoActividad) de un pago, vía su clase. Null si no aplica.
    private String disciplinaDe(Pago pago) {
        if (pago.getClase() == null || pago.getClase().getActividad() == null
                || pago.getClase().getActividad().getTipo() == null) {
            return null;
        }
        return pago.getClase().getActividad().getTipo();
    }

    @Transactional(readOnly = true)
    public EstadisticasIngresosDTO ingresos(Integer anioParam, String disciplinaParam) {
        // Solo los pagos efectivamente cobrados (COMPLETADO) con fecha y monto válidos.
        List<Pago> completados = pagoRepository.findByEstado(Pago.EstadoPago.COMPLETADO).stream()
                .filter(p -> p.getFecha() != null && p.getValor() != null)
                .collect(Collectors.toList());

        List<Integer> aniosConPagos = completados.stream()
                .map(p -> p.getFecha().getYear())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int anio = anioParam != null
                ? anioParam
                : (aniosConPagos.isEmpty() ? LocalDate.now().getYear() : aniosConPagos.get(0));

        String disciplina = (disciplinaParam == null || disciplinaParam.isBlank()
                || "TODAS".equalsIgnoreCase(disciplinaParam))
                        ? null
                        : disciplinaParam.toUpperCase();

        // Todos los pagos del año (sin filtrar por disciplina).
        List<Pago> delAnio = completados.stream()
                .filter(p -> p.getFecha().getYear() == anio)
                .collect(Collectors.toList());

        EstadisticasIngresosDTO dto = new EstadisticasIngresosDTO();
        dto.setAnio(anio);
        dto.setDisciplina(disciplina);
        // "Sin datos" es a nivel año (escenario 2 de la HU), independiente del filtro
        // de disciplina.
        dto.setHayDatos(!delAnio.isEmpty());

        // El selector ofrece los años con pagos + el año actual + el seleccionado.
        Set<Integer> anios = new TreeSet<>(Comparator.reverseOrder());
        anios.addAll(aniosConPagos);
        anios.add(LocalDate.now().getYear());
        anios.add(anio);
        dto.setAniosDisponibles(new ArrayList<>(anios));

        // Ingreso por disciplina del año completo (comparación; no se filtra).
        List<DisciplinaDTO> porDisciplina = new ArrayList<>();
        List<String> tipos = actividadRepository.findAll().stream()
                .map(Actividad::getTipo)
                .filter(t -> t != null)
                .distinct()
                .toList();
        for (String tipo : tipos) {
            double totalDisc = delAnio.stream()
                    .filter(p -> tipo.equals(disciplinaDe(p)))
                    .mapToDouble(Pago::getValor).sum();
            porDisciplina.add(new DisciplinaDTO(tipo, totalDisc));
        }
        dto.setPorDisciplina(porDisciplina);

        // A partir de acá, todo respeta el filtro de disciplina.
        List<Pago> filtrados = disciplina == null
                ? delAnio
                : delAnio.stream()
                        .filter(p -> disciplina.equals(disciplinaDe(p)))
                        .collect(Collectors.toList());

        double total = filtrados.stream().mapToDouble(Pago::getValor).sum();
        dto.setIngresoTotal(total);
        dto.setCantidadPagos(filtrados.size());
        dto.setTicketPromedio(filtrados.isEmpty() ? 0.0 : total / filtrados.size());

        double individual = filtrados.stream()
                .filter(p -> p.getTipo() != Pago.TipoClase.ABONADO)
                .mapToDouble(Pago::getValor).sum();
        double abono = filtrados.stream()
                .filter(p -> p.getTipo() == Pago.TipoClase.ABONADO)
                .mapToDouble(Pago::getValor).sum();
        dto.setIngresoIndividual(individual);
        dto.setIngresoAbono(abono);

        // Desglose por mes + mejor mes.
        double[] indivMes = new double[12];
        double[] abonoMes = new double[12];
        for (Pago p : filtrados) {
            int m = p.getFecha().getMonthValue() - 1;
            if (p.getTipo() == Pago.TipoClase.ABONADO) {
                abonoMes[m] += p.getValor();
            } else {
                indivMes[m] += p.getValor();
            }
        }

        List<MesDTO> porMes = new ArrayList<>();
        int mejorMes = -1;
        double mejorMonto = 0.0;
        for (int m = 0; m < 12; m++) {
            double totalMes = indivMes[m] + abonoMes[m];
            porMes.add(new MesDTO(m + 1, MESES[m], indivMes[m], abonoMes[m], totalMes));
            if (totalMes > mejorMonto) {
                mejorMonto = totalMes;
                mejorMes = m;
            }
        }
        dto.setPorMes(porMes);
        dto.setMejorMesNombre(mejorMes >= 0 ? MESES[mejorMes] : "—");
        dto.setMejorMesMonto(mejorMonto);

        return dto;
    }
}
