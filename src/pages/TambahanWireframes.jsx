import React, { useMemo, useState } from 'react'
import {
  Badge,
  BottomNav,
  Card,
  LabelRow,
  WireButton,
  fmtIDR,
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
  fontWeight: 700,
}

const annotationStyle = {
  color: gray.mid,
  fontSize: 10,
  lineHeight: 1.35,
}

function ReviewFrame({ title, kicker, children, activePage = 'projects', onNavigate }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 390,
        background: gray.bg,
        border: `1px solid ${gray.mid}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        boxSizing: 'border-box',
      }}
    >
      <header
        style={{
          display: 'grid',
          gap: 8,
          padding: '16px 16px 12px',
          borderBottom: `1px solid ${gray.line}`,
          background: '#fff',
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: gray.mid }}>
          JPA Finance System
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            style={{
              minHeight: 40,
              minWidth: 92,
              border: `1px solid ${gray.mid}`,
              borderRadius: 8,
              background: gray.bg,
              color: gray.ink,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {'<-'} Kembali
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, color: gray.ink }}>{title}</h1>
            {kicker ? (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: gray.text }}>
                {kicker}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      <section style={{ display: 'grid', gap: 10, padding: 12 }}>{children}</section>
      <BottomNav activePage={activePage} onNavigate={onNavigate} fixed={false} />
    </div>
  )
}

function ToggleGroup({ label, options, value, onChange, note }) {
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
          const active = option === value
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                minHeight: 44,
                border: `1px solid ${active ? gray.ink : gray.line}`,
                borderRadius: 6,
                background: active ? gray.ink : gray.bg,
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
      {note ? <span style={annotationStyle}>{note}</span> : null}
    </label>
  )
}

function TextField({ label, value, placeholder, type = 'text' }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>{label}</span>
      <input
        type={type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        value={value}
        readOnly
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  )
}

function TextAreaField({ label, value, placeholder }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: gray.ink, fontSize: 13, fontWeight: 800 }}>{label}</span>
      <textarea
        value={value}
        readOnly
        placeholder={placeholder}
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
  )
}

function EmptyIllustration({ type = 'folder' }) {
  return (
    <svg viewBox="0 0 160 96" aria-hidden="true" style={{ width: 132, height: 80 }}>
      <rect x="22" y="30" width="116" height="46" rx="8" fill="#fff" stroke={gray.mid} />
      {type === 'chart' ? (
        <>
          <rect x="44" y="54" width="12" height="16" fill={gray.ink} />
          <rect x="72" y="42" width="12" height="28" fill={gray.mid} />
          <rect x="100" y="48" width="12" height="22" fill={gray.line} stroke={gray.mid} />
        </>
      ) : type === 'history' ? (
        <>
          <circle cx="80" cy="54" r="20" fill={gray.bg} stroke={gray.mid} />
          <path d="M80 42v14l10 7" fill="none" stroke={gray.text} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M34 30v-8h36l8 8" fill={gray.bg} stroke={gray.mid} />
          <rect x="46" y="48" width="68" height="8" rx="4" fill={gray.line} />
          <rect x="56" y="62" width="48" height="8" rx="4" fill={gray.line} />
        </>
      )}
    </svg>
  )
}

function TambahProyekWireframe({ onNavigate }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [jenis, setJenis] = useState('Regular')
  const [sumber, setSumber] = useState('Non-SiPLAH')
  const nilai = 18500000

  return (
    <ReviewFrame
      title="Tambah Proyek"
      kicker="Halaman penuh, bukan modal"
      onNavigate={onNavigate}
    >
      <Card title="Form proyek baru" note="status otomatis Aktif">
        <TextField
          label="1. Nama Proyek"
          value=""
          placeholder="Contoh: Pengadaan Buku SDN 5 Ambon"
        />
        <ToggleGroup
          label="2. Jenis Transaksi"
          options={['Regular', 'Project']}
          value={jenis}
          onChange={setJenis}
          note={
            jenis === 'Regular'
              ? 'Regular = sekolah berulang: buku, map raport, supplies.'
              : 'Project = kerja khusus: CCTV, aplikasi, konstruksi, vendor.'
          }
        />
        <TextField
          label="3. Klien"
          value=""
          placeholder="Nama sekolah / instansi"
        />
        <ToggleGroup
          label="4. Sumber"
          options={['SiPLAH', 'Non-SiPLAH', 'Lainnya']}
          value={sumber}
          onChange={setSumber}
        />
        <TextField
          label="5. Nilai Pesanan (IDR)"
          value={String(nilai)}
          type="number"
        />
        <span style={annotationStyle}>{fmtIDR(nilai)}</span>
        <TextField label="6. Tanggal Mulai" value={today} type="date" />
        <TextAreaField
          label="7. Catatan"
          value=""
          placeholder="Keterangan tambahan (opsional)"
        />
      </Card>
      <Card title="Catatan proyek">
        <LabelRow label="Status" value="Default otomatis Aktif" />
        <LabelRow label="Potongan Ops Perusahaan" value="Diisi nanti di Detail" />
        <LabelRow label="Validasi wajib" value="Nama + Nilai Pesanan" strong />
      </Card>
      <WireButton>Simpan Proyek</WireButton>
    </ReviewFrame>
  )
}

function EditProyekWireframe({ onNavigate }) {
  const [jenis, setJenis] = useState('Regular')
  const [sumber, setSumber] = useState('Non-SiPLAH')
  const [status, setStatus] = useState('Aktif')
  const nilai = 32000000

  return (
    <ReviewFrame
      title="Edit Proyek"
      kicker="Pre-filled dari data proyek"
      onNavigate={onNavigate}
    >
      <Card title="Data proyek" note="semua sudah terisi">
        <TextField
          label="1. Nama Proyek"
          value="Pengadaan Buku SMP 3 Ambon"
        />
        <ToggleGroup
          label="2. Jenis Transaksi"
          options={['Regular', 'Project']}
          value={jenis}
          onChange={setJenis}
          note="Pre-selected sesuai data proyek."
        />
        <TextField label="3. Klien" value="SMP Negeri 3 Ambon" />
        <ToggleGroup
          label="4. Sumber"
          options={['SiPLAH', 'Non-SiPLAH', 'Lainnya']}
          value={sumber}
          onChange={setSumber}
        />
        <TextField label="5. Nilai Pesanan" value={String(nilai)} type="number" />
        <span style={annotationStyle}>{fmtIDR(nilai)}</span>
        <ToggleGroup
          label="6. Status"
          options={['Aktif', 'Menunggu Bayar', 'Selesai']}
          value={status}
          onChange={setStatus}
          note="Field ini hanya ada di Form Edit, tidak ada saat tambah baru."
        />
        <TextField label="7. Tanggal Mulai" value="2026-05-10" type="date" />
        <TextAreaField
          label="8. Catatan"
          value="Menunggu Dana BOS cair"
        />
      </Card>
      <WireButton>Simpan Perubahan</WireButton>

      <div style={{ height: 1, background: gray.mid, margin: '4px 0' }} />

      <Card title="Zona bahaya">
        <div
          style={{
            display: 'grid',
            gap: 6,
            padding: 10,
            border: `2px solid ${gray.ink}`,
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <strong style={{ color: gray.ink, fontSize: 13 }}>Hapus Proyek</strong>
          <span style={{ color: gray.text, fontSize: 12 }}>
            Semua transaksi terkait proyek ini juga akan terhapus.
          </span>
        </div>
        <button
          type="button"
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: 8,
            border: `2px solid ${gray.ink}`,
            background: '#fff',
            color: gray.ink,
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          Hapus Proyek
        </button>
      </Card>

      <Card title="State A - Bottom Sheet Hapus Proyek" note="tap pertama">
        <div
          style={{
            position: 'relative',
            minHeight: 420,
            border: `1px solid ${gray.mid}`,
            borderRadius: 8,
            overflow: 'hidden',
            background: gray.bg,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17,17,17,0.48)',
              display: 'grid',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 10,
                padding: 14,
                borderRadius: '12px 12px 0 0',
                background: '#fff',
                borderTop: `1px solid ${gray.mid}`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 4,
                  background: gray.mid,
                  justifySelf: 'center',
                }}
              />
              <h2 style={{ margin: 0, color: gray.ink, fontSize: 18 }}>
                Hapus proyek ini?
              </h2>
              <p style={{ margin: 0, color: gray.text, fontSize: 12, lineHeight: 1.4 }}>
                Semua transaksi terkait proyek ini juga akan terhapus permanen.
              </p>
              <div
                style={{
                  display: 'grid',
                  gap: 6,
                  padding: 10,
                  border: `1px solid ${gray.line}`,
                  borderRadius: 8,
                  background: gray.bg,
                }}
              >
                <span style={{ color: gray.mid, fontSize: 10 }}>Proyek yang dihapus</span>
                <strong style={{ color: gray.ink, fontSize: 13 }}>
                  Pengadaan Buku SMP 3 Ambon
                </strong>
              </div>
              <input
                type="text"
                readOnly
                placeholder='Ketik "HAPUS" untuk konfirmasi'
                style={inputStyle}
              />
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  minHeight: 48,
                  borderRadius: 8,
                  border: `1px solid ${gray.mid}`,
                  background: gray.line,
                  color: gray.mid,
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                Konfirmasi Hapus
              </button>
              <WireButton variant="secondary">Batal</WireButton>
            </div>
          </div>
        </div>
      </Card>

      <Card title="State B - Toast Proyek Terhapus" note="setelah konfirmasi">
        <div
          style={{
            position: 'relative',
            minHeight: 180,
            border: `1px dashed ${gray.mid}`,
            borderRadius: 8,
            background: gray.bg,
            padding: 12,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 54,
              minHeight: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              background: gray.ink,
              color: '#fff',
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            Proyek dihapus ✓
          </div>
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 10,
              height: 34,
              border: `1px solid ${gray.line}`,
              borderRadius: 8,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              color: gray.mid,
              fontSize: 10,
            }}
          >
            kembali ke Daftar Proyek
          </div>
        </div>
      </Card>
    </ReviewFrame>
  )
}

function EmptyStateWireframe({ onNavigate }) {
  return (
    <ReviewFrame
      title="Empty State"
      kicker="Saat app pertama kali belum punya data"
      activePage="projects"
      onNavigate={onNavigate}
    >
      <Card title="A. Daftar Proyek kosong" note="full page empty">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: '8px 0' }}>
          <EmptyIllustration />
          <strong style={{ color: gray.ink, fontSize: 18 }}>Belum ada proyek</strong>
          <span style={{ color: gray.text, fontSize: 12 }}>
            Mulai dengan membuat proyek pertamamu
          </span>
        </div>
        <WireButton>+ Buat Proyek Pertama</WireButton>
      </Card>

      <Card title="B. Dashboard kosong" note="arah ke Input Cepat">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: '8px 0' }}>
          <EmptyIllustration type="chart" />
          <strong style={{ color: gray.ink, fontSize: 18 }}>Belum ada data keuangan</strong>
          <span style={{ color: gray.text, fontSize: 12, textAlign: 'center' }}>
            Tambah proyek dan mulai catat transaksi
          </span>
        </div>
        <WireButton>Mulai Catat</WireButton>
      </Card>

      <Card title="C. Histori Transaksi kosong" note="compact in Detail">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 10,
            alignItems: 'center',
            padding: 10,
            border: `1px dashed ${gray.mid}`,
            borderRadius: 8,
            background: gray.bg,
          }}
        >
          <EmptyIllustration type="history" />
          <div>
            <strong style={{ display: 'block', color: gray.ink, fontSize: 13 }}>
              Belum ada transaksi di proyek ini
            </strong>
            <span style={{ color: gray.text, fontSize: 11 }}>
              Tap Input untuk mulai mencatat
            </span>
          </div>
        </div>
      </Card>
    </ReviewFrame>
  )
}

function DeleteFlowWireframe({ onNavigate }) {
  return (
    <ReviewFrame
      title="Flow Hapus Transaksi"
      kicker="Bottom sheet + toast"
      activePage="projects"
      onNavigate={onNavigate}
    >
      <Card title="Detail Proyek - Histori" note="state sebelum hapus">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            padding: 10,
            border: `1px solid ${gray.line}`,
            borderRadius: 8,
            background: gray.bg,
          }}
        >
          <div>
            <strong style={{ display: 'block', color: gray.ink, fontSize: 13 }}>
              Bayar Vendor
            </strong>
            <span style={{ color: gray.text, fontSize: 11 }}>
              15 Mei 2026 | DP vendor buku SMP
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ display: 'block', color: gray.ink, fontSize: 12 }}>
              - {fmtIDR(25000000)}
            </strong>
            <button
              type="button"
              style={{
                marginTop: 6,
                minHeight: 40,
                minWidth: 64,
                border: `1px solid ${gray.mid}`,
                borderRadius: 6,
                background: '#fff',
                color: gray.ink,
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      </Card>

      <Card title="Step 1 - Bottom Sheet" note="bukan popup tengah">
        <div
          style={{
            position: 'relative',
            minHeight: 360,
            border: `1px solid ${gray.mid}`,
            borderRadius: 8,
            overflow: 'hidden',
            background: gray.bg,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17,17,17,0.48)',
              display: 'grid',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 10,
                padding: 14,
                borderRadius: '12px 12px 0 0',
                background: '#fff',
                borderTop: `1px solid ${gray.mid}`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 4,
                  background: gray.mid,
                  justifySelf: 'center',
                }}
              />
              <h2 style={{ margin: 0, color: gray.ink, fontSize: 18 }}>
                Hapus transaksi ini?
              </h2>
              <div
                style={{
                  display: 'grid',
                  gap: 6,
                  padding: 10,
                  border: `1px solid ${gray.line}`,
                  borderRadius: 8,
                  background: gray.bg,
                }}
              >
                <LabelRow label="Kategori" value="Bayar Vendor" />
                <LabelRow label="Nominal" value={`- ${fmtIDR(25000000)}`} strong />
                <LabelRow label="Tanggal" value="15 Mei 2026" />
                <LabelRow label="Catatan" value="DP vendor buku SMP" />
              </div>
              <WireButton>Ya, Hapus</WireButton>
              <WireButton variant="secondary">Batal</WireButton>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Step 2 - Toast berhasil" note="setelah dismiss">
        <div
          style={{
            position: 'relative',
            minHeight: 170,
            border: `1px dashed ${gray.mid}`,
            borderRadius: 8,
            background: gray.bg,
            padding: 12,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 54,
              minHeight: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              background: gray.ink,
              color: '#fff',
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            Transaksi dihapus ✓
          </div>
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 10,
              height: 34,
              border: `1px solid ${gray.line}`,
              borderRadius: 8,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              color: gray.mid,
              fontSize: 10,
            }}
          >
            bottom navigation area
          </div>
        </div>
      </Card>
    </ReviewFrame>
  )
}

export default function TambahanWireframes({ onNavigate }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 24,
        width: '100%',
        justifyItems: 'center',
      }}
    >
      <TambahanHeader />
      <TambahProyekWireframe onNavigate={onNavigate} />
      <EditProyekWireframe onNavigate={onNavigate} />
      <EmptyStateWireframe onNavigate={onNavigate} />
      <DeleteFlowWireframe onNavigate={onNavigate} />
    </div>
  )
}

function TambahanHeader() {
  return (
    <section
      style={{
        width: '100%',
        maxWidth: 390,
        padding: 14,
        border: `1px solid ${gray.mid}`,
        borderRadius: 8,
        background: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ margin: 0, color: gray.mid, fontSize: 11 }}>
        Wireframe review board
      </p>
      <h1 style={{ margin: '4px 0 0', color: gray.ink, fontSize: 20 }}>
        4 Wireframe Tambahan
      </h1>
      <p style={{ margin: '6px 0 0', color: gray.text, fontSize: 12 }}>
        Tambah Proyek, Edit Proyek, Empty State, dan Flow Hapus Transaksi.
      </p>
    </section>
  )
}
