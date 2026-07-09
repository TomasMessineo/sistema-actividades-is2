package com.sportify.backend.services;

import com.sportify.backend.dtos.EstadisticasIngresosDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.AsistenciaDiaDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.DisciplinaDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.InscripcionesDisciplinaDTO;
import com.sportify.backend.dtos.EstadisticasIngresosDTO.MesDTO;
import com.sportify.backend.entities.Actividad;
import com.sportify.backend.entities.ListaAsistencia;
import com.sportify.backend.entities.Pago;
import com.sportify.backend.entities.RegistroAsistencia;
import com.sportify.backend.repositories.ActividadRepository;
import com.sportify.backend.repositories.ListaAsistenciaRepository;
import com.sportify.backend.repositories.PagoRepository;
import com.sportify.backend.repositories.RegistroAsistenciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
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

    // El gimnasio solo opera de lunes a viernes (ver ClaseService.validarDiaHabil).
    private static final DayOfWeek[] DIAS_HABILES = {
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
    };
    private static final String[] NOMBRES_DIAS_HABILES = { "Lunes", "Martes", "Miércoles", "Jueves", "Viernes" };

    // Cuántos años hacia atrás y hacia adelante del actual se ofrecen siempre en
    // el selector, aunque no tengan pagos cargados (para poder demostrar los dos
    // escenarios "sin datos": un año que ya pasó y uno que todavía no llegó).
    private static final int VENTANA_ANIOS_ATRAS = 3;
    private static final int VENTANA_ANIOS_ADELANTE = 1;

    private final PagoRepository pagoRepository;
    private final ActividadRepository actividadRepository;
    private final ListaAsistenciaRepository listaAsistenciaRepository;
    private final RegistroAsistenciaRepository registroAsistenciaRepository;

    public EstadisticasService(
            PagoRepository pagoRepository,
            ActividadRepository actividadRepository,
            ListaAsistenciaRepository listaAsistenciaRepository,
            RegistroAsistenciaRepository registroAsistenciaRepository) {
        this.pagoRepository = pagoRepository;
        this.actividadRepository = actividadRepository;
        this.listaAsistenciaRepository = listaAsistenciaRepository;
        this.registroAsistenciaRepository = registroAsistenciaRepository;
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

        int anioActual = LocalDate.now().getYear();

        EstadisticasIngresosDTO dto = new EstadisticasIngresosDTO();
        dto.setAnio(anio);
        dto.setDisciplina(disciplina);
        // "Sin datos" es a nivel año (escenario 2/3 de la HU), independiente del
        // filtro de disciplina.
        dto.setHayDatos(!delAnio.isEmpty());
        // Distingue el mensaje de "sin datos": un año futuro todavía no tuvo actividad
        // ("aún no hay datos"), mientras que uno pasado o el actual sin pagos
        // simplemente no tiene estadísticas registradas ("no se cuenta con...").
        dto.setAnioEsFuturo(anio > anioActual);

        // El selector ofrece una ventana fija de años (actual - VENTANA_ANIOS_ATRAS ..
        // actual + VENTANA_ANIOS_ADELANTE), ampliada si hay pagos fuera de esa ventana.
        // Así se pueden elegir años SIN pagos (p.ej. para comprobar los escenarios "sin
        // datos"), no solo los años con datos cargados.
        int minRango = anioActual - VENTANA_ANIOS_ATRAS;
        int maxRango = anioActual + VENTANA_ANIOS_ADELANTE;
        if (!aniosConPagos.isEmpty()) {
            minRango = Math.min(minRango, Collections.min(aniosConPagos));
            maxRango = Math.max(maxRango, Collections.max(aniosConPagos));
        }

        Set<Integer> anios = new TreeSet<>(Comparator.reverseOrder());
        for (int y = minRango; y <= maxRango; y++) {
            anios.add(y);
        }
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

        // Inscripciones por disciplina del año (comparación entre las tres; no se
        // filtra por disciplina, igual que porDisciplina) — responde "a qué tipo de
        // clases se inscribe más la gente".
        List<ListaAsistencia> listas = listaAsistenciaRepository.findAll();
        List<InscripcionesDisciplinaDTO> inscripcionesPorDisciplina = new ArrayList<>();
        for (String tipo : tipos) {
            int cantidad = listas.stream()
                    .filter(la -> la.getClase() != null
                            && la.getClase().getFecha() != null
                            && la.getClase().getFecha().getYear() == anio
                            && la.getClase().getActividad() != null
                            && tipo.equals(la.getClase().getActividad().getTipo()))
                    .mapToInt(la -> la.getAlumnos() == null ? 0 : la.getAlumnos().size())
                    .sum();
            inscripcionesPorDisciplina.add(new InscripcionesDisciplinaDTO(tipo, cantidad));
        }
        dto.setInscripcionesPorDisciplina(inscripcionesPorDisciplina);

        // Asistencia real (check-in) por día de la semana — responde "en qué días
        // asiste más o menos la gente". Respeta el filtro de disciplina, a diferencia
        // de la comparación de arriba.
        List<RegistroAsistencia> registrosDelAnio = registroAsistenciaRepository.findAll().stream()
                .filter(r -> r.getClase() != null
                        && r.getClase().getFecha() != null
                        && r.getClase().getFecha().getYear() == anio
                        && !Boolean.TRUE.equals(r.getClase().getCancelada()))
                .filter(r -> disciplina == null
                        || (r.getClase().getActividad() != null && disciplina.equals(r.getClase().getActividad().getTipo())))
                .collect(Collectors.toList());

        List<AsistenciaDiaDTO> asistenciaPorDia = new ArrayList<>();
        for (int i = 0; i < DIAS_HABILES.length; i++) {
            DayOfWeek dia = DIAS_HABILES[i];
            List<RegistroAsistencia> delDia = registrosDelAnio.stream()
                    .filter(r -> r.getClase().getFecha().getDayOfWeek() == dia)
                    .collect(Collectors.toList());

            int asistieron = (int) delDia.stream().filter(r -> !Boolean.TRUE.equals(r.getFalto())).count();
            int faltaron = (int) delDia.stream().filter(r -> Boolean.TRUE.equals(r.getFalto())).count();
            int totalRegistros = asistieron + faltaron;
            double porcentaje = totalRegistros == 0 ? 0.0 : (asistieron * 100.0 / totalRegistros);

            asistenciaPorDia.add(new AsistenciaDiaDTO(NOMBRES_DIAS_HABILES[i], asistieron, faltaron, porcentaje));
        }
        dto.setAsistenciaPorDia(asistenciaPorDia);

        return dto;
    }
}
