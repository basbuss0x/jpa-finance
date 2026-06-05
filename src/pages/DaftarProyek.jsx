import React, { useEffect, useMemo, useState } from 'react'
import {
  JENIS_PROYEK_OPTIONS,
  STATUS_PROYEK,
  STATUS_PROYEK_OPTIONS,
  SUMBER_PROYEK_OPTIONS,
} from '../constants'
import { addProyek, getProyek, getTransaksi } from '../store'
import { fmtIDR, generateProyekId, hitungProyek } from '../utils'
import {
  Badge,
  Card,
  PageFrame,
  ProgressBar,
  WireButton,
  gray,
} from '../components/WireframeShared.jsx'

const inputStyle = {
  width: '100%',
  minHeight: 48,
  border: `1px solid ${gray.mid}`,
  borderRadius: 6,
  padding: '0 12px',
  background: gray.bg,
  color: gray.ink,
  boxSizing: 'border-box',
  fontSize: 14,
}

function Segmented({ label, options, value, onChange, note }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>{label}</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: 6,
        }}
      >
        {options.map((option) => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                minHeight: 44,
                border: `1px solid ${active ? gray.gold : gray.line}`,
                borderRadius: 6,
                background: active ? gray.primary : gray.bg,
                color: active ? '#fff' : gray.text,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
      {note ? <span style={{ color: gray.mid, fontSize: 10 }}>{note}</span> : null}
    </label>
  )
}

function ProjectCard({ proyek, transaksi, onOpenDetail }) {
  const summary = hitungProyek(proyek, transaksi)
  const resultLabel = summary.profitBersih >= 0 ? 'Untung' : 'Rugi'

  return (
    <button
      type="button"
      onClick={onOpenDetail}
      style={{
        display: 'grid',
        gap: 8,
        width: '100%',
        padding: 12,
        border: `1px solid ${gray.line}`,
        borderRadius: 8,
        background: gray.bg,
        color: gray.ink,
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
          alignItems: 'start',
        }}
      >
        <div>
          <strong style={{ display: 'block', fontSize: 13 }}>{proyek.nama}</strong>
          <span style={{ color: gray.text, fontSize: 11 }}>
            {proyek.id} | {proyek.jenis} | {proyek.klien}
          </span>
        </div>
        <Badge>{proyek.status}</Badge>
      </div>
      <ProgressBar
        value={summary.progressPct}
        color={summary.progressPct >= 100 ? gray.success : gray.gold}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
          color: gray.text,
          fontSize: 11,
        }}
      >
        <span>
          Masuk {fmtIDR(summary.totalMasuk)} dari {fmtIDR(proyek.nilaiPesanan)}
        </span>
        <strong style={{ color: gray.ink }}>{summary.progressPct}%</strong>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
          paddingTop: 4,
          borderTop: `1px dashed ${gray.line}`,
          fontSize: 12,
        }}
      >
        <span style={{ color: gray.text }}>Profit bersih</span>
        <strong style={{ color: summary.profitBersih >= 0 ? gray.success : gray.danger }}>
          {resultLabel} {fmtIDR(Math.abs(summary.profitBersih))}
        </strong>
      </div>
    </button>
  )
}

function EmptyProjects({ onCreate }) {
  return (
    <Card title="Belum ada proyek" note="empty state">
      <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: 12 }}>
        <svg viewBox="0 0 160 96" aria-hidden="true" style={{ width: 132, height: 80 }}>
          <rect x="22" y="30" width="116" height="46" rx="8" fill="#fff" stroke={gray.mid} />
          <path d="M34 30v-8h36l8 8" fill={gray.bg} stroke={gray.mid} />
          <rect x="46" y="48" width="68" height="8" rx="4" fill={gray.line} />
          <rect x="56" y="62" width="48" height="8" rx="4" fill={gray.line} />
        </svg>
        <strong style={{ color: gray.ink, fontSize: 18 }}>Belum ada proyek</strong>
        <span style={{ color: gray.text, fontSize: 12 }}>
          Mulai dengan membuat proyek pertamamu
        </span>
      </div>
      <WireButton onClick={onCreate}>+ Buat Proyek Pertama</WireButton>
    </Card>
  )
}

