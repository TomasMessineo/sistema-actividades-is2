import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts'
import Navbar from '../../components/Navbar/NavbarAdmin.jsx'
import { getEstadisticasIngresos } from '../../services/estadisticasService'
import '../../styles/ingresosStats.css'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

const COLOR_INDIVIDUAL = '#3ecf2a'
const COLOR_ABONO = '#5b9dff'

const DISCIPLINAS = ['TODAS', 'YOGA', 'PILATES', 'FUNCIONAL']
const NOMBRE_DISCIPLINA = { TODAS: 'Todas', YOGA: 'Yoga', PILATES: 'Pilates', FUNCIONAL: 'Funcional' }
const COLOR_DISCIPLINA = { YOGA: '#3ecf2a', PILATES: '#5b9dff', FUNCIONAL: '#f5a623' }

const ejeMoneda = (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)

const tooltipStyle = {
  background: '#15151a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#fff'
}

function IngresosStatsView() {
  const [data, setData] = useState(null)
  const [anio, setAnio] = useState(null)
  const [disciplina, setDisciplina] = useState('TODAS')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = async (anioElegido, discElegida) => {
    setCargando(true)
    setError('')
    try {
      const respuesta = await getEstadisticasIngresos(anioElegido, discElegida)
      setData(respuesta)
      setAnio(respuesta.anio)
      setDisciplina(discElegida || 'TODAS')
    } catch {
      setError('No se pudieron cargar las estadísticas de ingresos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar(undefined, 'TODAS')
  }, [])

  const cambiarAnio = (nuevoAnio) => cargar(nuevoAnio, disciplina)
  const cambiarDisciplina = (nuevaDisc) => cargar(anio, nuevaDisc)
  const toggleDisciplina = (key) => cambiarDisciplina(disciplina === key ? 'TODAS' : key)

  const sufijoDisc = disciplina !== 'TODAS' ? ` · ${NOMBRE_DISCIPLINA[disciplina]}` : ''

  const datosDona = data
    ? [
        { name: 'Clases individuales', value: data.ingresoIndividual },
        { name: 'Abonos mensuales', value: data.ingresoAbono }
      ].filter((d) => d.value > 0)
    : []

  const datosDisciplina = (data?.porDisciplina || []).map((d) => ({
    key: d.disciplina,
    nombre: NOMBRE_DISCIPLINA[d.disciplina] || d.disciplina,
    total: d.total
  }))

  const datosMeses = (data?.porMes || []).map((m) => ({
    name: m.nombre.slice(0, 3),
    Total: m.total,
    Individual: m.individual,
    Abono: m.abono
  }))

  const seleccionVacia = data && data.hayDatos && data.ingresoTotal === 0

  return (
    <div className="ingresos-page">
      <Navbar />
      <main className="ingresos-main">
        <div className="ingresos-header">
          <div>
            <p className="ingresos-header__label">Panel administrativo</p>
            <h1>Estadísticas de ingresos</h1>
            <p className="ingresos-header__sub">Evaluá la situación financiera del gimnasio.</p>
          </div>

          <div className="ingresos-filtros">
            {data?.aniosDisponibles?.length > 0 && (
              <label className="ingresos-filtro">
                <span>Año</span>
                <select
                  value={anio ?? ''}
                  onChange={(e) => cambiarAnio(Number(e.target.value))}
                  disabled={cargando}
                >
                  {data.aniosDisponibles.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="ingresos-filtro">
              <span>Disciplina</span>
              <select
                value={disciplina}
                onChange={(e) => cambiarDisciplina(e.target.value)}
                disabled={cargando}
              >
                {DISCIPLINAS.map((d) => (
                  <option key={d} value={d}>{NOMBRE_DISCIPLINA[d]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {cargando && <p className="ingresos-status">Cargando estadísticas...</p>}
        {!cargando && error && <p className="ingresos-status ingresos-status--error">{error}</p>}

        {!cargando && !error && data && !data.hayDatos && (
          <div className="ingresos-alerta">
            Aún no hay datos de ingresos cargados para {anio}.
          </div>
        )}

        {!cargando && !error && data && data.hayDatos && (
          <>
            {seleccionVacia && (
              <div className="ingresos-alerta ingresos-alerta--info">
                No hay ingresos de {NOMBRE_DISCIPLINA[disciplina]} en {anio}.
              </div>
            )}

            <section className="ingresos-kpis">
              <article className="ingresos-kpi">
                <span className="ingresos-kpi__label">Ingreso total {anio}{sufijoDisc}</span>
                <strong className="ingresos-kpi__valor">{formatoMoneda.format(data.ingresoTotal)}</strong>
              </article>

              <article className="ingresos-kpi">
                <span className="ingresos-kpi__label">Cantidad de pagos</span>
                <strong className="ingresos-kpi__valor">{data.cantidadPagos}</strong>
              </article>

              <article className="ingresos-kpi">
                <span className="ingresos-kpi__label">Ticket promedio</span>
                <strong className="ingresos-kpi__valor">{formatoMoneda.format(data.ticketPromedio)}</strong>
              </article>

              <article className="ingresos-kpi">
                <span className="ingresos-kpi__label">Mejor mes</span>
                <strong className="ingresos-kpi__valor">{data.mejorMesNombre}</strong>
                <span className="ingresos-kpi__detalle">{formatoMoneda.format(data.mejorMesMonto)}</span>
              </article>
            </section>

            <div className="ingresos-charts">
              <section className="ingresos-grafico">
                <h2>Ingresos por tipo{sufijoDisc}</h2>
                <p className="ingresos-grafico__sub">Clases individuales vs abonos mensuales.</p>
                {datosDona.length === 0 ? (
                  <p className="ingresos-vacio">Sin ingresos para esta selección.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={datosDona}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {datosDona.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.name.startsWith('Clases') ? COLOR_INDIVIDUAL : COLOR_ABONO}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatoMoneda.format(value)} contentStyle={tooltipStyle} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: '#a1a1aa', fontSize: 14 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </section>

              <section className="ingresos-grafico">
                <h2>Ingresos por disciplina</h2>
                <p className="ingresos-grafico__sub">Tocá una barra para filtrar todo el tablero por esa disciplina.</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosDisciplina}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="nombre" stroke="#a1a1aa" tickLine={false} />
                    <YAxis stroke="#a1a1aa" tickFormatter={ejeMoneda} tickLine={false} width={48} />
                    <Tooltip
                      formatter={(value) => [formatoMoneda.format(value), 'Ingreso']}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} onClick={(d) => toggleDisciplina(d.key)} cursor="pointer">
                      {datosDisciplina.map((entry) => {
                        const activa = disciplina === 'TODAS' || disciplina === entry.key
                        return (
                          <Cell
                            key={entry.key}
                            fill={COLOR_DISCIPLINA[entry.key] || '#888'}
                            fillOpacity={activa ? 1 : 0.28}
                          />
                        )
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>
            </div>

            <section className="ingresos-grafico">
              <h2>Evolución mensual{sufijoDisc}</h2>
              <p className="ingresos-grafico__sub">Ingresos mes a mes: total, individuales y abonos.</p>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={datosMeses} margin={{ top: 10, right: 16, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} />
                  <YAxis stroke="#a1a1aa" tickFormatter={ejeMoneda} tickLine={false} width={48} />
                  <Tooltip formatter={(value) => formatoMoneda.format(value)} contentStyle={tooltipStyle} />
                  <Legend iconType="plainline" wrapperStyle={{ color: '#a1a1aa', fontSize: 14 }} />
                  <Line type="monotone" dataKey="Total" stroke="#ffffff" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Individual" stroke={COLOR_INDIVIDUAL} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Abono" stroke={COLOR_ABONO} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default IngresosStatsView
