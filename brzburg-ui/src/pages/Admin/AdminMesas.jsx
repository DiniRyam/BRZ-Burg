import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card'; 
import Modal from '../../components/ui/Modal'; 
import { Button } from '../../components/ui/Button'; 
import { Plus, Trash2, QrCode, Download } from 'lucide-react'; // Novo ícone QrCode
import { QRCodeCanvas } from 'qrcode.react'; // Nova biblioteca

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  
  // Estados de Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false); // Estado para o modal do QR
  
  const [novaMesaNome, setNovaMesaNome] = useState('');
  const [selectedMesa, setSelectedMesa] = useState(null); // Mesa selecionada para o QR
  const [loading, setLoading] = useState(false);

  const fetchMesas = useCallback(async () => {
    try {
      const data = await adminService.getMesas();
      setMesas(data);
    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
    }
  }, []);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleCriarMesa = async (e) => {
    e.preventDefault();
    if (!novaMesaNome.trim()) return;

    setLoading(true);
    try {
      await adminService.criarMesa(novaMesaNome);
      setNovaMesaNome('');
      setIsCreateOpen(false);
      await fetchMesas(); 
    } catch (error) {
      console.eror("Erro ao criar mesa.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarMesa = async (id, nome, status) => {
    if (status === 'OCUPADA') {
      alert(`A ${nome} está OCUPADA e não pode ser excluída.`);
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a ${nome}?`)) {
      try {
        await adminService.deletarMesa(id);
        await fetchMesas();
      } catch (error) {
        if (error.response && error.response.status === 409) {
            alert("Erro: A mesa está ocupada.");
        } else {
            alert("Erro ao excluir mesa.");
        }
      }
    }
  };

  // abre o modal do qrcode
  const handleOpenQr = (mesa) => {
    setSelectedMesa(mesa);
    setIsQrOpen(true);
  };

  // funcao para baixar o qrcode que a biblioteca gerou
  const downloadQRCode = () => {

    // pega o elemento canvas que a biblioteca usou
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;

    // converte a url para png
    const pngUrl = canvas.toDataURL("image/png");

    // cria um link falso e força o download 
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${selectedMesa.nome.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Mesas</h1>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nova Mesa
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <Card key={mesa.id} className="relative group">
            <div className="p-4 text-center">
              <h3 className="text-lg font-bold text-gray-900">{mesa.nome}</h3>
              
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                mesa.status === 'LIVRE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {mesa.status}
              </span>
              
              {/* Botões de Ação (Aparecem no Hover) */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                
                {/* Botão QR Code */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenQr(mesa);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors bg-white shadow-sm"
                  title="Ver QR Code"
                >
                  <QrCode size={18} />
                </button>

                {/* Botão Excluir */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletarMesa(mesa.id, mesa.nome, mesa.status);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white shadow-sm"
                  title="Excluir Mesa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Cadastrar Nova Mesa"
      >
        <form onSubmit={handleCriarMesa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mesa</label>
            <input
              type="text"
              value={novaMesaNome}
              onChange={(e) => setNovaMesaNome(e.target.value)}
              placeholder="Ex: Mesa 10"
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DE QR CODE --- */}
      <Modal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={selectedMesa ? `QR Code - ${selectedMesa.nome}` : "QR Code"}
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
            
            {/* O Código QR */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                {selectedMesa && (
                    <QRCodeCanvas 
                        id="qr-code-canvas"
                        // Gera a URL completa para o cliente: http://site.com/m/9
                        value={`http://192.168.137.1:5173/m/${selectedMesa.id}`}
                        size={256}
                        level={"H"} // Nível alto de correção de erro
                        includeMargin={true}
                    />
                )}
            </div>

            <p className="text-sm text-gray-500 text-center">
                Escaneie para acessar o cardápio da <strong>{selectedMesa?.nome}</strong>
            </p>

            <div className="flex gap-2 w-full">
                <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setIsQrOpen(false)}
                >
                    Fechar
                </Button>
                <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={downloadQRCode}
                >
                    <Download size={18} className="mr-2" />
                    Baixar Imagem
                </Button>
            </div>
        </div>
      </Modal>

    </div>
  );
}