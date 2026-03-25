import { useMemo } from 'react';

export interface UserParams {
  coduser: string;
  codsetor: string;
  nome: string;
}

/**
 * Hook para obter parâmetros do usuário da URL
 * 
 * Quando publicado, a aplicação receberá via query params:
 * ?coduser=190&codsetor=35&nome=Luis
 * 
 * Por enquanto, usa valores fixos para desenvolvimento
 */
export function useUserFromUrl(): UserParams {
  return useMemo(() => {
    // Pega parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const coduserFromUrl = urlParams.get('coduser');
    const codsetorFromUrl = urlParams.get('codsetor');
    const nomeFromUrl = urlParams.get('nome');

    // VALORES FIXOS PARA DESENVOLVIMENTO
    // Quando publicar, remova estas linhas e deixe apenas o return acima
    //const MODO_DESENVOLVIMENTO = true; // Mude para false quando publicar
    
    // if (MODO_DESENVOLVIMENTO) {
    //   return {
    //     coduser: '190',
    //     codsetor: '35',
    //     nome: 'Luis',
    //   };
    // }

    // MODO PRODUÇÃO: Pega da URL ou usa fallback
    return {
      coduser: coduserFromUrl || '190',
      codsetor: codsetorFromUrl || '35',
      nome: nomeFromUrl ? decodeURIComponent(nomeFromUrl) : 'Luis',
    };

  }, []);
}