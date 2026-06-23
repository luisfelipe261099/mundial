import { CadastroForm, type Campo } from "../../_components/cadastro-form";
import { clientes } from "../../_data/mock";

export default function NovoVeiculoPage() {
  const campos: Campo[] = [
    { name: "proprietario", label: "Proprietário", type: "select", options: clientes.map((c) => c.nome), full: true, required: true },
    { name: "modelo", label: "Modelo", required: true },
    { name: "placa", label: "Placa", required: true },
    { name: "ano", label: "Ano", type: "number" },
    { name: "km", label: "Quilometragem", type: "number" },
    { name: "combustivel", label: "Combustível", type: "select", options: ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"] },
    { name: "cor", label: "Cor" },
  ];

  return (
    <CadastroForm
      titulo="Cadastrar veículo"
      voltarHref="/oficina/veiculos"
      voltarLabel="Veículos"
      campos={campos}
      sucessoTitulo="Veículo cadastrado!"
      criarLabel="Cadastrar veículo"
    />
  );
}
