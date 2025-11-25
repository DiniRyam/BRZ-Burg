import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 
import Modal from '../../components/ui/Modal'; 
import { Button } from '../../components/ui/Button'; 
import { Plus, Trash2, Edit, User, History } from 'lucide-react';

export default function AdminFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modoHistorico, setModoHistorico] = useState(false); // Toggle para ver inativos

  // Estado do Formulário
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    login: '',
    senha: '',
    funcao: 'GARCOM' // Valor padrão
  });

  // 1. Busca os dados (Ativos ou Histórico)
  const fetchFuncionarios = useCallback(async () => {
    try {
      let data;
      if (modoHistorico) {
        data = await adminService.getHistoricoFuncionarios();
      } else {
        data = await adminService.getFuncionarios();
      }
      setFuncionarios(data);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  }, [modoHistorico]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  // 2. Lida com a abertura do Modal (Criar vs Editar)
  const handleOpenModal = (funcionario = null) => {
    if (funcionario) {
      // Modo Edição: Preenche os dados
      setIsEditing(true);
      setEditId(funcionario.id);
      setFormData({
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        login: funcionario.login || funcionario.usuario, // O backend pode retornar 'usuario' ou 'login'
        senha: '', // Senha sempre vazia na edição (só preenche se quiser mudar)
        funcao: funcionario.funcao
      });
    } else {
      // Modo Criação: Limpa tudo
      setIsEditing(false);
      setEditId(null);
      setFormData({ nome: '', cpf: '', login: '', senha: '', funcao: 'GARCOM' });
    }
    setIsModalOpen(true);
  };

  // 3. Enviar o Formulário (Criar ou Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // Na edição, se a senha estiver vazia, o backend ignora (não muda a senha)
        await adminService.atualizarFuncionario(editId, formData);
        alert("Funcionário atualizado com sucesso!");
      } else {
        await adminService.criarFuncionario(formData);
        alert("Funcionário criado com sucesso!");
      }
      
      setIsModalOpen(false);
      fetchFuncionarios(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar. Verifique se o Login ou CPF já existem.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Arquivar (Soft Delete)
  const handleArquivar = async (id, nome) => {
    if (confirm(`Tem certeza que deseja arquivar o acesso de "${nome}"?`)) {
      try {
        await adminService.arquivarFuncionario(id);
        fetchFuncionarios();
      } catch (error) {
        console.error("Erro ao arquivar:", error);
        alert("Erro ao arquivar funcionário.");
      }
    }
  };

  // Auxiliar para cor do badge de função
  const getFuncaoColor = (funcao) => {
    switch(funcao) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'COZINHEIRO': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700'; // Garçom
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {modoHistorico ? 'Histórico de Funcionários (Inativos)' : 'Funcionários Ativos'}
        </h1>
        
        <div className="flex space-x-3">
          {/* Botão de Alternar Histórico */}
          <Button 
            variant="secondary" 
            onClick={() => setModoHistorico(!modoHistorico)}
          >
            <History size={20} className="mr-2" />
            {modoHistorico ? 'Ver Ativos' : 'Ver Histórico'}
          </Button>

          {/* Botão Novo (Só aparece na tela de ativos) */}
          {!modoHistorico && (
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={20} className="mr-2" />
              Novo Funcionário
            </Button>
          )}
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {funcionarios.map((func) => (
          <Card key={func.id} className="relative group">
            <div className="p-4 flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <User size={24} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{func.nome}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${getFuncaoColor(func.funcao)}`}>
                  {func.funcao}
                </span>
                <div className="mt-3 text-sm text-gray-500 space-y-1">
                  <p>Login: <span className="font-medium text-gray-700">{func.login || func.usuario}</span></p>
                  <p>CPF: {func.cpf}</p>
                </div>
              </div>

              {/* Botões de Ação (Só aparecem para ativos) */}
              {!modoHistorico && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleOpenModal(func)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleArquivar(func.id, func.nome)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Arquivar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {funcionarios.length === 0 && (
           <p className="col-span-full text-center text-gray-500 py-10">Nenhum funcionário encontrado.</p>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Funcionário" : "Novo Funcionário"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          {/* CPF e Função (lado a lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                required
                placeholder="Só números"
                maxLength="11"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.funcao}
                onChange={(e) => setFormData({...formData, funcao: e.target.value})}
              >
                <option value="GARCOM">Garçom</option>
                <option value="COZINHEIRO">Cozinheiro</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Login e Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login de Acesso</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.login}
              onChange={(e) => setFormData({...formData, login: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {isEditing && <span className="text-xs font-normal text-gray-500">(Deixe em branco para manter a atual)</span>}
            </label>
            <input
              type="password"
              // A senha só é obrigatória se NÃO estivermos editando
              required={!isEditing} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}