function TambahProyekForm({ proyek, onCancel, onSaved }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState(JENIS_PROYEK_OPTIONS[0])
  const [klien, setKlien] = useState('')
  const [sumber, setSumber] = useState(SUMBER_PROYEK_OPTIONS[1])
  const [nilaiPesanan, setNilaiPesanan] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState(today)
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const nilai = Number(nilaiPesanan)
    if (!nama.trim()) {
      setError('Nama proyek wajib diisi.')
      return
    }
    if (!nilai || nilai <= 0) {
      setError('Nilai Pesanan wajib lebih dari 0.')
      return
    }

    addProyek({
      id: generateProyekId(proyek),
      jenis,
      nama: nama.trim(),
      sumber,
      klien: klien.trim(),
      nilaiPesanan: nilai,
      potOpsPerush: 0,
      status: STATUS_PROYEK.aktif,
      tanggalMulai,
      catatan: catatan.trim(),
    })

    onSaved()
  }

  return (
    <PageFrame
      title="Tambah Proyek"
      subtitle="Form halaman penuh, bukan modal."
      activePage="projects"
      onNavigate={() => {}}
    >
      <WireButton variant="secondary" onClick={onCancel}>
        {'<-'} Kembali
      </WireButton>

      <Card title="Data proyek baru" note="status otomatis Aktif">
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Nama Proyek
          </span>
          <input
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: Pengadaan Buku SDN 5 Ambon"
            style={inputStyle}
          />
        </label>

        <Segmented
          label="Jenis Transaksi"
          options={JENIS_PROYEK_OPTIONS}
          value={jenis}
          onChange={setJenis}
          note={
            jenis === 'Regular'
              ? 'Regular = transaksi sekolah berulang.'
              : 'Project = kerja khusus seperti CCTV, aplikasi, konstruksi.'
          }
        />

        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>Klien</span>
          <input
            value={klien}
            onChange={(event) => setKlien(event.target.value)}
            placeholder="Nama sekolah / instansi"
            style={inputStyle}
          />
        </label>

        <Segmented
          label="Sumber"
          options={SUMBER_PROYEK_OPTIONS}
          value={sumber}
          onChange={setSumber}
        />

        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Nilai Pesanan (IDR)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={nilaiPesanan}
            onChange={(event) => setNilaiPesanan(event.target.value)}
            placeholder="Contoh: 18500000"
            style={inputStyle}
          />
          <span style={{ color: gray.mid, fontSize: 10 }}>
            Terbaca: {fmtIDR(Number(nilaiPesanan))}
          </span>
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>
            Tanggal Mulai
          </span>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(event) => setTanggalMulai(event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>Catatan</span>
          <textarea
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            placeholder="Keterangan tambahan (opsional)"
            rows={3}
            style={{
              ...inputStyle,
              minHeight: 76,
              padding: 12,
              resize: 'none',
              lineHeight: 1.4,
            }}
          />
        </label>
      </Card>

      <Card title="Annotation" note="aturan tambah proyek">
        <span style={{ color: gray.text, fontSize: 12 }}>
          Tidak ada field Status saat tambah baru. Status otomatis Aktif.
        </span>
        <span style={{ color: gray.text, fontSize: 12 }}>
          Potongan Ops Perusahaan diisi nanti di Detail Proyek.
        </span>
        <strong style={{ color: gray.ink, fontSize: 12 }}>
          Validasi: Nama dan Nilai Pesanan wajib diisi.
        </strong>
      </Card>

      {error ? (
        <div
          style={{
            padding: 10,
            border: `1px solid ${gray.ink}`,
            borderRadius: 8,
            background: gray.card,
            color: gray.ink,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}

      <WireButton onClick={handleSubmit}>Simpan Proyek</WireButton>
    </PageFrame>
  )
}

export default function DaftarProyek({ onNavigate, onOpenDetail }) {
  const [proyek, setProyek] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [filter, setFilter] = useState('Semua')
  const [jenisFilter, setJenisFilter] = useState('Semua')
  const [mode, setMode] = useState('list')

  const reload = () => {
    setProyek(getProyek())
    setTransaksi(getTransaksi())
  }

  useEffect(() => {
    reload()
  }, [])

  const filteredProyek = proyek.filter((item) => {
    const statusMatch = filter === 'Semua' || item.status === filter
    const jenisMatch = jenisFilter === 'Semua' || item.jenis === jenisFilter
    return statusMatch && jenisMatch
  })

  if (mode === 'create') {
    return (
      <TambahProyekForm
        proyek={proyek}
        onCancel={() => setMode('list')}
        onSaved={() => {
          reload()
          setMode('list')
        }}
      />
    )
  }

  return (
    <PageFrame
      title="Daftar Proyek"
      subtitle="Semua pengadaan dan progress pembayaran."
      activePage="projects"
      onNavigate={onNavigate}
    >
      <WireButton onClick={() => setMode('create')}>+ Proyek Baru</WireButton>

      {proyek.length === 0 ? (
        <EmptyProjects onCreate={() => setMode('create')} />
      ) : (
        <>
          <Card title="Filter proyek" note="status + jenis">
            <span style={{ color: gray.text, fontSize: 11, fontWeight: 800 }}>
              Status
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['Semua', ...STATUS_PROYEK_OPTIONS].map((item) => {
                const active = filter === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    style={{
                      minHeight: 42,
                      border: `1px solid ${active ? gray.gold : gray.line}`,
                      borderRadius: 6,
                      background: active ? gray.primary : gray.bg,
                      color: active ? '#fff' : gray.text,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <span style={{ color: gray.text, fontSize: 11, fontWeight: 800 }}>
              Jenis transaksi
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['Semua', ...JENIS_PROYEK_OPTIONS].map((item) => {
                const active = jenisFilter === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setJenisFilter(item)}
                    style={{
                      minHeight: 42,
                      border: `1px solid ${active ? gray.gold : gray.line}`,
                      borderRadius: 6,
                      background: active ? gray.primary : gray.bg,
                      color: active ? '#fff' : gray.text,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
            <span style={{ color: gray.mid, fontSize: 10 }}>
              Project = kerja khusus. Regular = transaksi sekolah berulang.
            </span>
          </Card>

          <Card title="List proyek" note="tap card -> Detail Proyek">
            {filteredProyek.length > 0 ? (
              filteredProyek.map((item) => (
                <ProjectCard
                  key={item.id}
                  proyek={item}
                  transaksi={transaksi}
                  onOpenDetail={() => onOpenDetail?.(item.id)}
                />
              ))
            ) : (
              <span style={{ color: gray.text, fontSize: 12 }}>
                Tidak ada proyek yang cocok dengan filter.
              </span>
            )}
          </Card>
        </>
      )}
    </PageFrame>
  )
}
