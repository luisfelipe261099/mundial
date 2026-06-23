import { CadastroForm, type Campo } from "../../_components/cadastro-form";
import { criarCliente } from "../../actions";

const CAMPOS: Campo[] = [
  { name: "nome", label: "Nome completo", full: true, required: true },
  { name: "cpf", label: "CPF", required: true },
  { name: "telefone", label: "Telefone", required: true },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "email", label: "E-mail", full: true },
  { name: "cidade", label: "Cidade" },
  { name: "endereco", label: "Endereço", full: true },
];

export default function NovoClientePage() {
  return (
    <CadastroForm
      titulo="Cadastrar cliente"
      voltarHref="/oficina/clientes"
      voltarLabel="Clientes"
      campos={CAMPOS}
      sucessoTitulo="Cliente cadastrado!"
      criarLabel="Cadastrar cliente"
      onSubmit={criarCliente}
    />
  );
}
