import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { brl } from "@/app/oficina/_data/mock";
import { business, fullAddress, siteUrl } from "@/app/_data/business";
import type { OrdemPdf } from "@/lib/admin-data";

// Paleta do documento — papel branco, tinta grafite, azul da marca como acento.
const C = {
  paper: "#ffffff",
  ink: "#1a2230",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#e5e7eb",
  surface: "#f8fafc",
  brand: "#2563eb",
  brandDark: "#1d4ed8",
  brandSoft: "#eff4ff",
};

// Cor do selo de status (fundo/texto) — espelha os badges do painel.
const STATUS: Record<string, { bg: string; fg: string }> = {
  Aberta: { bg: "#eef2ff", fg: "#3730a3" },
  "Aguardando aprovação": { bg: "#fef3c7", fg: "#92400e" },
  "Em execução": { bg: "#dbeafe", fg: "#1e40af" },
  Finalizada: { bg: "#dcfce7", fg: "#166534" },
  Entregue: { bg: "#dcfce7", fg: "#166534" },
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Work Sans",
    fontSize: 9,
    color: C.ink,
    backgroundColor: C.paper,
    paddingBottom: 56,
    lineHeight: 1.4,
  },

  // Cabeçalho
  accent: { height: 5, backgroundColor: C.brand },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 40,
    paddingTop: 22,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 46, height: 46, borderRadius: 8 },
  brandName: { fontFamily: "Outfit", fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.1 },
  brandSub: { fontSize: 7.5, color: C.muted, marginTop: 4 },
  headRight: { alignItems: "flex-end" },
  docKicker: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 8.5,
    color: C.brand,
    letterSpacing: 1.2,
  },
  docNumber: { fontFamily: "Outfit", fontWeight: 700, fontSize: 17, color: C.ink, lineHeight: 1.1, marginTop: 3, marginBottom: 4 },
  docDate: { fontSize: 8, color: C.muted },
  badge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 8,
  },

  contact: { paddingHorizontal: 40, marginTop: 12, fontSize: 7.5, color: C.muted },
  rule: { marginHorizontal: 40, marginTop: 10, borderBottomWidth: 1, borderBottomColor: C.line },

  body: { paddingHorizontal: 40, paddingTop: 16 },

  // Cards cliente/veículo
  cardsRow: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 7,
    padding: 11,
  },
  cardLabel: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7.5,
    color: C.brand,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  cardTitle: { fontFamily: "Outfit", fontWeight: 600, fontSize: 11, color: C.ink },
  metaRow: { flexDirection: "row", marginTop: 3 },
  metaKey: { fontSize: 8, color: C.muted, width: 68 },
  metaVal: { fontSize: 8, color: C.ink, flex: 1 },

  // Blocos de texto
  block: { marginTop: 14 },
  blockLabel: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7.5,
    color: C.faint,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  blockText: { fontSize: 9.5, color: C.ink },

  // Tabela de itens
  table: { marginTop: 16, borderWidth: 1, borderColor: C.line, borderRadius: 7, overflow: "hidden" },
  thead: { flexDirection: "row", backgroundColor: C.brand, paddingVertical: 7, paddingHorizontal: 10 },
  th: { fontFamily: "Outfit", fontWeight: 600, fontSize: 8, color: "#ffffff", letterSpacing: 0.4 },
  row: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    alignItems: "center",
  },
  rowZebra: { backgroundColor: C.surface },
  cType: { width: 66 },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: "center" },
  cVal: { width: 82, textAlign: "right" },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: C.brandSoft,
    color: C.brandDark,
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  cellText: { fontSize: 9, color: C.ink },
  cellVal: { fontSize: 9, fontFamily: "Outfit", fontWeight: 600, color: C.ink },

  // Total
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.brand,
    borderRadius: 7,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  totalLabel: { fontFamily: "Outfit", fontWeight: 600, fontSize: 9, color: "#dbeafe", letterSpacing: 1 },
  totalValue: { fontFamily: "Outfit", fontWeight: 700, fontSize: 15, color: "#ffffff" },

  // Assinaturas
  signRow: { flexDirection: "row", gap: 40, marginTop: 40 },
  signCol: { flex: 1, alignItems: "center" },
  signLine: { width: "100%", borderTopWidth: 1, borderTopColor: C.ink, marginBottom: 4 },
  signName: { fontFamily: "Outfit", fontWeight: 600, fontSize: 9, color: C.ink },
  signRole: { fontSize: 7.5, color: C.muted, marginTop: 1 },

  // Rodapé fixo
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footText: { fontSize: 7, color: C.faint },
});

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaKey}>{k}</Text>
      <Text style={s.metaVal}>{v}</Text>
    </View>
  );
}

