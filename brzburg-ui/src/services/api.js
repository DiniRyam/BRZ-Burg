import axios from 'axios';

// cria a instancia do axios 
const api = axios.create({

  // define a url que o beck vai estar
  baseURL: 'http://localhost:8080' 
});


// para segurança ele pega cada pedido antes de enviar
api.interceptors.request.use(
  (config) => {

    // procura o token jtw no localstorage para autenticar
    const token = localStorage.getItem('authToken'); 
    
    if (token) {

      // se o token tiver la ele anexa ao cabecalho authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;