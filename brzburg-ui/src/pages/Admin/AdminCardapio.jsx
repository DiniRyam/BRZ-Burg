import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 
import Modal from '../../components/ui/Modal'; 
import { Button } from '../../components/ui/Button'; 
import { Plus, Trash2, Image as ImageIcon, FolderPlus } from 'lucide-react';

export default function AdminCardapio() {

  // Estados de Dados
  const [secoes, setSecoes] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados de Modal com secao ou item
  const [modalTipo, setModalTipo] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulários
  const [novaSecao, setNovaSecao] = useState('');
  const [novoItem, setNovoItem] = useState({
    nome: '',
    descricao: '',
    preco: '',
    secaoId: '',
    imagem: null // Aqui guardamos o arquivo da imagem do produto
  });

  // busca de dados
  const fetchData = useCallback(async () => {
    try {

      // Busca seções e itens em paralelo e tras ate os arquivados com getitenseditor()
      const [secoesData, itensData] = await Promise.all([
        adminService.getSecoes(),
        adminService.getItensEditor() 
      ]);
      setSecoes(secoesData);
      setItens(itensData);
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // acoes da secao
  const handleCriarSecao = async (e) => {
    e.preventDefault();
    if (!novaSecao.trim()) return;
    setLoading(true);
    try {
      await adminService.criarSecao(novaSecao);
      setNovaSecao('');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.erorr("Erro ao criar seção.", error);
    } finally {
      setLoading(false);
    }
  };

  // upload de itens 
  const handleCriarItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      // ajeita o formdata para mandar os arquivos 
      const formData = new FormData();
      formData.append('nome', novoItem.nome);
      formData.append('descricao', novoItem.descricao);
      formData.append('preco', novoItem.preco); // O backend espera String ou Number
      formData.append('secaoId', novoItem.secaoId);
      
      if (novoItem.imagem) {
        formData.append('imagem', novoItem.imagem);
      }

      // Envia para o serviço que usa o axios com multipart/form-data
      await adminService.criarItem(formData);
      
      // Limpa e fecha e da a msg de erro se tiver algum dado ruim
      setNovoItem({ nome: '', descricao: '', preco: '', secaoId: '', imagem: null });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar item. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleArquivarItem = async (id, nome) => {
    if (confirm(`Arquivar "${nome}"? Ele sairá do cardápio do cliente.`)) {
      try {
        await adminService.arquivarItem(id);
        fetchData();
      } catch (error) {
        console.error("Erro ao arquivar item.", error);
      }
    }
  };

  // Agrupa itens por seção para exibição organizada no cardapio
  const itensPorSecao = secoes.map(secao => ({
    ...secao,
    itens: itens.filter(i => i.secao?.id === secao.id)
  }));

  return (
    <div className="space-y-8 pb-20">

      {/* Ccabecalho e os botoes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Cardápio</h1>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => { setModalTipo('SECAO'); setIsModalOpen(true); }}>
            <FolderPlus size={20} className="mr-2" />
            Nova Seção
          </Button>
          <Button variant="primary" onClick={() => { setModalTipo('ITEM'); setIsModalOpen(true); }}>
            <Plus size={20} className="mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* lista os itens e as secoes */}
      {itensPorSecao.map((secao) => (
        <div key={secao.id} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{secao.nomeSecao}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {secao.itens.map((item) => (
              <Card 
                key={item.id}

                // Se tiver imagemUrl do backend, adiciona o domínio, senão deixa null
                imageUrl={item.imagemUrl ? `http://192.168.137.1:8080${item.imagemUrl}` : null}
                title={item.nome}
                description={`R$ ${item.preco.toFixed(2).replace('.', ',')}`}
                className="relative group"
              >
                <div className="p-4 pt-0">
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.descricao}</p>
                  
                  {/* status do produto ativo ou arquivado */}
                  {!item.active && (
                    <span className="inline-block px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded mb-2">
                      ARQUIVADO
                    </span>
                  )}

                  {/* botao de soft delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArquivarItem(item.id, item.nome);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Arquivar Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
            
            {secao.itens.length === 0 && (
              <div className="col-span-full p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
                Nenhum item nesta seção
              </div>
            )}
          </div>
        </div>
      ))}

      {secoes.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Comece criando uma Seção (ex: "Lanches").</p>
      )}

      {/* modal de secao ou item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTipo === 'SECAO' ? "Nova Seção" : "Novo Item"}
      >
        {modalTipo === 'SECAO' ? (

          // formulario da secao
          <form onSubmit={handleCriarSecao} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Seção</label>
              <input
                type="text"
                value={novaSecao}
                onChange={(e) => setNovaSecao(e.target.value)}
                placeholder="Ex: Bebidas"
                className="w-full p-2 border border-gray-300 rounded-md"
                autoFocus
                required
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading}>Salvar</Button>
            </div>
          </form>
        ) : (

          // formulario de entrada dos dados dos itens
          <form onSubmit={handleCriarItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seção</label>
              <select
                value={novoItem.secaoId}
                onChange={(e) => setNovoItem({...novoItem, secaoId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione...</option>
                {secoes.map(s => <option key={s.id} value={s.id}>{s.nomeSecao}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={novoItem.nome}
                onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novoItem.preco}
                onChange={(e) => setNovoItem({...novoItem, preco: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center">
                  <ImageIcon size={18} className="mr-2" />
                  Escolher arquivo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => setNovoItem({...novoItem, imagem: e.target.files[0]})}
                  />
                </label>
                <span className="text-sm text-gray-500 truncate">
                  {novoItem.imagem ? novoItem.imagem.name : 'Nenhum arquivo selecionado'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Salvar Item'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}