export function ServiceOrderPDF({
  os,
  logo,
  geradoEm,
}: {
  os: OrdemPdf;
  logo: string;
  geradoEm: string;
}) {
  const status = STATUS[os.status] ?? { bg: C.brandSoft, fg: C.brandDark };
  const site = siteUrl.replace(/^https?:\/\//, "");

  return (
    <Document
      title={`Ordem de Serviço ${os.id} — ${business.name}`}
      author={business.name}
      subject={`OS ${os.id} · ${os.cliente}`}
    >
      <Page size="A4" style={s.page}>
        {/* Cabeçalho */}
        <View style={s.accent} />
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logo} style={s.logo} />
            <View>
              <Text style={s.brandName}>{business.name}</Text>
              <Text style={s.brandSub}>
                {business.category} · {business.address.city}/{business.address.state}
              </Text>
            </View>
          </View>
          <View style={s.headRight}>
            <Text style={s.docKicker}>ORDEM DE SERVIÇO</Text>
            <Text style={s.docNumber}>{os.id}</Text>
            <Text style={s.docDate}>{os.data}</Text>
            <Text style={[s.badge, { backgroundColor: status.bg, color: status.fg }]}>{os.status}</Text>
          </View>
        </View>

        <Text style={s.contact}>
          {fullAddress}  ·  {business.phoneDisplay}  ·  WhatsApp {business.whatsappDisplay}  ·  {business.instagramHandle}
        </Text>
        <View style={s.rule} />

        <View style={s.body}>
          {/* Cliente e veículo */}
          <View style={s.cardsRow}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Cliente</Text>
              <Text style={s.cardTitle}>{os.cliente}</Text>
              <Meta k="CPF" v={os.clienteInfo.cpf} />
              <Meta k="Telefone" v={os.clienteInfo.telefone} />
              <Meta k="Cidade" v={os.clienteInfo.cidade} />
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Veículo</Text>
              <Text style={s.cardTitle}>{os.veiculo}</Text>
              <Meta k="Placa" v={os.placa} />
              <Meta k="Ano / Cor" v={`${os.veiculoInfo.ano} · ${os.veiculoInfo.cor}`} />
              <Meta k="Combustível" v={os.veiculoInfo.combustivel} />
              <Meta k="KM" v={`${os.km.toLocaleString("pt-BR")} km`} />
            </View>
          </View>

          {/* Defeito */}
          <View style={s.block}>
            <Text style={s.blockLabel}>Defeito relatado</Text>
            <Text style={s.blockText}>{os.defeito}</Text>
          </View>

          {/* Itens */}
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.th, s.cType]}>TIPO</Text>
              <Text style={[s.th, s.cDesc]}>DESCRIÇÃO</Text>
              <Text style={[s.th, s.cQty]}>QTD</Text>
              <Text style={[s.th, s.cVal]}>VALOR</Text>
            </View>
            {os.itens.map((it, i) => (
              <View key={i} style={[s.row, i % 2 === 1 ? s.rowZebra : {}]} wrap={false}>
                <View style={s.cType}>
                  <Text style={s.pill}>{it.tipo}</Text>
                </View>
                <Text style={[s.cellText, s.cDesc]}>{it.descricao}</Text>
                <Text style={[s.cellText, s.cQty]}>{it.qtd}</Text>
                <Text style={[s.cellVal, s.cVal]}>{brl(it.valor)}</Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={s.totalRow}>
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>TOTAL</Text>
              <Text style={s.totalValue}>{brl(os.total)}</Text>
            </View>
          </View>

          {/* Observações */}
          <View style={s.block}>
            <Text style={s.blockLabel}>Observações</Text>
            <Text style={s.blockText}>{os.observacoes}</Text>
          </View>

          {/* Assinaturas */}
          <View style={s.signRow} wrap={false}>
            <View style={s.signCol}>
              <View style={s.signLine} />
              <Text style={s.signName}>{os.cliente}</Text>
              <Text style={s.signRole}>Cliente</Text>
            </View>
            <View style={s.signCol}>
              <View style={s.signLine} />
              <Text style={s.signName}>{os.mecanico}</Text>
              <Text style={s.signRole}>Responsável técnico</Text>
            </View>
          </View>
        </View>

        {/* Rodapé fixo */}
        <View style={s.footer} fixed>
          <Text style={s.footText}>Documento gerado em {geradoEm}</Text>
          <Text
            style={s.footText}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `${site} · pág. ${pageNumber}/${totalPages}` : site
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
